import "./DijkstraPopup.css";
import React from "react";

export function DijkstraPopup(props) {
	const { handleClose } = props;

	return (
		<div className="popup-box">
			<div className="box">
				<span className="close-icon" onClick={handleClose}>
					x
				</span>
				<div className="row">
					<div className="column">
						<button onClick={undefined}>Traverse Entire Graph</button>
					</div>
					<div className="column">
						<button onClick={undefined}>Select End Node</button>
					</div>
				</div>
			</div>
		</div>
	);
}
