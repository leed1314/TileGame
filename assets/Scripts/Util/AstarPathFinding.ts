// 地图的原始数据
export class SearchParameters {
    startLocation: cc.Vec2;
    endLocation: cc.Vec2;
    map: cc.TiledMap;
    mapWidth: number;
    mapHeight: number;
    constructor(start: cc.Vec2, end: cc.Vec2, map: cc.TiledMap, mapWidth: number, mapHeight: number) {
        this.startLocation = start;
        this.endLocation = end;
        this.map = map;
        this.mapWidth = mapWidth;
        this.mapHeight = mapHeight;
    }
}
export enum NodeState {
    Untested,
    Open,
    Closed
}
export enum TraversalCostCalculateType {
    ByDistance,
    ByCell,
    None
}
// 单个格子的数据结构
export class CellNode {
    // 遍历过程中的状态
    nodeState: NodeState;
    // 遍历时的上一个节点
    parentNode: NodeState;

    location: cc.Vec2;
    isWalkable: boolean;
    // 从起点到该node的消耗值
    G: number;
    // 从该点到终点的估值
    H: number;
    // F = G + H
    _F: number;
    get F() {
        return this.G + this.H;
    }

    _parentNode: CellNode
    get ParentNode() {
        return this._parentNode;
    }
    set ParentNode(value) {
        this._parentNode = value;
        if (value == null) {
            this.G = 0;
        } else {
            this.G = this._parentNode.G + this.GetTraversalCostByCalculateType(this._parentNode.location, this.location, TraversalCostCalculateType.ByDistance);
        }
    }

    constructor(location: cc.Vec2, unitBase: any, endLocation: cc.Vec2) {
        if (unitBase == null) {
            this.isWalkable = false;
        } else {
            this.isWalkable = unitBase.isSailable;
        }
        this.G = 0;
        this.location = location;
        this.H = this.GetTraversalCostByCalculateType(location, endLocation, TraversalCostCalculateType.ByDistance);
    }

    GetTraversalCostByCalculateType(one: cc.Vec2, two: cc.Vec2, type: TraversalCostCalculateType): number {
        switch (type) {
            case TraversalCostCalculateType.ByDistance:
                // 直线距离估值
                return one.sub(two).magSqr();
            case TraversalCostCalculateType.ByCell:
                // 格子步数估值
                return Math.abs(one.x - two.x) + Math.abs(one.y - two.y);
            case TraversalCostCalculateType.None:
                return 0;
            default:
                return 0;
        }
    }
}

export class AstarPathFinding {
    // 地图宽高
    width: number;
    height: number;
    // 地图数据（格子数据）
    startNode: CellNode;
    endNode: CellNode;
    cellNodes: object;
    // 搜索参数(原始参数，类型均是vector3，但在AstarPathFinding使用，包装过的CellNode类型数据)
    searchParameters: SearchParameters;
    result: Array<cc.Vec2>;
    searchTimesCounter: number;

