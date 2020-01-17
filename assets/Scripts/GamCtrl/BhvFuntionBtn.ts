import { InputType } from "../Input/BhvInputMap";
import UIRoot from "./UIRoot";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class BhvFuntionBtn extends cc.Component {

    // LIFE-CYCLE CALLBACKS:
    onEnable() {
        cc.director.on(InputType[InputType.Click] + this.node.name, this.onClick, this);
        cc.director.on(InputType[InputType.Drag] + this.node.name, this.onDrag, this);
    }

    onDisable() {
        cc.director.off(InputType[InputType.Click] + this.node.name, this.onClick);
        cc.director.off(InputType[InputType.Drag] + this.node.name, this.onDrag);
    }
    // onLoad () {}

    start() {

    }

    // update (dt) {}

    syncCanmeraToShip(){
        cc.find("Canvas/Main Camera").x = cc.find("Canvas/playerSpawn/Player").x;
        cc.find("Canvas/Main Camera").y = cc.find("Canvas/playerSpawn/Player").y;
    }
    //点击
    private onClick(event: cc.Touch, pos: cc.Vec2) {
        console.log(this.name, "onClick", pos.toString());
        cc.find("Canvas/UIRoot").getComponent(UIRoot).showMainMenu();
    }
    //拖拽
    private onDrag(event: cc.Touch, posDelta: cc.Vec2) {
        console.log(this.name, "onDrag", posDelta.toString());
        this.node.x += posDelta.x;
        this.node.y += posDelta.y;
    }
}
