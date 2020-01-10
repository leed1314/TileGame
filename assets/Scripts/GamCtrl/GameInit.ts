const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        manager.enabledDebugDraw = true;
    }

    start() {

    }

    // update (dt) {}
}