    constructor(searchParameters: SearchParameters) {
        this.searchParameters = searchParameters;
        this.width = this.searchParameters.mapWidth;
        this.height = this.searchParameters.mapHeight;
        this.cellNodes = {};
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let pathLayer = this.searchParameters.map.getLayer("SailPath");
                let targetTile = this.searchParameters.map.getPropertiesForGID(pathLayer.getTileGIDAt(j, i));
                this.cellNodes[j + "*" + i] = new CellNode(new cc.Vec2(j, i), targetTile, this.searchParameters.endLocation);
            }
        }
        this.startNode = this.cellNodes[this.searchParameters.startLocation.x + "*" + this.searchParameters.startLocation.y];
        this.startNode.nodeState = NodeState.Open;// 作为路径搜索的起点，该节点是首个进入遍历的节点
        this.endNode = this.cellNodes[this.searchParameters.endLocation.x + "*" + this.searchParameters.endLocation.y];
    }
    ShowMeThePath(): Array<cc.Vec2> {
        this.result = new Array<cc.Vec2>();
        // 测试当前节点的所有邻居节点，直到测试到终点节点
        let isSuccess = this.Search(this.startNode);
        if (isSuccess) {
            let node = this.endNode;
            while (node.ParentNode != null) {
                this.result.push(node.location);
                node = node.ParentNode;
            }
            this.result.push(this.startNode.location);
            this.result.reverse();
        }
        return this.result;
    }
    Search(curTestNode: CellNode): boolean {
        // 每个节点仅仅可以被搜索一次,所以关闭本次search的节点
        curTestNode.nodeState = NodeState.Closed;

        // 获取当前节点的邻居节点
        let neighborLocations = this.GetNeighborLocations(curTestNode.location); // 原始向量数据
        let neighborNodes = new Array<CellNode>(); // 运算出的待搜索的邻居节点列表
        for (let i = 0; i < neighborLocations.length; i++) {
            let aNeighborLocation = neighborLocations[i];
            // 确保没有超出地图边界
            let x = aNeighborLocation.x;
            let y = aNeighborLocation.y;
            if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
                continue;
            }
            // 根据原始坐标数据获得对应的节点数据结构
            let checkedNeighborNode = this.cellNodes[x + "*" + y]
            // 确保节点是walkable
            if (!checkedNeighborNode.isWalkable) {
                continue;
            }
            // 确保节点没有被检测过
            if (checkedNeighborNode.nodeState == NodeState.Closed) {
                continue;
            }
            // open 意味着已经算过一次G值，也意味着该节点拥有了一个父节点路径
            // 如果已经是open的node（先前是untested状态，在之前的search中添加进了需要下次search的neighborNodes列表中），在添加进下次的search列表的时候进行有选择的添加
            // 添加的条件决定了算法的不同
            if (checkedNeighborNode.nodeState == NodeState.Open) {
                /* 
                * 贪婪 算法:
                * HCost 返回两个格子步数
                * GCost 总是 返回 0
                * 

                * A star 算法
                * HCost 返回两个格子步数
                * GCost 返回两个格子距离
                */
                let costBetweenCheckNodeAndCurNode = curTestNode.GetTraversalCostByCalculateType(curTestNode.location, checkedNeighborNode.location, TraversalCostCalculateType.ByDistance);// 从当前测试节点到当前walkable邻居节点的路程耗费
                let newRouteG = curTestNode.G + costBetweenCheckNodeAndCurNode;// 此条新路径的 从起点到当前walkable邻居节点的路程耗费
                // 如果新路径的G值小于旧路径的G值，那么用新路径替换旧路径进行搜索
                if (newRouteG < checkedNeighborNode.G) {
                    checkedNeighborNode.ParentNode = curTestNode;
                    neighborNodes.push(checkedNeighborNode);
                }
            } else { // 如果是 untested ，则直接把 checkedNeighborNode 节点的父节点设置为curTestNode,
                checkedNeighborNode.ParentNode = curTestNode;
                checkedNeighborNode.nodeState = NodeState.Open;
                neighborNodes.push(checkedNeighborNode);
            }
        }
        // 按F值排序，F值低的排在前面检测
        neighborNodes.sort((node1, node2) => {
            return node1.F - node2.F;
        });
        for (let i = 0; i < neighborNodes.length; i++) {
            let aNeighborNode = neighborNodes[i];
            if (aNeighborNode.location.equals(this.endNode.location)) {
                return true;
            }
            else {
                if (this.Search(aNeighborNode)) {
                    return true;
                }
            }
        }
        return false;
    }
    GetNeighborLocations(centerLocation: cc.Vec2): Array<cc.Vec2> {
        let result = new Array<cc.Vec2>();
        result.push(centerLocation.add(new cc.Vec2(-1, -1)));
        result.push(centerLocation.add(new cc.Vec2(-1, 0)));
        result.push(centerLocation.add(new cc.Vec2(-1, 1)));
        result.push(centerLocation.add(new cc.Vec2(0, 1)));
        result.push(centerLocation.add(new cc.Vec2(1, 1)));
        result.push(centerLocation.add(new cc.Vec2(1, 0)));
        result.push(centerLocation.add(new cc.Vec2(1, -1)));
        result.push(centerLocation.add(new cc.Vec2(0, -1)));
        return result;
    }
}