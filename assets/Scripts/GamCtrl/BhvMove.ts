import MapCtrl from "./MapCtrl";
import { GameDataRuntime } from "../UserModel/UserModel";
import { waitForAction, TruncateByVec2Mag } from "../Util/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BhvMove extends cc.Component {
    vVelocity: cc.Vec2 = cc.Vec2.ZERO;
    vHeading: cc.Vec2 = cc.Vec2.ZERO;
    MaxTurnRate: number = 10;
    Mass: number = 1;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    Seek(fromPos, toPos, MaxSpeed) {
        var desiredVelocity = toPos.sub(fromPos).normalize().mul(MaxSpeed);
        return desiredVelocity;
    }
    steeringForceApply(steeringForce, dt, MaxSpeed) {
        // 计算瞬时加速度
        var acc = steeringForce.div(this.Mass);
        // 计算瞬时速度
        this.vVelocity.addSelf(acc.mul(dt));
        this.vVelocity = TruncateByVec2Mag(MaxSpeed, this.vVelocity);
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
}
