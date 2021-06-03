import "./Graph.css";
import React, { useState } from "react";
import {Sidebar} from "./Sidebar"

const LOCKED_MULTIPLIER = 1.2;
const CONTAINER_HEIGHT = 600;
const CONTAINER_WIDTH = 1200;
const NODE_RADIUS = 20;
const DEFAULT_BACKGROUND = 'white';
const HOVER_BACKGROUND = 'orange';
const BUFFER = 15;

export function Graph() {
    
    const [drawGraph, setDrawGraph] = useState(true);
    const [numNodes, setNumNodes] = useState(1);
	const [nodes, setNodes] = useState([]);
    const [startLineNode, setStartLineNode] = useState(null);
    const [numArrows, setNumArrows] = useState(1);
    const [arrows, setArrows] = useState([]);
    const [animationArrow, setAnimationArrow] = useState(null);
    const [deleteMode, setDeleteMode] = useState(false);

	const handleAddNode = (e) => {
        if(e.target.className === "node" || e.button !== 0 || deleteMode) return;

        else if (e.nativeEvent.offsetX < NODE_RADIUS || 
                e.nativeEvent.offsetY < NODE_RADIUS || 
                CONTAINER_WIDTH - e.nativeEvent.offsetX < NODE_RADIUS ||
                CONTAINER_HEIGHT - e.nativeEvent.offsetY < NODE_RADIUS ) return; //Keeps all drawn node inside the canvas
        
        const coord_x = e.nativeEvent.offsetX;
        const coord_y = e.nativeEvent.offsetY;
        let update = true;

        nodes.forEach((node)=>{
            const distance = Math.sqrt(Math.pow(node.x-coord_x, 2) + Math.pow(node.y-coord_y, 2));
            if(distance < 2*NODE_RADIUS + BUFFER) {
                update = false; //Prevents two node from being on top of each other
                return;
            }
        })

        if(update){
            setNodes([...nodes, {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, id:numNodes}]);
            setNumNodes(numNodes+1);
        }
	};

    //Get angle between nodes
    const getAngle = (endNode, startNode) => {
        const x_dist = endNode.x - startNode.x;
        const y_dist = -1 * (endNode.y - startNode.y); //Vertical distance measured from top = 0 so multiply by -1 to get y positive wrt bottom of canvas
        const angle_ref = x_dist !== 0 ? Math.abs(Math.atan(y_dist / x_dist)) : Math.PI / 2; //reference angle

        //Standard angle
        let angle = angle_ref;
        if(y_dist >= 0 && x_dist < 0){
            angle = Math.PI - angle;
        }
        else if (y_dist < 0){
            if(x_dist > 0){
                angle = 2 * Math.PI - angle;
            }
            else{
                angle = Math.PI + angle;
            }
        }
        return angle;
    };

    //Offset of x,y wrt center of starting node
    const getStartOffsets = (startNode, angle) => {
        const start_offset = NODE_RADIUS
        const start_offsetx = startNode.x + start_offset * Math.cos(angle);
        const start_offsety = startNode.y - start_offset * Math.sin(angle);
        return [start_offsetx, start_offsety];
    };

    //Offset x,y wrt center of end node
    const getEndOffsets = (node, angle) => {
        const end_offset = NODE_RADIUS + 11; //Head of the arrow is 10ish px
        const end_offsetx = node.x - end_offset * Math.cos(angle);
        const end_offsety = node.y + end_offset * Math.sin(angle);
        return [end_offsetx, end_offsety];
    };
    
    const handleNodeClicked = (e, node) => {
        if(e.button === 0){ //Only primary click
            if(deleteMode){
                //Remove node from nodes and any connections with node.id at either start or end of link
                const nodes_copy = nodes.slice();
                for(let i=0; i<nodes_copy.length; ++i){
                    if(nodes_copy[i].id === node.id){
                        nodes_copy.splice(i, 1)
                        break;
                    }
                }

                const arrows_copy = arrows.slice();
                let i = 0;
                while(i<arrows_copy.length){
                    if(arrows_copy[i].startID === node.id || arrows_copy[i].endID === node.id){
                        arrows_copy.splice(i,1);
                    }
                    else{
                        ++i;
                    }
                }

                setNodes(nodes_copy);
                setArrows(arrows_copy);
            }
            else if(!startLineNode){
                setStartLineNode(node); //Change colour & signal arrow animation
                return;
            }
            else if(node.id !== startLineNode.id){ //connect nodes with arrows
                
                const angle = getAngle(node, startLineNode);
                const arrow_width = 8; //px
                let [start_offsetx, start_offsety] = getStartOffsets(startLineNode, angle);
                let [end_offsetx, end_offsety] = getEndOffsets(node, angle);                
                    
                //Check for overlap of arrows
                let overlap = false;
                let doubleEdgeNodePair = -1; //Look for two nodes connected by two directional edges
                for(let i = 0; i<arrows.length; ++i){
                    if(startLineNode.id === arrows[i].startID && node.id === arrows[i].endID) { //Trying to draw same line between already connected nodes
                        overlap = true;
                        break;
                    }
                    else if(startLineNode.id === arrows[i].endID && node.id === arrows[i].startID) {  //Mark index of double connected nodes
                        doubleEdgeNodePair = i;
                    }
                }
    
    
                if(overlap){
                    alert("Nodes already connected");
                }
                else {
                    let numLinks = numArrows;
                    if(doubleEdgeNodePair >= 0){ //Calculate required offset adjustmenet for doubly connected nodes
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
                                            id: numLinks
                                        };
                        arrows.splice(doubleEdgeNodePair, 1, replacement); //Replace current line by updated offset
                        numLinks++;
                    }
                    setArrows([...arrows, {nodex1:start_offsetx, nodey1:start_offsety, nodex2:end_offsetx, nodey2:end_offsety, startID:startLineNode.id, endID:node.id, id:numLinks}]);
                    setNumArrows(numLinks+1);
                }
            }
            setAnimationArrow(null);
            setStartLineNode(null);
        }
    };
    
    //Check if deletemode and set colour accordingly (do same for links)
    const handleNodeHover = (e, id) => {
        /*e.type === 'mouseenter'*/
    };

    const handleArrowAnimation = (e) => {
        if(startLineNode){
            const distance = Math.sqrt(Math.pow(e.nativeEvent.offsetX - startLineNode.x, 2) + Math.pow(e.nativeEvent.offsetY - startLineNode.y, 2));

            if(distance < 2*NODE_RADIUS + BUFFER){
                setAnimationArrow(null);
                return;
            }

            const pointer_coords = {x:e.nativeEvent.offsetX, y:e.nativeEvent.offsetY}
            const angle = getAngle(pointer_coords, startLineNode);
            const [start_offsetx, start_offsety] = getStartOffsets(startLineNode, angle);
            
            const pointer_size = 12;
            const pointerx = pointer_size * Math.cos(angle);
            const pointery = pointer_size * Math.sin(angle);
            const end_offsetx = e.nativeEvent.offsetX - pointerx;
            const end_offsety = e.nativeEvent.offsetY + pointery;

            setAnimationArrow({startx: start_offsetx, starty: start_offsety, endx:end_offsetx, endy:end_offsety});
        }
        else if(animationArrow) {
            setAnimationArrow(null);
        }
    };

    const toggleDeleteMode = () => {
        setStartLineNode(null);
        setDeleteMode(!deleteMode);
    };

    const handleLinkClick = (link) => {
        //Handle deleting link
        if(deleteMode){
            console.log(arrows, nodes);
            let connectedNodes = {};
            const arrows_copy = arrows.slice();
            for(let i=0; i<arrows_copy.length; ++i){
                if(arrows_copy[i].id === link.id){
                    connectedNodes.startID = arrows_copy[i].startID
                    connectedNodes.endID = arrows_copy[i].endID
                    arrows_copy.splice(i, 1);
                    break;
                }
            }

            if(connectedNodes){
                const arrow_width = 8; //px
                let i_paired_link = 0;
                while(i_paired_link < arrows_copy.length && !(arrows_copy[i_paired_link].startID === connectedNodes.endID && arrows_copy[i_paired_link].endID === connectedNodes.startID)) {
                    ++i_paired_link;
                }

                if(i_paired_link < arrows_copy.length) {
                    //Offset coordinates but angle is still the same
                    const endNode = {x:arrows_copy[i_paired_link].nodex2, y:arrows_copy[i_paired_link].nodey2}
                    const startNode = {x:arrows_copy[i_paired_link].nodex1, y:arrows_copy[i_paired_link].nodey1}
                    const angle = getAngle(endNode, startNode);
                    
                    arrows_copy[i_paired_link].nodex1 -= arrow_width * Math.sin(angle);
                    arrows_copy[i_paired_link].nodey1 -= arrow_width * Math.cos(angle);
                    arrows_copy[i_paired_link].nodex2 -= arrow_width * Math.sin(angle);
                    arrows_copy[i_paired_link].nodey2 -= arrow_width * Math.cos(angle);
                }
                setArrows(arrows_copy);
            }
        }

        return false;
    }

    const toggleDrawGraph = () => {
        setDrawGraph(!drawGraph);
    };


	return (
		<div>
            <h1 className="header">Draw your Graph</h1> 
            {drawGraph && 
                <svg className="canvas" height={CONTAINER_HEIGHT} width={CONTAINER_WIDTH} onMouseDown={handleAddNode} onMouseMove={handleArrowAnimation}>
                    <defs>
                        <marker id="markerArrow" markerWidth="8" markerHeight="8" refX="2" refY="5" orient="auto">
                            <path d="M2,0 L2,8 L8,5 L2,2" style={{fill: "#000000"}} />
                        </marker>
                    </defs>
                    <g>
                        {nodes.map((node, i) => (
                            <g key={i}>
                                <circle className="node" 
                                        r={NODE_RADIUS} 
                                        cx={node.x} 
                                        cy={node.y}
                                        onMouseDown = {(e) => handleNodeClicked(e, node)}
                                        onMouseEnter = {(e) => handleNodeHover(e, node.id)}
                                        onMouseLeave = {(e) => handleNodeHover(e, node.id)}
                                        style={{fill: startLineNode && startLineNode.id === node.id ? HOVER_BACKGROUND : DEFAULT_BACKGROUND}}
                                ></circle>
                            </g>
                        ))}
                    </g>
                    <g>
                        {arrows.map((arrow, i) => (
                            <line x1={arrow.nodex1} 
                                y1={arrow.nodey1} 
                                x2={arrow.nodex2} 
                                y2={arrow.nodey2} 
                                className="arrow" 
                                key={i} 
                                onClick={() => handleLinkClick(arrow)}
                                style={deleteMode ? {cursor:"pointer"}:{}}
                            />
                            ))}        
                    </g>
                    {animationArrow ? 
                    <g>
                        <line x1={animationArrow.startx} y1={animationArrow.starty} x2={animationArrow.endx} y2={animationArrow.endy} className="arrow"/>   
                    </g>
                        :null
                    }
                </svg>
            }
            {!drawGraph && 
                <svg className="canvas-locked" height={LOCKED_MULTIPLIER * CONTAINER_HEIGHT} width={LOCKED_MULTIPLIER * CONTAINER_WIDTH}>
                    <defs>
                        <marker id="markerArrow" markerWidth="8" markerHeight="8" refX="2" refY="5" orient="auto">
                            <path d="M2,0 L2,8 L8,5 L2,2" style={{fill: "#000000"}} />
                        </marker>
                    </defs>
                    <g>
                        {nodes.map((node, i) => (
                            <g key={i}>
                                <circle className="node" 
                                        r={NODE_RADIUS} 
                                        cx={LOCKED_MULTIPLIER * node.x} 
                                        cy={LOCKED_MULTIPLIER * node.y}
                                ></circle>
                            </g>
                        ))}
                    </g>
                    <g>
                        {arrows.map((arrow, i) => (
                            <line x1={LOCKED_MULTIPLIER * arrow.nodex1} 
                                    y1={LOCKED_MULTIPLIER * arrow.nodey1} 
                                    x2={LOCKED_MULTIPLIER * arrow.nodex2} 
                                    y2={LOCKED_MULTIPLIER * arrow.nodey2} className="arrow" key={i}/>
                        ))}
                    </g>
                </svg>
            }
            <Sidebar drawGraph={drawGraph} 
                    lockUnlock={toggleDrawGraph}
                    toggleDeleteMode={toggleDeleteMode}
                    isDeleteMode={deleteMode}
            ></Sidebar>       
		</div>
	);
}
