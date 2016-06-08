var MEDLEY = MEDLEY || {};

MEDLEY.MedialAxis = function(scene) {
	this._scene = scene;

	this._nodesInfo = []; // spatial info of nodes, contains:
	this._nodes = []; // meshes of nodes
	this._edgesInfo = []; // spatial info of edges, contains: 
	this._edges = []; // meshes of edges

	// visual properties
	this._rnode = 5;
	this._matNode = XAC.MATERIALHIGHLIGHT;
	this._matEdge = XAC.MATERIALCONTRAST;

	// built-in methods for manipulating axis
	document.addEventListener('mousedown', this._mousedown.bind(this), false);
	document.addEventListener('mousemove', this._mousemove.bind(this), false);
	document.addEventListener('mouseup', this._mouseup.bind(this), false);
};

MEDLEY.MedialAxis.prototype = {
	constructor: MEDLEY.MedialAxis
};

//
//
//	@param	v - position of the new node
//
MEDLEY.MedialAxis.prototype.addNode = function(pos, toConnect) {
	// check if the node is already in
	var alreadyIn = false;
	for (var i = this._nodesInfo.length - 1; i >= 0; i--) {
		// if so, push it to the top of the stack
		if (pos.distanceTo(this._nodesInfo[i].mesh.position) < this._rnode) {
			alreadyIn = true;
			this._nodes.push(this._nodes.splice(i, 1)[0]);
			this._nodesInfo.push(this._nodesInfo.splice(i, 1)[0]);
			break;
		}
	}

	if (!alreadyIn) {
		var node = new XAC.Sphere(this._rnode, this._matNode, true).m;
		node.position.copy(pos);
		this._nodes.push(node);
		this._nodesInfo.push({
			mesh: node,
			// pos: pos,
			radius: 0, // radius of its coverage on the object
			radiusData: [] // store the raw data
		});

		this._scene.add(node);
		log('node added at (' + pos.x + ', ' + pos.y + ', ' + pos.z + ')');
	}

	if (toConnect && this._nodes.length > 1) {
		var v1 = this._nodesInfo[this._nodes.length - 1];
		var v2 = this._nodesInfo[this._nodes.length - 2];

		var edge = new XAC.Line(v2.mesh.position, v1.mesh.position).m;
		this._scene.add(edge);
		this._edges.push(edge);

		this._edgesInfo.push({
			v1: v1,
			v2: v2
		});
	}
}

MEDLEY.MedialAxis.prototype.updateNode = function(node, pos) {
	//
	// update this node
	//
	node.position.copy(pos);

	//
	// update its edges and visuals
	//
	for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
		var v1 = this._edgesInfo[i].v1.mesh;
		var v2 = this._edgesInfo[i].v2.mesh;
		if (v1 == node || v2 == node) {
			this._scene.remove(this._edges[i]);
			this._edges[i] = new XAC.Line(v2.position, v1.position).m;
			this._scene.add(this._edges[i]);
		}
	}

}

MEDLEY.MedialAxis.prototype.render = function() {
	for (var i = this._nodes.length - 1; i >= 0; i--) {
		this._nodes[i].material = this._matNode;
		this._nodes[i].material.needsUpdate = true;
	}

	for (var i = this._edges.length - 1; i >= 0; i--) {
		this._edges[i].material = this._matEdge;
		this._edges[i].material.needsUpdate = true;
	}
}

MEDLEY.MedialAxis.prototype.snapVoxelGrid = function(vxg) {
	var visualize = false;

	// TODO: initialize the medial this._, in case it has been snapped with voxels before

	if (!this._isVoxelized) {
		//
		// for each voxel, find the anchoring edge
		//
		var nz = vxg.grid().length;
		var ny = vxg.grid()[0].length;
		var nx = vxg.grid()[0][0].length;

		var nearestMedialAxis = [];

		for (var i = 0; i < nz; i++) {
			var slice = [];
			for (var j = 0; j < 1; j++) {
				var row = [];
				for (var k = 0; k < nx; k++) {
					if (vxg.grid()[i][j][k] == 1) {
						this._snapVoxelToMediaAxis(k, j, i, vxg.dim());
					} // voxel
				} // x
			} // y
		} // z
	}

	//
	// aggregation
	//
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		this._nodesInfo[h].radius = getMax(this._nodesInfo[h].radiusData);

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
		var thickness = this._edgesInfo[h].thickness;
		var thicknessData = this._edgesInfo[h].thicknessData;

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

	//
	// revoxelize based on media this._
	//
	vxg.updateToMedialAxis(this);
}

