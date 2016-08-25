/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *	Mixed Initiatives
 *  - a collection of mixed initiative methods
 *
 *	@author Xiang 'Anthony' Chen http://xiangchen.me
 *
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var FORTE = FORTE || {};

FORTE.MixedInitiatives = function(scene, camera) {
    this._scene = scene;
    this._dump = [];

    document.addEventListener('mousedown', this._mousedown.bind(this), false);
    document.addEventListener('mousemove', this._mousemove.bind(this), false);
    document.addEventListener('mouseup', this._mouseup.bind(this), false);
    // document.addEventListener('keydown', this._keydown.bind(this), false);
}

FORTE.MixedInitiatives.prototype = {
    constructor: FORTE.MixedInitiatives
};

FORTE.MixedInitiatives.DFVOXELSIZE = 2;

FORTE.MixedInitiatives.prototype._mousedown = function(e) {

};

FORTE.MixedInitiatives.prototype._mousemove = function(e) {

};

FORTE.MixedInitiatives.prototype._mouseup = function(e) {

};

//
//  compute distance field of a forte design
//
FORTE.MixedInitiatives.prototype._computeDistanceField = function(design) {
    var assign = function(v, dfval, dx, dy, dz) {
        var idx = vxg.getIndex(v, dx, dy, dz);
        var dfx = idx[0];
        var dfy = idx[1];
        var dfz = idx[2];
        if (df[dfx][dfy][dfz] == XAC.INFINITY) {
            df[dfx][dfy][dfz] = dfval;
            counter++;
            return idx;
        }
        return undefined;
    };
    // var df = [];

    // make a voxel grid
    var medialAxis = design._medialAxis;
    var bbox = medialAxis.boundingBox();
    var inflation = 0; //.4;
    var vxg = new FORTE.VoxelGrid(this._scene, bbox.min);

    vxg._dim = FORTE.MixedInitiatives.DFVOXELSIZE;
    var nx = XAC.float2int((bbox.max.x - bbox.min.x) / vxg._dim) + 1;
    var ny = XAC.float2int((bbox.max.y - bbox.min.y) / vxg._dim) + 1;
    // suppress it to 1 just for the 2d case
    var nz = 1; //XAC.float2int((bbox.max.z - bbox.min.z) / vxg._dim) + 1;

    // initialize distance field

    var dfmx = XAC.float2int(nx * inflation * 0.5);
    var dfmy = XAC.float2int(ny * inflation * 0.5);
    var dfnx = nx + dfmx * 2; // XAC.float2int(nx * (1 + inflation));
    var dfny = ny + dfmy * 2; //XAC.float2int(ny * (1 + inflation));
    var dfnz = 1;
    var df = XAC.initMDArray([dfnx, dfny, dfnz], XAC.INFINITY);
    log('distance field: ' + dfnx + ' x ' + dfny + ' x ' + dfnz)

    var counter = 0; // goal is nx * ny * nz
    vxg._nx = dfnx;
    vxg._ny = dfny;
    vxg._nz = dfnz

    var numVoxels = vxg.nx * vxg.ny * vxg.nz;

    // set the zeros
    var bufPrev = [];
    var edges = medialAxis.edges;
    for (var i = 0; i < edges.length; i++) {
        if (edges[i].deleted) continue;

        bufPrev.push(assign(edges[i].node1.position, 0, dfmx, dfmy, 0));
        bufPrev.push(assign(edges[i].node2.position, 0, dfmx, dfmy, 0));
        var points = edges[i].points;
        for (var j = 0; j < points.length - 1; j++) {
            bufPrev.push(assign(points[j], 0, dfmx, dfmy, 0));

            var nbtwn = points[j].clone().sub(points[j + 1]).length() / vxg.dim;
            var dx = (points[j + 1].x - points[j].x) / nbtwn;
            var dy = (points[j + 1].y - points[j].y) / nbtwn;
            // ignore z for now

            for (var k = 1; k < nbtwn; k++) {
                var p = points[j].clone().add(new THREE.Vector3(dx * k, dy * k, 0));
                bufPrev.push(assign(p, 0, dfmx, dfmy, 0));
            }
        }
    }

    // flood fill to find distance fied
    while (counter < numVoxels) {
        var buf = [];

        for (var i = 0; i < bufPrev.length; i++) {
            var idx = bufPrev[i];
            if (idx == undefined) continue;
            var dfval = df[idx[0]][idx[1]][idx[2]];
            var neighbors = [
                [-1, 0, 0],
                [1, 0, 0],
                [0, -1, 0],
                [0, 1, 0],
                [0, 0, -1],
                [0, 0, 1]
            ];
            for (var j = 0; j < neighbors.length; j++) {
                var didx = neighbors[j]
                var ii = idx[0] + didx[0];
                var jj = idx[1] + didx[1];
                var kk = idx[2] + didx[2];
                if (0 <= ii && ii < vxg.nx && 0 <= jj && jj < vxg.ny && 0 <= kk && kk <
                    vxg.nz) {
                    if (df[ii][jj][kk] == XAC.INFINITY) {
                        df[ii][jj][kk] = dfval + 1;
                        buf.push([ii, jj, kk]);
                        counter++;
                    }
                }
            } // visiting neighbors
        } // visiting last round's computations

        bufPrev = XAC.copyArray(buf);
    }

    // visualize to debug
    this._showDistanceField(df);

    log(JSON.stringify(df));

    return df;
}

