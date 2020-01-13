import EnemyCtrl from "./EnemyCtrl";
import PlayerCtrl from "./PlayerCtrl";

const { ccclass, property } = cc._decorator;
export enum GrounpType {
    Player = 0,
    Enemy,
}
@ccclass
export default class ConnonBullet extends cc.Component {
    @property(cc.Prefab)
    fireHitPaticalPrefab = null;
    @property(cc.Prefab)
    splashHitPaticalPrefab = null;
    direction: cc.Vec2 = cc.Vec2.ZERO;
    speed: number = 200;
    damage: number = 1;
    shotDistance: number = 300;
    shotUnitUUid: string = null;
    belongGroup: GrounpType = -1;

    flyDistance: cc.Vec2 = cc.Vec2.ZERO;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    update(dt) {
        var velocity = this.direction.normalize().mul(this.speed);
        var posOffset = velocity.mul(dt);
        this.node.x += posOffset.x;
        this.node.y += posOffset.y;
        this.flyDistance.x += posOffset.x;
        this.flyDistance.y += posOffset.y;
        if (this.flyDistance.mag() > this.shotDistance) {
            this.splashAndSelfDestory();
        }
    }
    splashAndSelfDestory() {
        //  水花特效
        let splash:cc.Node = cc.instantiate(this.splashHitPaticalPrefab);
        splash.position = this.node.position
        splash.parent = this.node.parent;
        this.node.destroy();
    }
    fireWorkAndSelfDestory() {
        //  烟花特效
        let fire:cc.Node = cc.instantiate(this.fireHitPaticalPrefab);
        fire.getComponent(cc.ParticleSystem).gravity = this.direction.normalize().mul(this.speed);
        fire.position = this.node.position
        fire.parent = this.node.parent;
        this.node.destroy();
    }
    /**
     * 
     * @param direction 向哪里飞
     * @param shotDistance 飞多远
     * @param speed 飞多快
     * @param damage 造成多少伤害
     */
    init(direction: cc.Vec2, shotDistance: number, speed: number, damage: number, shotUnitUUid: string, belongGroup: GrounpType) {
        this.shotDistance = shotDistance;
        this.direction = direction;
        this.speed = speed;
        this.damage = damage;
        this.shotUnitUUid = shotUnitUUid;
        this.belongGroup = belongGroup;
    }
    onCollisionEnter(other, self) {
        console.log("onCollisionEnter", other.node.name, self.node.name);
        let otherNode: cc.Node = other.node;
        let selfNode: cc.Node = self.node;
        if (otherNode.uuid == this.shotUnitUUid) {
            console.log("检测到和发射者出现了碰撞，丢弃本次碰撞");
            return;
        }
        if (otherNode.getComponent(EnemyCtrl) && this.belongGroup == GrounpType.Enemy) {
            console.log("来自同一阵营 enemy，丢弃本次碰撞");
            return;
        }
        if (otherNode.getComponent(PlayerCtrl) && this.belongGroup == GrounpType.Player) {
            console.log("来自同一阵营 player，丢弃本次碰撞");
            return;
        }
        if (otherNode.getComponent(ConnonBullet)) {
            console.log("炮弹相互碰撞，丢弃本次碰撞");
            return;
        }
        if (otherNode.getComponent(EnemyCtrl)) {
            console.log("命中 enemy，进行伤害结算");
        }
        this.fireWorkAndSelfDestory();
    }
}
