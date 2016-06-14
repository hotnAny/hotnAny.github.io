/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	medial axis
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var CANON = CANON || {};

// check dependencies
if (scene == undefined || removeFromArray == undefined) {
	err('missing dependency!');
}

CANON.MedialAxis = function(scene) {
	this._scene = scene;

	this._nodesInfo = []; // spatial info of nodes, contains:
	this._nodes = []; // meshes of nodes
	this._edgesInfo = []; // spatial info of edges, contains: 
	this._edges = []; // meshes of edges

	// visual properties
	this._rnode = 5;
	this._matNode = XAC.MATERIALCONTRAST;
	this._matEdge = new THREE.MeshPhongMaterial({
		color: 0x888888,
		transparent: true,
		opacity: 0.75
	});
	this._matHighlight = XAC.MATERIALHIGHLIGHT;

	// built-in methods for manipulating axis
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
	document.addEventListener('keydown', this._keydown.bind(this), false);
};

CANON.MedialAxis.prototype = {
	constructor: CANON.MedialAxis,

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

//
//	for external use mostly - adding nodes by specifying its position
//
//	@param	pos - position of the new node
//	@param	toConect - whether to connect it to the previous node
//
CANON.MedialAxis.prototype.addNode = function(pos, toConnect) {
	// check if the node is already in
	var alreadyIn = this._findNode(pos, false) >= 0;

	if (!alreadyIn) {
		this._addNode(pos);
	}

	if (toConnect && this._nodes.length > 1) {
		var v1 = this._nodesInfo[this._nodes.length - 1];
		var v2 = this._nodesInfo[this._nodes.length - 2];

		this._edgeNodes(v1, v2);
	}
}

//
//	update a node's position based on external input
//
//	@param 	node - the node being interacted with
//	@param	pos - new position of this node
//
CANON.MedialAxis.prototype.updateNode = function(node, pos) {
	// update this node
	node.position.copy(pos);

	// update its edges and visuals
	for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
		var v1 = this._edgesInfo[i].v1.mesh;
		var v2 = this._edgesInfo[i].v2.mesh;
		if (v1 == node || v2 == node) {
			this._scene.remove(this._edges[i]);
			// this._edges[i] = new XAC.Line(v2.position, v1.position).m;
			this._edges[i] = new XAC.ThickLine(v2.position, v1.position, 1, this._matEdge).m;
			this._scene.add(this._edges[i]);
		}
	}
}

//
//	special method for working with a voxel grid: 
//		snap the voxels in the voxel grid to this medial axis
//
//	@param	vxg - an CANON.VoxelGrid object
//
CANON.MedialAxis.prototype.snapVoxelGrid = function(vxg) {
	var visualize = false;
	this._voxelGrid = vxg;

	for (var i = vxg.voxels.length - 1; i >= 0; i--) {
		this._snapVoxel(vxg.voxels[i], vxg.dim);
	}

	// aggregation
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		var radius = getMax(this._nodesInfo[h].radiusData);

		this._nodesInfo[h].radius = radius == undefined ? 0 : radius;

		if (visualize) {
			var ctr = this._nodesInfo[h].mesh.position;
			var r = this._nodesInfo[h].radius;
			if (r > 0) {
				addABall(ctr, 0x870527, r * vxg.dim());
			}
		}
	}

	for (var h = this._edgesInfo.length - 1; h >= 0; h--) {
		var p1 = this._edgesInfo[h].v1.mesh.position;
		var p2 = this._edgesInfo[h].v2.mesh.position;
		var thicknessData = this._edgesInfo[h].thicknessData;

		if (thicknessData == undefined || thicknessData.length <= 0) {
			continue;
		}

		this._edgesInfo[h].thickness = new Array(thicknessData.length);
		var thickness = this._edgesInfo[h].thickness;


		for (var i = thickness.length - 2; i >= 1; i--) {
			var t = getMax(thicknessData[i]);

			if (isNaN(t) || t <= 1) {
				t = 1;
			}

			thickness[i] = t;

			if (visualize) {
				var ctr = p1.clone().multiplyScalar(1 - i * 1.0 / thickness.length).add(
					p2.clone().multiplyScalar(i * 1.0 / thickness.length)
				);
				var r = thickness[i];
				addABall(ctr, 0x052787, r * vxg.dim());
			}
		}
	}

	// revoxelize based on this axis
	vxg.updateToMedialAxis(this);
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	
 *	event handlers
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

