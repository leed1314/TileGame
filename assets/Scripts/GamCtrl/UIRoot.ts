const { ccclass, property } = cc._decorator;

@ccclass
export default class UIRoot extends cc.Component {
    @property(cc.Node)
    MainMenu: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    closeMainMenu() {
        this.MainMenu.active = false;
    }
    showMainMenu(){
        this.MainMenu.active = true;
    }
}
