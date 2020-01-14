const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyCtrl extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    HP: number = 100;
    CurrentHP: number = 100;
    ShipName: string = "飞翔的荷兰人";
    // onLoad () {}

    start() {

    }

    // update (dt) {}

    onHPChange(deltaHP: number) {
        if (deltaHP > 0) {
            if (this.CurrentHP + deltaHP > this.HP) {
                this.CurrentHP = this.HP;
            } else {
                this.CurrentHP += deltaHP;
            }
        } else {
            if (this.CurrentHP - deltaHP <= 0) {
                // 销毁对象
            } else {
                this.CurrentHP -= deltaHP;
            }
        }
    }
}
