import { GameDataRuntime } from "../UserModel/UserModel";

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
    showMainMenu(status?:number){
        if(status){
            GameDataRuntime.menu.state = status;
        }else{
            GameDataRuntime.menu.state = 0;
        }
        this.MainMenu.active = true;
    }
    restart(){
        cc.director.loadScene("Game");
    }
}
