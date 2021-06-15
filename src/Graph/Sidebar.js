import "./Sidebar.css";
import React, {useState} from "react";

export function Sidebar(props) {

    const{
        lockUnlock, 
        drawGraph, 
        toggleDeleteMode, 
        isDeleteMode, 
        isMoveMode, 
        toggleMoveMode, 
        directed, 
        weighted,
        toggleWeighted,
        toggleDirected,
        clearGraph,
        handleChangeGraphType,
        toggleStartAnimationNode,
        startAnimationNode
    } = props;

    const [showPanel, setShowPanel] = useState(true);
    const [graphTypeMenu, setGraphTypeMenu] = useState(false);

    const toggleSidebar = () => {
        setShowPanel(!showPanel);
    };

    const toggleGraphTypeMenu = () => {
        setGraphTypeMenu(!graphTypeMenu);
        handleChangeGraphType();
    };


	return (
		<div>
            <div className = {`sidebar ${showPanel ? 'open-panel' : 'close-panel'}`}>
                <div>
                    <div className="panel panel-default">
                        <p className="panel-element" onClick={graphTypeMenu ? toggleGraphTypeMenu : lockUnlock}>
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Lock" : "Unlock"}</span>
                            <span 
                                className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`} 
                                style={{borderBottom:"2px solid white"}}
                            >
                                {"<<"}
                            </span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && !weighted ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleWeighted(false) : drawGraph ? toggleGraphTypeMenu : toggleStartAnimationNode}
                            style={startAnimationNode ? {backgroundColor:"green"} : {}}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Change Graph Type" : "Depth-First Search"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Unweighted</span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && weighted ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleWeighted(true) : drawGraph ? toggleMoveMode : toggleStartAnimationNode}
                            style={graphTypeMenu ? {} : isMoveMode || startAnimationNode ? {backgroundColor:"green"} : {}}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Move Node" : "Breadth-First Search"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Weighted</span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && !directed ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleDirected(false): drawGraph ? toggleDeleteMode : undefined}
                            style={graphTypeMenu ? {} : isDeleteMode ? {backgroundColor:"green"} : {}}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Delete Node/Link" : "Item 3"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Undirected</span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && directed ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleDirected(true) : drawGraph ? clearGraph : undefined}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Clear Graph" : "Item 4"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Directed</span>
                        </p>
                    </div>
                </div>
            </div>
            <div className="panel-hide" onClick={toggleSidebar}>
                <div className={`close-open ${showPanel ? 'open-rotate' : 'close-rotate'}`}>
                    {showPanel ? '>' : '<'}    
                </div>
            </div>
		</div>
	);
}