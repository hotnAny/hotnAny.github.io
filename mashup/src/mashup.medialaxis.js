/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Medial Axis
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var MASHUP = MASHUP || {};

// check dependencies
if (XAC.Thing == undefined || XAC.Utilities == undefined || XAC.Const == undefined) {
	err('missing dependency!');
}

MASHUP.MedialAxis = function(scene, camera) {
	this._scene = scene;
	this._camera = camera;

	// this._nodes = []; // spatial info of nodes, contains:
	this._nodes = []; // meshes of nodes
	// this._edges = []; // spatial info of edges, contains: 
	this._edges = []; // meshes of edges
	this._inflationsNode = [];
	this._inflations = [];
	this._inflationsInfo = [];
	this._inflateRate = 7; // larger value smaller rate

	// visual properties
	this._opacityNormal = 0.75;
	this._opacitySelected = this._opacityNormal / 2;

	this._radiusNode = 5;
	this._radiusEdge = 5;
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

	// built-in methods for manipulating axis
	// document.addEventListener('mousedown', this._mousedown.bind(this), false);
	// document.addEventListener('mousemove', this._mousemove.bind(this), false);
	// document.addEventListener('mouseup', this._mouseup.bind(this), false);
	// document.addEventListener('keydown', this._keydown.bind(this), false);
};

MASHUP.MedialAxis.NODE = 0;
MASHUP.MedialAxis.EDGE = 1;

MASHUP.MedialAxis.prototype = {
	constructor: MASHUP.MedialAxis,

	get nodes() {
		return this._nodes;
	},

	// get nodesInfo() {
	// 	return this._nodes;
	// },

	get edges() {
		return this._edges;
	}

	// get edgesInfo() {
	// 	return this._edges;
	// }
};

// MASHUP.MedialAxis.prototype.enableEventListeners = function() {
// 	this._listening = true;
// }

// MASHUP.MedialAxis.prototype.disableEventListeners = function() {
// 	this._listening = false;
// }

//
//	for external use mostly - adding nodes by specifying its position
//
//	@param	pos - position of the new node
//	@param	toConect - whether to connect it to the previous node
//
MASHUP.MedialAxis.prototype.addNode = function(pos, toConnect) {
	// check if the node is already in
	var alreadyIn = this._findNode(pos, false) >= 0;

	if (!alreadyIn) {
		this._addNode(pos);
	}

	if (toConnect && this._nodes.length > 1) {
		var v1 = this._nodes[this._nodes.length - 1];
		var v2 = this._nodes[this._nodes.length - 2];

		this._addEdge(v1, v2);
	}
}

//
//	for external use mostly - adding edges by specifying a series of points
//
//	@param	points - input points corresponding to an edge
//	@param	meshes - optional, some meshes that represent the edge
//
MASHUP.MedialAxis.prototype.addEdge = function(points, autoSplit) {
	if (points == undefined || points.length < 2) {
		return;
	}

	var idx1 = this._findNode(points[0], false);
	var v1 = idx1 >= 0 ? this._nodes[idx1] : this._addNode(points[0].clone(), autoSplit);
	var idx2 = this._findNode(points[points.length - 1], false);
	var v2 = idx2 >= 0 ? this._nodes[idx2] : this._addNode(points[points.length - 1].clone(), autoSplit);

	var thickness = [];
	for (var i = points.length - 1; i >= 0; i--) {
		thickness.push(this._radiusEdge);
	}

	var edgeInfo = {
		type: MASHUP.MedialAxis.EDGE,
		deleted: false,
		mesh: null,
		v1: v1,
		v2: v2,
		points: points,
		thickness: thickness,
		inflations: []
	};
	this._edges.push(edgeInfo);

	// storing edge info in nodes
	v1.edgesInfo.push(edgeInfo);
	v2.edgesInfo.push(edgeInfo);

	this._inflate();

	return edgeInfo;
}

