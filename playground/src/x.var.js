"use strict";

class MedialAxis {
	constructor() {
		this._nodes = [];
		this._edges = [];

		this._matNode = MATERIALHIGHLIGHT;
		this._matEdge = MATERIALCONTRAST;

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

							var dist = p2l(i, j, k, idx1[0], idx1[1], idx1[2], idx2[0], idx2[1], idx2[2])
							if (dist < 0.5) {
								pts.push(gVoxelTable[k][j][i]);
							}
						}
					}
				}
			}

			return pts;
		}
	}

	addNodes(node, toConnect) {
		this._nodes.push(node);
		node.material = this._matNode;
		node.material.needsUpdate = true;

		if (toConnect && this._nodes.length > 1) {
			var nodeLast = this._nodes[this._nodes.length - 2];
			var ptsEdge = this._interpolate(node, nodeLast, gVoxelGrid, gVoxels);
			log(ptsEdge)
			for (var i = ptsEdge.length - 2; i >= 1; i--) {
				ptsEdge[i].material = this._matEdge;
				ptsEdge[i].material.needsUpdate = true;
			}
			this._edges.push(ptsEdge);
		}
	}


}

var gVoxels = [];
var gVoxelTable = [];
var gma = new MedialAxis(); // medial axis
var gGlue = false;