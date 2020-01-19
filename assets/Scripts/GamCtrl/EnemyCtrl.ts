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
    _MaxSpeed: number = 100; //单位: 像素/秒
    MaxForce: number = 200;
    TruningSpeedRatio: number = 5; // 转向加力系数
    radarScanInterval: number = 2; // 雷达扫描间隔
    runtimeRadarScanTime: number = 0;
    ShipName: string = "飞翔的荷兰人";
    _HP: number = 1000;
    _FireRange: number = 200; // 火炮射程
    RadarRange: number = 400; // 雷达照射范围
    currentHp: number = 1000;
    _selfHealing: number = 1;
    selfHealingHPShowInterval: number = 3;
    selfHealingHPShowIntervalCounter: number = 0;
    currentPathList: Array<cc.Vec2> = null;
    currentRunningBhv: ShipBhvType = -1;
    currentWarnLevel: WarnLevel = 0;

    get HP() {
        return this._HP + this.shipMaxHpAdd;
    }
    set HP(val) {
        this._HP = val;
    }
    get MaxSpeed() {
        return this._MaxSpeed + this.shipMaxSpeedAdd;
    }
    set MaxSpeed(val) {
        this._MaxSpeed = val;
    }
    get FireRange() {
        return this._FireRange + this.connonRangeAdd;
    }
    set FireRange(val) {
        this._FireRange = val;
    }
    get selfHealing() {
        return this._selfHealing + this.shipSelfHealAdd;
    }
    set selfHealing(val) {
        this._selfHealing = val;
    }
    // buff
    positionLocked: number = 0;// 禁止移动

    // 左舷前位炮
    leftFontConnon: CannonModel = new CannonModel(true, 300, 5, 3);
    // 左舷后位炮
    leftBackConnon: CannonModel = new CannonModel(true, 300, 5, 3);
    // 右舷前位炮
    rightFontConnon: CannonModel = new CannonModel(true, 300, 5, 3);
    // 右舷后位炮
    rightBackConnon: CannonModel = new CannonModel(true, 300, 5, 3);

    // 增强属性
    connonSpeedAdd: number = 0;// 炮弹飞行速度增幅
    connonRangeAdd: number = 0;// 炮弹射程增幅
    skillAparKillerChance: number = 0;//桅杆杀手触发概率
    connonReloadIntervalSub: number = 0;//火炮装弹时间缩减
    skillFastShootChance: number = 0;//急速射击触发概率
    connonDamageAdd: number = 0;//火炮伤害增幅
    skillCritShootChance: number = 0; // 毁灭打击触发概率
    shipMaxSpeedAdd: number = 0;//最高航速增幅
    shipMaxHpAdd: number = 0;//最高血量增幅
    skillLuckyWave: number = 0;//幸运海浪触发概率
    shipSelfHealAdd: number = 0;//每秒回血增幅
    skillFastRepair: number = 0; // 战斗中回血比例

    // 1炮位 实例
    @property(cc.Node)
    leftFrontConnonNode: cc.Node = null;
    // 2炮位 实例
    @property(cc.Node)
    leftBackConnonNode: cc.Node = null;
    // 3炮位 实例
    @property(cc.Node)
    rightFrontConnonNode: cc.Node = null;
    // 4炮位 实例
    @property(cc.Node)
    rightBackConnonNode: cc.Node = null;

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
        this.UpdateGunSet();
        this.HpProgressNode.getComponent(cc.ProgressBar).progress = this.currentHp / this.HP; //初始化血条
        this.onHPChange(0);

        // func test
        // this.setEnumyShipData();
        this.setEnumyExterData(-100, 200, 10, 0, 10, 0, 0, 0, 0, 0, 0, 0);
    }
    UpdateGunSet() {
        if (this.leftFontConnon != null && this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Enemy, this.ShipName, "左舷前位炮", this.leftFontConnon.bulletSpeed, this.leftFontConnon.bulletDamage, this.leftFontConnon.reloadTime);
        } else {
            this.leftFrontConnonNode.active = false;
        }
        if (this.leftBackConnon != null && this.leftBackConnon.isActive == true) {
            this.leftBackConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Enemy, this.ShipName, "左舷后位炮", this.leftBackConnon.bulletSpeed, this.leftBackConnon.bulletDamage, this.leftBackConnon.reloadTime);
        } else {
            this.leftBackConnonNode.active = false;
        }
        if (this.rightFontConnon != null && this.rightFontConnon.isActive == true) {
            this.rightFrontConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Enemy, this.ShipName, "右舷前位炮", this.rightFontConnon.bulletSpeed, this.rightFontConnon.bulletDamage, this.rightFontConnon.reloadTime);
        } else {
            this.rightFrontConnonNode.active = false;
        }
        if (this.rightBackConnon != null && this.rightBackConnon.isActive == true) {
            this.rightBackConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Enemy, this.ShipName, "右舷后位炮", this.rightBackConnon.bulletSpeed, this.rightBackConnon.bulletDamage, this.rightBackConnon.reloadTime);
        } else {
            this.rightBackConnonNode.active = false;
        }
    }
    // 设置 技能特性
    setEnumyExterData(connonSpeedAdd
        , connonRangeAdd
        , skillAparKillerChance
        , connonReloadIntervalSub
        , skillFastShootChance
        , connonDamageAdd
        , skillCritShootChance
        , shipMaxSpeedAdd
        , shipMaxHpAdd
        , skillLuckyWave
        , shipSelfHealAdd
        , skillFastRepair) {
        this.connonSpeedAdd = connonSpeedAdd;
        this.connonRangeAdd = connonRangeAdd;
        this.skillAparKillerChance = skillAparKillerChance;
        this.connonReloadIntervalSub = connonReloadIntervalSub;
        this.skillFastShootChance = skillFastShootChance;
        this.connonDamageAdd = connonDamageAdd;
        this.skillCritShootChance = skillCritShootChance;
        this.shipMaxSpeedAdd = shipMaxSpeedAdd;
        this.shipMaxHpAdd = shipMaxHpAdd;
        this.skillLuckyWave = skillLuckyWave;
        this.shipSelfHealAdd = shipSelfHealAdd;
        this.skillFastRepair = skillFastRepair;

        this.leftFrontConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.leftBackConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.rightFrontConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.rightBackConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
    }
    // 用来设置 舰艇的数据， 如果不重置则使用默认值
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
            if (this.positionLocked > 0) {
                this.positionLocked -= dt;
            } else {
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
            if (this.isInCanbat() == true) {
                if (this.skillFastRepair > 0) {
                    let hpHeal = Math.ceil(this.selfHealingHPShowInterval * this.selfHealing * this.skillFastRepair / 100);
                    this.onHPChange(hpHeal, true);
                }
            } else {
                this.onHPChange(this.selfHealingHPShowInterval * this.selfHealing);
            }
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
        if (this.leftBackConnon.isActive == true) {
            this.leftBackConnonNode.getComponent(ShipConnon).fire(firePos);
        }
        if (this.rightFontConnon.isActive == true) {
            this.rightFrontConnonNode.getComponent(ShipConnon).fire(firePos);
        }
        if (this.rightBackConnon.isActive == true) {
            this.rightBackConnonNode.getComponent(ShipConnon).fire(firePos);
        }
    }
    aim(firePos: cc.Vec2) {
        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).aim(firePos);
        }
        if (this.leftBackConnon.isActive == true) {
            this.leftBackConnonNode.getComponent(ShipConnon).aim(firePos);
        }
        if (this.rightFontConnon.isActive == true) {
            this.rightFrontConnonNode.getComponent(ShipConnon).aim(firePos);
        }
        if (this.rightBackConnon.isActive == true) {
            this.rightBackConnonNode.getComponent(ShipConnon).aim(firePos);
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
        cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar(this.ShipName + "被我方击沉"));
        let sinkEffect = cc.instantiate(this.shipSinkEffect);
        sinkEffect.position = this.node.position;
        this.node.parent.addChild(sinkEffect);
        this.node.destroy();
    }
    onHPChange(deltaHP: number, noShowAction?: boolean, skillAparKillerChance?: number) {
        console.log("onHPChange");
        let from = this.currentHp;
        if (deltaHP > 0) {
            if (this.currentHp + deltaHP > this.HP) {
                this.currentHp = this.HP;
            } else {
                this.currentHp += deltaHP;
            }
        } else {
            if (skillAparKillerChance > 0) {
                let randomNum = Math.random() * 100;
                if (randomNum < skillAparKillerChance) {
                    this.positionLocked = 2;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar(this.ShipName + "被 桅杆杀手 命中"));
                }
            }
            if (this.skillLuckyWave > 0) {
                let randomNum = Math.random() * 100;
                if (randomNum < this.skillLuckyWave) {
                    return;
                }
            }
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
    isInCanbat() {
        let spawnNode = cc.find("Canvas/playerSpawn");
        let enemyList = spawnNode.getComponentsInChildren(PlayerCtrl);
        console.log("findEnemyTarget length", enemyList.length);
        if (enemyList.length > 0) {
            let isAnyOneInFireRange = false;
            let isAnyOneInRadarRange = false;
            for (var i = 0; i < enemyList.length; i++) {
                let enumyCtrlTs = enemyList[i];
                let distance = enumyCtrlTs.node.position.sub(this.node.position).mag();
                if (distance <= this.FireRange) {
                    isAnyOneInFireRange = true;
                    return true;
                }
                if (distance <= this.RadarRange) {
                    isAnyOneInRadarRange = true;
                }
            }
        }
        return false;
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
    }
}
