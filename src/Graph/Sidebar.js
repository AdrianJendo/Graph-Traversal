import "./Sidebar.css";
import React, {useEffect, useState} from "react";

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
        handleChangeGraphType
    } = props; //handleChangeGraphType

    const [showPanel, setShowPanel] = useState(true);
    const [graphTypeMenu, setGraphTypeMenu] = useState(false);

    const toggleSidebar = () => {
        setShowPanel(!showPanel);
    };

    const handleItemClick = () => {
        console.log("click");
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
                            onClick={graphTypeMenu ? ()=>toggleWeighted(false) : drawGraph ? toggleGraphTypeMenu : undefined}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Change Graph Type" : "Item 1"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Unweighted</span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && weighted ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleWeighted(true) : drawGraph ? toggleMoveMode : handleItemClick}
                            style={graphTypeMenu ? {} : isMoveMode ? {backgroundColor:"green"} : {}}
                        >
                            <span className={`panel-item ${graphTypeMenu ? "panel-item-open" : "panel-item-close"}`}>{drawGraph ? "Move Node" : "Item 2"}</span>
                            <span className={`dropdown-item ${graphTypeMenu ? "dropdown-item-open" : "dropdown-item-close"}`}>Weighted</span>
                        </p>
                        <p 
                            className={`panel-element ${graphTypeMenu && !directed ? "graphTypeSelected" : ""}`}
                            onClick={graphTypeMenu ? ()=>toggleDirected(false): drawGraph ? toggleDeleteMode : handleItemClick}
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