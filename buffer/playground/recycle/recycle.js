MASHUP.MedialAxis.prototype.addNodeObselete = function(node, vxg, toConnect) {
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
		var ptsEdge = this._interpolate(node, nodeLast, vxg);
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
			thickness: new Array(lenEdge), // set up once when the axis is first created
			thicknessData: new Array(lenEdge) // store the raw data
		});
	}
}

MASHUP.MedialAxis.prototype.updateNodeObselete = function(node, vxg, pos) {
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

MASHUP.MedialAxis.prototype.snapVoxelGrid = function(vxg) {
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
						this.._snapVoxel(k, j, i, vxg.dim());
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

MASHUP.MedialAxis.prototype._snapVoxel = function(kx, jy, iz, dim) {
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
		var v1 = this._edgesInfo[h].v1.mesh.position;
		var v2 = this._edgesInfo[h].v2.mesh.position;

		var p2lInfo = p2ls(k, j, i, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
		if (p2lInfo != undefined) {
			var dist = p2lInfo.distance;
			var proj = p2lInfo.projection;
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
		var idxPt = XAC.float2int(getDist(projEdgeMin, v1));
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
// MASHUP.MedialAxis.prototype.render = function() {
// 	for (var i = this._nodes.length - 1; i >= 0; i--) {
// 		this._nodes[i].material = this._matNode;
// 		this._nodes[i].material.needsUpdate = true;
// 	}

// 	for (var i = this._edges.length - 1; i >= 0; i--) {
// 		this._edges[i].material = this._matEdge;
// 		this._edges[i].material.needsUpdate = true;
// 	}
// }


// MASHUP.MedialAxis.prototype._interpolate = function(p1, p2, vxg) {
// 	var pts = [];
// 	var idx1 = p1.index;
// 	var idx2 = p2.index;

// 	var ds = [];
// 	var offsets = [];
// 	for (var i = 0; i < idx1.length; i++) {
// 		ds[i] = Math.sign(idx2[i] - idx1[i]);
// 		ds[i] = ds[i] == 0 ? 1 : ds[i];
// 		offsets[i] = idx2[i] * 1.0 - idx1[i];
// 	}

// 	var v21 = new THREE.Vector3(offsets[0], offsets[1], offsets[2]);

// 	for (var i = idx1[0]; i != idx2[0] + ds[0]; i += ds[0]) {
// 		for (var j = idx1[1]; j != idx2[1] + ds[1]; j += ds[1]) {
// 			for (var k = idx1[2]; k != idx2[2] + ds[2]; k += ds[2]) {
// 				if (vxg.grid()[k][j][i] == 1) {
// 					var dist = p2l(i, j, k, idx1[0], idx1[1], idx1[2], idx2[0], idx2[1], idx2[2]).dist;
// 					if (dist < 0.5) {
// 						pts.push(vxg.table()[k][j][i]);
// 						// vxg[k][j][i] = this.EDGE
// 					}
// 				}
// 			} // z
// 		} // y
// 	} // x

// 	return pts;
// }

// var nelx = vxg.nx;
	// var nely = vxg.ny;
	// var nelz = vxg.nz;

	// var arrDisp = listDisp.split(',');
	// var _getNodeDisp = function(x, y, z) {
	// 	var idx = XAC.float2int(z * (nelx + 1) * (nely + 1) + x * (nely + 1) + y);
	// 	if (arrDisp[idx] == undefined) {
	// 		err('overflow!');
	// 	}
	// 	return new THREE.Vector3(Number(arrDisp[idx]), Number(arrDisp[idx + 1]), Number(arrDisp[idx + 2]));;
	// };

	// var stressElms = [];
	// for (var i = 0; i < nelx; i++) {
	// 	var plane = [];
	// 	for (var j = 0; j < nely; j++) {
	// 		var line = [];
	// 		for (var k = 0; k < nelz; k++) {
	// 			line.push([]);
	// 		}
	// 		plane.push(line)
	// 	}
	// 	stressElms.push(plane);
	// }

	// // go thru each node
	// for (var i = 0; i < nelx + 1; i++) {
	// 	for (var j = 0; j < nely + 1; j++) {
	// 		for (var k = 0; k < nelz + 1; k++) {
	// 			var greenStrains = [];
	// 			var cnt = 0;

	// 			var ni, nj, nk;
	// 			for (var ni = i - 1; ni <= i + 1; ni += 2) {
	// 				for (var nj = j - 1; nj <= j + 1; nj += 2) {
	// 					for (var nk = k - 1; nk <= k + 1; nk += 2) {
	// 						if (ni < 0 || ni > nelx || nj < 0 || nj > nely || nk < 0 || nk > nelz) {
	// 							continue;
	// 						}

	// 						var node = new THREE.Vector3(i, j, k);
	// 						var node1 = new THREE.Vector3(ni, j, k);
	// 						var node2 = new THREE.Vector3(i, nj, k);
	// 						var node3 = new THREE.Vector3(i, j, nk);

	// 						var v1 = new THREE.Vector3().subVectors(node1, node);
	// 						var v2 = new THREE.Vector3().subVectors(node2, node);
	// 						var v3 = new THREE.Vector3().subVectors(node3, node);

	// 						node.add(_getNodeDisp(i, j, k));
	// 						node1.add(_getNodeDisp(ni, j, k));
	// 						node2.add(_getNodeDisp(i, nj, k));
	// 						node3.add(_getNodeDisp(i, j, nk));

	// 						var V1 = new THREE.Vector3().subVectors(node1, node);
	// 						var V2 = new THREE.Vector3().subVectors(node2, node);
	// 						var V3 = new THREE.Vector3().subVectors(node3, node);

	// 						// should instead get the max?
	// 						var E = this._computeGreenStrain(v1, v2, v3, V1, V2, V3);
	// 						var gs = numeric.fnorm(E);
	// 						greenStrains.push(gs);
	// 						// cnt++;

	// 					} // nk
	// 				} // nj
	// 			} // ni

	// 			log(greenStrains)

	// 		} // z
	// 	} // y
	// } // x

	
					// var scaledPos = [];
					// for (var l = 0; l < tetras[h].positions.length; l++) {
					// 	scaledPos.push(tetras[h].positions[l].clone().multiplyScalar(vxg.dim));
					// }

					// var mat = new THREE.MeshBasicMaterial({
					// 	color: this._getColorFromScore(tetras[h].stress, maxStress),
					// 	transparent: true,
					// 	opacity: vxg.gridRaw[k][j][i] * 0.5,
					// 	side: THREE.DoubleSide
					// });

					// var tetraMesh = new XAC.Polygon(scaledPos, faces, mat).m;

					// scene.add(tetraMesh);