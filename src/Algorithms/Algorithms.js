import {getGraphLinkedList} from "./DataStructure"

//Returns list of visited nodes in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);
    const visited = []; //Dictionary might give better performance (visited[cur.id] = 1 or something) for checking if node is visited
    const visited_arrows = [];
    const unvisited = [startNode.id];
    const unvisited_arrows = [];
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]

    let lastNode_ID = startNode.id;

    console.log(graph);

    do {
        const cur_id = breadthFirstSearch ? unvisited.shift() : unvisited.pop(); //.pop for depth-first search
        if(unvisited_arrows.length){
            const lastArrow_id = breadthFirstSearch ? unvisited_arrows.shift() : unvisited_arrows.pop();
            animations.push({type:"arrow", stage: "visited", id:lastArrow_id}) //push arrow pointing from previous node
            visited_arrows.push(lastArrow_id);
        }

        // if(lastNode_ID !== cur_id){
        //     let i = 0;
        //     while(lastNode_ID !== cur_id && i < graph[lastNode_ID].length && graph[lastNode_ID][i].endID !== cur_id){ //
        //         ++i;
        //     }
        //     if(i < graph[lastNode_ID].length){
        //         animations.push({type:"arrow", id:graph[lastNode_ID][i].arrowID}) //push arrow pointing from previous node
        //     }
        // }

        visited.push(cur_id); //current node
        animations.push({type:"node", stage: "visited", id: cur_id});
        
        if(graph[cur_id].length){ //Check if there are connections at the current node
            for(let i = 0; i<graph[cur_id].length; ++i){ //Add unvisited nodes to list
                if(!id_in_list(visited_arrows, graph[cur_id][i].arrowID)){
                    animations.push({type:"arrow", stage: "seen", id:graph[cur_id][i].arrowID});
                }
                if(!id_in_list(visited, graph[cur_id][i].endID) && !id_in_list(unvisited, graph[cur_id][i].endID) ){
                    // animations.push({type:"node", stage: "seen", id:graph[cur_id][i].endID}); //Might delete this one
                    unvisited.push(graph[cur_id][i].endID);
                    unvisited_arrows.push(graph[cur_id][i].arrowID);
                }
            }
        }

        lastNode_ID = cur_id;
    } while(unvisited.length);
    
    console.log(visited, animations);
    return [visited, animations];
}

const id_in_list = (list, id) => {
    for(let i = 0; i < list.length; i++){
        if(list[i] === id){
            return true;
        }
    }

    return false;
}