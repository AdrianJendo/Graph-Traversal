import "./Graph.css";
import React, { useState } from "react";

const CONTAINER_HEIGHT = 600;
const CONTAINER_WIDTH = 1200;
const NODE_RADIUS = 20;
const DEFAULT_BACKGROUND = 'white';
const HOVER_BACKGROUND = 'orange';
const BUFFER = 5;

export function Graph() {
    
    const [numNodes, setNumNodes] = useState(1);
	const [nodes, setNodes] = useState([]);
    const [nodeToUpdate, setNodeToUpdate] = useState(null);
    const [arrows, setArrows] = useState([{nodex1:100, nodey1:200, nodex2:300, nodey2:400}]);
    const [drawArrow, setDrawArrow] = useState(false);

	const handleAddNode = (e) => {
        if(e.target.className === "node" || e.button !== 0) return;

        else if (e.nativeEvent.offsetX < NODE_RADIUS || 
                e.nativeEvent.offsetY < NODE_RADIUS || 
                CONTAINER_WIDTH - e.nativeEvent.offsetX < NODE_RADIUS ||
                CONTAINER_HEIGHT - e.nativeEvent.offsetY < NODE_RADIUS ) return; //Keeps all drawn node inside the canvas
        
        const coord_x = e.nativeEvent.offsetX - NODE_RADIUS;
        const coord_y = e.nativeEvent.offsetY - NODE_RADIUS;
        let update = true;

        nodes.forEach((node)=>{
            const distance = Math.sqrt(Math.pow(node.x-coord_x, 2) + Math.pow(node.y-coord_y, 2));
            if(distance < 2*NODE_RADIUS + BUFFER) {
                update = false; //Prevents two node from being on top of each other
                return;
            }
        })

        if(update){
            setNodes([...nodes, {x: e.nativeEvent.offsetX - NODE_RADIUS, y: e.nativeEvent.offsetY - NODE_RADIUS, id:numNodes}]);
            setNumNodes(numNodes+1);
        }
	};
    
    const handleNodeClicked = (id) => {
        setNodeToUpdate(id);
        setDrawArrow(true);
    };
    
    const handleNodeHover = (e, id) => {
        /*if(e.type === 'mouseenter'){
            setNodeToUpdate(id);
        }
        else{
            setNodeToUpdate(null);
        }*/
    }

	return (
		<div>
			<h1 className="header">Draw your Graph</h1>
			<div className="canvas" style = {{"--height":CONTAINER_HEIGHT, "--width":CONTAINER_WIDTH}} onMouseDown={handleAddNode}>
                {nodes.map((node, i) => (
                        <div 
                            className="node"
                            onMouseDown = {() => handleNodeClicked(node.id)}
                            onMouseEnter = {(e) => handleNodeHover(e, node.id)}
                            onMouseLeave = {(e) => handleNodeHover(e, node.id)}
                            style={{left:`${node.x}px`, 
                                    top:`${node.y}px`, 
                                    '--radius':NODE_RADIUS, 
                                    backgroundColor: nodeToUpdate && nodeToUpdate === node.id ? HOVER_BACKGROUND : DEFAULT_BACKGROUND,
                                    cursor: 'pointer'
                                }}
                            key={i}
                        ></div>
                    ))}
            </div>            
		</div>
	);
}
