import "./DijkstraPopup.css";
import React from "react";

export function DijkstraPopup(props) {
	const { handleClose, toggleStartAnimationNode } = props;

	return (
		<div className="popup-box">
			<div className="box">
				<span className="close-icon" onClick={handleClose}>
					x
				</span>
				<div className="row">
					<button
						className="popupButton"
						onClick={() => toggleStartAnimationNode("dijkstraFull")}
					>
						Traverse Entire Graph
					</button>
					<button
						className="popupButton"
						onClick={() => toggleStartAnimationNode("dijkstraStartEnd")}
					>
						Select Start and End Node
					</button>
				</div>
			</div>
		</div>
	);
}
