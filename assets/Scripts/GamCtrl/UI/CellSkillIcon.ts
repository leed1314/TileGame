import { GameDataRuntime } from "../../UserModel/UserModel";
import { VM } from "../../Mvvm/ViewModel";
import { PlayerSKills, ConfigSkills } from "../../UserModel/StroageModel";
import BhvFrameIndex from "./BhvFrameIndex";

const { ccclass, property } = cc._decorator;

interface CellData {
    name: string;
    info: string;
    id: number;
    pic: number;
    level: number;
    max: number;
    unlock: number;
    condition: {
        skill: number,
        point: number,
        all_use: number
    }
}


@ccclass
export default class CellSkillIcon extends cc.Component {

    @property
    private _index: number = 0;
    /**技能的数据库编号 */
    public get index(): number {
        return this._index;
    }
    @property
    public set index(v: number) {
        if (v <= -1) v = -1;
        let res = this.getData(v);
        if (res == true) {
            this._index = v;
        }

        this.refreshCell();
    }

    private data: CellData;
    private skill_point: number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}


    //监听一个数值变化
    onValueChange(n, o, pathArr: string[]) {
        let name = pathArr.join('.');
        switch (name) {
            case 'GameDataRuntime.skill_point':
                //todo 解决顺序的坑点
                this.index = this.index; //这里刷新获取的 不是最新的 player.skill_point 值 
                this.skill_point = n;//!注意顺序问题，从这个函数获取的n 值，才是最新的
                this.refreshCell();//这个时候再手动更新一次
                break;
            case 'GameDataRuntime.UISkill.id':
                if (this.data.id === n) {
                    this.node.color = cc.color(170, 60, 25);
                } else {
                    this.node.color = cc.color(0, 0, 0);
                }
                break;
            default:
                break;
        }

    }
    start() {
        if (this.index == 1) {
            this.onTouchSelect();
        }
    }
    onEnable() {
        this.skill_point = GameDataRuntime.skill_point; //初始化 skill_point 值
        this.index = this.index;//刷新一次
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchSelect, this);
        //this.node.on(cc.Node.EventType.MOUSE_ENTER,this.onTouchSelect,this);
    }

    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchSelect, this);
        //this.node.off(cc.Node.EventType.MOUSE_ENTER,this.onTouchSelect,this);
    }

    //touch 选中，更新对应信息 skill id
    onTouchSelect() {
        VM.setValue('GameDataRuntime.UISkill.name', this.data.name);
        VM.setValue('GameDataRuntime.UISkill.id', this.data.id);
        VM.setValue('GameDataRuntime.UISkill.pic', this.data.pic);
        VM.setValue('GameDataRuntime.UISkill.level', this.data.level);
        VM.setValue('GameDataRuntime.UISkill.info', this.data.info);
    }



    getData(v: number): boolean {
        let user = PlayerSKills.find(data => data.id === v);
        if (user == null) return false;
        let skill = ConfigSkills.find(data => data.id === user.skillId);
        if (skill == null) return false;

        this.data = {
            id: v,
            name: skill.name,
            info: skill.info,
            pic: skill.pic,
            level: user.level,
            max: skill.max,
            unlock: user.unlock,
            condition: {
                skill: user.condition.skill,
                point: user.condition.point,
                all_use: user.condition.all_use,
            },
        }

        //检查是否解锁及技能
        if (this.checkConditionFill()) {
            user.unlock = 1;
            this.data.unlock = 1;
        }


        return true;
    }

    addLevel() {
        //升级技能点
        let p = PlayerSKills.find(data => data.id === this.index);
        if (p == null) return false;
        if (GameDataRuntime.skill_point < 1) return;
        p.level += 1;
        GameDataRuntime.skill_point -= 1;

        //刷新数据/刷新细胞
        this.getData(this.index);
        this.refreshCell()

        this.onTouchSelect();

    }

    //检查解锁条件是否满足
    checkConditionFill() {
        let cod = this.data.condition;
        let player = PlayerSKills.find(data => data.id === cod.skill); // 上级技能 点选数据
        if (player == null) return;
        let skill = ConfigSkills.find(data => data.id === player.skillId); // 上级技能 配置数据
        if (player.level >= skill.max) {
        // if (player.level >= cod.point) {
            return true;
        } else {
            return false;
        }

    }

    refreshCell() {
        if (!this.data) return;
        let icon = this.node.getChildByName('icon');
        let frame = this.node.getChildByName('icon').getComponent(BhvFrameIndex);
        let point = this.node.getChildByName('lv Label').getComponent(cc.Label);
        let text = this.node.getChildByName('locked Label');
        let btn_add = this.node.getChildByName('btn add');
        frame.index = this.data.pic;
        point.string = this.data.level + '/' + this.data.max;


        if (this.data.unlock === 0) {
            text.active = true;
            icon.opacity = 55;
        } else {
            text.active = false;
            icon.opacity = 255;
        }


        if (this.data.level < this.data.max && this.skill_point > 0 && this.data.unlock === 1) {
            btn_add.active = true;
        } else {
            btn_add.active = false;
        }

    }

    // update (dt) {}
}
