import { convertLocalToAnotherLocal } from "../Util/Tools";
import ConnonBullet, { GrounpType } from "./ConnonBullet";
import GameInfoNotice, { InfoConnon } from "./GameInfoNotice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShipConnon extends cc.Component {
    @property(cc.Prefab)
    connonBullet: cc.Prefab = null;
    @property(cc.Prefab)
    connonFireworkPrefab: cc.Prefab = null;
    // LIFE-CYCLE CALLBACKS:
    _bulletSpeed: number = 300;
    _bulletDamage: number = 20;
    _reloadTime: number = 3.0;
    runtimeReloadTime: number = 0;
    isReload: boolean = false;
    belongToUUid: string = null;
    belongToShipName: string = null;
    belongTo: GrounpType = -1;
    ConnonName: string = null;
    get bulletSpeed() {
        return this._bulletSpeed + this._connonSpeedAdd;
    }
    set bulletSpeed(val) {
        this._bulletSpeed = val;
    }
    get bulletDamage() {
        return this._bulletDamage + this._connonDamageAdd;
    }
    set bulletDamage(val) {
        this._bulletDamage = val;
    }
    get reloadTime() {
        let sub = this._reloadTime - this._connonReloadIntervalSub;
        return sub < 0 ? 0.5 : sub;
    }
    set reloadTime(val) {
        this._reloadTime = val;
    }

    _connonSpeedAdd: number = 0;// 炮弹飞行速度增幅
    _skillAparKillerChance: number = 0;//桅杆杀手触发概率
    _connonReloadIntervalSub: number = 0;//火炮装弹时间缩减
    _skillFastShootChance: number = 0;//急速射击触发概率
    _connonDamageAdd: number = 0;//火炮伤害增幅
    _skillCritShootChance: number = 0; // 毁灭打击触发概率
    // onLoad () {}

    start() {
    }

    update(dt) {
        // this.aim(new cc.Vec2(200, 200));
        // this.fire(new cc.Vec2(200, 200));
        if (this.isReload == false) {
            this.runtimeReloadTime += dt;
            if (this.runtimeReloadTime >= this.reloadTime) {
                this.isReload = true;
                if (GrounpType.Player == this.belongTo) {
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoConnon(this.ConnonName, "填装完毕"));
                }
            }
        }
    }
    init(belongToUUid: string, belongTo: GrounpType, belongToShipName: string, ConnonName: string, bulletSpeed: number, bulletDamage: number, reloadTime: number) {
        this.belongToUUid = belongToUUid;
        this.belongTo = belongTo;
        this.belongToShipName = belongToShipName;
        this.ConnonName = ConnonName;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.reloadTime = reloadTime;
    }
    setExternal(_connonSpeedAdd, _connonReloadIntervalSub, _connonDamageAdd, _skillAparKillerChance, _skillFastShootChance, _skillCritShootChance) {
        this._connonSpeedAdd = _connonSpeedAdd;
        this._connonReloadIntervalSub = _connonReloadIntervalSub;
        this._connonDamageAdd = _connonDamageAdd;
        this._skillAparKillerChance = _skillAparKillerChance;
        this._skillFastShootChance = _skillFastShootChance;
        this._skillCritShootChance = _skillCritShootChance;
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
            this.runtimeReloadTime = 0;

            let mapNode = cc.find("Canvas/TiledMap");
            let bulletSpawnNode = cc.find("Canvas/BulletSpawn");
            let selfBulletSpawnPosNode = this.node.getChildByName("bulletSpawnPos");
            let selfPosInMap = convertLocalToAnotherLocal(this.node.position, this.node.parent, mapNode);
            let selfBulletSpawnPosInMap = convertLocalToAnotherLocal(selfBulletSpawnPosNode.position, selfBulletSpawnPosNode.parent, mapNode);
            let shotDirection = targetPos.sub(selfPosInMap);

            console.log("fire from", selfPosInMap.toString(), "to", targetPos.toString(), "shotDir", shotDirection.toString());
            this.node.getComponent(cc.Animation).play("ConnonFireShake");

            let cannonBall = cc.instantiate(this.connonBullet);
            cannonBall.getComponent(ConnonBullet).init(shotDirection, shotDirection.mag(), this.bulletSpeed, this.bulletDamage, this.belongToUUid, this.belongTo, this.belongToShipName);
            cannonBall.position = selfBulletSpawnPosInMap;
            bulletSpawnNode.addChild(cannonBall);

            let cannonFirework = cc.instantiate(this.connonFireworkPrefab);
            cannonFirework.position = cc.Vec2.ZERO;
            selfBulletSpawnPosNode.addChild(cannonFirework)
        }
    }
}
