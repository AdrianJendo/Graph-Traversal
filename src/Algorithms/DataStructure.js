
//Returns a linked list data structure to represent the nodes and edges
export const getGraphLinkedList = (nodes, arrows, directed=true) => {
    const linked_list = {}; //Initialize linked list data structure 

    //Initialize empty array for each nodes linked list
    nodes.forEach(node => {
        linked_list[node.id] = [];
        
    });

    //Add the edges to the corresponding node
    arrows.forEach(arrow => {
        //Keep track of the start and end coords of the arrows for animation
        linked_list[arrow.startID].push({endID: arrow.endID, weight: arrow.weight, arrowID: arrow.id, nodex1:arrow.nodex1, nodex2:arrow.nodex2, nodey1:arrow.nodey1, nodey2:arrow.nodey2});
        if(!directed){
            linked_list[arrow.endID].push({endID: arrow.startID, weight: arrow.weight, arrowID: arrow.id, nodex1:arrow.nodex1, nodex2:arrow.nodex2, nodey1:arrow.nodey1, nodey2:arrow.nodey2});
        }
    });

    // console.log(linked_list);
    return linked_list;
}