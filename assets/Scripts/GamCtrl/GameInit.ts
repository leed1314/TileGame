import { GameDataRuntime } from "../UserModel/UserModel";
import { EnemyWave } from "../UserModel/StroageModel";
import GameInfoNotice, { InfoRadar } from "./GameInfoNotice";
import MapCtrl from "./MapCtrl";
import EnemyCtrl from "./EnemyCtrl";
import { waitUntil } from "../Util/Tools";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameInit extends cc.Component {
    @property(cc.Prefab)
    enemyPrefab: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:
    timeCounter: number = 0;
    onLoad() {
        var manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
    }

    start() {

    }

    // update(dt) {

    // }
    onEnemyDestory() {
        let spawnNode = cc.find("Canvas/playerSpawn");
        let enemyList = spawnNode.getComponentsInChildren(EnemyCtrl);
        if (enemyList.length > 1) {
            // 战斗还在继续
        } else {
            // 战斗已经结束
            this.timeCounterPerSecond(30);
        }
    }
    async timeCounterPerSecond(totle) {
        this.timeCounter = totle;
        this.schedule(() => {
            cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar("敌人还有" + this.timeCounter-- + "秒到达"));
        }, 1, totle);
        await waitUntil(() => {
            return this.timeCounter == 0;
        });
        this.enemyWaveGenerate();
    }

    enemyWaveGenerate() {
        GameDataRuntime.playerWaveIndex++;
        if (GameDataRuntime.playerWaveIndex >= EnemyWave.length) {
            GameDataRuntime.playerWaveIndex = 0;
        }
        if (GameDataRuntime.playerWaveIndex < EnemyWave.length) {
            let thisWaveData = EnemyWave[GameDataRuntime.playerWaveIndex];
            cc.find("Canvas/GameInfoNotice").getComponent(GameInfoNotice).CastGameInfo(new InfoRadar(thisWaveData.name + ":" + thisWaveData.info));
            for (var i = 0; i < thisWaveData.enemys.length; i++) {
                let enemy = cc.instantiate(this.enemyPrefab);
                let mapCtrlTs = cc.find("Canvas/TiledMap").getComponent(MapCtrl);
                let x = Math.floor(Math.random() * GameDataRuntime.MapSize.width);
                let y = Math.floor(Math.random() * GameDataRuntime.MapSize.height);
                while (mapCtrlTs.isSailable(x, y) != true) {
                    x = Math.floor(Math.random() * GameDataRuntime.MapSize.width);
                    y = Math.floor(Math.random() * GameDataRuntime.MapSize.height);
                }
                let enemyTileIndex = new cc.Vec2(x, y);
                let enemyPosition = mapCtrlTs.convertTilemapIndexToMapNodePosition(enemyTileIndex);
                enemy.position = enemyPosition;
                let playerRott = cc.find("Canvas/playerSpawn");
                playerRott.addChild(enemy);
            }
        }
    }
}
