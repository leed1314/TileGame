import { GameDataRuntime } from "../UserModel/UserModel";
import { InputType } from "../Input/BhvInputMap";
import { SearchParameters, AstarPathFinding } from "../Util/AstarPathFinding";
import BhvMove from "./BhvMove";
import PlayerCtrl from "./PlayerCtrl";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapCtrl extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    onEnable() {
        cc.director.on(InputType[InputType.Click] + this.node.name, this.onClick, this);
        cc.director.on(InputType[InputType.Drag] + this.node.name, this.onDrag, this);
    }

    onDisable() {
        cc.director.off(InputType[InputType.Click] + this.node.name, this.onClick);
        cc.director.off(InputType[InputType.Drag] + this.node.name, this.onDrag);
    }
    start() {
        GameDataRuntime.MapSize = this.getComponent(cc.TiledMap).getMapSize();
        GameDataRuntime.TileSize = this.getComponent(cc.TiledMap).getTileSize();

        let var1 = this.getComponent(cc.TiledMap).getMapSize();
        let var2 = this.getComponent(cc.TiledMap).getTileSize();
        let var3 = this.getComponent(cc.TiledMap).getMapOrientation();
        let var4 = this.getComponent(cc.TiledMap).getLayer("SailPath");
        let var5 = this.getComponent(cc.TiledMap).getProperty("isSailable");
        let var6 = var4.getTileSet();
        let var7 = var4.getTiledTileAt(0, 0, false);
        let var8 = var4.getTileGIDAt(1, 1);
        let var9 = this.getComponent(cc.TiledMap).getPropertiesForGID(var8)
        console.log("tilemap test", var1.toString(), var2.toString(), var3, var4, var5);
        console.log("***", var6);
        console.log("***", var7);
        console.log("***", var8);
        console.log("***", var9);
    }

    // update (dt) {}

    //点击
    private onClick(event: cc.Touch, pos: cc.Vec2) {
        console.log(this.name, "onClick", pos.toString());
        let indexInMap = this.convertClickToTilemapIndex(pos);
        console.log("clicked tile index ", indexInMap.toString());

        cc.find("Canvas/playerSpawn/Player").getComponent(PlayerCtrl).moveInPath(indexInMap);
    }
    //拖拽
    private onDrag(event: cc.Touch, posDelta: cc.Vec2) {
        console.log(this.name, "onDrag", posDelta.toString());
        cc.find("Canvas/Main Camera").x -= posDelta.x;
        cc.find("Canvas/Main Camera").y -= posDelta.y;
    }
    // function 计算两点之间的航线
    getPathFromTo(from: cc.Vec2, to: cc.Vec2) {
        let a = new SearchParameters(from, to, this.getComponent(cc.TiledMap), GameDataRuntime.MapSize.width, GameDataRuntime.MapSize.height);
        let b = new AstarPathFinding(a);
        let path = b.ShowMeThePath();
        return path;
    }
    convertTilemapIndexToMapNodePosition(index: cc.Vec2) {
        let touchX = index.x;
        let touchY = index.y;

        let convertTilePosX = touchX * GameDataRuntime.TileSize.width;
        let convertTilePosY = touchY * GameDataRuntime.TileSize.height;

        let localX = convertTilePosX - GameDataRuntime.MapSize.width * GameDataRuntime.TileSize.width / 2;
        let localY = GameDataRuntime.MapSize.height * GameDataRuntime.TileSize.height / 2 - convertTilePosY;

        return new cc.Vec2(localX + GameDataRuntime.TileSize.width / 2, localY - GameDataRuntime.TileSize.height / 2);
    }
    convertTileMapNodePositionToTileIndex(pos) {
        var localPos = pos; // 地图的本地坐标
        let convertTilePosX = localPos.x + GameDataRuntime.MapSize.width * GameDataRuntime.TileSize.width / 2;
        let convertTilePosY = GameDataRuntime.MapSize.height * GameDataRuntime.TileSize.height / 2 - localPos.y;

        let touchX = Math.floor(convertTilePosX / GameDataRuntime.TileSize.width);
        let touchY = Math.floor(convertTilePosY / GameDataRuntime.TileSize.height);

        return new cc.Vec2(touchX, touchY);
    }
    convertClickToTilemapIndex(pos) {
        var localPos = this.node.convertToNodeSpaceAR(pos); // 地图的本地坐标
        localPos.x = localPos.x + cc.find("Canvas/Main Camera").x;
        localPos.y = localPos.y + cc.find("Canvas/Main Camera").y;
        let convertTilePosX = localPos.x + GameDataRuntime.MapSize.width * GameDataRuntime.TileSize.width / 2;
        let convertTilePosY = GameDataRuntime.MapSize.height * GameDataRuntime.TileSize.height / 2 - localPos.y;

        let touchX = Math.floor(convertTilePosX / GameDataRuntime.TileSize.width);
        let touchY = Math.floor(convertTilePosY / GameDataRuntime.TileSize.height);

        return new cc.Vec2(touchX, touchY);
    }
}
