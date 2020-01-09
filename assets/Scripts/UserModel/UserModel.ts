import { VM } from "../Mvvm/ViewModel";


export class GameData {
    MapSize: cc.Size = null;
    TileSize: cc.Size = null;
}

//原始数据
export let GameDataRuntime: GameData = new GameData();
//数据模型绑定,定义后不能修改顺序
VM.add(GameDataRuntime, 'GameDataRuntime');    //定义全局tag

//使用注意事项
//VM 得到的回调 onValueChanged ，不能强制修改赋值
//VM 的回调 onValueChanged 中，不能直接操作VM数据结构,否则会触发 循环调用