//
//  interpolate between two distance fields
//
FORTE.MixedInitiatives.prototype._interpolateDistanceFields = function(df1, df2, val) {
    var df = []
    for (var i = 0; i < df1.length; i++) {
        var dfyz = [];
        for (var j = 0; j < df1[0].length; j++) {
            dfz = [];
            for (var k = 0; k < df1[0][0].length; k++) {
                dfz.push(df1[i][j][k] * val + df2[i][j][k] * (1 - val));
            }
            dfyz.push(dfz);
        }
        df.push(dfyz);
    }

    this._showDistanceField(df);
}

//
//  show distance fields as a voxel grid
//
FORTE.MixedInitiatives.prototype._showDistanceField = function(df, offset) {
    var vxg = new FORTE.VoxelGrid(this._scene, new THREE.Vector3(50, -50, 0));
    var offset = offset == undefined ? new THREE.Vector3(0, 0, 0) : offset;
    var counter = 0;
    for (var i = 0; i < df.length; i++) {
        for (var j = 0; j < df[0].length; j++) {
            for (var k = 0; k < df[0][0].length; k++) {
                var opacity = 1.0 / (1 + df[i][j][k]);

                if (this._dump[counter] == undefined) {
                    var mat = XAC.MATERIALWIRE.clone();
                    mat.opacity = opacity;
                    var voxel = vxg._makeVoxel(FORTE.MixedInitiatives.DFVOXELSIZE,
                        i - df.length / 2 + offset.x,
                        j - df[0].length / 2 + offset.y,
                        k + offset.z,
                        mat, true);
                    this._scene.add(voxel);
                    this._dump.push(voxel);
                } else {
                    var voxel = this._dump[counter];
                    voxel.material.opacity = opacity;
                    voxel.material.needsUpdate = true;
                }

                counter++;
            } // k
        } // j
    } // i
}

