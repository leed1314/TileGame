const { ccclass, property } = cc._decorator;
export class infoDamage {
    damage: number = 0;
    from: string = "";
    to: string = "";
    constructor(from: string, to: string, damage: number) {
        this.damage = damage;
        this.from = from;
        this.to = to;
    }
    toRichString() {
        return "<color=#2D76E4>" + this.from + "</c><color=#000000>对</color><color=#DF2963>" + this.to + "</color><color=#000000>造成了</color><color=#E07832>" + this.damage + "</color><color=#000000>点伤害</color>";
    }
}
export class InfoConnon {
    info: string = "";
    connonName: string = "";
    constructor(connonName: string, info: string) {
        this.info = info;
        this.connonName = connonName;
    }
    toRichString() {
        return "<color=#E06BE0>" + this.connonName + "</c></c><color=#000000>" + this.info + "</color>";
    }
}
export class InfoRadar {
    info: string = "";
    constructor(info: string) {
        this.info = info;
    }
    toRichString() {
        return "<color=#6762DD>" + this.info + "</c>";
    }
}
@ccclass
export default class GameInfoNotice extends cc.Component {
    @property(cc.Prefab)
    richTextInfoPrefab: cc.Prefab = null;
    @property(cc.Node)
    infoShowContent: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    // update (dt) {}

    CastGameInfo(info) {
        let richText = cc.instantiate(this.richTextInfoPrefab);
        let richString = info.toRichString();
        richText.getComponent(cc.RichText).string = info.toRichString();
        this.infoShowContent.addChild(richText);
    }
}
