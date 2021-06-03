import "./Sidebar.css";
import React, {useState} from "react";

export function Sidebar(props) {

    const{lockUnlock, drawGraph, toggleDeleteMode, isDeleteMode} = props;

    const [showPanel, setShowPanel] = useState(true);

    const toggleSidebar = () => {
        setShowPanel(!showPanel);
    };

    const handleItemClick = () => {
        console.log("click");
    }

    

	return (
		<div>
            <div className = {`sidebar ${showPanel ? 'open-panel' : 'close-panel'}`}>
                <div className="panel">
                    <p className="panel-element" onClick={lockUnlock}>{drawGraph ? "Lock" : "Unlock"}</p>
                    <p className="panel-element">{drawGraph ? "Move Node" : "Item 2"}</p>
                    <p className="panel-element" 
                        onClick={drawGraph ? toggleDeleteMode : handleItemClick}
                        style={isDeleteMode ? {backgroundColor:"green"} : {}}
                    >{drawGraph ? "Delete Node/Link" : "Item 3"}</p>
                    <p className="panel-element">{drawGraph ? "Delete Link" : "Item 4"}</p>
                    <p className="panel-element">Item 5</p>
                    <p className="panel-element">Item 6</p>
                    <p className="panel-element">Item 7</p>
                </div>
            </div>
            
            <div className="panel-hide" onClick={toggleSidebar}>
                <div className={`close-open ${showPanel ? 'open' : 'close'}`}>
                    {showPanel ? '>' : '<'}    
                </div>
            </div>
		</div>
	);
}