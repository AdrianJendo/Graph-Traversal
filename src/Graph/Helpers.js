export const NODE_RADIUS = 20;

//Sorts Node Array
export const sortNodesArray = (nodes) => {
	const nodes_copy = nodes.sort((node1, node2) => node1.id - node2.id);
	return nodes_copy;
};

//Returns node object from nodes array based on unique id
export const findNodeFromID = (id, nodes) => {
	const valid_nodes = nodes.filter((node) => {
		return node.id === id;
	});
	return valid_nodes[0];
};

//Updates arrows to new node location
export const updateMovedNodeLinks = (
	startNode,
	endNode,
	index,
	links,
	double_connections,
	arrow_width,
	directed = true,
	keepWeights = true
) => {
	const angle = getAngle(startNode, endNode);
	//const arrow_width = 11; //px
	let [start_offsetx, start_offsety] = getStartOffsets(startNode, angle);
	let [end_offsetx, end_offsety] = getEndOffsets(endNode, angle, directed);

	let doubleEdgeNodePair = -1; //Look for two nodes connected by two directional edges
	if (directed) {
		for (let i = index; i < links.length; ++i) {
			if (startNode.id === links[i].endID && endNode.id === links[i].startID) {
				//Mark index of double connected nodes
				doubleEdgeNodePair = i;
			}
		}
	}

	if (doubleEdgeNodePair >= 0) {
		//Calculate required offset adjustmenet for doubly connected nodes
		start_offsetx += arrow_width * Math.sin(angle);
		start_offsety += arrow_width * Math.cos(angle);
		end_offsetx += arrow_width * Math.sin(angle);
		end_offsety += arrow_width * Math.cos(angle);

		//Reverse arrow has backwards startNode and EndNode
		const [start_offsetx2, start_offsety2] = getStartOffsets(
			endNode,
			angle + Math.PI
		);
		const [end_offsetx2, end_offsety2] = getEndOffsets(
			startNode,
			angle + Math.PI
		);

		const secondLink_replacement = {
			nodex1: start_offsetx2 - arrow_width * Math.sin(angle),
			nodey1: start_offsety2 - arrow_width * Math.cos(angle),
			nodex2: end_offsetx2 - arrow_width * Math.sin(angle),
			nodey2: end_offsety2 - arrow_width * Math.cos(angle),
			startID: links[doubleEdgeNodePair].startID,
			endID: links[doubleEdgeNodePair].endID,
			id: links[doubleEdgeNodePair].id,
			weight: keepWeights ? links[doubleEdgeNodePair].weight : 1,
		};
		links.splice(doubleEdgeNodePair, 1, secondLink_replacement); //Replace current line by updated offset
		double_connections.push(secondLink_replacement.id);
	}
	const replacement = {
		nodex1: start_offsetx,
		nodey1: start_offsety,
		nodex2: end_offsetx,
		nodey2: end_offsety,
		startID: links[index].startID,
		endID: links[index].endID,
		id: links[index].id,
		weight: keepWeights ? links[index].weight : 1,
	};
	links.splice(index, 1, replacement);
};

//Get angle between nodes (radians)
export const getAngle = (startNode, endNode) => {
	const x_dist = endNode.x - startNode.x;
	const y_dist = -1 * (endNode.y - startNode.y); //Vertical distance measured from top = 0 so multiply by -1 to get y positive wrt bottom of canvas
	const angle_ref =
		x_dist !== 0 ? Math.abs(Math.atan(y_dist / x_dist)) : Math.PI / 2; //reference angle

	//Standard angle
	let angle = angle_ref;
	if (y_dist >= 0 && x_dist < 0) {
		angle = Math.PI - angle;
	} else if (y_dist < 0) {
		if (x_dist > 0) {
			angle = 2 * Math.PI - angle;
		} else {
			angle = Math.PI + angle;
		}
	}
	return angle;
};

//Offset of x,y wrt center of starting node
export const getStartOffsets = (startNode, angle) => {
	const start_offset = NODE_RADIUS + 1;
	const start_offsetx = startNode.x + start_offset * Math.cos(angle);
	const start_offsety = startNode.y - start_offset * Math.sin(angle);
	return [start_offsetx, start_offsety];
};

//Offset x,y wrt center of end node
export const getEndOffsets = (node, angle, directed = true) => {
	const end_offset = directed ? NODE_RADIUS + 15 : NODE_RADIUS + 1;
	const end_offsetx = node.x - end_offset * Math.cos(angle);
	const end_offsety = node.y + end_offset * Math.sin(angle);
	return [end_offsetx, end_offsety];
};
