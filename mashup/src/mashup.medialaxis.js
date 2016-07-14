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

	this._nodesInfo = []; // spatial info of nodes, contains:
	this._nodes = []; // meshes of nodes
	this._edgesInfo = []; // spatial info of edges, contains: 
	this._edges = []; // meshes of edges
	this._inflationsNode = [];
	this._inflations = [];
	this._inflationsInfo = [];
	this._inflateRate = 7; // larger value smaller rate

	// visual properties
	this._radiusEdge = 1.75;
	this._radiusNode = 5;
	this._radiusEdge = 5;
	this._matNode = XAC.MATERIALCONTRAST;
	this._matEdge = new THREE.MeshPhongMaterial({
		color: 0x888888,
		transparent: true,
		opacity: 0.75
	});
	this._matHighlight = XAC.MATERIALHIGHLIGHT;
	this._matInflation = new THREE.MeshLambertMaterial({
		color: 0xaaaaaa,
		transparent: true,
		wireframe: true,
		opacity: 0.25
	});

	// built-in methods for manipulating axis
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
	document.addEventListener('keydown', this._keydown.bind(this), false);
};

MASHUP.MedialAxis.prototype = {
	constructor: MASHUP.MedialAxis,

	get nodes() {
		return this._nodes;
	},

	get nodesInfo() {
		return this._nodesInfo;
	},

	get edges() {
		return this._edges;
	},

	get edgesInfo() {
		return this._edgesInfo;
	}
};

MASHUP.MedialAxis.prototype.enableEventListeners = function() {
	this._listening = true;
}

MASHUP.MedialAxis.prototype.disableEventListeners = function() {
	this._listening = false;
}

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
		var v1 = this._nodesInfo[this._nodes.length - 1];
		var v2 = this._nodesInfo[this._nodes.length - 2];

		this._addEdge(v1, v2);
	}
}

//
//	for external use mostly - adding edges by specifying a series of points
//
//	@param	points - input points corresponding to an edge
//	@param	meshes - optional, some meshes that represent the edge
//
MASHUP.MedialAxis.prototype.addEdge = function(points, meshes) {
	if (points == undefined || points.length < 2) {
		return;
	}

	var edge = new THREE.Object3D();
	if (meshes != undefined) {
		for (var i = meshes.length - 1; i >= 0; i--) {
			edge.add(meshes[i])
		}
	} else {
		// TODO:
	}

	var idx1 = this._findNode(points[0], false);
	var v1 = idx1 >= 0 ? this._nodesInfo[idx1] : this._addNode(points[0]);
	v1.radius = v1.radius == undefined ? this._radiusNode : v1.radius;
	var idx2 = this._findNode(points[points.length - 1], false);
	var v2 = idx2 >= 0 ? this._nodesInfo[idx2] : this._addNode(points[points.length - 1]);
	v2.radius = v2.radius == undefined ? this._radiusNode : v2.radius;

	var thickness = [];
	for (var i = points.length - 1; i >= 0; i--) {
		thickness.push(this._radiusEdge);
	}

	this._scene.add(edge);
	this._edges.push(edge);

	var edgeInfo = {
		deleted: false,
		mesh: edge,
		v1: v1,
		v2: v2,
		points: points,
		thickness: thickness,
		inflations: []
	};
	this._edgesInfo.push(edgeInfo);

	// storing edge info in nodes
	v1.edgesInfo.push(edgeInfo);
	v2.edgesInfo.push(edgeInfo);


	this._inflate();

	return edgeInfo;
}

//
//	update a node's position based on external input
//
//	@param 	node - the node being interacted with
//	@param	pos - new position of this node
//
MASHUP.MedialAxis.prototype.updateNode = function(node, pos) {
	// update this node
	var posPrev = node.position.clone();
	node.position.copy(pos);

	// update its edges and visuals
	for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
		if (this._edgesInfo[i].deleted) {
			continue;
		}

		var v1 = this._edgesInfo[i].v1.mesh;
		var v2 = this._edgesInfo[i].v2.mesh;
		if (v1 == node || v2 == node) {
			// for simple straight edge
			if (this._edgesInfo[i].points == undefined) {
				this._scene.remove(this._edges[i]);
				this._edges[i] = new XAC.ThickLine(v2.position, v1.position, this._radiusEdge, this._matEdge).m;
				this._edgesInfo[i].mesh = this._edges[i];
				this._scene.add(this._edges[i]);
			}
			// for edges with points (polygonal line)
			else {
				var dv = node.position.clone().sub(posPrev);
				var len = v2.position.clone().sub(posPrev).length();
				for (var j = this._edgesInfo[i].points.length - 1; j >= 0; j--) {
					var pt = this._edgesInfo[i].points[j];
					var ratio = v1 == node ?
						1 - 1.0 * j / this._edgesInfo[i].points.length :
						1.0 * j / this._edgesInfo[i].points.length;
					var dvj = dv.clone().multiplyScalar(ratio);
					this._edgesInfo[i].points[j].add(dvj);
				}
			}
		}
	}
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	
 *	event handlers
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

