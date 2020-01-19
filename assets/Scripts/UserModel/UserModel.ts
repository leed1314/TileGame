import { VM } from "../Mvvm/ViewModel";
export class CannonModel {
    isActive: boolean = true; // 是否激活
    bulletSpeed: number = 300; // 炮弹飞行速度
    bulletDamage: number = 20; // 炮弹伤害
    reloadTime: number = 3.0; // 炮弹装弹间隔
    constructor(isActive: boolean, bulletSpeed: number, bulletDamage: number, reloadTime: number) {
        this.isActive = isActive;
        this.bulletSpeed = bulletSpeed;
        this.bulletDamage = bulletDamage;
        this.reloadTime = reloadTime;
    }
}
export class ShipModel {
    MaxSpeed: number = 50; //最高航速 单位: 像素/秒
    MaxForce: number = 100; //最高瞬时 加速度（质量恒为 1 时）
    MaxTurnRate: number = 10; // 转向速度 -- 基本不变
    Mass: number = 1; // 质量-- 基本不变
    TruningSpeedRatio: number = 5; // 转向加力系数（转向时 加力运算规则为：MaxSpeed*TruningSpeedRatio）-- 基本不变
    radarScanInterval: number = 2; // 雷达扫描间隔
    ShipName: string = "小破船"; //舰艇名字
    FireRange: number = 300; // 火炮射程
    RadarRange: number = 900; // 雷达照射范围
    HP: number = 100; // 最高血量
    currentHp: number = 100; // 当前血量
    selfHealing: number = 1; // 单位 血量/秒

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

    // 左舷 前位炮
    leftFontConnon: CannonModel = null;
    // 左舷 后位炮
    leftBackConnon: CannonModel = null;
    // 右舷 前位炮
    rightFontConnon: CannonModel = null;
    // 右舷 后位炮
    rightBackConnon: CannonModel = null;

    constructor(MaxSpeed: number, MaxForce: number, radarScanInterval: number, ShipName: string, FireRange: number, RadarRange: number, HP: number, currentHp: number, selfHealing: number
        ,leftFontConnon: CannonModel
        ,leftBackConnon: CannonModel
        ,rightFontConnon: CannonModel
        ,rightBackConnon: CannonModel) {
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
        this.leftBackConnon = leftBackConnon;
        this.rightFontConnon = rightFontConnon;
        this.rightBackConnon = rightBackConnon;
    }

}

export class GameData {
    MapSize: cc.Size = null;
    TileSize: cc.Size = null;
    //菜单状态（代表选择了哪个菜单
    menu = {
        state: 0
    }
    exp: number = 15255;//exp
    exp_max: number = 100000;//升级目标exp
    level: number = 0;
    skill_point: number = 99;//剩余的技能点
    UISkill = {
        id: 0,
        pic: 0,
        name: '??',
        level: 0,
        info: '未知'
    }
}
//原始数据
export let GameDataRuntime: GameData = new GameData();
export let PlayerShipModel: ShipModel = new ShipModel(80, 200, 0.6, "小破船", 200, 300, 100, 100, 1
, new CannonModel(true, 200, 5, 4)
, new CannonModel(true, 200, 5, 3)
, new CannonModel(true, 200, 5, 2)
, new CannonModel(true, 200, 5, 1));
//数据模型绑定,定义后不能修改顺序
VM.add(GameDataRuntime, 'GameDataRuntime');    //定义全局tag
VM.add(PlayerShipModel, 'PlayerShipModel');
//使用注意事项
//VM 得到的回调 onValueChanged ，不能强制修改赋值
//VM 的回调 onValueChanged 中，不能直接操作VM数据结构,否则会触发 循环调用