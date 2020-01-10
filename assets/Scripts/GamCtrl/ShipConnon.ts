import { convertLocalToAnotherLocal } from "../Util/Tools";
import ConnonBullet, { GrounpType } from "./ConnonBullet";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShipConnon extends cc.Component {
    @property(cc.Prefab)
    connonBullet: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:
    speed: number = 200;
    damage: number = 1;
    shotRange: number = 300;
    reloadTime: number = 3.0;
    runtimeReloadTile: number = 0;
    isReload: boolean = true;
    belongToUUid: string = null;
    belongTo: GrounpType = -1;
    // onLoad () {}

    start() {
    }

    update(dt) {
        this.aim(new cc.Vec2(200, 200));
        this.fire(new cc.Vec2(200, 200));
        if (this.isReload == false) {
            this.runtimeReloadTile += dt;
            if (this.runtimeReloadTile >= this.reloadTime) {
                this.isReload = true;
            }
        }
    }
    init(belongToUUid: string, belongTo: GrounpType) {
        this.belongToUUid = belongToUUid;
        this.belongTo = belongTo;
    }
    aim(targetPos: cc.Vec2) {
        let mapNode = cc.find("Canvas/TiledMap");
        var localTargetPos = convertLocalToAnotherLocal(targetPos, mapNode, this.node.parent);
        var dir = localTargetPos.sub(this.node.position);

        var angle = cc.Vec2.RIGHT.signAngle(dir);
        var degree = angle / Math.PI * 180;
        // console.log('aimed degree', dir.toString(), degree, this.node.parent.angle);

        this.node.angle = degree;
    }
    fire(targetPos: cc.Vec2) {
        if (this.isReload == true) {
            this.isReload = false;
            this.runtimeReloadTile = 0;

            let mapNode = cc.find("Canvas/TiledMap");
            let bulletSpawnNode = cc.find("Canvas/BulletSpawn");
            let selfBulletSpawnPosNode = this.node.getChildByName("bulletSpawnPos");
            let selfPosInMap = convertLocalToAnotherLocal(this.node.position, this.node.parent, mapNode);
            let selfBulletSpawnPosInMap = convertLocalToAnotherLocal(selfBulletSpawnPosNode.position, selfBulletSpawnPosNode.parent, mapNode);
            let shotDirection = targetPos.sub(selfPosInMap);
            console.log("fire from", selfPosInMap.toString(), "to", targetPos.toString(), "shotDir", shotDirection.toString());

            let cannonBall = cc.instantiate(this.connonBullet);
            cannonBall.getComponent(ConnonBullet).init(shotDirection, shotDirection.mag(), this.speed, this.damage, this.belongToUUid, this.belongTo);
            cannonBall.position = selfBulletSpawnPosInMap;
            bulletSpawnNode.addChild(cannonBall);
        }
    }
}
