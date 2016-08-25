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
            _neighboars1: [],
            _neighboars2: [],

            // corresponded stuff
            _dp1: {
                elm: undefined, // elm to depend upon
                idx: -1 // which point on the dependUpon is the closest
            },
            _dp2: {
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
        var neighbors = [elm._neighboars1, elm._neighboars2];
        for (var j = 0; j < nodes.length; j++) {
            var edgesInfo = getIntersectingEdge(nodes[j], designNew);
            for (var k = 0; k < edgesInfo.length; k++) {
                if (edgesInfo[k].idxEdge != idx) neighbors[j].push(edgesInfo[k].idxEdge);
            }
        }

        // log(idx)
        // log(elm._neighboars1)
        // log(elm._neighboars2)

        this._graph.push(elm);
    }

    //find correspondence to original design and boundary
    for (var idx = 0; idx < this._graph.length; idx++) {
        var elm = this._graph[idx];
        var dps = [elm._dp1, elm._dp2];
        var posNodes = [elm._node1, elm._node2];
        var projNodes = [elm._projNode1, elm._projNode2];
        var neighbors = [elm._neighboars1, elm._neighboars2];

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
                        dps[k].id = 'o' + i; // HACK
                        dps[k].elm = edge
                        dps[k].idx = j;
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

                // var pos = posNodes[k];
                // for (var i = 0; i < boundaries.length; i++) {
                //     for (var j = boundaries[i].length - 1; j >= 0; j--) {
                //         // addABall(this._scene, new THREE.Vector3().fromArray(boundaries[i][j]),
                //         //     0x000000,
                //         //     3,
                //         //     1);
                //         log(XAC.getDist(pos, boundaries[i][j]))
                //         if (XAC.getDist(pos, boundaries[i][j]) < 5) {
                //             dps[k].id = 'b'; // HACK
                //             // TODO: find the edge that intersects with the boundary
                //             // dps[k].elm =
                //             // TODO: on that edge find the proj
                //             // dps[k].idx =

                // }
                // } // for the poitns on the boundary
                // } // for each boundary
            } // for each dependency
        }
    }

    // find inter-correspondence in new design
    for (var i = 0; i < this._graph.length; i++) {
        this._graph[i]
    }
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
    var _interpolate = function(n1, n2, t) {
        // TODO
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

    // recursive update routine
    var _updateElm = function(elm, t) {
        // elm is fully projected onto the original design
        if (elm._projEdge != undefined) {
            elm.node1 = _interpolate(elm._node1, elm._projNode1, t);
            elm.node2 = _interpolate(elm._node2, elm._projNode2, t);
            for (var j = 0; j < elm._projEdge.points.length; j++) {
                elm.edge.points.push(_interpolate(elm._edge.points[j], elm._projEdge.points[
                    j], t));
                elm.edge.thickness[j].push(_interpolate(elm._edge.thickness[j], elm._projEdge
                    .thickness[j], t));
            }
        }
        // elm is partially projected or dependent on other elms
        else {
            var nodes = [elm.node1, elm.node2];
            var dps = [elm._dp1, elm._dp2];
            var projNodes = [elm._projNode1, elm._projNode2];
            for (var i = 0; i < dps.length; i++) {
                if (dps[i] != undefined) {
                    _updateElm(dps[i].elm, t);
                    nodes[i] = dps[i].elm.edge.points[dps[i].idx];
                } else if (projNodes[i] != undefined) {
                    nodes[i] = _interpolate(nodes[i], projNodes[i], t);
                } else {
                    err('we have a problem ...')
                }
            }
        }
        elm.needsUpdate = false;
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
