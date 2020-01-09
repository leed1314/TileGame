const { ccclass, property } = cc._decorator;
export enum InputType {
    Click = 0,
    Hold,
    Drag,
    Drop,
}
@ccclass
export default class BhvInputMap extends cc.Component {
    /**是否正在触摸该区域 */
    private isTouching: boolean = false;

    private startTouchPos: cc.Vec2 = null;
    private touchEndOrCancelPos: cc.Vec2 = null;

    private startTouchId: number = 0;

    private duration: number = 0;

    /**如果进入了 拖拽的逻辑 在触摸结束时会阻止其他的输入类型 */
    private isDoDraging = false;

    onEnable() {
        let node = this.node;
        node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
    }

    onDisable() {
        let node = this.node;
        node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        node.off(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this, true);
        node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
        node.off(cc.Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this, true);
    }

    start() {

    }

    resetInput() {
        this.isTouching = false;
        this.duration = 0;
        this.startTouchPos = null;
        this.touchEndOrCancelPos = null;
        this.startTouchId = 0;
        this.isDoDraging = false;
    }
    onTouchStart(e: cc.Touch) {
        this.resetInput();
        this.startTouchId = e.getID();
        this.isTouching = true;
        this.startTouchPos = e.getLocation();
    }

    onTouchMove(e: cc.Touch) {
        if (e.getID() !== this.startTouchId) return;
        this.isTouching = true;
        var delta = e.getDelta();
        if (delta.equals(cc.Vec2.ZERO) == true) {

        } else {
            this.isDoDraging = true;
            console.log(InputType[InputType.Drag], delta.toString());
            cc.director.emit(InputType[InputType.Drag] + this.node.name, e, delta);
        }
    }

    onTouchEnd(e: cc.Touch) {
        if (e.getID() !== this.startTouchId) return;
        this.isTouching = false;
        this.touchEndOrCancelPos = e.getLocation();
        if (this.isDoDraging == true) {
            console.log(InputType[InputType.Drop], this.touchEndOrCancelPos.toString());
        } else {
            if (this.touchEndOrCancelPos.fuzzyEquals(this.startTouchPos, 2.33) && this.duration < 0.233) {
                console.log(InputType[InputType.Click], this.touchEndOrCancelPos.equals(this.startTouchPos), this.duration);
                cc.director.emit(InputType[InputType.Click] + this.node.name, e, this.touchEndOrCancelPos);
            } else if (this.touchEndOrCancelPos.fuzzyEquals(this.startTouchPos, 2.33) && this.duration >= 0.233) {
                console.log(InputType[InputType.Hold], this.touchEndOrCancelPos.equals(this.startTouchPos), this.duration);
            } else {
                console.log("触碰类型未定义");
            }
        }
    }

    onTouchCancel(e: cc.Touch) {
        if (e.getID() !== this.startTouchId) return;
        this.isTouching = false;
        this.touchEndOrCancelPos = e.getLocation();
    }

    update(dt) {
        if (this.isTouching) {
            this.duration += dt;
        }
    }
}
