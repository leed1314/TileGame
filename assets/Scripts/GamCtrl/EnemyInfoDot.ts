import { GameDataRuntime } from "../UserModel/UserModel";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyInfoDot extends cc.Component {
    @property([cc.SpriteFrame])
    colorDotList: Array<cc.SpriteFrame> = [];
    @property(cc.Prefab)
    colorTipPrefab: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        // this.showColorTipDot(new cc.Vec2(200, 200), 100);
    }

    showColorTipDot(pos: cc.Vec2, size) {
        let isInView = this.isInCanmaerView(pos, size);
        console.log("showColorTipDot 是否在视野中", isInView);
        if (isInView == false) {
            let colorDotPos = this.getPosInEdge(pos, size, 30);
            console.log("showColorTipDot 视野边缘的位置", colorDotPos);
            let colorDot = cc.instantiate(this.colorTipPrefab);
            colorDot.getComponent(cc.Sprite).spriteFrame = this.colorDotList[Math.floor(Math.random() * this.colorDotList.length)];
            colorDot.position = colorDotPos;
            this.node.addChild(colorDot);
        }
    }
    // 返回在屏幕边缘上的坐标
    getPosInEdge(pos, size, offset) {
        var posmainCamera = cc.find("Canvas/Main Camera").position;
        // cc.log("posmainCamera",posmainCamera.toString());
        var posXRightBounder = cc.winSize.width / 2 + posmainCamera.x;
        var posXLeftBounder = -cc.winSize.width / 2 + posmainCamera.x;

        var posYUpBounder = cc.winSize.height / 2 + posmainCamera.y;
        var posYDownBounder = -cc.winSize.height / 2 + posmainCamera.y;
        var xEdgePos = pos.x;
        var yEdgePos = pos.y;
        if (pos.x + size < posXLeftBounder) {
            xEdgePos = -cc.winSize.width / 2 + offset;
        } else if (pos.x - size > posXRightBounder) {
            xEdgePos = cc.winSize.width / 2 - offset;
        } else {
            xEdgePos = cc.winSize.width * (pos.x - posmainCamera.x) / (GameDataRuntime.MapSize.width * GameDataRuntime.TileSize.width);
        }

        if (pos.y + size < posYDownBounder) {
            yEdgePos = -cc.winSize.height / 2 + offset;
        } else if (pos.y - size > posYUpBounder) {
            yEdgePos = cc.winSize.height / 2 - offset;
        } else {
            yEdgePos = cc.winSize.height * (pos.y - posmainCamera.y) / (GameDataRuntime.MapSize.height * GameDataRuntime.TileSize.height);
        }
        return new cc.Vec2(xEdgePos, yEdgePos);
    }
    // 是否在屏幕内
    isInCanmaerView(pos, size) {
        var posmainCamera = cc.find("Canvas/Main Camera").position;
        // cc.log("posmainCamera",posmainCamera.toString());
        var posXRightBounder = cc.winSize.width / 2 + posmainCamera.x;
        var posXLeftBounder = -cc.winSize.width / 2 + posmainCamera.x;

        var posYUpBounder = cc.winSize.height / 2 + posmainCamera.y;
        var posYDownBounder = -cc.winSize.height / 2 + posmainCamera.y;
        var xIn = false;
        if (pos.x + size > posXLeftBounder && pos.x - size < posXRightBounder) {
            xIn = true;
        }
        var yIn = false;
        if (pos.y + size > posYDownBounder && pos.y - size < posYUpBounder) {
            yIn = true;
        }
        if (xIn == true && yIn == true) {
            return true;
        } else {
            return false;
        }
    }
}