CANON.MedialAxis.prototype._mousedown = function(e) {
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
	var node = XAC.hitObject(e, this._nodes);
	if (this._nodeSelected != undefined) {
		if (e.shiftKey) {
			this._edgeNodes(node, this._nodeSelected);
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
	}

	if (this._nodeSelected != undefined) {
		if (e.ctrlKey) {
			// this.addNode(this._nodeSelected.position, true);
			this._nodeSelected = this._copyNode(this._nodeSelected);
		}
		this._maniplane = new XAC.Maniplane(this._nodeSelected.position, true);

		// what's actually done here is connecting node
		// TODO: fix the confusion
		this._findNode(this._nodeSelected.position, true);

		// do not interact with edge if already interacting with node
		return;
	}

	//
	// interacting with an edge
	//	
	var hitOnEdge = XAC.hit(e, this._edges);
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
			return;
		}
	}
}

CANON.MedialAxis.prototype._mousemove = function(e) {
	if (this._maniplane != undefined) {
		var pos = this._maniplane.update(e);
		this.updateNode(this._nodeSelected, pos);
	}
}

CANON.MedialAxis.prototype._mouseup = function(e) {
	if (this._maniplane != undefined) {
		this._maniplane.destruct();
		this._maniplane = undefined;
	}
}

CANON.MedialAxis.prototype._keydown = function(e) {
	switch (e.keyCode) {
		case 46: // DEL
			this._removeNode(this._nodeSelected);
			this._removeEdge(this._edgeSelected);
			break;
	}
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * 	
 *	internal helper routines
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

CANON.MedialAxis.prototype._addNode = function(pos) {
	var nodeNew = new XAC.Sphere(this._rnode, this._matNode, true).m;
	nodeNew.position.copy(pos);
	this._nodes.push(nodeNew);
	this._nodesInfo.push({
		mesh: nodeNew,
		edgesInfo: [],
		// pos: pos,
		radius: 0, // radius of its coverage on the object
		radiusData: [] // store the raw data
	});
	scene.add(nodeNew);

	return nodeNew;
}

CANON.MedialAxis.prototype._removeNode = function(node) {
	scene.remove(node);

	// find this node from all nodes
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (node == this._nodes[i]) {
			this._nodes.splice(i, 1);

			// deal with its edges
			var edgesInfo = this._nodesInfo[i].edgesInfo;
			for (var j = edgesInfo.length - 1; j >= 0; j--) {
				// locate each of its edge amongst all edges
				for (var k = this._edgesInfo.length - 1; k >= 0; k--) {
					if (this._edgesInfo[k] == edgesInfo[j]) {
						scene.remove(this._edges[k]);
						this._edges.splice(k, 1);

						// remove that edge from the other node's info
						var nodeOther = this._edgesInfo[k].v1 == this._nodesInfo[i] ? this._edgesInfo[k].v2 : this.edgesInfo[k].v1;
						removeFromArray(nodeOther.edgesInfo, edgesInfo[j]);

						this._edgesInfo.splice(k, 1);
					}
				}
			}
			this._nodesInfo.splice(i, 1);
		}
	}
}

