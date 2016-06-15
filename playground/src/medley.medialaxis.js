/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	medial axis
 * 	
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var CANON = CANON || {};

// check dependencies
if (removeFromArray == undefined || float2int == undefined) {
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
	this._matInflation = new THREE.MeshLambertMaterial({
		color: 0xaaaaaa,
		transparent: true,
		wireframe: true,
		opacity: 0.25
	});

	this._inflations = [];

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

		this._addEdge(v1, v2);
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
			this._edges[i] = new XAC.ThickLine(v2.position, v1.position, 1, this._matEdge).m;
			this._scene.add(this._edges[i]);
		}
	}
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
	}

	if (this._nodeSelected != undefined) {
		if (e.ctrlKey) {
			// this.addNode(this._nodeSelected.position, true);
			this._nodeSelected = this._copyNode(this._nodeSelected);
		}
		this._maniplane = new XAC.Maniplane(this._nodeSelected.position, true);

		// find the node that's clicked
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
		this._inflate();
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

//
//	add a node at pos
//
CANON.MedialAxis.prototype._addNode = function(pos) {
	var nodeNew = new XAC.Sphere(this._rnode, this._matNode, true).m;
	nodeNew.position.copy(pos);
	this._nodes.push(nodeNew);
	this._nodesInfo.push({
		deleted: false,
		mesh: nodeNew, // mesh representation
		edgesInfo: [], // info of the edges connected to this node
		radius: undefined, // radius of this node
		radiusData: [] // store the raw data
	});
	this._scene.add(nodeNew);

	return this._nodesInfo[this._nodesInfo.length - 1];
}

//
//	remove a node
//
CANON.MedialAxis.prototype._removeNode = function(node) {
	this._scene.remove(node);

	// find this node from all nodes
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		if (node == this._nodes[i]) {

			// deal with its edges
			var edgesInfo = this._nodesInfo[i].edgesInfo;
			for (var j = edgesInfo.length - 1; j >= 0; j--) {
				// locate each of its edge amongst all edges
				for (var k = this._edgesInfo.length - 1; k >= 0; k--) {
					if (this._edgesInfo[k] == edgesInfo[j]) {
						this._scene.remove(this._edges[k]);
						this._edges.splice(k, 1);

						// remove that edge from the other node's info
						var nodeOther = this._edgesInfo[k].v1 == this._nodesInfo[i] ? this._edgesInfo[k].v2 : this.edgesInfo[k].v1;
						removeFromArray(nodeOther.edgesInfo, edgesInfo[j]);

						this._edgesInfo.splice(k, 1);
					}
				}
			}
			// this._nodesInfo.splice(i, 1);
			this._nodesInfo[i].deleted = true;
		}
	}
}

//
//	find a node and maybe bring it to the top of the stack
//
CANON.MedialAxis.prototype._findNode = function(pos, bringToTop) {
	for (var i = this._nodesInfo.length - 1; i >= 0; i--) {
		if (this._nodesInfo[i].deleted) continue;

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
CANON.MedialAxis.prototype._removeEdge = function(edge) {
	var v1, v2;
	this._scene.remove(edge);
	for (var i = this._edges.length - 1; i >= 0; i--) {
		if (this._edges[i] == edge) {
			this._edgesInfo[i].deleted = true;
			v1 = this._edgesInfo[i].v1;
			v2 = this._edgesInfo[i].v2;
			break;
		}
	}

	this._inflate();

	return {
		v1: v1,
		v2: v2
	};
}

//
//	split an edge at pos
//
CANON.MedialAxis.prototype._splitEdge = function(edge, pos) {
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
	split = float2int(thickness.length * split);
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
CANON.MedialAxis.prototype._addEdge = function(v1, v2) {
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
	// var edge = new XAC.Line(v2.mesh.position, v1.mesh.position).m;
	if (edgeInfo == undefined) {
		var edge = new XAC.ThickLine(v2.mesh.position, v1.mesh.position, 1, this._matEdge).m;
		this._scene.add(edge);
		this._edges.push(edge);

		var edgeInfo = {
			deleted: false,
			mesh: edge,
			v1: v1,
			v2: v2,
			thickness: [],
			thicknessData: []
		};
		this._edgesInfo.push(edgeInfo);

		// storing edge info in nodes
		v1.edgesInfo.push(edgeInfo);
		v2.edgesInfo.push(edgeInfo);
	} else {
		edgeInfo.deleted = false;
		this._scene.add(edgeInfo.mesh)
	}

	this._inflate();

	return edgeInfo;
}

//
//	inflate the medial axis with thicknesses
//
CANON.MedialAxis.prototype._inflate = function() {
	// clean up old inflations
	for (var i = this._inflations.length - 1; i >= 0; i--) {
		this._scene.remove(this._inflations[i]);
	}

	this._inflations.splice(0, this._inflations.length);

	// inflate the nodes
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		if (this._nodesInfo[h].deleted) {
			continue;
		}

		var ctr = this._nodesInfo[h].mesh.position;
		var r = this._nodesInfo[h].radius;

		if (r == undefined) {
			continue;
		}

		if (r > 0) {
			var sphere = new XAC.Sphere(r, this._matInflation, true).m;
			sphere.position.copy(ctr);
			this._inflations.push(sphere);
		}
	}

	// inflate the edges
	for (var h = this._edgesInfo.length - 1; h >= 0; h--) {
		if (this._edgesInfo[h].deleted) {
			continue;
		}

		var p1 = this._edgesInfo[h].v1.mesh.position;
		var p2 = this._edgesInfo[h].v2.mesh.position;

		if (this._edgesInfo[h].thickness == undefined) {
			continue;
		}

		var thickness = this._edgesInfo[h].thickness.concat([this._edgesInfo[h].v2.radius]);

		var ctr0 = p1;
		var r0 = this._edgesInfo[h].v1.radius;
		for (var i = 0; i < thickness.length; i++) {
			var ctr = p1.clone().multiplyScalar(1 - (i + 1) * 1.0 / thickness.length).add(
				p2.clone().multiplyScalar((i + 1) * 1.0 / thickness.length)
			);

			var r;
			if (i == 0 || i == thickness.length - 1) {
				r = thickness[i];
			} else {
				r = (thickness[i] + r0) / 2;
			}

			var cylinder = new XAC.ThickLine(ctr0, ctr, {
				r1: r,
				r2: r0
			}, this._matInflation).m;
			this._inflations.push(cylinder);

			ctr0 = ctr;
			r0 = r;
		}
	}

	// add new inflations
	for (var i = this._inflations.length - 1; i >= 0; i--) {
		this._scene.add(this._inflations[i]);
	}
}