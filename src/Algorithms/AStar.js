import {getGraphLinkedList} from "./DataStructure";
import {CONTAINER_WIDTH} from "../Graph/Graph";

//Returns weights and animations of graph traversal using A* Algorithm (requires defined start and end nodes)
//Hcost is defined as the straight line distance between two nodes (euclidian)
//Does not guarantee shortest path based on this heuristic
//http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html https://en.wikipedia.org/wiki/A*_search_algorithm
export const AStar = (startNode, endNode, nodeList, arrowList, directed) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);
    const startID = startNode.id;
    const animations = [];
    
    //Get hcosts
    const gCosts = getOtherCosts(startNode, nodeList); //minimum cost from start node to current node
    const hCosts = getHCosts(endNode, nodeList); //(heuristic cost) estimated cost to the end from the current node
    const fCosts = getOtherCosts(startNode, nodeList, hCosts[startID]); //sum of gcost and hcost

    const closedSet = []; //visited nodes
    const openSet = {}; //reached but not yet visited nodes
    openSet[startID] = {node: startNode, prevNode: null};

    //Loop while openset still has values (and endnode has not been reached)
    do {
        const current_node_obj = findSmallestFCost(openSet, fCosts);
        const current_node = current_node_obj.node;
        const prev_node = current_node_obj.prevNode;
        closedSet.push(openSet[current_node.id]);
        delete openSet[current_node.id];

        //Find the visited node that connects to current closest node
        if(prev_node) {
            graph[prev_node.id].forEach(edge => {
                if(edge.endID === current_node.id) {
                    animations.push({type:"arrow", id:edge.arrowID, nodex1:edge.nodex1, nodex2:edge.nodex2, nodey1:edge.nodey1, nodey2:edge.nodey2});
                }
            });
        }

        animations.push({type:"node", id: current_node.id});

        if(current_node.id === endNode.id){
            return animations;
        }
        
        //Check the neighbours of the current node
        graph[current_node.id].forEach(edge => {
            const gCost = gCosts[current_node.id] + edge.weight;
            if(gCost < gCosts[edge.endID]) { // !closedSet[edge.endID] ||  gCost < closedSet[edge.endID].gCost
                gCosts[edge.endID] = gCost;
                fCosts[edge.endID] = gCost + hCosts[edge.endID];
                openSet[edge.endID] = {node: nodeList[edge.endID-1], prevNode: current_node}; //If node already in openset, just override it
            }
        });
   
    } while(Object.keys(openSet).length !== 0);

    return animations;
};

//Gets hCosts of each node relative to end node (absolute distance) -- scaled based on width of canvas so that it more likely underestimates the actual cost (better accuracy, less performacne)
const getHCosts = (endNode, nodes) => {
    const scaler = 2; //Aribitray value but larger values will be faster and less optimal
    const hCosts = {};
    for (let id = 1; id <= nodes.length; ++id) {
        hCosts[id] = euclidianDistance(endNode, nodes[id-1]) / (CONTAINER_WIDTH/scaler); //the node with id is the (id-1)th index of nodes
    }

    console.log(hCosts);
    return hCosts;
}

//Used to get initial g and f costs of each node relative (infinity)
const getOtherCosts = (startNode, nodes, startNodeHCost = null) => {
    const costs = {};
    for (let id = 1; id <= nodes.length; ++id) {
        if(id === startNode.id && startNodeHCost) {
            costs[id] = startNodeHCost;
        }
        else if (id === startNode.id) {
            costs[id] = 0;
        }
        else {
            costs[id] = Infinity
        }
    }

    return costs;
}

const findSmallestFCost = (openSet, fCosts) => {
    let smallest_node = Object.values(openSet)[0];

    for(const val of Object.values(openSet)){
        if(fCosts[val.node.id] < fCosts[smallest_node.node.id]) {
            smallest_node = val;
        }
    }

    return smallest_node;
}

// const manhattanDistance = (nodex, targetx, nodey, targety) => {
//     return Math.abs(nodex-targetx) + Math.abs(nodey-targety);
// }

const euclidianDistance = (node, target) => {
    return Math.sqrt(Math.pow(node.x-target.x, 2) + Math.pow(node.y-target.y, 2));
}