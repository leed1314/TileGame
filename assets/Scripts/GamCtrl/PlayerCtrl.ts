import MapCtrl from "./MapCtrl";
import BhvMove from "./BhvMove";
import { TruncateByVec2Mag } from "../Util/Tools";
import VMEvent from "../Mvvm/VMEvent";

const { ccclass, property } = cc._decorator;
export enum ShipBhvType {
    MoveInPath = 0,
    Idle,
}
@ccclass
export default class PlayerCtrl extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    vVelocity: cc.Vec2 = cc.Vec2.ZERO;
    vHeading: cc.Vec2 = cc.Vec2.ZERO;
    /**
     * MaxSpeed 和 MaxForce 应在一个合适的比例之下：
     * 如果 MaxSpeed 过大会出现转向时绕大圈，无法到达终点
     * 如果 MaxForce 过大会出现转向时加速度变化过快，同样出现无法到达终点
     */
    MaxSpeed: number = 100; //单位: 像素/秒
    MaxForce: number = 200;
    DesiredSpeed: number = 20;
    MaxTurnRate: number = 10;
    Mass: number = 1

    currentPathList: Array<cc.Vec2> = null;
    currentRunningBhv: ShipBhvType = -1;
    // onLoad () {}

    start() {

    }

    update(dt) {
        let bhvMoveTs = this.getComponent(BhvMove);
        let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
        if (this.currentRunningBhv == ShipBhvType.MoveInPath) {
            if (this.isInTile(this.currentPathList[this.currentPathList.length - 1]) == true) { // 意味着已经到达前进节点
                // 到达节点之后而且再无新的节点需要导航，认为导航结束
                this.currentRunningBhv = ShipBhvType.Idle;
                return;
            }
            // 意味着没有到达前进节点，则对本段路径进行导航计算
            // 1,预测未来的位置
            let pathR = 32; // 为什么是32，因为地图的tile是64X64
            let preDictLoc = this.vVelocity.normalize().mul(pathR).add(this.node.position);
            // 2,计算未来的位置到路径点的法线长度
            let normal = this.node.position;
            let worldRecord = 1000000;  // Start with a very high record distance that can easily be beaten
            for (var i = 0; i < this.currentPathList.length - 1; i++) {
                let a = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.currentPathList[i]);
                let b = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.currentPathList[i + 1]);
                let normalPoint = this.getNormalPoint(preDictLoc, a, b);
                if (normalPoint.x < Math.min(a.x, b.x)
                    || normalPoint.x > Math.max(a.x, b.x)
                    || normalPoint.y < Math.min(a.y, b.y)
                    || normalPoint.y > Math.max(a.y, b.y)) {
                    // This is something of a hacky solution, but if it's not within the line segment
                    // consider the normal to just be the end of the line segment (point b)
                    normalPoint = b;
                }
                let distance = preDictLoc.sub(normalPoint).mag();
                if (distance < worldRecord) {
                    worldRecord = distance;
                    // If so the target we want to steer towards is the normal
                    normal = normalPoint;
                }
            }
            // 计算行为合力
            let posStart = this.node.position;
            let posNextPath;
            let responseLevel = 1;
            // 判断是否需要调整航向
            if (worldRecord > pathR) {
                // 调整航向
                posNextPath = normal;
                responseLevel = 5;
            } else {
                // 保持航向
                posNextPath = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.currentPathList[this.currentPathList.length - 1]);
                responseLevel = 1;
            }
            let steeringForce = bhvMoveTs.Seek(posStart, posNextPath, this.DesiredSpeed * responseLevel);
            steeringForce = TruncateByVec2Mag(this.MaxForce, steeringForce);
            this.steeringForceApply(steeringForce, dt);
        }
    }
    getNormalPoint(p: cc.Vec2, a: cc.Vec2, b: cc.Vec2) {
        let ap = p.sub(a);
        let ab = b.sub(a);
        ab.normalizeSelf();
        ab.mulSelf(ap.dot(ab));
        return a.add(ab);
    }
    steeringForceApply(steeringForce, dt) {
        // 计算瞬时加速度
        var acc = steeringForce.div(this.Mass);
        // 计算瞬时速度
        this.vVelocity.addSelf(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(this.MaxSpeed, this.vVelocity);
        // 计算位移，使其移动
        var posOffset = this.vVelocity.mul(dt);
        var posNow = this.node.position;
        var posNext = posNow.add(posOffset);
        this.node.position = posNext;
        // 计算朝向（角度）
        var angle = this.node.angle * Math.PI / 180;
        var currentVHeading = cc.Vec2.UP.negSelf().rotate(angle);
        var headingThisMoment = currentVHeading.lerp(this.vVelocity.normalize(), dt * this.MaxTurnRate);
        var angle = cc.Vec2.UP.negSelf().signAngle(headingThisMoment);
        var degree = angle / Math.PI * 180;
        this.node.angle = degree;
        var angle = this.node.angle * Math.PI / 180;
        this.vHeading = cc.Vec2.UP.negSelf().rotate(angle);
    }
    moveInPath(targetTileIndex: cc.Vec2) {
        let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
        let startIndex = mapCtrlTs.convertTileMapNodePositionToTileIndex(this.node.position);
        let pathList = mapCtrlTs.getPathFromTo(startIndex, targetTileIndex);
        this.currentPathList = pathList;
        this.currentRunningBhv = ShipBhvType.MoveInPath;
        this.DrawMovePath(this.currentPathList);
    }
    isInTile(testTileIndex: cc.Vec2) {
        let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
        let startIndex = mapCtrlTs.convertTileMapNodePositionToTileIndex(this.node.position);
        if (testTileIndex.x == startIndex.x && testTileIndex.y == startIndex.y) {
            return true;
        } else {
            return false;
        }
    }
    // function 绘制航线
    DrawMovePath(path: Array<cc.Vec2>) {
        if (path.length > 0) {
            let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
            let pathGraphics = cc.find("Canvas/playerSpawn/SailPathGrap").getComponent(cc.Graphics);
            pathGraphics.clear();
            for (var i = 0; i < path.length; i++) {
                console.log("path", i, path[i].toString());
                let positionInMap = mapCtrlTs.convertTilemapIndexToMapNodePosition(path[i]);
                if (i == 0) {
                    pathGraphics.moveTo(positionInMap.x, positionInMap.y);
                } else {
                    pathGraphics.lineTo(positionInMap.x, positionInMap.y);
                }
            }
            pathGraphics.stroke();
        }
    }
}
