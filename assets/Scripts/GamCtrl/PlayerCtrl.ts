import MapCtrl from "./MapCtrl";
import BhvMove from "./BhvMove";
import { TruncateByVec2Mag, localStorageGet, localStorageMap, localStorageSet } from "../Util/Tools";
import VMEvent from "../Mvvm/VMEvent";
import ShipConnon from "./ShipConnon";
import { GrounpType } from "./ConnonBullet";
import BhvFollowPath, { BhvFollowPathStatus, ShipPostureType } from "./BhvFollowPath";
import EnemyCtrl from "./EnemyCtrl";
import GameInfoNotice, { InfoRadar } from "./GameInfoNotice";
import EnemyInfoDot from "./EnemyInfoDot";
import { CannonModel, ShipModel, PlayerShipModel } from "../UserModel/UserModel";

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
    vVelocity: cc.Vec2 = cc.Vec2.ZERO;
    vHeading: cc.Vec2 = cc.Vec2.ZERO;
    /**
     * MaxSpeed 和 MaxForce 应在一个合适的比例之下：
     * 如果 MaxSpeed 过大会出现转向时绕大圈，无法到达终点
     * 如果 MaxForce 过大会出现转向时加速度变化过快，同样出现无法到达终点
     */
    MaxSpeed: number = 100; //单位: 像素/秒
    MaxForce: number = 200;
    MaxTurnRate: number = 10;
    Mass: number = 1;
    TruningSpeedRatio: number = 5; // 转向加力系数
    radarScanInterval: number = 2; // 雷达扫描间隔
    runtimeRadarScanTime: number = 0;
    ShipName: string = "黑珍珠";
    HP: number = 100;
    FireRange: number = 300; // 火炮射程
    RadarRange: number = 900; // 雷达照射范围
    currentHp: number = 100;
    currentPathList: Array<cc.Vec2> = null;
    currentRunningBhv: ShipBhvType = -1;
    currentWarnLevel: WarnLevel = 0;

    // 左舷 前位炮参数
    leftFontConnon: CannonModel = new CannonModel(true, 300, 50, 3);

    @property(ShipConnon)
    leftFrontConnonTs: ShipConnon = null;
    // onLoad () {}

    start() {
        this.loadShipModelFromLocal();

        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonTs.init(this.node.uuid, GrounpType.Player, this.ShipName, "左舷前位炮", this.leftFontConnon.bulletSpeed, this.leftFontConnon.bulletDamage, this.leftFontConnon.reloadTime);
        } else {
            this.leftFrontConnonTs.node.active = false;
        }
    }

    update(dt) {
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
            this.steeringForceApply(steeringForce, dt);
        }
        // 雷达扫描及其火力管理
        if (this.runtimeRadarScanTime >= this.radarScanInterval) {
            this.runtimeRadarScanTime = 0;
            this.findEnemyTarget();
        } else {
            this.runtimeRadarScanTime += dt;
        }
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
                    isAnyOneInRadarRange = true;
                    cc.find("Canvas/EnemyInfoDot").getComponent(EnemyInfoDot).showColorTipDot(enumyCtrlTs.node.position, 100);
                }
            }
            if (isAnyOneInRadarRange) {
                if (this.currentWarnLevel == WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("发现" + enemyList.length + "艘敌舰,准备战斗"));
                    this.enterCombat();
                }
            } else {
                if (this.currentWarnLevel != WarnLevel.none) {
                    this.currentWarnLevel = WarnLevel.none;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("警报解除"));
                    this.exitCombat();
                }
            }
            if (isAnyOneInFireRange) {
                if (this.currentWarnLevel != WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInShotRange;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("进入射程,开火"));
                }
                this.aim(enemyInFireRange.node.position);
                this.fire(enemyInFireRange.node.position);
            } else {
                if (this.currentWarnLevel == WarnLevel.EnemyInShotRange) {
                    this.currentWarnLevel = WarnLevel.EnemyInView;
                    cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("超出了射程"));
                }
            }
        } else {
            if (this.currentWarnLevel != WarnLevel.none) {
                this.currentWarnLevel = WarnLevel.none;
                cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("警报解除"));
                this.exitCombat();
            }
        }
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
        // this.node.angle --- for 2.1.0+
        // this.node.rotation
        var angle = this.node.angle * Math.PI / 180;
        var currentVHeading = cc.Vec2.UP.negSelf().rotate(angle);
        var headingThisMoment = currentVHeading.lerp(this.vVelocity.normalize(), dt * this.MaxTurnRate);
        var angle = cc.Vec2.UP.negSelf().signAngle(headingThisMoment);
        var degree = angle / Math.PI * 180;
        this.node.angle = degree;
        var angle = this.node.angle * Math.PI / 180;
        this.vHeading = cc.Vec2.UP.negSelf().rotate(angle);
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
            this.leftFrontConnonTs.fire(firePos);
        }
    }
    aim(firePos: cc.Vec2) {
        if (this.leftFontConnon.isActive == true) {
            this.leftFrontConnonTs.aim(firePos);
        }
    }
    moveInPath(targetTileIndex: cc.Vec2) {
        this.currentRunningBhv = ShipBhvType.MoveInPath;
        this.node.getComponent(BhvFollowPath).init(targetTileIndex);
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

    /**
     * 从本地数据载入上次的玩家数据
     */
    loadShipModelFromLocal() {
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
    }
}
