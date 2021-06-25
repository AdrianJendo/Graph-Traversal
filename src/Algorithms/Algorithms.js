import {getGraphLinkedList} from "./DataStructure"

//Returns list of visited nodes in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    const visited = []; //Dictionary might give better performance (visited[cur.id] = 1 or something) for checking if node is visited
    const visited_arrows = [];
    const unvisited = [startNode.id];
    const unvisited_arrows = [];
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]

    do {
        //Get current node id
        const cur_id = breadthFirstSearch ? unvisited.shift() : unvisited.pop(); //.pop for depth-first search

        //push arrow pointing from previous node into animations
        if(unvisited_arrows.length){
            const last_node = breadthFirstSearch ? unvisited_arrows.shift() : unvisited_arrows.pop();
            animations.push({type:"arrow", stage: "visited", id:last_node.arrowID, nodex1:last_node.nodex1, nodex2:last_node.nodex2, nodey1:last_node.nodey1, nodey2:last_node.nodey2})
        }
        
        visited.push(cur_id); //psuh id of current node to visited and add animation
        animations.push({type:"node", stage: "visited", id: cur_id});
        
        if(graph[cur_id].length){ //Check if there are connections at the current node
            for(let i = 0; i<graph[cur_id].length; ++i){ //Add unvisited nodes to list
                if(!id_in_list(visited_arrows, graph[cur_id][i].arrowID)){
                    const cur_node = graph[cur_id][i];
                    animations.push({type:"arrow", stage: "seen", id:cur_node.arrowID, nodex1:cur_node.nodex1, nodex2:cur_node.nodex2, nodey1:cur_node.nodey1, nodey2:cur_node.nodey2});
                    visited_arrows.push(cur_node.arrowID); //Avoid duplicating seen arrows
                }
                if(!id_in_list(visited, graph[cur_id][i].endID) && !id_in_list(unvisited, graph[cur_id][i].endID) ){
                    unvisited.push(graph[cur_id][i].endID);
                    unvisited_arrows.push(graph[cur_id][i]);
                }
            }
        }

    } while(unvisited.length);
    
    return [visited, animations];
}

//Checks if given id is found in a list of objects
const id_in_list = (list, id) => {
    for(let i = 0; i < list.length; i++){
        if(list[i] === id){
            return true;
        }
    }

    return false;
}