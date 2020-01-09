import MapCtrl from "./MapCtrl";
import { GameDataRuntime } from "../UserModel/UserModel";
import { waitForAction } from "../Util/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BhvMove extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    Seek(fromPos, toPos, MaxSpeed) {
        var desiredVelocity = toPos.sub(fromPos).normalize().mul(MaxSpeed);
        return desiredVelocity; // .mul(5) 乘以一个倍数的原因是，为了是转向更加敏感，避免“绕大弯”的情况出现
    }
}