FORTE.MixedInitiatives.prototype.buildDependencyGraph = function(designOriginal, designNew,
    boundaries) {
    var getIntersectingEdge = function(pos, edges, oneHit) {
        var intEdgesInfo = [];
        var rndnum = Math.random() * 10;
        for (var i = edges.length - 1; i >= 0; i--) {
            var edge = edges[i];
            var points = edge.points;
            var thickness = edge.thickness;
            for (var j = points.length - 1; j >= 0; j--) {
                if (XAC.getDist(pos, points[j]) < thickness[j] * 2) {
                    var edgeInfo = {
                        idxEdge: i,
                        idxIntPnt: j
                    };
                    if (oneHit == true) {
                        return edgeInfo;
                    }
                    intEdgesInfo.push(edgeInfo);
                    // addABall(FORTE.scene, new THREE.Vector3().fromArray(pos), 0xff0000 +
                    //     rndnum *
                    //     0x008800, 2,
                    //     1);
                    break;
                }
            } // for the poitns on each edge
        } // for each edge
        return intEdgesInfo;
    };

    var computeProjection = function() {

    }

    this._graph = [];

    // initialization & find connectivity between edges
    for (var idx = 0; idx < designNew.length; idx++) {
        var edge = designNew[idx];

        var elm = {
            // original stuff
            _node1: edge.node1,
            _node2: edge.node2,
            _edge: {
                points: XAC.copyArray(edge.points),
                thickness: XAC.copyArray(edge.thickness)
            },

            // connectivity, storing indices of neighbors
            _neighbors1: [],
            _neighbors2: [],

            // corresponded stuff
            _dp1: {
                idxElm: -1, // index of the elm in the graph (mostly for debug use)
                elm: undefined, // elm to depend upon
                idx: -1 // which point on the dependUpon is the closest
            },
            _dp2: {
                idxElm: -1,
                elm: undefined,
                idx: -1
            },
            _projNode1: undefined,
            _projNode2: undefined,
            _projEdge: undefined,

            // interpolated stuff
            node1: undefined,
            node2: undefined,
            edge: {
                points: [],
                thickness: []
            }
        };

        var nodes = [elm._node1, elm._node2];
        var neighbors = [elm._neighbors1, elm._neighbors2];
        for (var j = 0; j < nodes.length; j++) {
            var edgesInfo = getIntersectingEdge(nodes[j], designNew);
            for (var k = 0; k < edgesInfo.length; k++) {
                if (edgesInfo[k].idxEdge != idx) neighbors[j].push({
                    idxElm: edgesInfo[k].idxEdge,
                    idxIntPnt: edgesInfo[k].idxIntPnt
                });
            }
        }

        // log(idx)
        // log(elm._neighbors1)
        // log(elm._neighbors2)

        this._graph.push(elm);
    }

    //find correspondence to original design and boundary
    for (var idx = 0; idx < this._graph.length; idx++) {
        var elm = this._graph[idx];
        var dps = [elm._dp1, elm._dp2];
        var posNodes = [elm._node1, elm._node2];
        var projNodes = [elm._projNode1, elm._projNode2];
        var neighbors = [elm._neighbors1, elm._neighbors2];

        //
        //
        // find incident edge from the original design, if there is any
        for (var k = 0; k < dps.length; k++) {
            var pos = posNodes[k];
            for (var i = designOriginal.length - 1; i >= 0 && dps[k].elm == undefined; i--) {
                var edge = designOriginal[i];
                var points = edge.points;
                var thickness = edge.thickness;
                for (var j = points.length - 1; j >= 0; j--) {
                    if (XAC.getDist(pos, points[j]) < thickness[j] * 2) {
                        dps[k].type = 0; // original
                        dps[k].elm = edge
                        dps[k].idxIntPnt = j;
                        dps[k].idxElm = i;
                        // addABall(this._scene, new THREE.Vector3().fromArray(pos), 0xff0000, 5,
                        //     1);
                        break;
                    }
                } // for the poitns on each edge
            } // for each edge
        } // for each dependency

        //
        //
        // TODO: compute projections
        // both ends on original design
        if (elm._dp1.elm != undefined && elm._dp2.elm != undefined) {
            elm._projEdge = {
                points: [],
                thickness: []
            };
        }
        // one end on original design
        else {
            var edge = elm._dp1.elm || elm._dp2.elm;
            if (edge != undefined) {
                elm._projEdge = {
                    points: edge.points,
                    thickness: edge.thickness
                };
            }
        }

        //
        //
        // find if incident to boundary
        if (elm._projEdge == undefined) {
            for (var k = 0; k < dps.length; k++) {
                if (neighbors[k].length == 0) {
                    // TODO: find the edge that intersects with the boundary
                    // dps[k].elm =
                    // TODO: on that edge find the proj
                    // dps[k].idx =
                    // addABall(this._scene, new THREE.Vector3().fromArray(pos), 0xff0000,
                    //     5,
                    //     1);
                }
            } // for each dependency
        }
    }

    // find inter-correspondence in new design
    for (var idx = 0; idx < this._graph.length; idx++) {
        var elm = this._graph[idx];
        var dps = [elm._dp1, elm._dp2];
        var neighbors = [elm._neighbors1, elm._neighbors2];
        for (var j = 0; j < dps.length; j++) {
            if (dps[j].elm == undefined) {
                for (var k = 0; k < neighbors[j].length; k++) {
                    var idxNeighbor = neighbors[j][k].idxElm;
                    var idxIntPnt = neighbors[j][k].idxIntPnt;
                    var elmNeighbor = this._graph[idxNeighbor];
                    if (elmNeighbor._dp1.elm != undefined && elmNeighbor._dp2.elm != undefined) {
                        dps[j].type = 1; // new design
                        dps[j].elm = elmNeighbor;
                        dps[j].idxElm = idxNeighbor;
                        dps[j].idxIntPnt = idxIntPnt;
                        break;
                    }
                }

                // if find no dependUpons, depend on itself
                if (dps[j].elm == undefined) {
                    dps[j].type = 1;
                    dps[j].elm = elm;
                    dps[j].idxElm = idx;

                    // TODO: compute projection
                }
            } // looking for neighbor to depend on
        } // each node (2 in total)
    } // each graph elm

    // for (var idx = 0; idx < this._graph.length; idx++) {
    //     log(idx)
    //     var elm = this._graph[idx];
    //     log([elm._dp1.type == 1 ? elm._dp1.idxElm + '-' + elm._dp1.idxIntPnt : '',
    //         elm._dp2.type == 1 ? elm._dp2.idxElm + '-' + elm._dp2.idxIntPnt : ''
    //     ]);
    // }
}

FORTE.MixedInitiatives.prototype.project = function() {
    // project to design

    // project to ground

}

