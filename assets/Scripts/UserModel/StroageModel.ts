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
        skillId: 2,
        level: 0,
        unlock: 0,
        condition: {
            skill: 1,
            point: -1,
        }
    },
    {
        id: 3,
        tag: 'skill1-2-3',
        skillId: 3,
        level: 0,
        unlock: 0,
        condition: {
            skill: 2,
            point: -1,
        }
    },
    {
        id: 4,
        tag: 'skill1-4',
        skillId: 4,
        level: 0,
        unlock: 0,
        condition: {
            skill: 3,
            point: -1,
        }
    },
    {
        id: 5,
        tag: 'skill1-5',
        skillId: 5,
        level: 0,
        unlock: 0,
        condition: {
            skill: 1,
            point: -1,
        }
    },
    {
        id: 6,
        tag: 'skill5-6',
        skillId: 6,
        level: 0,
        unlock: 0,
        condition: {
            skill: 5,
            point: -1,
            all_use: -1
        }
    },
    {
        id: 7,
        tag: 'skill6-7',
        skillId: 7,
        level: 0,
        unlock: 0,
        condition: {
            skill: 6,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 8,
        tag: 'skill1-8',
        skillId: 8,
        level: 0,
        unlock: 0,
        condition: {
            skill: 1,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 9,
        tag: 'skill8-9',
        skillId: 9,
        level: 0,
        unlock: 0,
        condition: {
            skill: 8,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 10,
        tag: 'skill9-10',
        skillId: 10,
        level: 0,
        unlock: 0,
        condition: {
            skill: 9,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 11,
        tag: 'skill11',
        skillId: 11,
        level: 0,
        unlock: 1,
        condition: {
            skill: -1,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 12,
        tag: 'skill11-12',
        skillId: 12,
        level: 0,
        unlock: 0,
        condition: {
            skill: 11,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 13,
        tag: 'skill12-13',
        skillId: 13,
        level: 0,
        unlock: 0,
        condition: {
            skill: 12,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 14,
        tag: 'skill13-14',
        skillId: 14,
        level: 0,
        unlock: 0,
        condition: {
            skill: 13,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 15,
        tag: 'skill11-15',
        skillId: 15,
        level: 0,
        unlock: 0,
        condition: {
            skill: 11,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 16,
        tag: 'skill15-16',
        skillId: 16,
        level: 0,
        unlock: 0,
        condition: {
            skill: 15,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
    {
        id: 17,
        tag: 'skill16-17',
        skillId: 17,
        level: 0,
        unlock: 0,
        condition: {
            skill: 16,//前置条件 技能id
            point: -1, //前置条件 
            all_use: -1  //必须累计使用技能点数
        }
    },
];

export let ConfigSkills = [
    {
        id: 1,
        pic: 0,
        max: 5,
        name: '高级火药',
        info: '每级提升20像素炮弹飞行速度',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 2,
        pic: 1,
        max: 5,
        name: '火力延伸',
        info: '每级提升25像素火炮射程',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 3,
        pic: 2,
        max: 1,
        name: '桅杆杀手',
        info: '炮弹命中敌人后有 5% 几率使敌人无法移动',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 4,
        pic: 3,
        max: 5,
        name: '强化桅杆杀手',
        info: '每级+1%概率触发 桅杆杀手',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 5,
        pic: 4,
        max: 5,
        name: '熟练炮手',
        info: '每级减少0.2秒装弹时间',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 6,
        pic: 5,
        max: 1,
        name: '急速射击',
        info: '开火时有 5% 几率使下一次装弹时间缩短为0.5秒',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 7,
        pic: 6,
        max: 5,
        name: '强化急速射击',
        info: '每级+1%概率触发 急速射击',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 8,
        pic: 7,
        max: 5,
        name: '破片弹药',
        info: '每级增加 5 点炮弹伤害',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 9,
        pic: 8,
        max: 1,
        name: '毁灭打击',
        info: '命中时有 5% 几率使敌人遭受200%的伤害',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 10,
        pic: 9,
        max: 5,
        name: '强化毁灭打击',
        info: '每级+1%概率触发 毁灭打击',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 11,
        pic: 10,
        max: 5,
        name: '领航',
        info: '每级增加 20 像素/秒 的最高航速',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 12,
        pic: 11,
        max: 5,
        name: '船身加固',
        info: '每级增加 20 点最高血量',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 13,
        pic: 12,
        max: 1,
        name: '幸运海浪',
        info: '被击中时有 5% 几率闪避该次伤害',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 14,
        pic: 13,
        max: 5,
        name: '强化幸运海浪',
        info: '每级+1%概率触发 幸运海浪',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 15,
        pic: 14,
        max: 5,
        name: '船械精通',
        info: '每级+1点/秒血量回复速度',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 16,
        pic: 15,
        max: 1,
        name: '快速修理',
        info: '在战斗过程中也保持25%的回复速度',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
    {
        id: 17,
        pic: 16,
        max: 5,
        name: '强化快速修理',
        info: '每级 +5% 战斗中回复速度',
        type: 0,  //技能类型 0 - 主动技能 1- 被动技能 2- buff技能
    },
]