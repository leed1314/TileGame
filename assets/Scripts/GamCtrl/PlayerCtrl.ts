import MapCtrl from "./MapCtrl";
import BhvMove from "./BhvMove";
import { TruncateByVec2Mag, localStorageGet, localStorageMap, localStorageSet, waitForTime, MapNum } from "../Util/Tools";
import VMEvent from "../Mvvm/VMEvent";
import ShipConnon from "./ShipConnon";
import { GrounpType } from "./ConnonBullet";
import BhvFollowPath, { BhvFollowPathStatus, ShipPostureType } from "./BhvFollowPath";
import EnemyCtrl from "./EnemyCtrl";
import GameInfoNotice, { InfoRadar } from "./GameInfoNotice";
import EnemyInfoDot from "./EnemyInfoDot";
import { CannonModel, ShipModel, PlayerShipModel } from "../UserModel/UserModel";
import { PlayerSKills } from "../UserModel/StroageModel";

const { ccclass, property } = cc._decorator;
export enum ShipBhvType {
    MoveInPath = 0,
    Idle,
}
export enum WarnLevel {
    none = 0,
    EnemyInView,
    EnemyInShotRange,
}
@ccclass
export default class PlayerCtrl extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    shipFireCheckInterval: number = 2;
    shipFireCheckIntervalRuntime: number = 0;
    /**
     * MaxSpeed 和 MaxForce 应在一个合适的比例之下：
     * 如果 MaxSpeed 过大会出现转向时绕大圈，无法到达终点
     * 如果 MaxForce 过大会出现转向时加速度变化过快，同样出现无法到达终点
     */
    _MaxSpeed: number = 100; //单位: 像素/秒
    MaxForce: number = 300;
    TruningSpeedRatio: number = 5; // 转向加力系数
    radarScanInterval: number = 0.6; // 雷达扫描间隔
    runtimeRadarScanTime: number = 0;
    ShipName: string = "黑珍珠";
    _HP: number = 100;
    _FireRange: number = 300; // 火炮射程
    RadarRange: number = 900; // 雷达照射范围
    currentHp: number = 100;
    currentPathList: Array<cc.Vec2> = null;
    currentRunningBhv: ShipBhvType = -1;
    currentWarnLevel: WarnLevel = 0;
    _selfHealing: number = 1;
    selfHealingHPShowInterval: number = 3;
    selfHealingHPShowIntervalCounter: number = 0;
    // 左舷前位炮
    leftFontConnon: CannonModel = null;
    // 左舷后位炮
    leftBackConnon: CannonModel = null;
    // 右舷前位炮
    rightFontConnon: CannonModel = null;
    // 右舷后位炮
    rightBackConnon: CannonModel = null;

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
    // 增强属性
    _connonSpeedAdd: number = 0;// 炮弹飞行速度增幅
    _connonRangeAdd: number = 0;// 炮弹射程增幅
    _skillAparKillerChance: number = 0;//桅杆杀手触发概率
    _connonReloadIntervalSub: number = 0;//火炮装弹时间缩减
    _skillFastShootChance: number = 0;//急速射击触发概率
    _connonDamageAdd: number = 0;//火炮伤害增幅
    _skillCritShootChance: number = 0; // 毁灭打击触发概率
    _shipMaxSpeedAdd: number = 0;//最高航速增幅
    _shipMaxHpAdd: number = 0;//最高血量增幅
    _skillLuckyWave: number = 0;//幸运海浪触发概率
    _shipSelfHealAdd: number = 0;//每秒回血增幅
    _skillFastRepair: number = 0; // 战斗中回血比例
    get connonSpeedAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 1); // 技能 1 的选点数据
        return runtimeCalulate.level * 20;
    }
    set connonSpeedAdd(val) {
        this._connonSpeedAdd = val;
    }
    get connonRangeAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 2);
        return runtimeCalulate.level * 25;
    }
    set connonRangeAdd(val) {
        this._connonRangeAdd = val;
    }
    get skillAparKillerChance() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 3);
        let runtimeCalulate2 = PlayerSKills.find(data => data.id === 4);
        return runtimeCalulate.level * 5 + runtimeCalulate2.level * 1;
    }
    set skillAparKillerChance(val) {
        this._skillAparKillerChance = val;
    }
    get connonReloadIntervalSub() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 5);
        return runtimeCalulate.level * 0.2;
    }
    set connonReloadIntervalSub(val) {
        this._connonReloadIntervalSub = val;
    }
    get skillFastShootChance() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 6);
        let runtimeCalulate2 = PlayerSKills.find(data => data.id === 7);
        return runtimeCalulate.level * 5 + runtimeCalulate2.level * 1;
    }
    set skillFastShootChance(val) {
        this._skillFastShootChance = val;
    }
    get connonDamageAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 8);
        return runtimeCalulate.level * 5;
    }
    set connonDamageAdd(val) {
        this._connonDamageAdd = val;
    }
    get skillCritShootChance() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 9);
        let runtimeCalulate2 = PlayerSKills.find(data => data.id === 10);
        return runtimeCalulate.level * 5 + runtimeCalulate2.level * 1;
    }
    set skillCritShootChance(val) {
        this._skillCritShootChance = val;
    }
    get shipMaxSpeedAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 11);
        return runtimeCalulate.level * 20;
    }
    set shipMaxSpeedAdd(val) {
        this._shipMaxSpeedAdd = val;
    }
    get shipMaxHpAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 12);
        return runtimeCalulate.level * 20;
    }
    set shipMaxHpAdd(val) {
        this._shipMaxHpAdd = val;
    }
    get skillLuckyWave() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 13);
        let runtimeCalulate2 = PlayerSKills.find(data => data.id === 14);
        return runtimeCalulate.level * 5 + runtimeCalulate2.level * 1;
    }
    set skillLuckyWave(val) {
        this._skillLuckyWave = val;
    }
    get shipSelfHealAdd() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 15);
        return runtimeCalulate.level * 1;
    }
    set shipSelfHealAdd(val) {
        this._shipSelfHealAdd = val;
    }
    get skillFastRepair() {
        let runtimeCalulate = PlayerSKills.find(data => data.id === 16);
        let runtimeCalulate2 = PlayerSKills.find(data => data.id === 17);
        return runtimeCalulate.level * 25 + runtimeCalulate2.level * 5;
    }
    set skillFastRepair(val) {
        this._skillFastRepair = val;
    }
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
        this.loadShipModelFromLocal();
        this.syncRunTimeSkillToUI();

        this.UpdateGunSet();
        this.HpProgressNode.getComponent(cc.ProgressBar).progress = this.currentHp / this.HP; //初始化血条
        this.onHPChange(0);
    }
    syncRunTimeSkillToUI() {
        PlayerShipModel.connonSpeedAdd = this.connonSpeedAdd;
        PlayerShipModel.connonRangeAdd = this.connonRangeAdd;
        PlayerShipModel.skillAparKillerChance = this.skillAparKillerChance;
        PlayerShipModel.connonReloadIntervalSub = this.connonReloadIntervalSub;
        PlayerShipModel.skillFastShootChance = this.skillFastShootChance;
        PlayerShipModel.connonDamageAdd = this.connonDamageAdd;
        PlayerShipModel.skillCritShootChance = this.skillCritShootChance;
        PlayerShipModel.shipMaxSpeedAdd = this.shipMaxSpeedAdd;
        PlayerShipModel.shipMaxHpAdd = this.shipMaxHpAdd;
        PlayerShipModel.skillLuckyWave = this.skillLuckyWave;
        PlayerShipModel.shipSelfHealAdd = this.shipSelfHealAdd;
        PlayerShipModel.skillFastRepair = this.skillFastRepair;

        this.leftFrontConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.leftBackConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.rightFrontConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
        this.rightBackConnonNode.getComponent(ShipConnon).setExternal(this.connonSpeedAdd, this.connonReloadIntervalSub, this.connonDamageAdd, this.skillAparKillerChance, this.skillFastShootChance, this.skillCritShootChance);
    }
    UpdateGunSet() {
        if (this.leftFontConnon != null && this.leftFontConnon.isActive == true) {
            this.leftFrontConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Player, this.ShipName, "左舷前位炮", this.leftFontConnon.bulletSpeed, this.leftFontConnon.bulletDamage, this.leftFontConnon.reloadTime);
        } else {
            this.leftFrontConnonNode.active = false;
        }
        if (this.leftBackConnon != null && this.leftBackConnon.isActive == true) {
            this.leftBackConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Player, this.ShipName, "左舷后位炮", this.leftBackConnon.bulletSpeed, this.leftBackConnon.bulletDamage, this.leftBackConnon.reloadTime);
        } else {
            this.leftBackConnonNode.active = false;
        }
        if (this.rightFontConnon != null && this.rightFontConnon.isActive == true) {
            this.rightFrontConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Player, this.ShipName, "右舷前位炮", this.rightFontConnon.bulletSpeed, this.rightFontConnon.bulletDamage, this.rightFontConnon.reloadTime);
        } else {
            this.rightFrontConnonNode.active = false;
        }
        if (this.rightBackConnon != null && this.rightBackConnon.isActive == true) {
            this.rightBackConnonNode.getComponent(ShipConnon).init(this.node.uuid, GrounpType.Player, this.ShipName, "右舷后位炮", this.rightBackConnon.bulletSpeed, this.rightBackConnon.bulletDamage, this.rightBackConnon.reloadTime);
        } else {
            this.rightBackConnonNode.active = false;
        }
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
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("战斗中回复 +" + hpHeal));
                }
            } else {
                this.onHPChange(this.selfHealingHPShowInterval * this.selfHealing);
            }
        } else {
            this.selfHealingHPShowIntervalCounter += dt;
        }
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
        cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar(this.ShipName + " 光荣沉没,大侠请重新来过"));
        let sinkEffect = cc.instantiate(this.shipSinkEffect);
        sinkEffect.position = this.node.position;
        this.node.parent.addChild(sinkEffect);
        this.node.destroy();
    }
    onHPChange(deltaHP: number, noShowAction?: boolean, skillAparKillerChance?: number) {
        console.log("onHPChange");
        let from = this.currentHp;
        if (deltaHP >= 0) {
            if (this.currentHp + deltaHP > this.HP) {
                this.currentHp = this.HP;
            } else {
                this.currentHp += deltaHP;
            }
        } else {
            if (skillAparKillerChance > 0) {
                let randomNum = Math.random() * 100;
                if (randomNum < skillAparKillerChance) {
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("我方被 桅杆杀手 命中"));
                    this.positionLocked = 2;
                }
            }
            if (this.skillLuckyWave > 0) {
                let randomNum = Math.random() * 100;
                if (randomNum < this.skillLuckyWave) {
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("幸运海浪触发 伤害抵抗"));
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
        this.restoreShipModelToLocal();
        if (noShowAction == true) return;
        this.showHpChangeAction(from, this.currentHp);
    }
    isInCanbat() {
        let spawnNode = cc.find("Canvas/playerSpawn");
        let enemyList = spawnNode.getComponentsInChildren(EnemyCtrl);
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
        let enemyList = spawnNode.getComponentsInChildren(EnemyCtrl);
        console.log("findEnemyTarget length", enemyList.length);
        if (enemyList.length > 0) {
            let isAnyOneInFireRange = false;
            let isAnyOneInRadarRange = false;
            let enemyInFireRange = null;
            for (var i = 0; i < enemyList.length; i++) {
                let enumyCtrlTs = enemyList[i];
                let distance = enumyCtrlTs.node.position.sub(this.node.position).mag();
                if (distance <= this.FireRange) {
                    enemyInFireRange = enumyCtrlTs;
                    isAnyOneInFireRange = true;
                }
                if (distance <= this.RadarRange) {
                    enemyInFireRange = enumyCtrlTs;
                    isAnyOneInRadarRange = true;
                    cc.find("Canvas/EnemyInfoDot").getComponent(EnemyInfoDot).showColorTipDot(enumyCtrlTs.node.position, 100);
                }
            }
            if (isAnyOneInRadarRange) {
                if (this.currentWarnLevel == WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("警戒:发现" + enemyList.length + "艘敌舰"));
                    this.enterCombat();
                }
            } else {
                if (this.currentWarnLevel != WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.none;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("退出战斗"));
                    this.exitCombat();
                }
            }
            if (isAnyOneInFireRange) {
                if (this.currentWarnLevel != WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInShotRange;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("进入战斗,开火"));
                }
                // 进入射程开火
                this.aim(enemyInFireRange.node.position);
                this.fire(enemyInFireRange.node.position);
            } else {
                if (this.currentWarnLevel == WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("超出了我方火炮射程"));
                }
            }
        } else {
            if (this.currentWarnLevel != WarnLevel.none) {
                this.currentWarnLevel = WarnLevel.none;
                cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("退出战斗"));
                this.exitCombat();
            }
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
    // // 左舷 前位炮
    // leftFontConnon: CannonModel = null;
    // // 左舷 后位炮
    // leftBackConnon: CannonModel = null;
    // // 右舷 前位炮
    // rightFontConnon: CannonModel = null;
    // // 右舷 后位炮
    // rightBackConnon: CannonModel = null;

    // // 1炮位 实例
    // @property(cc.Node)
    // leftFrontConnonNode: cc.Node = null;
    // // 2炮位 实例
    // @property(cc.Node)
    // leftBackConnonNode: cc.Node = null;
    // // 3炮位 实例
    // @property(cc.Node)
    // rightFrontConnonNode: cc.Node = null;
    // // 4炮位 实例
    // @property(cc.Node)
    // rightBackConnonNode: cc.Node = null;
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

    /**
     * 从本地数据载入上次的玩家数据
     */
    loadShipModelFromLocal() {
        cc.sys.localStorage.clear();
        let result = localStorageGet(localStorageMap.PlayerShipData, "array") as Array<ShipModel>;
        if (result.length == 0) {
            // 使用默认的 runtime 数据
            this.syncShipModeFromRuntime();
        } else {
            let localShipData = result[0];
            this.MaxSpeed = localShipData.MaxSpeed;
            this.MaxForce = localShipData.MaxForce;
            this.radarScanInterval = localShipData.radarScanInterval;
            this.ShipName = localShipData.ShipName;
            this.FireRange = localShipData.FireRange;
            this.RadarRange = localShipData.RadarRange;
            this.HP = localShipData.HP;
            this.currentHp = localShipData.currentHp;
            this.leftFontConnon = localShipData.leftFontConnon;
            this.leftBackConnon = localShipData.leftBackConnon;
            this.rightFontConnon = localShipData.rightFontConnon;
            this.rightBackConnon = localShipData.rightBackConnon;
            this.selfHealing = localShipData.selfHealing;
            this.syncShipModeToRuntime();
        }
    }
    /**
     * 将当前的玩家数据保存到本地
     */
    restoreShipModelToLocal() {
        this.syncShipModeToRuntime();
        localStorageSet(localStorageMap.PlayerShipData, "array", [PlayerShipModel]);
    }
    /**
     * 将运行时中保存的玩家数据同步到此对象实例
     */
    syncShipModeFromRuntime() {
        this.MaxSpeed = PlayerShipModel.MaxSpeed;
        this.MaxForce = PlayerShipModel.MaxForce;
        this.radarScanInterval = PlayerShipModel.radarScanInterval;
        this.ShipName = PlayerShipModel.ShipName;
        this.FireRange = PlayerShipModel.FireRange;
        this.RadarRange = PlayerShipModel.RadarRange;
        this.HP = PlayerShipModel.HP;
        this.currentHp = PlayerShipModel.currentHp;
        this.leftFontConnon = PlayerShipModel.leftFontConnon;
        this.leftBackConnon = PlayerShipModel.leftBackConnon;
        this.rightFontConnon = PlayerShipModel.rightFontConnon;
        this.rightBackConnon = PlayerShipModel.rightBackConnon;
        this.selfHealing = PlayerShipModel.selfHealing;
    }
    /**
     * 将次实例中的玩家数据同步到运行时
     */
    syncShipModeToRuntime() {
        PlayerShipModel.MaxSpeed = this.MaxSpeed;
        PlayerShipModel.MaxForce = this.MaxForce;
        PlayerShipModel.radarScanInterval = this.radarScanInterval;
        PlayerShipModel.ShipName = this.ShipName;
        PlayerShipModel.FireRange = this.FireRange;
        PlayerShipModel.RadarRange = this.RadarRange;
        PlayerShipModel.HP = this.HP;
        PlayerShipModel.currentHp = this.currentHp;
        PlayerShipModel.leftFontConnon = this.leftFontConnon;
        PlayerShipModel.leftBackConnon = this.leftBackConnon;
        PlayerShipModel.rightFontConnon = this.rightFontConnon;
        PlayerShipModel.rightBackConnon = this.rightBackConnon;
        PlayerShipModel.selfHealing = this.selfHealing;
    }
}
