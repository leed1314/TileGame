const { ccclass, property } = cc._decorator;
export enum BhvType {
    DelayToDisapear = 0,
    PopCute,
}
@ccclass
export default class BhvSimpleAndAuto extends cc.Component {
    @property({
        type: cc.Enum(BhvType),
        tooltip: '自动执行的动作类型'
    })
    bhvType: BhvType = BhvType.DelayToDisapear;

    @property({
        visible: function () { return this.bhvType === BhvType.DelayToDisapear },
        tooltip: '多少秒之后执行'
    })
    delayTime: number = 0;

    @property({
        visible: function () { return this.bhvType === BhvType.DelayToDisapear },
        tooltip: '淡出时间'
    })
    fadeoutTime: number = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (this.bhvType == BhvType.DelayToDisapear) {
            let delay = cc.delayTime(this.delayTime);
            let fadeOut = cc.fadeOut(this.fadeoutTime);
            let actOverAction = cc.callFunc(() => {
                this.node.destroy();
            });
            this.node.runAction(cc.sequence(delay, fadeOut, actOverAction));
        } else if (this.bhvType == BhvType.PopCute) {
            this.node.scale = 1;
            let actList = [];
            let scale1 = cc.scaleTo(8 / 60, 1.162, 0.8);
            let scale2 = cc.scaleTo(8 / 60, 0.894, 1.035);
            let scale3 = cc.scaleTo(12 / 60, 1.05, 1.0);
            let scale4 = cc.scaleTo(9 / 60, 1.0, 1.0);
            actList.push(scale1, scale2, scale3, scale4);
            this.node.runAction(cc.sequence(actList));
        } else {
            // this.node.destroy();
        }
    }

    // update (dt) {}
}