MASHUP.MedialAxis.prototype._mousedown = function(e) {
	if (this._listening == false) return;

	if (this._nodes == undefined) {
		return;
	}

	//	clean selected edges
	for (var i = this._edges.length - 1; i >= 0; i--) {
		this._edges[i].material = this._matEdge;
		this._edges[i].material.needsUpdate = true;
	}

	//
	//	interacting with nodes
	//
	var node = XAC.hitObject(e, this._nodes, this._camera);
	if (this._nodeSelected != undefined) {
		if (e.shiftKey) {
			this._addEdge(node, this._nodeSelected);
		} else {
			for (var i = this._nodes.length - 1; i >= 0; i--) {
				this._nodes[i].material = this._matNode;
				this._nodes[i].material.needsUpdate = true;
			}
		}
	}
	this._nodeSelected = node;
	if (this._nodeSelected != undefined) {
		this._nodeSelected.material = this._matHighlight;
		this._nodeSelected.material.needsUpdate = true;
		for (var i = this._nodes.length - 1; i >= 0; i--) {
			if (this._nodes[i] == this._nodeSelected) {
				this._nodeInfoSel = this._nodesInfo[i];
			}
		}
	}

	if (this._nodeSelected != undefined) {
		if (e.ctrlKey) {
			this._nodeSelected = this._copyNode(this._nodeSelected);
		}
		this._maniplane = new XAC.Maniplane(this._nodeSelected.position, this._scene, this._camera, true);

		// find the node that's clicked
		this._findNode(this._nodeSelected.position, true);

		// stop propagation here
		return;
	}

	//
	// interacting with an edge
	//	
	var hitOnEdge = XAC.hit(e, this._edges, this._camera);
	var edge = hitOnEdge != undefined ? hitOnEdge.object : undefined;

	this._edgeSelected = edge;
	if (this._edgeSelected != undefined) {
		this._edgeSelected.material = this._matHighlight;
		this._edgeSelected.material.needsUpdate = true;
	}

	if (hitOnEdge != undefined) {
		var point = hitOnEdge.point;
		if (e.ctrlKey) {
			this._nodeSelected = this._splitEdge(edge, point);
			this._nodeSelected.material = this._matHighlight;
			this._nodeSelected.material.needsUpdate = true;
		}

		// stop propagation here
		return;
	}

	//
	//	interacting with inflation
	//
	this._infSelected = XAC.hitObject(e, this._inflationsNode, this._camera); // nodes have higher priority to be interacted with
	if (this._infSelected == undefined) {
		this._infSelected = XAC.hitObject(e, this._inflations, this._camera);
	}

	for (var i = this._inflations.length - 1; i >= 0; i--) {
		if (this._inflations[i] == this._infSelected) {
			this._infSelInfo = this._inflationsInfo[i];
			break;
		}
	}
	this._eDown = e;
}

MASHUP.MedialAxis.prototype._mousemove = function(e) {
	if (this._listening == false) return;

	if (this._maniplane != undefined) {
		var pos = this._maniplane.update(e);
		this.updateNode(this._nodeSelected, pos);
		this._inflateNode(this._nodeInfoSel);
	}

	if (this._infSelected != undefined) {
		var yOffset = e.clientY - this._eDown.clientY;
		var ratio = -yOffset / Math.pow(2, this._inflateRate);

		// this._scene.remove(this._infSelected);
		if (this._infSelInfo.nodeInfo != undefined) {
			this._infSelInfo.nodeInfo.radius *= (1 + ratio);
			this._inflateNode(this._infSelInfo.nodeInfo);
		} else if (this._infSelInfo.edgeInfo.thickness != undefined) {
			// WIP: try to experiment with a more natural way of manipulating thickness
			// var v1 = this._infSelInfo.edgeInfo.v1.mesh.position.clone().unproject(camera);
			// var v2 = this._infSelInfo.edgeInfo.v2.mesh.position.clone().unproject(camera);
			// var d = p2ls(e.clientX, e.clientY, 0, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
			// log([e.clientX, e.clientY, 0, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z])

			var wind = 3;
			for (var i = -wind; i <= wind; i++) {
				var idx = Math.max(0, this._infSelInfo.idx + i);
				idx = Math.min(this._infSelInfo.edgeInfo.thickness.length - 1, idx);
				this._infSelInfo.edgeInfo.thickness[idx] *= (1 + ratio * (1 - Math.abs(i) / wind));
			}

			this._inflateEdge(this._infSelInfo.edgeInfo);
		}

		this._eDown = e;
	}
}

MASHUP.MedialAxis.prototype._mouseup = function(e) {
	if (this._listening == false) return;

	if (this._maniplane != undefined) {
		this._maniplane.destruct();
		this._maniplane = undefined;
		this._inflate();
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
MASHUP.MedialAxis.prototype._addNode = function(pos) {
	var nodeNew = new XAC.Sphere(this._radiusNode, this._matNode, true).m;
	nodeNew.position.copy(pos);
	this._nodes.push(nodeNew);
	this._nodesInfo.push({
		deleted: false,
		mesh: nodeNew, // mesh representation
		edgesInfo: [], // info of the edges connected to this node
		radius: undefined, // radius of this node
		radiusData: [], // store the raw data
		inflation: undefined
	});
	this._scene.add(nodeNew);

	return this._nodesInfo[this._nodesInfo.length - 1];
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
			var edgesInfo = this._nodesInfo[i].edgesInfo;
			for (var j = edgesInfo.length - 1; j >= 0; j--) {
				this._removeEdge(edgesInfo[j]);
			}
			// this._nodesInfo.splice(i, 1);
			this._nodesInfo[i].deleted = true;

			this._scene.remove(this._nodesInfo[i].inflation.m);
		}
	}
}

