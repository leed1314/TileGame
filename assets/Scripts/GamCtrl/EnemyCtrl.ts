import { waitForTime, MapNum } from "../Util/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyCtrl extends cc.Component {
    // LIFE-CYCLE CALLBACKS:
    @property([cc.Prefab])
    fireEffectList: Array<cc.Prefab> = [];
    @property(cc.Node)
    HpProgressNode: cc.Node = null;
    @property(cc.Node)
    fireEffectNode: cc.Node = null;
    HP: number = 100;
    CurrentHP: number = 100;
    ShipName: string = "飞翔的荷兰人";
    // onLoad () {}

    start() {
        this.HpProgressNode.getComponent(cc.ProgressBar).progress = this.CurrentHP / this.HP; //初始化血条
        this.onHPChange(0);
    }

    update(dt) {
        this.HpProgressNode.angle = this.node.angle * -1;  // 纠正血条的角度
        this.fireEffectNode.angle = this.node.angle * -1;  // 纠正血条的角度 
        this.UpdateFireLevelWithHp();
    }
    async showHpChangeAction(from: number, to: number, ) {
        // if (this.HpProgressNode.getNumberOfRunningActions() > 0) return;
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
        let fadeOut = cc.fadeOut(0.3);
        this.HpProgressNode.runAction(fadeOut);
    }
    UpdateFireLevelWithHp() {
        let HpPercent = this.CurrentHP / this.HP;
        let currentFire = this.fireEffectNode.childrenCount;
        if (HpPercent < 0.2) {
            // disaster 保持 5-7 个火焰效果
            if (currentFire < 7) {
                this.createRandomFireEffect();
            }
        } else if (HpPercent < 0.4) {
            // mid 保持 3-4 个火焰效果
            if (currentFire < 4) {
                this.createRandomFireEffect();
            }
        } else if (HpPercent < 0.7) {
            // small  保持 1-2 个火焰效果
            if (currentFire < 2) {
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
    onHPChange(deltaHP: number) {
        console.log("onHPChange");

        let from = this.CurrentHP;
        if (deltaHP > 0) {
            if (this.CurrentHP + deltaHP > this.HP) {
                this.CurrentHP = this.HP;
            } else {
                this.CurrentHP += deltaHP;
            }
        } else {
            if (this.CurrentHP + deltaHP <= 0) {
                // todo 销毁对象
            } else {
                this.CurrentHP += deltaHP;
            }
        }
        this.showHpChangeAction(from, this.CurrentHP);
    }
}
