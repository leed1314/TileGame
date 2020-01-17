import { waitForTime, MapNum, TruncateByVec2Mag } from "../Util/Tools";
import PlayerCtrl, { ShipBhvType, WarnLevel } from "./PlayerCtrl";
import { CannonModel } from "../UserModel/UserModel";
import ShipConnon from "./ShipConnon";
import BhvMove from "./BhvMove";
import BhvFollowPath, { BhvFollowPathStatus, ShipPostureType } from "./BhvFollowPath";
import MapCtrl from "./MapCtrl";
import { GrounpType } from "./ConnonBullet";
import GameInfoNotice, { InfoRadar } from "./GameInfoNotice";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyCtrl extends cc.Component {
    // LIFE-CYCLE CALLBACKS:
    shipFireCheckInterval: number = 2;
    shipFireCheckIntervalRuntime: number = 0;
    /**
     * MaxSpeed 和 MaxForce 应在一个合适的比例之下：
     * 如果 MaxSpeed 过大会出现转向时绕大圈，无法到达终点
     * 如果 MaxForce 过大会出现转向时加速度变化过快，同样出现无法到达终点
     */
    MaxSpeed: number = 100; //单位: 像素/秒
    MaxForce: number = 200;
    TruningSpeedRatio: number = 5; // 转向加力系数
    radarScanInterval: number = 2; // 雷达扫描间隔
    runtimeRadarScanTime: number = 0;
    ShipName: string = "飞翔的荷兰人";
    HP: number = 100;
    FireRange: number = 300; // 火炮射程
    RadarRange: number = 400; // 雷达照射范围
    currentHp: number = 100;
    selfHealing: number = 1;
    selfHealingHPShowInterval: number = 3;
    selfHealingHPShowIntervalCounter: number = 0;
    currentPathList: Array<cc.Vec2> = null;
    currentRunningBhv: ShipBhvType = -1;
    currentWarnLevel: WarnLevel = 0;

    // 左舷 前位炮参数
    leftFontConnon: CannonModel = new CannonModel(true, 300, 10, 3);

    @property(cc.Node)
    leftFrontConnonNode: cc.Node = null;

    @property(cc.Prefab)
    shipSinkEffect: cc.Prefab = null;
    @property([cc.Prefab])
    fireEffectList: Array<cc.Prefab> = [];
    @property(cc.Node)
    HpProgressNode: cc.Node = null;
    @property(cc.Node)
    fireEffectNode: cc.Node = null;
    // onLoad () {}

    start() {
        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Enemy, this.ShipName, "左舷前位炮", this.leftFontConnon.bulletSpeed, this.leftFontConnon.bulletDamage, this.leftFontConnon.reloadTime);
        } else {
            this.leftFrontConnonNode.active = false;
        }
        this.HpProgressNode.getComponent(cc.ProgressBar).progress = this.currentHp / this.HP; //初始化血条
        this.onHPChange(0);
    }
    // 用来重置 舰艇的数据， 如果不重置则使用默认值
    setEnumyShipData(MaxSpeed: number, MaxForce: number, radarScanInterval: number, ShipName: string, FireRange: number, RadarRange: number, HP: number, currentHp: number, selfHealing: number,
        leftFontConnon: CannonModel) {
        this.MaxSpeed = MaxSpeed;
        this.MaxForce = MaxForce;
        this.radarScanInterval = radarScanInterval;
        this.ShipName = ShipName;
        this.FireRange = FireRange;
        this.RadarRange = RadarRange;
        this.HP = HP;
        this.currentHp = currentHp;
        this.selfHealing = selfHealing;
        this.leftFontConnon = leftFontConnon;
    }
    update(dt) {
        this.HpProgressNode.angle = this.node.angle * -1;  // 纠正血条的角度
        this.fireEffectNode.angle = this.node.angle * -1;  // 纠正血条的角度 
        // 船上燃烧火焰效果管理
        if (this.shipFireCheckIntervalRuntime > this.shipFireCheckInterval) {
            this.shipFireCheckIntervalRuntime = 0;
            this.UpdateFireLevelWithHp();
        } else {
            this.shipFireCheckIntervalRuntime += dt;
        }

        // 航行管理
        if (this.currentRunningBhv == ShipBhvType.MoveInPath) {
            let bhvMoveTs = this.getComponent(BhvMove);
            let bhvFollowPathTs = this.node.getComponent(BhvFollowPath)
            if (bhvFollowPathTs.currentRunningStatus == BhvFollowPathStatus.Finshed) { // 意味着已经到达前进节点
                this.currentRunningBhv = ShipBhvType.Idle;
                return;
            }
            // 计算行为合力
            let posNextPath = bhvFollowPathTs.currentPathPoint == null ? this.node.position : bhvFollowPathTs.currentPathPoint;
            let responseLevel = 1;
            if (bhvFollowPathTs.currentPosture = ShipPostureType.Turning) {
                responseLevel *= this.TruningSpeedRatio;
            }
            let steeringForce = bhvMoveTs.Seek(this.node.position, posNextPath, this.MaxSpeed * responseLevel);
            steeringForce = TruncateByVec2Mag(this.MaxForce, steeringForce);
            bhvMoveTs.steeringForceApply(steeringForce, dt, this.MaxSpeed);
        }
        // 雷达扫描及其火力管理
        if (this.runtimeRadarScanTime >= this.radarScanInterval) {
            this.runtimeRadarScanTime = 0;
            this.findEnemyTarget();
        } else {
            this.runtimeRadarScanTime += dt;
        }
        //血量恢复管理
        if (this.selfHealingHPShowIntervalCounter > this.selfHealingHPShowInterval) {
            this.selfHealingHPShowIntervalCounter = 0;
            this.onHPChange(this.selfHealingHPShowInterval * this.selfHealing, this.findEnemyTarget());
        } else {
            this.selfHealingHPShowIntervalCounter += dt;
        }
    }
    enterCombat() {
        let sailNode = this.node.getChildByName("shipSail");
        // sailNode.opacity = 72;
        let fadeOut = cc.fadeTo(1.1, 72);
        sailNode.runAction(fadeOut);
    }
    exitCombat() {
        let sailNode = this.node.getChildByName("shipSail");
        // sailNode.opacity = 255;
        let fadeIn = cc.fadeTo(1.1, 255);
        sailNode.runAction(fadeIn);
    }
    fire(firePos: cc.Vec2) {
        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).fire(firePos);
        }
    }
    aim(firePos: cc.Vec2) {
        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).aim(firePos);
        }
    }
    moveInPath(targetTileIndex: cc.Vec2) {
        this.currentRunningBhv = ShipBhvType.MoveInPath;
        this.node.getComponent(BhvFollowPath).init(targetTileIndex);
    }
    async showHpChangeAction(from: number, to: number, ) {
        if (this.HpProgressNode.getNumberOfRunningActions() > 0) return;
        this.HpProgressNode.opacity = 255;
        this.HpProgressNode.getComponent(cc.ProgressBar).progress = from / this.HP;
        while (from != to) {
            if (from > to) {
                from -= 1;
            } else {
                from += 1;
            }
            this.HpProgressNode.getComponent(cc.ProgressBar).progress = from / this.HP;
            await waitForTime(0);
        }
        let delay = cc.delayTime(0.5);
        let fadeOut = cc.fadeOut(0.3);
        this.HpProgressNode.runAction(cc.sequence(delay, fadeOut));
    }
    UpdateFireLevelWithHp() {
        let HpPercent = this.currentHp / this.HP;
        let currentFire = this.fireEffectNode.childrenCount;
        if (HpPercent < 0.2) {
            // disaster 保持 6 个火焰效果
            if (currentFire < 7) {
                this.createRandomFireEffect();
            }
        } else if (HpPercent < 0.4) {
            // mid 保持 4 个火焰效果
            if (currentFire < 5) {
                this.createRandomFireEffect();
            }
        } else if (HpPercent < 0.7) {
            // small  保持 2 个火焰效果
            if (currentFire < 3) {
                this.createRandomFireEffect();
            }
        }
    }
    createRandomFireEffect() {
        let fireEffect = cc.instantiate(this.fireEffectList[Math.floor(this.fireEffectList.length * Math.random())]);
        fireEffect.scale = MapNum(Math.random(), 0, 1, 0.6, 1);
        fireEffect.x = MapNum(Math.random(), 0, 1, -15, 15);
        fireEffect.y = MapNum(Math.random(), 0, 1, -40, 40);
        this.fireEffectNode.addChild(fireEffect);
    }
    onSink() {
        // 沉没效果
        cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar(this.ShipName + "光荣沉没"));
        let sinkEffect = cc.instantiate(this.shipSinkEffect);
        sinkEffect.position = this.node.position;
        this.node.parent.addChild(sinkEffect);
        this.node.destroy();
    }
    onHPChange(deltaHP: number, noShowAction?: boolean) {
        console.log("onHPChange");
        let from = this.currentHp;
        if (deltaHP > 0) {
            if (this.currentHp + deltaHP > this.HP) {
                this.currentHp = this.HP;
            } else {
                this.currentHp += deltaHP;
            }
        } else {
            if (this.currentHp + deltaHP <= 0) {
                //  销毁对象
                this.onSink();
            } else {
                this.currentHp += deltaHP;
            }
        }
        if (from == this.currentHp) return;
        if (noShowAction == true) return;
        this.showHpChangeAction(from, this.currentHp);
    }
    // 返回 最近的敌方舰艇
    findEnemyTarget() {
        let spawnNode = cc.find("Canvas/playerSpawn");
        let playerList = spawnNode.getComponentsInChildren(PlayerCtrl);
        if (playerList.length > 0) {
            let isAnyOneInFireRange = false;
            let isAnyOneInRadarRange = false;
            let enemyInFireRange = null;
            for (var i = 0; i < playerList.length; i++) {
                let enumyCtrlTs = playerList[i];
                let distance = enumyCtrlTs.node.position.sub(this.node.position).mag();
                if (distance <= this.FireRange) {
                    enemyInFireRange = enumyCtrlTs;
                    isAnyOneInFireRange = true;
                }
                if (distance <= this.RadarRange) {
                    isAnyOneInRadarRange = true;
                }
            }
            if (isAnyOneInRadarRange) {
                if (this.currentWarnLevel == WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                    this.enterCombat();
                }
            } else {
                if (this.currentWarnLevel != WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.none;
                    this.exitCombat();
                }
            }
            if (isAnyOneInFireRange) {
                if (this.currentWarnLevel != WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInShotRange;
                }
                // 进入射程开火
                this.aim(enemyInFireRange.node.position);
                this.fire(enemyInFireRange.node.position);
                return true;
            } else {
                if (this.currentWarnLevel == WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                }
            }
        } else {
            if (this.currentWarnLevel != WarnLevel.none) {
                this.currentWarnLevel = WarnLevel.none;
                this.exitCombat();
            }
        }
        return false;
    }
}
