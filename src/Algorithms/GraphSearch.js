import {getGraphLinkedList} from "./DataStructure";

//Returns list of visited nodes and arrows in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true, findCycle = false) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    //Always use depth first search for find cycle
    if (findCycle) {
        breadthFirstSearch = false;
    }

    const visited_nodes = {}; //Dictionary used to give better performance (visited_nodes[cur.id] = 1) for checking if node is visited
    //const visited_order = []; //Need to use list to get the visited_nodes order
    const unvisited = [startNode.id];
    const unvisited_arrows = [];
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]
    
    do {
        //Get current node id
        const cur_id = breadthFirstSearch ? unvisited.shift() : unvisited.pop(); //.pop for depth-first search
        const last_adjacency = unvisited_arrows.length ? breadthFirstSearch ? unvisited_arrows.shift() : unvisited_arrows.pop() : null;

        //push arrow pointing from previous node into animations
        if(last_adjacency && !visited_nodes[last_adjacency.endID]){
            animations.push({type:"arrow", id:last_adjacency.arrowID, nodex1:last_adjacency.nodex1, nodex2:last_adjacency.nodex2, nodey1:last_adjacency.nodey1, nodey2:last_adjacency.nodey2});
        }
        
        animations.push({type:"node", id: cur_id});
        //visited_order.push(cur_id);
        visited_nodes[cur_id] = true; //push id of current node to visited_nodes and add animation
        
        for(let i = 0; i<graph[cur_id].length; ++i){ //Add unvisited nodes to list
            const neighbour = graph[cur_id][i].endID;
            if(!visited_nodes[neighbour]){
                unvisited.push(neighbour);
                unvisited_arrows.push(graph[cur_id][i]);
            }
            else if (findCycle && graph[cur_id][i].arrowID !== last_adjacency.arrowID){ //Node seen was already visited, therefore there is cycle (handles undirected case)
                for(let j=0; j<graph[neighbour].length; ++j){
                    const edge_neighbour = graph[neighbour][j];
                    if(visited_nodes[edge_neighbour.endID]){
                        //Animate arrow
                        const edge = graph[cur_id][i];
                        animations.push({type:"arrow", id:edge.arrowID, nodex1:edge.nodex1, nodex2:edge.nodex2, nodey1:edge.nodey1, nodey2:edge.nodey2});
                        //Animate node (special animation)
                        animations.push({type:"node", id: edge.endID});
                        return [true, animations];
                    }
                }
            }
        }
    } while(unvisited.length);

    if(findCycle){
        return [false, animations];
    }
    
    return animations;
};

//Returns true if there is at least one cycle in the graph
export const findCycle = (startNode, nodeList, arrowList, directed) => {
    //Graph search can be implemented by using depth first search
    return graphSearch(startNode, nodeList, arrowList, directed, false, true);
};