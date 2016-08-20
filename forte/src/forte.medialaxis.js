/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Medial Axis
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

// check dependencies
if (XAC.Thing == undefined || XAC.Utilities == undefined || XAC.Const ==
	undefined) {
	err('missing dependency!');
}

FORTE.MedialAxis = function(scene, camera) {
	this._scene = scene;
	this._camera = camera;

	this._nodes = [];
	this._edges = [];

	this._inflationsNode = [];
	this._inflations = [];
	this._inflationsInfo = [];
	this._inflateRate = 7; // larger value smaller rate

	// if set true, deleted edges will be used to reconnect its nodes
	this.RESTORINGEDGE = true;

	// visual properties
	this._opacityNormal = 0.75;
	this._radiusNode = FORTE.MedialAxis.DEFAULTEDGERADIUS * 1.1;
	this._radiusEdge = FORTE.MedialAxis.DEFAULTEDGERADIUS;
	this._matNode = XAC.MATERIALCONTRAST;
	this._matEdge = new THREE.MeshPhongMaterial({
		color: 0x888888,
		transparent: true,
		opacity: this._opacityNormal
	});
	this._matHighlight = XAC.MATERIALHIGHLIGHT;
	this._matInflation = new THREE.MeshLambertMaterial({
		color: 0xaaaaaa,
		transparent: true,
		wireframe: true,
		opacity: this._opacityNormal / 3
	});
};

FORTE.MedialAxis.NODE = 0;
FORTE.MedialAxis.EDGE = 1;

FORTE.MedialAxis.DEFAULTEDGERADIUS = 5;

FORTE.MedialAxis.prototype = {
	constructor: FORTE.MedialAxis,

	get nodes() {
		return this._nodes;
	},

	get edges() {
		return this._edges;
	}
};

//
//	allow events listeners to be added to the main web app, rather than called
//
FORTE.MedialAxis.addEventListeners = function() {
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
	document.addEventListener('keydown', this._keydown.bind(this), false);
}

//
//	for external use mostly - adding nodes by specifying its position
//
//	@param	pos - position of the new node
//	@param	toConect - whether to connect it to the previous node
//
FORTE.MedialAxis.prototype.addNode = function(pos, toConnect) {
	// check if the node is already in
	var alreadyIn = this._findNode(pos, false) >= 0;

	// add node
	if (!alreadyIn) {
		this._addNode(pos);
	}

	// add edge to previously created node
	if (toConnect && this._nodes.length > 1) {
		var node1 = this._nodes[this._nodes.length - 1];
		var node2 = this._nodes[this._nodes.length - 2];

		this._addEdge(node1, node2);
	}
}

//
//	for external use mostly - adding edges by specifying a series of points
//
//	@param	points - input points corresponding to an edge
//	@param	autoSplit - whether to split it when the edge starts on another edge
//
FORTE.MedialAxis.prototype.addEdge = function(points, autoSplit) {
	if (points == undefined || points.length < 2) {
		return;
	}

	// check if starting from existing nodes
	var idx1 = this._findNode(points[0], false);
	var node1 = idx1 >= 0 ? this._nodes[idx1] : this._addNode(points[0].clone(),
		autoSplit);
	var idx2 = this._findNode(points[points.length - 1], false);
	var node2 = idx2 >= 0 ? this._nodes[idx2] : this._addNode(points.slice(-1)[0]
		.clone(), autoSplit);

	// initialize thickness
	var thickness = [];
	for (var i = points.length - 1; i >= 0; i--) {
		thickness.push(this._radiusEdge);
	}

	// create an edge
	var edge = this._addEdge(node1, node2, points);

	return edge;
}