//
//	find a node and maybe bring it to the top of the stack
//	return the index of the node stored
//
MASHUP.MedialAxis.prototype._findNode = function(pos, bringToTop) {
	for (var i = this._nodesInfo.length - 1; i >= 0; i--) {
		if (this._nodesInfo[i].deleted) continue;

		if (pos.distanceTo(this._nodesInfo[i].mesh.position) < this._nodesInfo[i].radius) {
			if (bringToTop) {
				this._nodes.push(this._nodes.splice(i, 1)[0]);
				this._nodesInfo.push(this._nodesInfo.splice(i, 1)[0]);
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
	log('node added at (' + node.position.x + ', ' + node.position.y + ', ' + node.position.z + ')');

	var v1 = this._nodesInfo[this._nodes.length - 1];
	var v2 = this._nodesInfo[this._nodes.length - 2];

	this._addEdge(v1, v2);

	return v1;
}

//
//	remove an edge
//
MASHUP.MedialAxis.prototype._removeEdge = function(edgeOrInfo) {
	var v1, v2;
	var edgeInfo = edgeOrInfo.mesh == undefined ? undefined : edgeOrInfo;

	if (edgeInfo == undefined) {
		for (var i = this._edges.length - 1; i >= 0; i--) {
			if (this._edges[i] == edgeOrInfo) {
				edgeInfo = this._edgesInfo[i];
				break;
			}
		}
	}

	this._scene.remove(edgeInfo.mesh);
	edgeInfo.deleted = true;
	v1 = edgeInfo.v1;
	v2 = edgeInfo.v2;
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
//
MASHUP.MedialAxis.prototype._splitEdge = function(edge, pos) {
	// retrieve the edge info
	var edgeInfo;
	for (var i = this._edges.length - 1; i >= 0; i--) {
		if (edge == this._edges[i]) {
			edgeInfo = this._edgesInfo[i];
			break;
		}
	}

	// remove the edge, add a node in between and reconnect it with new edges
	var nodes = this._removeEdge(edge);
	var v = this._addNode(pos);
	var edgeInfo1 = this._addEdge(nodes.v1, v);
	var edgeInfo2 = this._addEdge(v, nodes.v2);

	// redistribute the thickness along the original edge
	var thickness = edgeInfo.thickness;
	var split = v.mesh.position.distanceTo(nodes.v1.mesh.position) /
		nodes.v2.mesh.position.distanceTo(nodes.v1.mesh.position);
	split = XAC.float2int(thickness.length * split);
	if (thickness != undefined) {
		for (var i = 0; i < thickness.length; i++) {
			if (i <= split) {
				edgeInfo1.thickness.push(thickness[i]);
			}

			if (i == split) {
				v.radius = thickness[i]
			}

			if (i >= split) {
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
MASHUP.MedialAxis.prototype._addEdge = function(v1, v2) {
	// if input is mesh of nodes, retrieve the corresponding node info
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (this._nodes[i] == v1) {
			v1 = this._nodesInfo[i];
		}

		if (this._nodes[i] == v2) {
			v2 = this._nodesInfo[i];
		}
	}

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

	// connect nodes
	var edge = new XAC.ThickLine(v2.mesh.position, v1.mesh.position, this._radiusEdge, this._matEdge).m;
	this._scene.add(edge);
	if (edgeInfo == undefined) {
		this._edges.push(edge);

		var edgeInfo = {
			deleted: false,
			mesh: edge,
			v1: v1,
			v2: v2,
			thickness: [],
			thicknessData: [],
			inflations: []
		};
		this._edgesInfo.push(edgeInfo);

		// storing edge info in nodes
		v1.edgesInfo.push(edgeInfo);
		v2.edgesInfo.push(edgeInfo);
	} else {
		edgeInfo.deleted = false;
		edgeInfo.mesh = edge;
		for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
			if (this._edgesInfo[i] == edgeInfo) {
				this._edges[i] = edge;
			}
		}

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
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		if (this._nodesInfo[h].deleted) continue;
		this._inflateNode(this._nodesInfo[h], true);
	}

	// inflate the edges
	for (var h = this._edgesInfo.length - 1; h >= 0; h--) {
		if (this._edgesInfo[h].deleted) continue;
		this._inflateEdge(this._edgesInfo[h]);
	}
}

//
//	inflate a node
//
MASHUP.MedialAxis.prototype._inflateNode = function(nodeInfo, nodeOnly) {
	var ctr = nodeInfo.mesh.position;
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
	var p1 = edgeInfo.v1.mesh.position;
	var p2 = edgeInfo.v2.mesh.position;
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