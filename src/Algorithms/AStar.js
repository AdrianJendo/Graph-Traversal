import {getGraphLinkedList} from "./DataStructure";
import {CONTAINER_WIDTH} from "../Graph/Graph";

//Returns weights and animations of graph traversal using A* Algorithm (requires defined start and end nodes)
//Hcost is defined as the straight line distance between two nodes with a scale factor to not overpower the weight (euclidian)

/*
A* is a good general purpose path-finding algorithm for finding a good path between the start and end nodes, but it does not guarantee the shortest path unless both the situation and heuristic are favourable

For example, traversal in a 2D grid is well suited to A* since a step between any two spaces on the grid has the same weight, and the heuristic is meaningful to follow
Other situations, such as doing graph traversals can still provide good solutions but are less suited for finding the optimal path because the heuristics are less reliable

Ex: Scheduling a flight from Calgary to Toronto, where two possible flights leave at the same time
A) There is a 1 hour flight to Vancouver with a 1 hour overlay, and then a 6 hour flight to Toronto (8 hours total)
B) There is a 2 hour flight to Winnipeg with a 4 hour overlay, and then a 3 hour flight to Toronto (9 hours total)

Dijkstra would say option B is preferred because it takes the least amount of time to get to Toronto
Based on the heuristic and its weight on the fCost, A* would likely choose option A because Vancouver is in the wrong direction and the trip through Winnipeg would likely be selected
Although in this situation A* didn't provide the optimal path, as you add more and more flights it will be able to select a flight with a "good enough result" in much less computational cost than it would take Dijkstra to find the "best result"
If the layover in Winnipeg was 12 hours instead of 4, A* would be able to identify that going through Winnipeg does not make sense, and would also select the flight through Vancouver

A thought to overcome this and guarantee the shortest path would be as follows:
Once you have reached the end node, check the openset to see if there are any nodes with a lower gcost and follow them until either their gcost exceeds the gcost to reach the endnode, or the endnode is reached
This is just Dijkstra's algorithm though...

Sources:
http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html 
http://theory.stanford.edu/~amitp/GameProgramming/AStarComparison.html 
https://en.wikipedia.org/wiki/A*_search_algorithm
*/


export const AStar = (startNode, endNode, nodeList, arrowList, directed, weighted = false) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);
    const startID = startNode.id;
    const animations = [];
    
    //Get hcosts
    const gCosts = getOtherCosts(startNode, nodeList); //minimum cost from start node to current node
    const hCosts = getHCosts(endNode, nodeList, weighted); //(heuristic cost) estimated cost to the end from the current node
    const fCosts = getOtherCosts(startNode, nodeList, hCosts[startID]); //sum of gcost and hcost
    const closedSet = {}; //visited nodes
    const openSet = {}; //reached but not yet visited nodes
    openSet[startID] = {node: startNode, prevNode: null};

    //Loop while openset still has values (and endnode has not been reached)
    do {
        const current_node_obj = findSmallestFCost(openSet, fCosts);
        const current_node = current_node_obj.node;
        const prev_node = current_node_obj.prevNode;
        closedSet[current_node.id] = true;
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
            //Get the animations for going from start to end node
            return [animations, gCosts, true];
        }
        
        //Check the neighbours of the current node
        graph[current_node.id].forEach(edge => {
            const gCost = gCosts[current_node.id] + edge.weight;
            if(!closedSet[edge.endID] && gCost < gCosts[edge.endID]) {
                gCosts[edge.endID] = gCost;
                fCosts[edge.endID] = gCost + edge.weight*hCosts[edge.endID]; // Bigger weights will have their hCosts scaled more
                openSet[edge.endID] = {node: nodeList[edge.endID-1], prevNode: current_node}; //If node already in openset, just override it
            }
        });
   
    } while(Object.keys(openSet).length !== 0);

    animations.push({type:"node", id: endNode.id});
    return [animations, gCosts, false];
};

//Gets hCosts of each node relative to end node (absolute distance) -- scaled based on width of canvas so that it more likely underestimates the actual cost (better accuracy, less performacne)
const getHCosts = (endNode, nodes, weighted) => {
    const bias = weighted ? 8 : 4; //Aribitray value to scale hCost (larger values will be faster and less optimal)
    const hCosts = {};
    for (let id = 1; id <= nodes.length; ++id) {
        hCosts[id] = euclidianDistance(endNode, nodes[id-1]) / CONTAINER_WIDTH * bias; //the node with id is the (id-1)th index of nodes
    }
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

// const manhattanDistance = (node, target) => {
//     return Math.abs(node.x-target.x) + Math.abs(node.y-target.y);
// }

const euclidianDistance = (node, target) => {
    return Math.sqrt(Math.pow(node.x-target.x, 2) + Math.pow(node.y-target.y, 2));
}