//
//	update a node's position and its connected edges based on external input
//
//	@param 	node - the node being interacted with
//	@param	pos - new position of this node
//
FORTE.MedialAxis.prototype.updateNode = function(node, pos) {
	// update this node
	var posPrev = node.position.clone();
	node.position.copy(pos);

	// update its edges and visuals
	for (var i = this._edges.length - 1; i >= 0; i--) {
		if (this._edges[i].deleted) {
			continue;
		}

		var node1 = this._edges[i].node1;
		var node2 = this._edges[i].node2;
		// if an edge is connected to this node
		if (node1 == node || node2 == node) {
			// offset the points along an edge
			// based on its degree of separation to the manipulated node
			var dv = node.position.clone().sub(posPrev);
			var len = node2.position.clone().sub(posPrev).length();
			var points = this._edges[i].points;
			for (var j = points.length - 1; j >= 0; j--) {
				var pt = points[j];
				var ratio = node1 == node ?
					1 - 1.0 * j / (points.length - 1) :
					1.0 * j / (points.length - 1);
				var dvj = dv.clone().multiplyScalar(ratio);
				points[j].add(dvj);
			}

			// DEBUG
			// if (points[points.length - 1] == undefined || points[0] == undefined) {
			// 	log(points)
			// }

			// make sure the end of points stick to the moving node
			if (node1 == node) {
				points[0].copy(pos);
			} else {
				points[points.length - 1].copy(pos);
			}
		} // found edge connected to ndoe
	} // all edges
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *	event handlers
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

FORTE.MedialAxis.prototype._mousedown = function(e) {
	//
	//	clean up previously selected edge
	//
	var edgeSelected = this._edgeSelected;
	if (this._edgeSelected != undefined) {
		for (var j = this._edgeSelected.inflations.length - 1; j >= 0; j--) {
			this._edgeSelected.inflations[j].m.material = this._edgeSelected.inflations[j].m.materialPersistent; //his._matInflation;
			this._edgeSelected.joints[j - 1 < 0 ? 0 : j - 1].m.material = this._edgeSelected.inflations[j].m
				.materialPersistent; //his._matInflation;
		}
		this._edgeSelected = undefined;
	}

	//
	//	interacting with a node
	//
	if (this._nodeSelected != undefined) {
		this._nodeSelected.inflation.m.material = this._matInflation;
	}

	var hitOnNode;
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		hitOnNode = XAC.hit(e, [this._nodes[i].inflation.m], this._camera);
		if (hitOnNode != undefined) {
			if (this.__nodeSelected != this._nodes[i]) {
				this._nodes[i].inflation.m.material = this._matHighlight;
				this._nodeSelected = this._nodes[i];
			} else {
				this._nodeSelected = undefined;
			}
			break;
		}
	}

	if (hitOnNode != undefined) {
		// TODO: disable to avoid global conflict
		// if (e.ctrlKey) {
		// 	this._nodeSelected = this._copyNode(this._nodeSelected);
		// }
		// this._maniplane = new XAC.Maniplane(this._nodeSelected.position, this._scene, this._camera, true);
		this._maniplane = new XAC.Maniplane(new THREE.Vector3(), this._scene, this._camera,
			true);
		this._findNode(this._nodeSelected.position, true); // find the node that's clicked
		return this._nodeSelected; // stop propagation here
	}

	//
	// interacting with an edge
	//
	var hitOnEdge;
	for (var i = this._edges.length - 1; i >= 0; i--) {
		var elmsInf = [];
		for (var j = this._edges[i].inflations.length - 1; j >= 0; j--) {
			elmsInf.push(this._edges[i].inflations[j].m);
		}
		hitOnEdge = XAC.hit(e, elmsInf, this._camera);
		if (hitOnEdge != undefined) {
			if (edgeSelected != this._edges[i]) {
				this._edgeSelected = this._edges[i];
			} else {
				this._edgeSelected = undefined;
			}
			break;
		}
	}

	if (hitOnEdge == undefined) {
		this._edgeSelected = undefined;
	}

	if (hitOnEdge != undefined) {
		var point = hitOnEdge.point;
		// TODO: disable to avoid global conflict
		// if (e.ctrlKey) {
		// 	this._nodeSelected = this._splitEdge(edge, point);
		// 	this._nodeSelected.material = this._matHighlight;
		// }

	}

	//
	//	interacting with inflation
	//
	// nodes have higher priority to be interacted with
	this._infSelected = XAC.hitObject(e, this._inflationsNode, this._camera);
	if (this._infSelected == undefined) {
		this._infSelected = XAC.hitObject(e, this._inflations, this._camera);
	}

	this._infSelInfo = undefined;
	for (var i = this._inflations.length - 1; i >= 0; i--) {
		if (this._inflations[i] == this._infSelected) {
			this._infSelInfo = this._inflationsInfo[i];
			break;
		}
	}
	this._eDown = e;

	return this._infSelInfo;
}