MEDLEY.MedialAxis.prototype._mousedown = function(e) {
	if (this._nodes == undefined) {
		return;
	}

	this._nodeSelected = XAC.hitObject(e, this._nodes);
	if (this._nodeSelected != undefined) {
		this._maniplane = new XAC.Maniplane(this._nodeSelected);
	}
}

MEDLEY.MedialAxis.prototype._mousemove = function(e) {
	if (this._maniplane != undefined) {
		var pos = this._maniplane.update(e);
		this.updateNode(this._nodeSelected, pos);
	}
}

MEDLEY.MedialAxis.prototype._mouseup = function(e) {
	this._nodeSelected = undefined;

	if (this._maniplane != undefined) {
		this._maniplane.destruct();
		this._maniplane = undefined;
	}
}

MEDLEY.MedialAxis.prototype._snapVoxel = function(kx, jy, iz, dim) {
	var k = kx,
		j = jy,
		i = iz;
	var visualize = false;
	//
	// snap to edge
	//
	var idxEdgeMin = -1;
	var dist2EdgeMin = Number.MAX_VALUE;
	var projEdgeMin;
	for (var h = this._edgesInfo.length - 1; h >= 0; h--) {
		var v1 = this._edgesInfo[h].v1.index;
		var v2 = this._edgesInfo[h].v2.index;

		var p2lInfo = p2ls(k, j, i, v1[0], v1[1], v1[2], v2[0], v2[1], v2[2]);
		if (p2lInfo != undefined) {
			var dist = p2lInfo.dist;
			var proj = p2lInfo.proj;
			if (dist < dist2EdgeMin) {
				idxEdgeMin = h;
				dist2EdgeMin = dist;
				projEdgeMin = proj;
			}
		}
	}

	//
	// snap to node
	//
	var idxNodeMin = -1;
	var dist2NodeMin = Number.MAX_VALUE;
	for (var h = this._nodesInfo.length - 1; h >= 0; h--) {
		var dist = getDist([k, j, i], this._nodesInfo[h].index);
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
			addALine(new THREE.Vector3(k, j, i).multiplyScalar(dim),
				new THREE.Vector3(projEdgeMin[0], projEdgeMin[1], projEdgeMin[2]).multiplyScalar(dim));
		}

		// register the distance to edge
		var v1 = this._edgesInfo[idxEdgeMin].v1.index;
		var v2 = this._edgesInfo[idxEdgeMin].v2.index;
		var thicknessData = this._edgesInfo[idxEdgeMin].thicknessData;
		// var len = this._edgesInfo[idxEdgeMin].len;
		var idxPt = float2int(getDist(projEdgeMin, v1));
		if (thicknessData[idxPt] == undefined) {
			thicknessData[idxPt] = [];
		}
		thicknessData[idxPt].push(dist2EdgeMin);

	} else {
		if (visualize) {
			var v = this._nodesInfo[idxNodeMin].index;
			addALine(new THREE.Vector3(k, j, i).multiplyScalar(dim), new THREE.Vector3(v[0], v[1], v[2]).multiplyScalar(dim));
		}


		// register the distance to node
		this._nodesInfo[idxNodeMin].radiusData.push(Math.max(this._nodesInfo[idxNodeMin].radius, dist2NodeMin));
	}
}

MEDLEY.MedialAxis.prototype._interpolate = function(p1, p2, vxg) {
	var pts = [];
	var idx1 = p1.index;
	var idx2 = p2.index;

	var ds = [];
	var offsets = [];
	for (var i = 0; i < idx1.length; i++) {
		ds[i] = Math.sign(idx2[i] - idx1[i]);
		ds[i] = ds[i] == 0 ? 1 : ds[i];
		offsets[i] = idx2[i] * 1.0 - idx1[i];
	}

	var v21 = new THREE.Vector3(offsets[0], offsets[1], offsets[2]);

	for (var i = idx1[0]; i != idx2[0] + ds[0]; i += ds[0]) {
		for (var j = idx1[1]; j != idx2[1] + ds[1]; j += ds[1]) {
			for (var k = idx1[2]; k != idx2[2] + ds[2]; k += ds[2]) {
				if (vxg.grid()[k][j][i] == 1) {
					var dist = p2l(i, j, k, idx1[0], idx1[1], idx1[2], idx2[0], idx2[1], idx2[2]).dist;
					if (dist < 0.5) {
						pts.push(vxg.table()[k][j][i]);
						// vxg[k][j][i] = this.EDGE
					}
				}
			} // z
		} // y
	} // x

	return pts;
}