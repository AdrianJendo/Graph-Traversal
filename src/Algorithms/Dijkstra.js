import {getGraphLinkedList} from "./DataStructure";

//Returns weights and animations of graph traversal using Dijkstra's Algorithm
export const Dijkstra = (startNode, nodeList, arrowList, directed, endNode=null) => {
    const graph = getGraphLinkedList(nodeList, arrowList, directed);

    const visited_nodes = [];
    const unvisited_nodes = nodeList.slice();
    const animations = []; //Animations for both arrows and nodes
    

    const node_weights = {}; //dictionary of {id:weight, ...} pairs   
    const startNode_id = startNode.id;
    visited_nodes.push(startNode);
    unvisited_nodes.splice(startNode_id-1, 1);

    graph[startNode_id].forEach(edge => {
        node_weights[edge.endID] = edge.weight;
    });
    
    for(const key in graph) {
        if(!node_weights[key]) {
            node_weights[key] = Infinity;
        }
    }
    node_weights[startNode_id] = 0;
    animations.push({type:"node", id: startNode_id});

    do {
        let closest_node = null;
        let closest_node_weight = Infinity;
        let closest_node_index = -1;
        unvisited_nodes.forEach((unvisited_node, index) => {
            if(node_weights[unvisited_node.id] < closest_node_weight) {
                closest_node = unvisited_node
                closest_node_weight = node_weights[unvisited_node.id];
                closest_node_index = index;
            }
        });
        if(closest_node){
            //Find the visited node that connects to current closest node (with the lowest cost)
            let edge_to_closest_node = graph[visited_nodes[0].id][0];
            let prev_cost = Infinity;
            visited_nodes.forEach(node => {
                graph[node.id].forEach(edge => {
                    if(edge.endID === closest_node.id && node_weights[node.id] < prev_cost){
                        prev_cost = node_weights[node.id];
                        edge_to_closest_node = edge;
                    }
                });
            });
            
            animations.push({type:"arrow", id:edge_to_closest_node.arrowID, nodex1:edge_to_closest_node.nodex1, nodex2:edge_to_closest_node.nodex2, nodey1:edge_to_closest_node.nodey1, nodey2:edge_to_closest_node.nodey2});
            animations.push({type:"node", id: closest_node.id});

            if(endNode && endNode.id === closest_node.id){
                return [node_weights, animations];
            }
            
            //Move closest node from unvisited to visited
            unvisited_nodes.splice(closest_node_index, 1);            
            visited_nodes.push(closest_node);

            //Update graph weights based on new closest node
            graph[closest_node.id].forEach(edge => {
                const new_weight = closest_node_weight + edge.weight
                if(new_weight < node_weights[edge.endID]){
                    node_weights[edge.endID] = new_weight;
                }
            });
        }
        else {
            do {
                closest_node = unvisited_nodes.splice(0, 1)[0];
                visited_nodes.push(closest_node);
                animations.push({type:"node", id: closest_node.id});
            } while(unvisited_nodes.length);
        }
    } while(unvisited_nodes.length); //|| closest_node.id === endNode.id (<- just add that to stop at end node for non-negative weights)

    if(endNode !== null){
        animations.push({type:"node", id:endNode.id});
    }

    return [node_weights, animations];
};