FORTE.MedialAxis.prototype._mousemove = function(e) {
	// if (this._listening == false) return;

	if (this._maniplane != undefined) {
		var pos = this._maniplane.update(e);
		if (pos != undefined) {
			this.updateNode(this._nodeSelected, pos);
			this._inflateNode(this._nodeSelected);
		}
		return this._nodeSelected;
	}

	if (this._infSelected != undefined) {
		var yOffset = e.clientY - this._eDown.clientY;
		var ratio = -yOffset / Math.pow(2, this._inflateRate);

		// this._scene.remove(this._infSelected);
		if (this._infSelInfo.nodeInfo != undefined) {
			this._infSelInfo.nodeInfo.radius *= (1 + ratio);
			this._inflateNode(this._infSelInfo.nodeInfo);
			this._nodeSelected = undefined;
		} else if (this._infSelInfo.edge.thickness != undefined) {
			var wind = 3;
			for (var i = -wind; i <= wind; i++) {
				var idx = Math.max(0, this._infSelInfo.idx + i);
				idx = Math.min(this._infSelInfo.edge.thickness.length - 1, idx);
				this._infSelInfo.edge.thickness[idx] *= (1 + ratio * (1 - Math.abs(i) /
					wind));
			}

			this._inflateEdge(this._infSelInfo.edge);
			this._edgeSelected = undefined;
		}

		this._eDown = e;

		return this._infSelected;
	}
}

FORTE.MedialAxis.prototype._mouseup = function(e) {
	if (this._maniplane != undefined) {
		this._maniplane.destruct();
		this._maniplane = undefined;
		this._inflate();
	}

	if (this._nodeSelected != undefined) {
		this._nodeSelected.inflation.m.material = this._matInflation;
		this._nodeSelected = undefined;
	}

	if (this._edgeSelected != undefined) {
		for (var j = this._edgeSelected.inflations.length - 1; j >= 0; j--) {
			this._edgeSelected.inflations[j].m.material = this._matHighlight;
			this._edgeSelected.joints[j - 1 < 0 ? 0 : j - 1].m.material = this._matHighlight;
		}
	}

	this._infSelected = undefined;
}

FORTE.MedialAxis.prototype._keydown = function(e) {
	switch (e.keyCode) {
		case 46: // DEL
			if (this._nodeSelected != undefined) return this._removeNode(this._nodeSelected);
			if (this._edgeSelected != undefined) return this._removeEdge(this._edgeSelected);
			break;
	}
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 *	internal helper routines
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

//
//	add a node at pos
//
FORTE.MedialAxis.prototype._addNode = function(pos, autoSplit) {
	var edgeIntersected;

	if (autoSplit == true) {
		for (var i = this._edges.length - 1; i >= 0 && edgeIntersected == undefined; i--) {
			if (this._edges[i].deleted) continue;
			var points = this._edges[i].points;
			for (var j = points.length - 1; j >= 0; j--) {
				if (pos.distanceTo(points[j]) < this._radiusEdge * 2) {
					edgeIntersected = this._edges[i];
					break;
				}
			} // for the poitns on each edge
		} // for each edge
	} // auto split or not

	if (edgeIntersected == undefined) {
		this._nodes.push({
			type: FORTE.MedialAxis.NODE,
			deleted: false,
			position: pos,
			edges: [], // info of the edges connected to this node
			radius: this._radiusNode * 1.1, // radius of this node
			radiusData: [], // store the raw data
			inflation: undefined
		});

		var node = this._nodes.slice(-1)[0];
		this._inflateNode(node);
		return node;
	} else {
		return this._splitEdge(edgeIntersected, pos);
	}
}

//
//	remove a node
//
FORTE.MedialAxis.prototype._removeNode = function(node) {
	this._scene.remove(node);

	// find this node from all nodes
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (node == this._nodes[i]) {

			// deal with its edges
			var edges = this._nodes[i].edges;
			for (var j = edges.length - 1; j >= 0; j--) {
				if (edges[j].deleted != true) this._removeEdge(edges[j]);
			}
			this._nodes[i].deleted = true;

			this._scene.remove(this._nodes[i].inflation.m);
		}
	}
}

