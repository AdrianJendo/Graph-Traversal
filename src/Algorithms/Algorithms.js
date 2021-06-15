import {getGraphLinkedList} from "./DataStructure"

//Returns list of visited nodes in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);
    const visited = []; //Dictionary might give better performance (visited[cur.id] = 1 or something) for checking if node is visited
    const unvisited = [startNode.id];

    console.log(graph);

    do {
        const cur_id = breadthFirstSearch ? unvisited.shift() : unvisited.pop(); //.pop for depth-first search

        visited.push({nodeID: cur_id}); //current node
        
        if(graph[cur_id].length){ //Check if there are connections at the current node
            for(let i = 0; i<graph[cur_id].length; ++i){
                if(!id_in_list(visited, graph[cur_id][i].endID)){
                    unvisited.push(graph[cur_id][i].endID);
                }
            }
        }

        if(unvisited.length){ //check if there are still nodes to traverse
            const nextNode_ID = breadthFirstSearch ? unvisited[0] : unvisited[unvisited.length-1];
            let i = 0;
            while(graph[cur_id][i].endID !== nextNode_ID){ //&& i < graph[cur_id].length
                ++i;
            }
            visited.push({arrowID: graph[cur_id][i].arrowID}) //push arrow pointing to next node
        }

    } while(unvisited.length);
    
    console.log(visited);
    return visited;
}

const id_in_list = (list, id) => {
    for(let i = 0; i < list.length; i+=2){ //node is every other entry
        if(list[i].nodeID === id){
            return true;
        }
    }

    return false;
}