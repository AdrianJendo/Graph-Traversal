import "./Graph.css";
import React, { useState } from "react";
import {Sidebar} from "./Sidebar"
import {getNodeLinkedList} from "../Algorithms/DataStructure"
import {graphSearch} from "../Algorithms/Algorithms"
import {NODE_RADIUS, sortNodesArray, findNodeFromID, updateMovedNodeLinks, getAngle, getStartOffsets, getEndOffsets} from "./Helpers"

//Consts
const LOCKED_MULTIPLIER = 1.2;
const CONTAINER_HEIGHT = 600;
const CONTAINER_WIDTH = 1200;
const BUFFER = 15;

export function Graph() {
    
    const [drawGraph, setDrawGraph] = useState(true); //mode for drawing graph (lock/unlock graph)
    const [numNodes, setNumNodes] = useState(1); //used to give unique id to each new node (doesn't decrement when a node is deleted)
	const [nodes, setNodes] = useState([]); //list of node objects
    const [startLineNode, setStartLineNode] = useState(null); //starting node when connecting nodes
    const [numArrows, setNumArrows] = useState(1); //used to give unique id to each new arrow (doesn't decrement when an arrow is deleted)
    const [arrows, setArrows] = useState([]); //list of arrow objects
    const [animationArrow, setAnimationArrow] = useState(null); //used to draw the realtime animated arrow when connecting two nodes
    const [deleteMode, setDeleteMode] = useState(false); //true if delete mode is enabled
    const [hoverNode, setHoverNode] = useState(null); //if delete mode is on, this is the node that is being hovered over
    const [hoverArrow, setHoverArrow] = useState(null); //if delete mode is on, this is the link that is being hovered over
    const [moveMode, setMoveMode] = useState(false); //true if move mode is enabled
    const [animationNode, setAnimationNode] = useState(null); //realtime animated node when moving a node
    const [originalNode, setOriginalNode] = useState(null); //outline of original node when when moving a node
    const [weighted, setWeighted] = useState(false); //true if graph is weighted
    const [directed, setDirected] = useState(true); //true if graph is directed
    const [selectStartNode, setSelectStartNode] = useState(false);

    const ARROW_WIDTH = weighted ? 11 : 8; //px

    //Handles event when canvas is clicked
	const handleCanvasClicked = (e) => {
        if(e.target.className === "node" || e.button !== 0 || deleteMode || !drawGraph) return;

        else if (e.nativeEvent.offsetX < NODE_RADIUS || 
            e.nativeEvent.offsetY < NODE_RADIUS || 
            CONTAINER_WIDTH - e.nativeEvent.offsetX < NODE_RADIUS ||
            CONTAINER_HEIGHT - e.nativeEvent.offsetY < NODE_RADIUS ) return; //Keeps all drawn node inside the canvas
                    
        const coord_x = e.nativeEvent.offsetX;
        const coord_y = e.nativeEvent.offsetY;
        let update = true;
        let idx = 0;

        //Check if adding a new node at the clicked location would overlap an existing node
        while(idx < nodes.length && update){
            const distance = Math.sqrt(Math.pow(nodes[idx].x-coord_x, 2) + Math.pow(nodes[idx].y-coord_y, 2));
            if(distance < 2*NODE_RADIUS + BUFFER) {
                update = false; //Prevents two node from being on top of each other
            }
            else{
                idx++;
            }
        }
        
        if(update){
            if(animationNode){ //Node was just moved
                //Move links to new node location
                const arrows_copy = arrows.slice();
                const double_connections = [];
                for(let i = 0; i<arrows_copy.length; i++){
                    if(!double_connections.includes(arrows_copy[i].id)){
                        if(arrows_copy[i].startID === animationNode.id){
                            updateMovedNodeLinks(animationNode, findNodeFromID(arrows_copy[i].endID, nodes), i, arrows_copy, double_connections, ARROW_WIDTH, directed); //arrows_copy and double_connections updated in function
                        }
                        else if(arrows_copy[i].endID === animationNode.id){
                            updateMovedNodeLinks(findNodeFromID(arrows_copy[i].startID, nodes), animationNode, i, arrows_copy, double_connections, ARROW_WIDTH, directed);
                        }
                    }
                }

                setArrows(arrows_copy);
                setNodes([...nodes, animationNode]);
                setMoveMode(false);
                setAnimationNode(null);
                setOriginalNode(null);
            }
            else if (!moveMode) { //Adding a new node
                setNodes([...nodes, {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, id:numNodes}]);
                setNumNodes(numNodes+1);
            }
        }
	};
    
    //Handle clicking on a node
    const handleNodeClicked = (e, node) => {
        if(e.button === 0  && !animationNode && drawGraph){ //Only primary click and not when node is being moved
            if(deleteMode){ //Handle deleting node
                //Remove node from nodes and any connections with node.id at either start or end of link
                const nodes_copy = sortNodesArray(nodes.slice()); //Order by id
                let i = 0;
                let found = false;
                while(i < nodes_copy.length){
                    if(found) { //Decrement any node that has id > id of deleted node
                        --nodes_copy[i].id;
                        ++i;
                    }
                    else if(nodes_copy[i].id === node.id){
                        nodes_copy.splice(i, 1);
                        found = true;
                    }
                    else{
                        ++i;
                    }
                }

                
                //Remove arrows that are connected to node
                const arrows_copy = arrows.slice();
                i = 0;
                while(i<arrows_copy.length){
                    if(arrows_copy[i].startID === node.id || arrows_copy[i].endID === node.id){
                        arrows_copy.splice(i, 1);
                    }
                    else{ //Decrement start and end id of every arrow with id > id of deleted node
                        if(arrows_copy[i].startID > node.id){
                            --arrows_copy[i].startID;
                        }
                        if(arrows_copy[i].endID > node.id) {
                            --arrows_copy[i].endID;
                        }
                        ++i;
                    }
                }

                setHoverNode(null);
                setNodes(nodes_copy);
                setArrows(arrows_copy);
                //Don't use the arrows id anywhere so don't care about resetting
                setNumNodes(numNodes - 1); 
            }
            else if(moveMode){ //Handle moving node
                //Remove node from nodes list and set as animation node
                let i = 0;
                const nodes_copy = nodes.slice();
                while(i < nodes_copy.length && nodes_copy[i].id !== node.id){
                    ++i;
                }
                
                if(i >= nodes_copy.length){
                    alert("error");
                    return;
                }
                else {
                    nodes_copy.splice(i, 1);
                    setAnimationNode(node);
                    setOriginalNode(node);
                    setNodes(nodes_copy);
                }
            }
            else if(!startLineNode){ //Start animation to draw new line
                setStartLineNode(node); //Change colour & signal arrow animation
                return;
            }
            else if(node.id !== startLineNode.id){ //connect nodes with arrows
                const angle = getAngle(startLineNode, node);
                const arrow_width = ARROW_WIDTH; //px
                let [start_offsetx, start_offsety] = getStartOffsets(startLineNode, angle);
                let [end_offsetx, end_offsety] = getEndOffsets(node, angle, directed);                
                    
                //Check for overlap of arrows
                let overlap = false;
                let doubleEdgeNodePair = -1; //Look for two nodes connected by two directional edges
                let i = 0;
                while(i < arrows.length && !overlap && doubleEdgeNodePair === -1) {

                    if(startLineNode.id === arrows[i].endID && node.id === arrows[i].startID && directed) {  //Mark index of double connected nodes
                        doubleEdgeNodePair = i;
                    }
                    else if((startLineNode.id === arrows[i].startID && node.id === arrows[i].endID) || //Trying to draw same line between already connected nodes
                            (startLineNode.id === arrows[i].endID && node.id === arrows[i].startID)){ //Undirected
                        overlap = true;
                    }
                    else{
                        ++i;
                    }
                }

                if(overlap){
                    alert("Nodes already connected");
                }
                else {
                    let numLinks = numArrows;
                    if(doubleEdgeNodePair >= 0){ //Calculate required offset adjustment for doubly connected nodes
                        start_offsetx += arrow_width * Math.sin(angle);
                        start_offsety += arrow_width * Math.cos(angle);
                        end_offsetx += arrow_width * Math.sin(angle);
                        end_offsety += arrow_width * Math.cos(angle);
                        const replacement = {nodex1: arrows[doubleEdgeNodePair].nodex1 - arrow_width * Math.sin(angle), 
                                            nodey1: arrows[doubleEdgeNodePair].nodey1 - arrow_width * Math.cos(angle), 
                                            nodex2: arrows[doubleEdgeNodePair].nodex2 - arrow_width * Math.sin(angle), 
                                            nodey2: arrows[doubleEdgeNodePair].nodey2 - arrow_width * Math.cos(angle),
                                            startID: node.id,
                                            endID: startLineNode.id,
                                            id: numLinks,
                                            weight: arrows[doubleEdgeNodePair].weight
                                        };
                        arrows.splice(doubleEdgeNodePair, 1, replacement); //Replace current line by updated offset
                        numLinks++;
                    }
                    setArrows([...arrows, {nodex1:start_offsetx, nodey1:start_offsety, nodex2:end_offsetx, nodey2:end_offsety, startID:startLineNode.id, endID:node.id, id:numLinks, weight: 1}]);
                    setNumArrows(numLinks+1);
                }
            }
            setAnimationArrow(null);
            setStartLineNode(null);
        }
        else if (e.button === 0 && selectStartNode){ //selecting start node for graph traversal
            graphSearch();
        }
    };
    
    //Check if deletemode and set colour accordingly (do same for links)
    const handleElementHover = (e, id) => {
        if(e.type === "mouseenter"){
            if(e.target.className.baseVal.indexOf("node") === 0){
                setHoverNode(id);
            }
            else if (e.target.className.baseVal.indexOf("arrow") === 0){
                setHoverArrow(id);
            }
        }
        else {
            setHoverNode(null);
            setHoverArrow(null);
        }
    };

    //Handle animating arrow in real-time
    const handleArrowAnimation = (e) => {
        if(e.target.className==="weight-input"){ //turn off animation when hoving over weight text
            setAnimationArrow(null);
        }
        else if(moveMode && animationNode){ //Draw the animated node if currently moving a node
            setAnimationNode({x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY, id:animationNode.id})
        }
        else if(startLineNode){ //Draw the animated arrow if a startnode has been selected
            const distance = Math.sqrt(Math.pow(e.nativeEvent.offsetX - startLineNode.x, 2) + Math.pow(e.nativeEvent.offsetY - startLineNode.y, 2));

            if(distance < 2*NODE_RADIUS + BUFFER){ //Nodes that are too close (shouldn't happen) will not get connected
                setAnimationArrow(null);
                return;
            }

            const pointer_coords = {x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY}
            const angle = getAngle(startLineNode, pointer_coords);
            const [start_offsetx, start_offsety] = getStartOffsets(startLineNode, angle);
            
            const pointer_size = directed ? 12 : 2;
            const pointerx = pointer_size * Math.cos(angle);
            const pointery = pointer_size * Math.sin(angle);
            const end_offsetx = e.nativeEvent.offsetX - pointerx;
            const end_offsety = e.nativeEvent.offsetY + pointery;

            setAnimationArrow({startx: start_offsetx, starty: start_offsety, endx:end_offsetx, endy:end_offsety});
        }
        else if(animationArrow) { //Error handling
            setAnimationArrow(null);
        }
    };

    //Handle action for clicking on an arrow (for deleting)
    const handleLinkClick = (link) => {
        if(deleteMode){
            let connectedNodes = {};
            const arrows_copy = arrows.slice();
            let i = 0;
            //Find index of link to be deleted
            while(i < arrows_copy.length && arrows_copy[i].id !== link.id){
                ++i;
            }

            if(i < arrows_copy.length){
                //Delete link from arrows array
                connectedNodes.startID = arrows_copy[i].startID
                connectedNodes.endID = arrows_copy[i].endID
                arrows_copy.splice(i, 1);

                //Check if there is another link that needs to be moved
                const arrow_width = ARROW_WIDTH; //px
                let i_paired_link = 0;
                while(i_paired_link < arrows_copy.length && !(arrows_copy[i_paired_link].startID === connectedNodes.endID && arrows_copy[i_paired_link].endID === connectedNodes.startID)) {
                    ++i_paired_link;
                }
    
                //If arrow was originally doubly connected, move 2nd arrow to middle
                if(i_paired_link < arrows_copy.length) {
                    //Offset coordinates but angle is still the same
                    const endNode = {x:arrows_copy[i_paired_link].nodex2, y:arrows_copy[i_paired_link].nodey2}
                    const startNode = {x:arrows_copy[i_paired_link].nodex1, y:arrows_copy[i_paired_link].nodey1}
                    const angle = getAngle(startNode, endNode);
                    
                    arrows_copy[i_paired_link].nodex1 -= arrow_width * Math.sin(angle);
                    arrows_copy[i_paired_link].nodey1 -= arrow_width * Math.cos(angle);
                    arrows_copy[i_paired_link].nodex2 -= arrow_width * Math.sin(angle);
                    arrows_copy[i_paired_link].nodey2 -= arrow_width * Math.cos(angle);
                }
                setArrows(arrows_copy);
                setHoverArrow(null);
            }
        }
    }

    //Handle interrupting moving a node (click another option or something)
    const handleMoveNodeInterrupt = () => {
        const temp = nodes.slice();
        temp.push(originalNode);
        setNodes(temp);
        setAnimationNode(null);
        setOriginalNode(null);
    }

    //Click on Delete Node/Link
    const toggleDeleteMode = () => {
        setStartLineNode(null);
        setDeleteMode(!deleteMode);
        setMoveMode(false);
        if(animationNode){
            handleMoveNodeInterrupt();
        }
    };

    //Click on Move Node
    const toggleMoveMode = () => {
        setStartLineNode(null);
        setMoveMode(!moveMode);
        setDeleteMode(false);
        if(animationNode){
            handleMoveNodeInterrupt();
        }
    }

    //Lock / Unlock graph
    const toggleDrawGraph = () => {
        //Update arrows and nodes to maintain distancing
        const arrows_copy = arrows.slice();
        const double_connections = [];
        const nodes_copy = nodes.slice();

        //Scale the nodes in the canvas accordingly to the new size
        nodes_copy.forEach((node) => {
            if(drawGraph){ //Locking draw
                node.x *= LOCKED_MULTIPLIER;
                node.y *= LOCKED_MULTIPLIER;
            }
            else { //Unlocking draw
                node.x /= LOCKED_MULTIPLIER;
                node.y /= LOCKED_MULTIPLIER;
            }
        })

        for(let i = 0; i<arrows_copy.length; i++){
            if(!double_connections.includes(arrows_copy[i].id)){
                updateMovedNodeLinks(findNodeFromID(arrows_copy[i].startID, nodes_copy), findNodeFromID(arrows_copy[i].endID, nodes_copy), i, arrows_copy, double_connections, ARROW_WIDTH, directed); //arrows_copy and double_connections updated in function
            }
        }

        setNodes(nodes_copy);
        setArrows(arrows_copy);
        setDrawGraph(!drawGraph);
        setMoveMode(false);
        setDeleteMode(false);
        if(animationNode){
            handleMoveNodeInterrupt();
        }
    };

    //Change graphtype to directed / undirected
    const toggleDirected = (val) => {
        if(val && val !== directed){ //Set to directed (don't consider any double edges)
            const new_arrows = arrows.slice();

            for(let i = 0; i<new_arrows.length; i++){
                updateMovedNodeLinks(findNodeFromID(new_arrows[i].startID, nodes), findNodeFromID(new_arrows[i].endID, nodes), i, new_arrows, [], ARROW_WIDTH);
            }

            setArrows(new_arrows);
        }
        else if (val !== directed){ //Set to undirected
            const new_arrows = [];
            //Get rid of double edges
            for(let i = 0; i<arrows.length; ++i){
                let include = true;
                let j = 0;
                while(j<new_arrows.length && include){
                    if(new_arrows[j].startID === arrows[i].endID && new_arrows[j].endID === arrows[i].startID){
                        include = false;
                    }
                    else{
                        ++j;
                    }
                }
                if(include){
                    new_arrows.push(arrows[i]);
                }
            }

            for(let i = 0; i<new_arrows.length; i++){
                updateMovedNodeLinks(findNodeFromID(new_arrows[i].startID, nodes), findNodeFromID(new_arrows[i].endID, nodes), i, new_arrows, [], ARROW_WIDTH, false);
            }

            setArrows(new_arrows);
        }
        setDirected(val);
    };

    //Change graphtype to weighted / unweighted
    const toggleWeighted = (val) => {
        //Update arrows and nodes to add appropriate distancing
        const arrows_copy = arrows.slice();
        const double_connections = [];
        const arrow_width = val ? 11 : 8; //11 for setting weighted and 8 for setting unweighted
        if(directed && val !== weighted){
            for(let i = 0; i<arrows_copy.length; i++){
                if(!double_connections.includes(arrows_copy[i].id)){
                    updateMovedNodeLinks(findNodeFromID(arrows_copy[i].startID, nodes), findNodeFromID(arrows_copy[i].endID, nodes), i, arrows_copy, double_connections, arrow_width, directed, val);
                }
            }
        }
        
        setWeighted(val);
        setArrows(arrows_copy);
    };

    //Change the sidebar to display the different graph options
    const handleChangeGraphType = () => {
        setMoveMode(false);
        setDeleteMode(false);
        if(animationNode){
            handleMoveNodeInterrupt();
        }
    };

    //Clear graph of all nodes / arrows
    const clearGraph = () => {
        setNodes([]);
        setArrows([]);
        setNumNodes(1);
        setStartLineNode(null);
        setNumArrows(1);
        setAnimationArrow(null);
        setDeleteMode(false);
        setMoveMode(false);
        setAnimationNode(null);
        setOriginalNode(null);
    }

    //Updates weight of arrow
    const updateArrowWeight = (e, id) => {
        if(!drawGraph) return; //Don't update if canvas is locked

        const arrows_copy = arrows.slice();
        let i = 0;
        //Find arrow whose weight is being updated
        while(i < arrows_copy.length && arrows_copy[i].id !== id){
            i++;
        }
        
        //Errror handling for id not found
        if(i >= arrows_copy.length){
            alert("Error");
            return;
        }
        else if (e.target.value[0] === "0") { //Avoid case of adding 0s to the front
            e.target.value = e.target.value.substr(1);
        }
        
        const eventNum = parseInt(e.target.value); //Value typed into input box
        const addedValue = parseInt(e.nativeEvent.data); //New number added to input box
        const prevValue = arrows_copy[i].weight; //Previous value in input box
        const MAX = 50; //Max weight
        const MIN = 1; //Min weight

        if (!eventNum){ //Delete a single digit
            arrows_copy[i].weight = MIN;
        }
        else if (eventNum > MAX && prevValue < 10){ //Replace current digit to avoid going over MAX (if max < 100)
            arrows_copy[i].weight = addedValue === 0 ? MIN : addedValue;
        }
        else if (!addedValue && eventNum <= MAX){ //Delete a digit
            arrows_copy[i].weight = eventNum;
        }
        else if (prevValue < Math.floor(MAX/10)){ //Append to single digit if adding another digit would be less than max
            arrows_copy[i].weight = eventNum;
        }
        else if (prevValue >= 10 && e.target.value.indexOf(String(prevValue)) === 0){ //Adding a number to the end
            arrows_copy[i].weight = Math.floor(prevValue / 10) * 10 + addedValue;
        }
        else if (prevValue >= 10 && e.target.value.indexOf(String(prevValue)) === -1){ //Adding a number to the end (from middle)
            arrows_copy[i].weight = Math.floor(prevValue / 10) * 10 + addedValue;
        }
        else if (prevValue >= 10 && e.target.value.indexOf(String(addedValue)) === 0 && Math.floor(eventNum / 10) < MAX){ //Adding a number to the start
            arrows_copy[i].weight = Math.floor(eventNum / 10);
        }
        
        setArrows(arrows_copy);
    }

    const toggleSelectStartNode = () => {
        setSelectStartNode(!selectStartNode);
    }

	return (
		<div>
            <h1 className="header">{selectStartNode ? "Select Starting Node" : "Draw Your Graph"}</h1> 
            <svg className={drawGraph ? "canvas" : "canvas-locked"} 
                height={drawGraph ? CONTAINER_HEIGHT : LOCKED_MULTIPLIER * CONTAINER_HEIGHT}
                width={drawGraph ? CONTAINER_WIDTH : LOCKED_MULTIPLIER * CONTAINER_WIDTH} 
                onMouseDown={handleCanvasClicked} 
                onMouseMove={handleArrowAnimation}
            >
                {directed && 
                    <defs>
                        <marker id="markerArrow" markerWidth="8" markerHeight="8" refX="2" refY="5" orient="auto">
                            <path d="M2,0 L2,8 L8,5 L2,2" style={{fill: "#000000"}} />
                        </marker>
                        <marker id="markerArrowDelete" markerWidth="8" markerHeight="8" refX="2" refY="5" orient="auto">
                            <path d="M2,0 L2,8 L8,5 L2,2" style={{fill: "red"}} />
                        </marker>
                    </defs>
                }
                <g>
                    {nodes.map((node, i) => (
                        <g key={i}>
                            <circle className={`node ${
                                                !startLineNode && hoverNode && hoverNode === node.id ? //hover actions
                                                    deleteMode ?
                                                        "delete-node-hover" //hovering on node to delete
                                                    : 
                                                        moveMode ?
                                                            "move-node-hover" //hovering on node to move
                                                        : 
                                                            drawGraph && !startLineNode ?
                                                                "draw-node-connection" //hovering on node to start drawing arrow
                                                            : 
                                                                selectStartNode ? 
                                                                    "select-start-node" //hovering on node to start search
                                                                :
                                                                    "no-click-node"
                                                :
                                                    drawGraph ?
                                                        startLineNode && startLineNode.id === node.id && "draw-node-connection" //click on node and changes to orange
                                                    :
                                                        "no-click-node"
                                            }`}
                                    r={NODE_RADIUS} 
                                    cx={node.x} 
                                    cy={node.y}
                                    onMouseDown = {(e) => handleNodeClicked(e, node)}
                                    onMouseEnter = {(e) => handleElementHover(e, node.id)}
                                    onMouseLeave = {(e) => handleElementHover(e, node.id)}
                            ></circle>
                            <text x={node.x} y={node.y}
                                className={!drawGraph && !selectStartNode ? "no-click-node-number" : "node-number"}
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="0.5px"
                                alignmentBaseline="middle"
                                onMouseDown = {(e) => handleNodeClicked(e, node)}
                                onMouseEnter = {(e) => handleElementHover(e, node.id)}
                            > 
                                {node.id}
                            </text>
                        </g>
                    ))}
                </g>

                {arrows.map((arrow, i) => (
                    <g key={i}>
                        <line x1={arrow.nodex1} 
                            y1={arrow.nodey1} 
                            x2={arrow.nodex2} 
                            y2={arrow.nodey2} 
                            className={`${deleteMode && hoverArrow && hoverArrow === arrow.id ? "delete-arrow-hover" : "arrow"}`}
                            onClick={() => handleLinkClick(arrow)}
                            onMouseEnter={(e) => handleElementHover(e, arrow.id)}
                            onMouseLeave={(e) => handleElementHover(e, arrow.id)}
                        />
                        {weighted && 
                            <foreignObject
                                x={(arrow.nodex1+arrow.nodex2) / 2 - 13}
                                y={(arrow.nodey1+arrow.nodey2) / 2 - 10}
                                width="33"
                                height="24"
                            >
                                <input
                                    className={`weight-input ${!drawGraph && "weight-input-disabled"}`}
                                    type="number"
                                    min="1"
                                    max="50"
                                    step="1"
                                    value={arrow.weight}
                                    onChange={(e)=>updateArrowWeight(e, arrow.id)}
                                    onClick={deleteMode?()=>handleLinkClick(arrow):undefined}
                                    style={deleteMode ?{color:"transparent"}:{}} 
                                /> {/*Adding the style avoids weird case where an input gets clicked when deleting another*/}

                            </foreignObject>
                        }
                    </g>
                ))}

                {animationArrow &&
                    <g>
                        <line x1={animationArrow.startx} y1={animationArrow.starty} x2={animationArrow.endx} y2={animationArrow.endy} className="arrow"/>
                    </g>
                }
                {animationNode &&
                    <g>
                        <circle className="node animation-node" 
                                        r={NODE_RADIUS} 
                                        cx={animationNode.x} 
                                        cy={animationNode.y}
                        ></circle>
                        <text x={animationNode.x} y={animationNode.y}
                                className="animation-node node-number"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="0.5px"
                                alignmentBaseline="middle"
                            > 
                                {animationNode.id}
                        </text>
                        <circle className="node original-node" 
                                        r={NODE_RADIUS} 
                                        cx={originalNode.x} 
                                        cy={originalNode.y}
                        ></circle>
                        <text x={originalNode.x} y={originalNode.y}
                                className="original-node node-number"
                                textAnchor="middle"
                                stroke="black"
                                strokeWidth="0.5px"
                                alignmentBaseline="middle"
                            > 
                                {originalNode.id}
                        </text>
                    </g>
                }
            </svg>

            <Sidebar drawGraph={drawGraph} 
                    lockUnlock={toggleDrawGraph}
                    toggleDeleteMode={toggleDeleteMode}
                    toggleMoveMode={toggleMoveMode}
                    toggleWeighted={toggleWeighted}
                    toggleDirected={toggleDirected}
                    handleChangeGraphType={handleChangeGraphType}
                    isDeleteMode={deleteMode}
                    isMoveMode={moveMode}
                    weighted={weighted}
                    directed={directed}
                    clearGraph={clearGraph}
                    toggleSelectStartNode={toggleSelectStartNode}
                    selectStartNode={selectStartNode}
            ></Sidebar>       
		</div>
	);
}