//
//	find a node and maybe bring it to the top of the stack
//	return the index of the node stored
//
FORTE.MedialAxis.prototype._findNode = function(pos, bringToTop) {
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (this._nodes[i].deleted) continue;

		if (pos.distanceTo(this._nodes[i].position) < this._nodes[i].radius) {
			if (bringToTop) {
				this._nodes.push(this._nodes.splice(i, 1)[0]);
			}
			return i;
		}
	}
	return -1;
}

//
//	copy from an existing node
//
FORTE.MedialAxis.prototype._copyNode = function(node) {
	this._findNode(node.position, true);

	this._addNode(node.position);

	var node1 = this._nodes[this._nodes.length - 1];
	var node2 = this._nodes[this._nodes.length - 2];

	this._addEdge(node1, node2);

	return node1;
}

//
//	remove an edge
//
FORTE.MedialAxis.prototype._removeEdge = function(edge) {
	var isNodeEdgeless = function(node) {
		for (var i = 0; i < node.edges.length; i++) {
			if (node.edges[i].deleted != true) {
				return false;
			}
		}
		return true;
	}
	this._scene.remove(edge.mesh);
	edge.deleted = true;
	for (var j = edge.inflations.length - 1; j >= 0; j--) {
		this._scene.remove(edge.inflations[j].m);
		this._scene.remove(edge.joints[j - 1 < 0 ? 0 : j - 1].m);
	}

	if (isNodeEdgeless(edge.node1)) this._removeNode(edge.node1);
	if (isNodeEdgeless(edge.node2)) this._removeNode(edge.node2);

	return edge;
}

//
//	split an edge at pos
//	@param	edge - can be a mesh representing an edge, or its info
//
FORTE.MedialAxis.prototype._splitEdge = function(edge, pos) {
	// remove the edge, add a node in between and reconnect it with new edges
	var dmin = Number.MAX_VALUE;
	var idxSplit = -1;
	for (var i = edge.points.length - 1; i >= 0; i--) {
		var d = pos.distanceTo(edge.points[i]);
		if (d < dmin) {
			dmin = d;
			idxSplit = i;
		}
	}

	if (idxSplit <= 0) {
		return edge.node1;
	}

	if (idxSplit >= edge.points.length - 1) {
		return edge.node2;
	}

	var edge = this._removeEdge(edge);
	var node = this._addNode(pos);

	var edge1 = this._addEdge(edge.node1, node, edge.points.slice(0, idxSplit));
	var edge2 = this._addEdge(node, edge.node2, edge.points.slice(idxSplit + 1));

	// redistribute the thickness along the original edge
	var thickness = edge.thickness;
	var splitRatio = node.position.distanceTo(edge.node1.position) /
		edge.node2.position.distanceTo(edge.node1.position);
	idxSplit = idxSplit < 0 ? XAC.float2int(thickness.length * splitRatio) :
		idxSplit;
	edge1.thickness = [];
	edge2.thickness = [];
	if (thickness != undefined) {
		for (var i = 0; i < thickness.length; i++) {
			if (i < idxSplit) {
				edge1.thickness.push(thickness[i]);
			}

			if (i == idxSplit) {
				node.radius = thickness[i]
			}

			if (i > idxSplit) {
				edge2.thickness.push(thickness[i])
			}
		}
	}

	return node;
}

//
//	connect two nodes with an edge
//
FORTE.MedialAxis.prototype._addEdge = function(node1, node2, points) {
	// check it's already connected, or used to be connected
	var edge;

	if (this.RESTORINGEDGE) {
		for (var i = node1.edges.length - 1; i >= 0; i--) {
			if (node1.edges[i].node1 == node2 || node1.edges[i].node2 == node2) {
				if (node1.edges[i].deleted) {
					edge = node1.edges[i];
					break;
				} else {
					return; // edge already exists
				}
			}
		}
	}

	// connect nodes (that have never been connected)
	if (edge == undefined) {
		var edge = {
			type: FORTE.MedialAxis.EDGE,
			deleted: false,
			node1: node1,
			node2: node2,
			points: points,
			thickness: [],
			thicknessData: [],
			inflations: [],
			joints: []
		};

		for (var i = edge.points.length - 1; i >= 0; i--) {
			edge.thickness.push(this._radiusEdge);
		}

		this._edges.push(edge);

		// storing edge info in nodes
		node1.edges.push(edge);
		node2.edges.push(edge);

		if (this._scene.children.indexOf(node1.inflation.m) < 0) {
			this._scene.add(node1.inflation.m);
		}

		if (this._scene.children.indexOf(node2.inflation.m) < 0) {
			this._scene.add(node2.inflation.m);
		}
	}
	// connect nodes (that were connected but deleted)
	else {
		edge.deleted = false;
		for (var i = edge.inflations.length - 1; i >= 0; i--) {
			this._scene.add(edge.inflations[i].m)
		}
	}

	this._inflateEdge(edge);

	return edge;
}

