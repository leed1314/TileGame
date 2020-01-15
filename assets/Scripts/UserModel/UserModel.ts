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
    // 左舷 前位炮
    leftFontConnon: CannonModel = null;

    constructor(MaxSpeed: number, MaxForce: number, radarScanInterval: number, ShipName: string, FireRange: number, RadarRange: number, HP: number, currentHp: number,
        leftFontConnon: CannonModel) {
        this.MaxSpeed = MaxSpeed;
        this.MaxForce = MaxForce;
        this.radarScanInterval = radarScanInterval;
        this.ShipName = ShipName;
        this.FireRange = FireRange;
        this, RadarRange = RadarRange;
        this.HP = HP;
        this.currentHp = currentHp;
        this.leftFontConnon = leftFontConnon;
    }
}

export class GameData {
    MapSize: cc.Size = null;
    TileSize: cc.Size = null;
}
//原始数据
export let GameDataRuntime: GameData = new GameData();
export let PlayerShipModel: ShipModel = new ShipModel(80, 140, 2, "小破船", 300, 500, 100, 100, new CannonModel(true, 300, 15, 3));
//数据模型绑定,定义后不能修改顺序
VM.add(GameDataRuntime, 'GameDataRuntime');    //定义全局tag
VM.add(PlayerShipModel, 'PlayerShipModel');
//使用注意事项
//VM 得到的回调 onValueChanged ，不能强制修改赋值
//VM 的回调 onValueChanged 中，不能直接操作VM数据结构,否则会触发 循环调用