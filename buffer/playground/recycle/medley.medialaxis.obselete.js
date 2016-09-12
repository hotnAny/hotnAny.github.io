"use strict";

//
// voxel grid based medial axis
//
class MedialAxis {
	constructor(voxels, voxelGrid, voxelTable, voxelDim) {
		this._voxels = voxels;
		this._voxelGrid = voxelGrid;
		this._voxelTable = voxelTable;
		this._voxelDim = voxelDim;

		this._nodesInfo = []; // spatial info of nodes, contains:
		//						- index
		//						- radius (when voxelizing, a sphere is used around this node)
		this._nodes = []; // meshes of nodes
		this._edgesInfo = []; // spatial info of edges, contains: 
		// 						- v1, v2 (two extreme vertices), 
		// 						- thickness (how thick it is along this edge)
		// 						- snappedVoxels (which voxels are snapped along this edge)
		this._edges = []; // meshes of edges

		this._isVoxelized = false;

		this._matNode = MATERIALHIGHLIGHT;
		this._matEdge = MATERIALCONTRAST;

		this.NONE = 0;
		this.NODE = 1;
		this.EDGE = 2;

		this._interpolate = function(p1, p2, vxg, voxels) {
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
						if (vxg[k][j][i] == 1) {
							var dist = p2l(i, j, k, idx1[0], idx1[1], idx1[2], idx2[0], idx2[1], idx2[2]).dist;
							if (dist < 0.5) {
								pts.push(this._voxelTable[k][j][i]);
								// vxg[k][j][i] = this.EDGE
							}
						}
					} // z
				} // y
			} // x

			return pts;
		}
	}

	addNode(node, toConnect) {
		// check if the node is already in
		var alreadyIn = false;
		for (var i = this._nodes.length - 1; i >= 0; i--) {
			// if so, push it to the top of the stack
			if (node == this._nodes[i]) {
				alreadyIn = true;
				this._nodes.push(this._nodes.splice(i, 1)[0]);
				this._nodesInfo.push(this._nodesInfo.splice(i, 1)[0]);
				break;
			}
		}

		if (!alreadyIn) {
			this._nodes.push(node);
			this._nodesInfo.push({
				mesh: node,
				index: node.index,
				radius: 0,
				radiusData: [] // store the raw data
			});
			node.material = this._matNode;
			node.material.needsUpdate = true;

			// this._voxelGrid[node.index[2]][node.index[1]][node.index[0]] = this.NODE;

			log('node added at ' + node.index);
		}

		if (toConnect && this._nodes.length > 1) {
			var nodeLast = this._nodes[this._nodes.length - 2];
			var ptsEdge = this._interpolate(node, nodeLast, this._voxelGrid, this._voxels);
			for (var i = ptsEdge.length - 2; i >= 1; i--) {
				ptsEdge[i].material = this._matEdge;
				ptsEdge[i].material.needsUpdate = true;
			}
			this._edges.push(ptsEdge);

			var v1 = this._nodesInfo[this._nodes.length - 1];
			var v2 = this._nodesInfo[this._nodes.length - 2];
			var lenEdge = XAC.float2int(getDist(v1.index, v2.index));

			this._edgesInfo.push({
				v1: v1,
				v2: v2,
				// len: lenEdge,
				thickness: new Array(lenEdge),	// set up once when the axis is first created
				thicknessData: new Array(lenEdge) // store the raw data
			});
		}
	}

	//
	//	
	// @param pos - THREE.Vector3
	//
	updateNode(node, pos) {
		//
		// update info on this node
		//
		var dPos = pos.clone().sub(node.position);
		if (dPos.length() < this._voxelDim / 2) {
			return node;
		}

		var x = XAC.float2int(node.index[0] + 0.5 + dPos.x / this._voxelDim);
		var y = XAC.float2int(node.index[1] + 0.5 + dPos.y / this._voxelDim);
		var z = XAC.float2int(node.index[2] + 0.5 + dPos.z / this._voxelDim);

		if (x == node.index[0] && y == node.index[1] && z == node.index[2]) {
			return node;
		}

		var nodeNew = this._voxelTable[z][y][x];
		if (nodeNew == undefined) {
			nodeNew = makeVoxel(this._voxelDim, x, y, z, this._matNode, true);
			scene.add(nodeNew);
		}

		nodeNew.index = [x, y, z];

		for (var i = this._nodes.length - 1; i >= 0; i--) {
			if (node == this._nodes[i]) {
				this._nodes[i].material = MATERIALNORMAL;
				this._nodes[i].material.needsUpdate = true;
				this._nodes[i] = nodeNew;

				this._nodesInfo[i].mesh = nodeNew;
				this._nodesInfo[i].index = nodeNew.index;
			}
		}

		//
		// update its edges and visuals
		//
		for (var i = this._edgesInfo.length - 1; i >= 0; i--) {
			var edgePts = this._edges[i];
			var edgeInfo = this._edgesInfo[i];

			if (edgeInfo.v1.mesh == nodeNew || edgeInfo.v2.mesh == nodeNew) {
				for (var j = edgePts.length - 2; j >= 1; j--) {
					edgePts[j].material = MATERIALNORMAL;
					edgePts[j].material.needsUpdate = true;
				}

				var edgePtsNew = this._interpolate(edgeInfo.v1.mesh, edgeInfo.v2.mesh, this._voxelGrid, this._voxels);

				for (var j = edgePtsNew.length - 2; j >= 1; j--) {
					edgePtsNew[j].material = this._matEdge;
					edgePtsNew[j].material.needsUpdate = true;
				}
				this._edges[i] = edgePtsNew;
			}
		}

		//	update visuals of this node again, as it might has been considered as a non-edge
		nodeNew.material = this._matNode;
		nodeNew.material.needsUpdate = true;

		//
		// update the voxel grid
		//

		return nodeNew;
	}

	renderAxis() {
		for (var i = this._nodes.length - 1; i >= 0; i--) {
			this._nodes[i].material = this._matNode;
			this._nodes[i].material.needsUpdate = true;
		}

		for (var i = this._edges.length - 1; i >= 0; i--) {
			this._edges[i].material = this._matEdge;
			this._edges[i].material.needsUpdate = true;
		}
	}

	get nodes() {
		return this._nodes;
	}

	get nodesInfo() {
		return this._nodesInfo;
	}

	get edgesInfo() {
		return this._edgesInfo;
	}

	get edges() {
		return this._edges;
	}

	get isVoxelized() {
		return this._isVoxelized;
	}
}