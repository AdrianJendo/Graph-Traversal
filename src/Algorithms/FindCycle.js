import {getGraphLinkedList} from "./DataStructure";

//Returns true if there is at least one cycle in the graph
export const findCycle = (startNode, nodeList, arrowList, directed) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    const visited_nodes = {}; //Dictionary used to give better performance (visited_nodes[cur.id] = 1) for checking if node is visited
    const stack = {}; //Used to keep track of nodes visited during depth first search from reference node
    const unvisited_nodes = [startNode.id];
    const unvisited_arrows = [];
    const animations = []; //Animations for both arrows and nodes <-- [{type:arrow/node, stage:seen/visited,id:ID}, ...]
    
    do {
        if(dfs(graph, stack, visited_nodes, unvisited_nodes, unvisited_arrows, directed, animations)) {
            return [true, animations];
        }
    } while(unvisited_nodes.length);

    return [false, animations];
};

//depth first search from reference node (top of unvisted_nodes stack)
const dfs = (graph, stack, visited_nodes, unvisited_nodes, unvisited_arrows, directed, animations) => {
    //Get current node id
    const cur_id = unvisited_nodes.pop(); //depth-first search
    const last_adjacency = unvisited_arrows.length ? unvisited_arrows.pop() : null;

    //push arrow pointing from previous node into animations
    if(last_adjacency && !visited_nodes[last_adjacency.endID]){
        animations.push({type:"arrow", id:last_adjacency.arrowID, nodex1:last_adjacency.nodex1, nodex2:last_adjacency.nodex2, nodey1:last_adjacency.nodey1, nodey2:last_adjacency.nodey2});
    }

    animations.push({type:"node", id: cur_id});
    visited_nodes[cur_id] = true;
    stack[cur_id] = true;

    for(let i = 0; i<graph[cur_id].length; ++i){ //Add unvisited nodes to list
        const neighbour = graph[cur_id][i].endID;
        if(!visited_nodes[neighbour]){
            unvisited_nodes.push(neighbour);
            unvisited_arrows.push(graph[cur_id][i]);
            if(dfs(graph, stack, visited_nodes, unvisited_nodes, unvisited_arrows, directed, animations)){
                return true;
            }
        }
        //Node seen was already visited, check if it is in the stack (in the same iteration of dfs) or if it is undirected and arrow id is not the same as last connection
        else if ((directed && stack[neighbour]) || (!directed && graph[cur_id][i].arrowID !== last_adjacency.arrowID)){ 
            for(let j=0; j<graph[neighbour].length; ++j){
                const edge_neighbour = graph[neighbour][j];
                if(visited_nodes[edge_neighbour.endID]){
                    //Animate arrow
                    const edge = graph[cur_id][i];
                    animations.push({type:"arrow", id:edge.arrowID, nodex1:edge.nodex1, nodex2:edge.nodex2, nodey1:edge.nodey1, nodey2:edge.nodey2});
                    //Animate node (special animation)
                    animations.push({type:"node", id: edge.endID});
                    return true;
                }
            }
        }
    }
    
    delete stack[cur_id];
    return false;
};