//
//	inflate the medial axis with thicknesses
//
FORTE.MedialAxis.prototype._inflate = function() {
	// inflate the nodes
	for (var h = this._nodes.length - 1; h >= 0; h--) {
		if (this._nodes[h].deleted) continue;
		this._inflateNode(this._nodes[h], true);
	}

	// inflate the edges
	for (var h = this._edges.length - 1; h >= 0; h--) {
		if (this._edges[h].deleted) continue;
		this._inflateEdge(this._edges[h]);
	}
}

//
//	inflate a node
//
FORTE.MedialAxis.prototype._inflateNode = function(nodeInfo, nodeOnly) {
	var ctr = nodeInfo.position;
	var r = nodeInfo.radius;

	if (r > 0) {
		if (nodeInfo.inflation == undefined) {
			nodeInfo.inflation = new XAC.Sphere(r, this._matInflation, true);
			this._inflations.push(nodeInfo.inflation.m);
			this._inflationsNode.push(nodeInfo.inflation.m);
			this._inflationsInfo.push({
				nodeInfo: nodeInfo
			});
			this._scene.add(nodeInfo.inflation.m);
		} else {
			nodeInfo.inflation.update(r);
		}
		nodeInfo.inflation.m.position.copy(ctr);

	}

	if (nodeOnly) {} else {
		for (var i = nodeInfo.edges.length - 1; i >= 0; i--) {
			this._inflateEdge(nodeInfo.edges[i]);
		}
	}
}

//
//	inflate an edge
//
FORTE.MedialAxis.prototype._inflateEdge = function(edge) {
	var p1 = edge.node1.position;
	var p2 = edge.node2.position;
	var thickness = edge.thickness.concat([edge.node2.radius]);
	var points = edge.points.concat([p2]);

	var ctr0 = p1;
	var r0 = edge.node1.radius;
	for (var i = 0; i < thickness.length; i++) {
		var ctr;
		if (points == undefined) {
			ctr = p1.clone().multiplyScalar(1 - (i + 1) * 1.0 / thickness.length).add(
				p2.clone().multiplyScalar((i + 1) * 1.0 / thickness.length)
			);
		} else {
			ctr = points[i];
		}

		if (ctr == undefined) {
			continue;
		}

		var r;
		if (i == 0 || i == thickness.length - 1) {
			r = thickness[i];
		} else {
			r = (thickness[i - 1] + thickness[i] + thickness[i + 1]) / 3;
		}

		if (edge.inflations[i] == undefined) {
			var inflation = new XAC.ThickLine(ctr0, ctr, {
				r1: r,
				r2: r0
			}, this._matInflation);

			this._inflations.push(inflation.m);
			this._inflationsInfo.push({
				edge: edge,
				idx: i
			});
			edge.inflations.push(inflation);

			if (i < thickness.length - 1) {
				var joint = new XAC.Sphere(r, this._matInflation);
				joint.m.position.copy(ctr);
				edge.joints.push(joint);
				this._scene.add(joint.m);
			}

			this._scene.add(edge.inflations[i].m);
		} else {
			edge.inflations[i].update(ctr0, ctr, {
				r1: r,
				r2: r0
			});

			edge.inflations[i].m.material = this._matInflation;

			if (i < thickness.length - 1) {
				edge.joints[i].update(r, ctr); //.m.position.copy(ctr);
			}
		}

		ctr0 = ctr;
		r0 = r;
	}
}