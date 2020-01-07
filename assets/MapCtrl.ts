const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        let var1 = this.getComponent(cc.TiledMap).getMapSize();
        let var2 = this.getComponent(cc.TiledMap).getTileSize();
        let var3 = this.getComponent(cc.TiledMap).getMapOrientation();
        let var4 = this.getComponent(cc.TiledMap).getLayer("SailPath");
        let var5 = this.getComponent(cc.TiledMap).getProperty("isSailable");
        let var6 = var4.getTileSet();
        let var7 = var4.getTiledTileAt(0, 0, false);
        let var8 = var4.getTileGIDAt(1,1);
        let var9 = this.getComponent(cc.TiledMap).getPropertiesForGID(var8)
        console.log("tilemap test", var1.toString(), var2.toString(), var3, var4, var5);
        console.log("***", var6);
        console.log("***", var7);
        console.log("***", var8);
        console.log("***", var9);


    }

    // update (dt) {}


}
