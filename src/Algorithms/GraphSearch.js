import {getGraphLinkedList} from "./DataStructure";

//Returns list of visited nodes and arrows in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    const visited_nodes = {}; //Dictionary used to give better performance (visited_nodes[cur.id] = 1) for checking if node is visited
    //const visited_order = []; //Need to use list to get the visited_nodes order
    const queue = [startNode.id];
    visited_nodes[startNode.id] = true;
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]

    if(breadthFirstSearch){
        animations.push({type:"node", id: startNode.id});
        do {
            //Get current node id
            const cur_id = queue.shift();
            
            for(let i = 0; i<graph[cur_id].length; ++i){ //Add queue nodes to list
                const neighbour = graph[cur_id][i].endID;
                if(!visited_nodes[neighbour]){
                    queue.push(neighbour);
                    const last_adjacency = graph[cur_id][i];
                    animations.push({type:"arrow", id:last_adjacency.arrowID, nodex1:last_adjacency.nodex1, nodex2:last_adjacency.nodex2, nodey1:last_adjacency.nodey1, nodey2:last_adjacency.nodey2});
                    animations.push({type:"node", id: neighbour});
                    //visited_order.push(cur_id);
                    visited_nodes[neighbour] = true; //push id of neighbour to visited_nodes and add animation
                }
            }
        } while(queue.length);
    }
    else {
        depthFirstSearch(graph, visited_nodes, startNode.id, null, animations);
    }
    
    return animations;
};

const depthFirstSearch = (graph, visited_nodes, cur_id, last_adjacency, animations) => {
    //push arrow pointing from previous node into animations
    if(last_adjacency && !visited_nodes[last_adjacency.endID]){
        animations.push({type:"arrow", id:last_adjacency.arrowID, nodex1:last_adjacency.nodex1, nodex2:last_adjacency.nodex2, nodey1:last_adjacency.nodey1, nodey2:last_adjacency.nodey2});
    }
    
    animations.push({type:"node", id: cur_id});
    //visited_order.push(cur_id);
    visited_nodes[cur_id] = true; //push id of current node to visited_nodes and add animation

    for(let i = 0; i<graph[cur_id].length; ++i){ 
        const neighbour = graph[cur_id][i].endID;
        if(!visited_nodes[neighbour]){
            depthFirstSearch(graph, visited_nodes, neighbour, graph[cur_id][i], animations);
        }
    }
}