//
//	find a node and maybe bring it to the top of the stack
//
CANON.MedialAxis.prototype._findNode = function(pos, bringToTop) {
	for (var i = this._nodesInfo.length - 1; i >= 0; i--) {
		// if so, push it to the top of the stack
		if (pos.distanceTo(this._nodesInfo[i].mesh.position) < this._rnode) {
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
CANON.MedialAxis.prototype._copyNode = function(node) {
	this._findNode(node.position, true);

	var nodeNew = this._addNode(node.position);
	log('node added at (' + node.position.x + ', ' + node.position.y + ', ' + node.position.z + ')');

	var v1 = this._nodesInfo[this._nodes.length - 1];
	var v2 = this._nodesInfo[this._nodes.length - 2];

	this._edgeNodes(v1, v2);

	return nodeNew;
}

//
//	remove an edge
//
CANON.MedialAxis.prototype._removeEdge = function(edge) {
	var v1, v2;
	scene.remove(edge);
	for (var i = this._edges.length - 1; i >= 0; i--) {
		if (this._edges[i] == edge) {
			this._edges.splice(i, 1);

			v1 = this._edgesInfo[i].v1;
			removeFromArray(v1.edgesInfo, this._edgesInfo[i]);
			v2 = this._edgesInfo[i].v2;
			removeFromArray(v2.edgesInfo, this._edgesInfo[i]);

			this._edgesInfo.splice(i, 1);
			break;
		}
	}

	return {
		v1: v1,
		v2: v2
	};
}

//
//	split an edge at pos
//
CANON.MedialAxis.prototype._splitEdge = function(edge, pos) {
	var nodes = this._removeEdge(edge);
	var v = this._addNode(pos);
	this._edgeNodes(v, nodes.v1);
	this._edgeNodes(v, nodes.v2);

	return v;
}

//
//	connect two nodes with an edge
//
CANON.MedialAxis.prototype._edgeNodes = function(v1, v2) {
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (this._nodes[i] == v1) {
			v1 = this._nodesInfo[i];
		}

		if (this._nodes[i] == v2) {
			v2 = this._nodesInfo[i];
		}
	}

	// check it already connected
	for (var i = v1.edgesInfo.length - 1; i >= 0; i--) {
		if (v1.edgesInfo[i].v1 == v2 || v1.edgesInfo[i].v2 == v2) {
			return;
		}
	}

	// connect nodes
	// var edge = new XAC.Line(v2.mesh.position, v1.mesh.position).m;
	var edge = new XAC.ThickLine(v2.mesh.position, v1.mesh.position, 1, this._matEdge).m;
	this._scene.add(edge);
	this._edges.push(edge);

	var edgeInfo = {
		v1: v1,
		v2: v2
	};
	this._edgesInfo.push(edgeInfo);

	// storing edge info in nodes
	v1.edgesInfo.push(edgeInfo);
	v2.edgesInfo.push(edgeInfo);
}

//
//	snap a voxel (of a dim dimension) to this medial axis
//
CANON.MedialAxis.prototype._snapVoxel = function(voxel, dim) {
	var visualize = false;
	var v = voxel.position;

	//
	// snap to edge
	//
	var idxEdgeMin = -1;
	var dist2EdgeMin = Number.MAX_VALUE;
	var projEdgeMin = new THREE.Vector3();
	for (var h = this._edgesInfo.length - 1; h >= 0; h--) {

		var v1 = this._edgesInfo[h].v1.mesh.position;
		var v2 = this._edgesInfo[h].v2.mesh.position;

		var p2lInfo = p2ls(v.x, v.y, v.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
		if (p2lInfo != undefined) {
			var dist = p2lInfo.distance;
			var proj = p2lInfo.projection;
			if (dist < dist2EdgeMin) {
				idxEdgeMin = h;
				dist2EdgeMin = dist;
				projEdgeMin.set(proj[0], proj[1], proj[2]);
			}
		}
	}

	//
	// snap to node
	//
	var idxNodeMin = -1;
	var dist2NodeMin = Number.MAX_VALUE;
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		var dist = v.distanceTo(this._nodes[h].position);
		if (dist < dist2NodeMin) {
			idxNodeMin = h;
			dist2NodeMin = dist;
		}
	}

	//
	// compare the two
	//
	if (dist2EdgeMin < dist2NodeMin) {
		if (visualize) {
			addALine(v, projEdgeMin);
		}

		// register the distance to edge
		var v1 = this._edgesInfo[idxEdgeMin].v1.mesh.position;
		var v2 = this._edgesInfo[idxEdgeMin].v2.mesh.position;
		var thicknessData = this._edgesInfo[idxEdgeMin].thicknessData;
		if (thicknessData == undefined) {
			this._edgesInfo[idxEdgeMin].thicknessData = new Array(float2int(v2.distanceTo(v1) / dim));
			thicknessData = this._edgesInfo[idxEdgeMin].thicknessData;
		}

		var idxPt = float2int(projEdgeMin.distanceTo(v1) / dim);
		if (thicknessData[idxPt] == undefined) {
			thicknessData[idxPt] = [];
		}
		thicknessData[idxPt].push(dist2EdgeMin);

	} else {
		if (visualize) {
			var v0 = this._nodesInfo[idxNodeMin].mesh.position;
			addALine(v, v0);
		}

		// register the distance to node
		this._nodesInfo[idxNodeMin].radiusData.push(Math.max(this._nodesInfo[idxNodeMin].radius, dist2NodeMin));
	}
}