//
//
//  return the interpolated new design (not including the original one)
//
FORTE.MixedInitiatives.prototype.interpolate = function(t) {
    if (this._graph == undefined) {
        return;
    }

    // do node to node simple linear interpolation
    // var _interpolate = function(p1, p2, t) {
    //     var len = Math.min(p1.length, p2.length);
    //     var arr = [];
    //     for(var i=0; i<len; i++) {
    //         arr.push(p1[i] * t + p2[i] * (1))
    //     }
    // };

    // recursive update routine
    var _updateElm = function(elm, t) {
        var dps = [elm._dp1, elm._dp2];
        var _nodes = [elm._node1, elm._node2];
        var nodes = [elm.node1, elm.node2];

        for (var i = 0; i < dps.length; i++) {
            switch (dps[i].type) {
                case 0: // depend on original design
                    // interpolate in geodesic space
                    if (dps[i].path != undefined) {
                        var idx = XAC.float2int(dps[i].path.length * t);
                        nodes[i] = dps[i].path[idx];
                    }
                    // interpolate in cartesian space
                    else {
                        var projection = dps[i].elm.points[dps[i].idxIntPnt];
                        // nodes[i] = _interpolate(elm._nodes[i], projection, t);
                        nodes[i] = elm._nodes[i].clone().times(t).add(projection.times(1-t));
                    }
                    break;
                case 1: // depend on new design
                    if (dps[i].elm.needsUpdate) _updateElm(dps[i].elm, t);
                    nodes[i] = dps[i].elm.points[dps[i].idxIntPnt];
                    break;
            }
        }

        var len = XAC.getDist(elm._node1, elm._node2);
        var dnode1 = elm.node1.clone().sub(elm._node1);
        var dnode2 = elm.node2.clone().sub(elm._node2);
        for (var i = 0; i < elm._edge.points; i++) {
            var point = XAC.copyArray(elm._edge.points[i]);
            var len1 = XAC.getDist(point, elm._node1);
            point.add(dnode1.clone().times(1 - len1 / len));
            var len2 = XAC.getDist(point, elm._node2);
            point.add(dnode2.clone().times(1 - len2 / len));
            elm.edges.push(point);
        }

        elm.needsUpdate = false;
    }

    // clean up previous values
    for (var i = 0; i < this._graph.length; i++) {
        this._graph[i].node1 = undefined;
        this._graph[i].node2 = undefined;
        this._graph[i].edge = {
            points: [],
            thickness: []
        }
        this._graph[i].needsUpdate = true;
    }

    var designInterpolated = [];
    for (var i = 0; i < this._graph.length; i++) {
        var elm = this._graph[i];
        if (elm.needsUpdate == true) {
            _udpate(elm, t);
        }
        designInterpolated.push(elm.edge);
    }

    return designInterpolated;

}


//
//
//  extending other classes
//
//

FORTE.MedialAxis.prototype.boundingBox = function() {
    var bbox = {
        min: new THREE.Vector3(XAC.INFINITY, XAC.INFINITY, XAC.INFINITY),
        max: new THREE.Vector3(-XAC.INFINITY, -XAC.INFINITY, -XAC.INFINITY)
    };
    var compareTo = function(v, bbox) {
        bbox.min.x = Math.min(bbox.min.x, v.x);
        bbox.min.y = Math.min(bbox.min.y, v.y);
        bbox.min.z = Math.min(bbox.min.z, v.z);
        bbox.max.x = Math.max(bbox.max.x, v.x);
        bbox.max.y = Math.max(bbox.max.y, v.y);
        bbox.max.z = Math.max(bbox.max.z, v.z);
    }

    for (var i = 0; i < this._edges.length; i++) {
        var edge = this._edges[i];
        compareTo(edge.node1.position, bbox);
        compareTo(edge.node2.position, bbox);
        for (var j = 0; j < edge.points.length; j++) {
            compareTo(edge.points[j], bbox);
        }
    }

    // DEBUG:
    // addABall(this._scene, bbox.min, 0xff0000, 5, 1)
    // addABall(this._scene, bbox.max, 0xff00ff, 5, 1)

    return bbox;
}

FORTE.VoxelGrid.prototype.getIndex = function(v, dx, dy, dz) {
    var vrel = v.clone().sub(this._origin);
    var i = XAC.clamp(XAC.float2int(vrel.x / this._dim), dx, this._nx - 1 - dx);
    var j = XAC.clamp(XAC.float2int(vrel.y / this._dim), dy, this._ny - 1 - dy);
    var k = XAC.clamp(XAC.float2int(vrel.z / this._dim), dz, this._nz - 1 - dz);
    return [i, j, k]
}
