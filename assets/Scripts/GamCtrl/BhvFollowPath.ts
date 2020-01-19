import PlayerCtrl, { ShipBhvType } from "./PlayerCtrl";
import MapCtrl from "./MapCtrl";
import BhvMove from "./BhvMove";
import { getNormalPoint } from "../Util/Tools";
import GameInfoNotice, { InfoSailing } from "./GameInfoNotice";

const { ccclass, property } = cc._decorator;
export enum BhvFollowPathStatus {
    NotInit = 0,
    Working,
    Finshed,
}
export enum ShipPostureType {
    KeepHeading = 0,
    Turning
}
@ccclass
export default class BhvFollowPath extends cc.Component {
    currentPathList: Array<cc.Vec2> = null;
    currentRunningStatus: BhvFollowPathStatus = 0;
    currentPathPoint: cc.Vec2 = null;
    currentPosture: ShipPostureType = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        if (this.currentRunningStatus != BhvFollowPathStatus.Working) return;

        let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
        let BhvMoveTs = this.node.getComponent(BhvMove);
        if (this.isInTile(this.getFinshedTile()) == true) { // 意味着已经到达前进节点
            // 到达节点之后而且再无新的节点需要导航，认为导航结束
            this.currentRunningStatus = BhvFollowPathStatus.Finshed;
            this.DrawMovePath([]);
            return;
        }
        // 意味着没有到达前进节点，则对本段路径进行导航计算
        // 1,预测未来的位置
        let pathR = 32; // 为什么是32，因为地图的tile是64X64
        let preDictLoc = BhvMoveTs.vVelocity.normalize().mul(pathR).add(this.node.position);
        // 2,计算未来的位置到路径点的法线长度
        let normal = this.node.position;
        let worldRecord = 1000000;  // Start with a very high record distance that can easily be beaten
        for (var i = 0; i < this.currentPathList.length - 1; i++) {
            let a = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.currentPathList[i]);
            let b = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.currentPathList[i + 1]);
            let normalPoint = getNormalPoint(preDictLoc, a, b);
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
        let posNextPath;
        // 判断是否需要调整航向
        if (worldRecord > pathR) {
            // 调整航向
            posNextPath = normal;
            this.currentPosture = ShipPostureType.Turning;
        } else {
            // 保持航向
            posNextPath = mapCtrlTs.convertTilemapIndexToMapNodePosition(this.getFinshedTile());
            this.currentPosture = ShipPostureType.KeepHeading;
        }
        this.currentPathPoint = posNextPath;
    }

    init(targetTileIndex: cc.Vec2) {
        let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
        let startIndex = mapCtrlTs.convertTileMapNodePositionToTileIndex(this.node.position);
        let pathList = mapCtrlTs.getPathFromTo(startIndex, targetTileIndex);
        if (pathList.length < 2) {
            cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoSailing("无法航行到那里"));
            return;
        }
        this.currentPathList = pathList;
        this.currentRunningStatus = BhvFollowPathStatus.Working;
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
    getFinshedTile() {
        return this.currentPathList[this.currentPathList.length - 1];
    }
    // function 绘制航线
    DrawMovePath(path: Array<cc.Vec2>) {
        
        return;

        if (path.length > 0) {
            let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
            let pathGraphics = cc.find("Canvas/playerSpawn/SailPathGraphics").getComponent(cc.Graphics);
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
        } else {
            let pathGraphics = cc.find("Canvas/playerSpawn/SailPathGraphics").getComponent(cc.Graphics);
            pathGraphics.clear();
        }
    }
}
