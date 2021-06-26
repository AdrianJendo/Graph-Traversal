import {getGraphLinkedList} from "./DataStructure"

//Returns list of visited nodes in the order they were visited
export const graphSearch = (startNode, nodeList, arrowList, directed, breadthFirstSearch = true, findCycle = false) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    //Always use depth first search for find cycle
    if (findCycle) {
        breadthFirstSearch = false;
    }

    const visited = {}; //Dictionary used to give better performance (visited[cur.id] = 1) for checking if node is visited
    //const visited_order = []; //Need to use list to get the visited order
    const unvisited = [startNode.id];
    const unvisited_arrows = [];
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]
    
    do {
        //Get current node id
        const cur_id = breadthFirstSearch ? unvisited.shift() : unvisited.pop(); //.pop for depth-first search
        const last_adjacency = unvisited_arrows.length ? breadthFirstSearch ? unvisited_arrows.shift() : unvisited_arrows.pop() : null;

        //push arrow pointing from previous node into animations
        if(last_adjacency && !visited[last_adjacency.endID]){
            animations.push({type:"arrow", id:last_adjacency.arrowID, nodex1:last_adjacency.nodex1, nodex2:last_adjacency.nodex2, nodey1:last_adjacency.nodey1, nodey2:last_adjacency.nodey2});
        }
        
        animations.push({type:"node", id: cur_id});
        //visited_order.push(cur_id);
        visited[cur_id] = 1; //push id of current node to visited and add animation
        
        if(graph[cur_id].length){ //Check if there are connections at the current node
            for(let i = 0; i<graph[cur_id].length; ++i){ //Add unvisited nodes to list
                if(!visited[graph[cur_id][i].endID]){
                    unvisited.push(graph[cur_id][i].endID);
                    unvisited_arrows.push(graph[cur_id][i]);
                }
                else if (findCycle && graph[cur_id][i].arrowID !== last_adjacency.arrowID){ //Node seen was already visited, therefore there is cycle (handles undirected case)
                    //Animate arrow
                    const adjacency = graph[cur_id][i]
                    animations.push({type:"arrow", id:adjacency.arrowID, nodex1:adjacency.nodex1, nodex2:adjacency.nodex2, nodey1:adjacency.nodey1, nodey2:adjacency.nodey2});
                    //Animate node with special status
                    animations.push({type:"node", id: adjacency.endID});
                    return [true, animations];
                }
            }
        }
    } while(unvisited.length);

    if(findCycle){
        return [false, animations];
    }
    
    return animations;
}

//Returns true if there is at least one cycle in the graph
export const findCycle = (startNode, nodeList, arrowList, directed) => {
    //Graph search can be implemented by using depth first search
    return graphSearch(startNode, nodeList, arrowList, directed, false, true);
}