export let PlayerSKills = [
    {
        id: 1,
        tag: 'skill1',
        skillId: 1,
        level: 0,
        unlock: 1,
        condition: {}
    },
    {
        id: 2,
        tag: 'skill1-2',
        skillId: 3,
        level: 0,
        unlock: 0,
        condition: {
            skill: 1,
            point: 3,
        }
    },
    {
        id: 3,
        tag: 'skill1-3',
        skillId: 4,
        level: 0,
        unlock: 0,
        condition: {
            skill: 1,
            point: 3,
        }
    },
    {
        id: 4,
        tag: 'skill1-3-4',
        skillId: 5,
        level: 0,
        unlock: 0,
        condition: {
            skill: 3,
            point: 3,
        }
    },
    {
        id: 5,
        tag: 'skill1-3-4-5',
        skillId: 6,
        level: 0,
        unlock: 0,
        condition: {
            skill: 4,
            point: 3,
        }
    },
    {
        id: 6,
        tag: 'skill1-3-4-5-6',
        skillId: 7,
        level: 0,
        unlock: 0,
        condition: {
            skill: 3,
            point: 3,
            all_use: 3
        }
    },
    {
        id: 7,
        tag: 'skill2',
        skillId: 2,
        level: 0,
        unlock: 0,
        condition: {
            skill: -1,//前置条件 技能id
            point: -1, //前置条件 
            all_use: 20  //必须累计使用技能点数
        }
    },
];

export let ConfigSkills = [
    {
        id: 1,
        pic: 0,
        max: 3,
        name: 'USB充能',
        info: '是时候给自己充充电了，增加充能效率 5% 每级',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 2,
        pic: 1,
        max: 3,
        name: '突破',
        info: '技能描述，这肯定是一个厉害的技能，不用描述怎么做了',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 3,
        pic: 2,
        max: 3,
        name: '手柄',
        info: '键盘已经不能满足你了，用手柄获得更优质的游戏体验吧',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 4,
        pic: 3,
        max: 3,
        name: '看破',
        info: '对手的任何招式，在你眼中都是小儿科。提前攻击概率 + 5% 每级',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 5,
        pic: 4,
        max: 3,
        name: '知识点',
        info: '这里是一个知识点，知识点越多你的智力就越高',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 6,
        pic: 5,
        max: 3,
        name: '购物欲',
        info: '疯狂买买买，喜欢购物的你，能够搜刮各类优惠券。商店货物价格 - 5% 每级',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 7,
        pic: 6,
        max: 3,
        name: '黑框眼镜',
        info: '技能描述，所有buff 的持续时间 都 +1s 每级',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
]