//
//	update a node's position and its connected edges based on external input
//
//	@param 	node - the node being interacted with
//	@param	pos - new position of this node
//
MASHUP.MedialAxis.prototype.updateNode = function(node, pos) {
	// update this node
	var posPrev = node.position.clone();
	node.position.copy(pos);

	// update its edges and visuals
	for (var i = this._edges.length - 1; i >= 0; i--) {
		if (this._edges[i].deleted) {
			continue;
		}

		var v1 = this._edges[i].v1;
		var v2 = this._edges[i].v2;
		if (v1 == node || v2 == node) {
			// for simple straight edge
			// if (this._edges[i].points == undefined) {
			// 	this._scene.remove(this._edges[i]);
			// 	this._edges[i] = new XAC.ThickLine(v2.position, v1.position, this._radiusEdge, this._matEdge).m;
			// 	this._edges[i].mesh = this._edges[i];
			// 	this._scene.add(this._edges[i]);
			// }
			// for edges with points (polygonal line)
			// else {
			var dv = node.position.clone().sub(posPrev);
			var len = v2.position.clone().sub(posPrev).length();
			for (var j = this._edges[i].points.length - 1; j >= 0; j--) {
				var pt = this._edges[i].points[j];
				var ratio = v1 == node ?
					1 - 1.0 * j / this._edges[i].points.length :
					1.0 * j / this._edges[i].points.length;
				var dvj = dv.clone().multiplyScalar(ratio);
				this._edges[i].points[j].add(dvj);
			}
			// }
		} // found edge connected to ndoe
	} // all edges
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	
 *	event handlers
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

MASHUP.MedialAxis.prototype._mousedown = function(e) {
	//
	//	interacting with a node
	//
	if (this._nodeSelected != undefined) {
		this._nodeSelected.inflation.m.material = this._matInflation;
		this._nodeSelected.inflation.m.material.needsUpdate = true;
	}

	var hitOnNode;
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		hitOnNode = XAC.hit(e, [this._nodes[i].inflation.m], this._camera);
		if (hitOnNode != undefined) {
			if (this.__nodeSelected != this._nodes[i]) {
				this._nodes[i].inflation.m.material = this._matHighlight;
				this._nodes[i].inflation.m.material.needsUpdate = true;
				this._nodeSelected = this._nodes[i];
			} else {
				this._nodeSelected = undefined;
			}
			break;
		}
	}

	if (hitOnNode != undefined) {
		if (e.ctrlKey) {
			this._nodeSelected = this._copyNode(this._nodeSelected);
		}
		// this._maniplane = new XAC.Maniplane(this._nodeSelected.position, this._scene, this._camera, true);
		this._maniplane = new XAC.Maniplane(new THREE.Vector3(), this._scene, this._camera, true);

		// find the node that's clicked
		this._findNode(this._nodeSelected.position, true);

		// stop propagation here
		return this._nodeSelected;
	}

	//
	// interacting with an edge
	//
	if (this._edgeSelected != undefined) {
		for (var j = this._edgeSelected.inflations.length - 1; j >= 0; j--) {
			this._edgeSelected.inflations[j].m.material = this._matInflation;
			this._edgeSelected.inflations[j].m.material.needsUpdate = true;
		}
	}

	var hitOnEdge;
	for (var i = this._edges.length - 1; i >= 0; i--) {
		var elmsInf = [];
		for (var j = this._edges[i].inflations.length - 1; j >= 0; j--) {
			elmsInf.push(this._edges[i].inflations[j].m);
		}
		hitOnEdge = XAC.hit(e, elmsInf, this._camera);
		if (hitOnEdge != undefined) {
			if (this._edgeSelected != this._edges[i]) {
				this._edgeSelected = this._edges[i];
			} else {
				this._edgeSelected = undefined;
			}
		}
		break;
	}

	if (hitOnEdge != undefined) {
		var point = hitOnEdge.point;
		if (e.ctrlKey) {
			this._nodeSelected = this._splitEdge(edge, point);
			this._nodeSelected.material = this._matHighlight;
			this._nodeSelected.material.needsUpdate = true;
		}

		// stop propagation here
		// return this._edgeSelected;
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

MASHUP.MedialAxis.prototype._mousemove = function(e) {
	// if (this._listening == false) return;

	if (this._maniplane != undefined) {
		// log(this._nodeSelected.inflation.m.position.toArray());
		var pos = this._maniplane.update(e);
		this.updateNode(this._nodeSelected, pos);
		// addABall(this._scene, this._nodeSelected.inflation.m.position, 0xff0000, 2.5, 1)
		this._inflateNode(this._nodeSelected);
		// log(this._nodeSelected.position.toArray());
		// log('---')
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
		} else if (this._infSelInfo.edgeInfo.thickness != undefined) {
			var wind = 3;
			for (var i = -wind; i <= wind; i++) {
				var idx = Math.max(0, this._infSelInfo.idx + i);
				idx = Math.min(this._infSelInfo.edgeInfo.thickness.length - 1, idx);
				this._infSelInfo.edgeInfo.thickness[idx] *= (1 + ratio * (1 - Math.abs(i) / wind));
			}

			this._inflateEdge(this._infSelInfo.edgeInfo);
			this._edgeSelected = undefined;
		}

		this._eDown = e;

		return this._infSelected;
	}
}

MASHUP.MedialAxis.prototype._mouseup = function(e) {
	// if (this._listening == false) return;

	if (this._maniplane != undefined) {
		this._maniplane.destruct();
		this._maniplane = undefined;
		this._inflate();
	}

	if (this._edgeSelected != null) {
		for (var j = this._edgeSelected.inflations.length - 1; j >= 0; j--) {
			this._edgeSelected.inflations[j].m.material = this._matHighlight;
			this._edgeSelected.inflations[j].m.material.needsUpdate = true;
		}
	}

	this._infSelected = undefined;
}

MASHUP.MedialAxis.prototype._keydown = function(e) {
	switch (e.keyCode) {
		case 46: // DEL
			if (this._nodeSelected != undefined) this._removeNode(this._nodeSelected);
			if (this._edgeSelected != undefined) this._removeEdge(this._edgeSelected);
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
MASHUP.MedialAxis.prototype._addNode = function(pos, autoSplit) {
	var edgeIntersected;

	if (autoSplit == true) {
		for (var i = this._edges.length - 1; i >= 0 && edgeIntersected == undefined; i--) {
			var points = this._edges[i].points;
			for (var j = points.length - 1; j >= 0; j--) {
				if (pos.distanceTo(points[j]) < this._radiusEdge * 2) {
					edgeIntersected = this._edges[i];
					break;
				}
			}
		}
	}

	if (edgeIntersected == undefined) {
		// var nodeNew = new XAC.Sphere(this._radiusNode, this._matNode, true).m;
		// nodeNew.position.copy(pos);
		// this._nodes.push(nodeNew);
		this._nodes.push({
			type: MASHUP.MedialAxis.NODE,
			deleted: false,
			position: pos,
			// mesh: nodeNew, // mesh representation
			edgesInfo: [], // info of the edges connected to this node
			radius: this._radiusNode * 1.1, // radius of this node
			radiusData: [], // store the raw data
			inflation: undefined
		});
		// this._scene.add(nodeNew);
		return this._nodes[this._nodes.length - 1];
	} else {
		return this._splitEdge(edgeIntersected, pos);
	}

}

//
//	remove a node
//
MASHUP.MedialAxis.prototype._removeNode = function(node) {
	this._scene.remove(node);

	// find this node from all nodes
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (node == this._nodes[i]) {

			// deal with its edges
			var edgesInfo = this._nodes[i].edgesInfo;
			for (var j = edgesInfo.length - 1; j >= 0; j--) {
				this._removeEdge(edgesInfo[j]);
			}
			// this._nodes.splice(i, 1);
			this._nodes[i].deleted = true;

			this._scene.remove(this._nodes[i].inflation.m);
		}
	}
}

//
//	find a node and maybe bring it to the top of the stack
//	return the index of the node stored
//
MASHUP.MedialAxis.prototype._findNode = function(pos, bringToTop) {
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
MASHUP.MedialAxis.prototype._copyNode = function(node) {
	this._findNode(node.position, true);

	this._addNode(node.position);
	// log('node added at (' + node.position.x + ', ' + node.position.y + ', ' + node.position.z + ')');

	var v1 = this._nodes[this._nodes.length - 1];
	var v2 = this._nodes[this._nodes.length - 2];

	this._addEdge(v1, v2);

	return v1;
}

//
//	remove an edge
//
MASHUP.MedialAxis.prototype._removeEdge = function(edgeInfo) {
	this._scene.remove(edgeInfo.mesh);
	edgeInfo.deleted = true;
	var v1 = edgeInfo.v1;
	var v2 = edgeInfo.v2;
	for (var j = edgeInfo.inflations.length - 1; j >= 0; j--) {
		this._scene.remove(edgeInfo.inflations[j].m);
	}

	return {
		v1: v1,
		v2: v2
	};
}

//
//	split an edge at pos
//	@param	edge - can be a mesh representing an edge, or its info
//
MASHUP.MedialAxis.prototype._splitEdge = function(edgeInfo, pos) {
	// remove the edge, add a node in between and reconnect it with new edges
	var nodes = this._removeEdge(edgeInfo);
	var v = this._addNode(pos);

	var dmin = Number.MAX_VALUE;
	var idxSplit = -1;
	for (var i = edgeInfo.points.length - 1; i >= 0; i--) {
		var d = pos.distanceTo(edgeInfo.points[i]);
		if (d < dmin) {
			dmin = d;
			idxSplit = i;
		}
	}
	var edgeInfo1 = this._addEdge(nodes.v1, v, edgeInfo.points.slice(0, idxSplit));
	var edgeInfo2 = this._addEdge(v, nodes.v2, edgeInfo.points.slice(idxSplit + 1));

	// redistribute the thickness along the original edge
	var thickness = edgeInfo.thickness;
	var splitRatio = v.position.distanceTo(nodes.v1.position) /
		nodes.v2.position.distanceTo(nodes.v1.position);
	idxSplit = idxSplit < 0 ? XAC.float2int(thickness.length * splitRatio) : idxSplit;
	if (thickness != undefined) {
		for (var i = 0; i < thickness.length; i++) {
			if (i < idxSplit) {
				edgeInfo1.thickness.push(thickness[i]);
			}

			if (i == idxSplit) {
				v.radius = thickness[i]
			}

			if (i > idxSplit) {
				edgeInfo2.thickness.push(thickness[i])
			}
		}
	}

	this._inflate();

	return v;
}

//
//	connect two nodes with an edge
//
MASHUP.MedialAxis.prototype._addEdge = function(v1, v2, points) {
	// // if input is mesh of nodes, retrieve the corresponding node info
	// for (var i = this._nodes.length - 1; i >= 0; i--) {
	// 	if (this._nodes[i] == v1) {
	// 		v1 = this._nodes[i];
	// 	}

	// 	if (this._nodes[i] == v2) {
	// 		v2 = this._nodes[i];
	// 	}
	// }

	// check it's already connected, or used to be connected
	var edgeInfo;
	for (var i = v1.edgesInfo.length - 1; i >= 0; i--) {
		if (v1.edgesInfo[i].v1 == v2 || v1.edgesInfo[i].v2 == v2) {
			if (v1.edgesInfo[i].deleted) {
				edgeInfo = v1.edgesInfo[i];
				break;
			} else {
				return;
			}
		}
	}

	// connect nodes (that have never been connected)
	if (edgeInfo == undefined) {
		var edgeInfo = {
			type: MASHUP.MedialAxis.EDGE,
			deleted: false,
			v1: v1,
			v2: v2,
			points: points,
			thickness: [],
			thicknessData: [],
			inflations: []
		};
		this._edges.push(edgeInfo);

		// storing edge info in nodes
		v1.edgesInfo.push(edgeInfo);
		v2.edgesInfo.push(edgeInfo);
	}
	// connect nodes (that were connected but deleted)
	else {
		edgeInfo.deleted = false;

		for (var i = edgeInfo.inflations.length - 1; i >= 0; i--) {
			this._scene.add(edgeInfo.inflations[i].m)
		}
	}

	this._inflate();

	return edgeInfo;
}

//
//	inflate the medial axis with thicknesses
//
MASHUP.MedialAxis.prototype._inflate = function() {
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
MASHUP.MedialAxis.prototype._inflateNode = function(nodeInfo, nodeOnly) {
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
		for (var i = nodeInfo.edgesInfo.length - 1; i >= 0; i--) {
			this._inflateEdge(nodeInfo.edgesInfo[i]);
		}
	}
}

//
//	inflate an edge
//
MASHUP.MedialAxis.prototype._inflateEdge = function(edgeInfo) {
	var p1 = edgeInfo.v1.position;
	var p2 = edgeInfo.v2.position;
	var thickness = edgeInfo.thickness.concat([edgeInfo.v2.radius]);
	var points = edgeInfo.points.concat([p2]);

	var ctr0 = p1;
	var r0 = edgeInfo.v1.radius;
	for (var i = 0; i < thickness.length; i++) {

		var ctr;

		if (points == undefined) {
			ctr = p1.clone().multiplyScalar(1 - (i + 1) * 1.0 / thickness.length).add(
				p2.clone().multiplyScalar((i + 1) * 1.0 / thickness.length)
			);
		} else {
			ctr = points[i];
		}

		var r;
		if (i == 0 || i == thickness.length - 1) {
			r = thickness[i];
		} else {
			r = (thickness[i - 1] + thickness[i] + thickness[i + 1]) / 3;
		}

		if (edgeInfo.inflations[i] == undefined) {
			var inflation = new XAC.ThickLine(ctr0, ctr, {
				r1: r,
				r2: r0
			}, this._matInflation);

			this._inflations.push(inflation.m);
			this._inflationsInfo.push({
				edgeInfo: edgeInfo,
				idx: i
			});

			edgeInfo.inflations.push(inflation);
			this._scene.add(edgeInfo.inflations[i].m);
		} else {
			edgeInfo.inflations[i].update(ctr0, ctr, {
				r1: r,
				r2: r0
			});
		}

		ctr0 = ctr;
		r0 = r;
	}
}