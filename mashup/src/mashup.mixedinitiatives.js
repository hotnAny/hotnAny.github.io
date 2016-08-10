var MASHUP = MASHUP || {};

MASHUP.MixedInitiatives = function(scene, camera) {
    this._scene = scene;
}

MASHUP.MixedInitiatives.prototype = {
    constructor: MASHUP.MixedInitiatives
};

MASHUP.MixedInitiatives.prototype._computeDistanceField = function(design) {
    var assign = function(v, dfval) {
        var idx = vxg.getIndex(v);
        if (df[idx[0]][idx[1]][idx[2]] == XAC.INFINITY) {
            df[idx[0]][idx[1]][idx[2]] = dfval;
            counter++;
            return idx;
        }
        return undefined;
    }
    var df = [];

    // make a voxel grid
    var medialAxis = design._medialAxis;
    var bbox = medialAxis.boundingBox();
    var vxg = new MASHUP.VoxelGrid(this._scene, bbox.min);

    vxg._dim = 2;
    vxg._nx = XAC.float2int((bbox.max.x - bbox.min.x) / vxg._dim) + 1;
    vxg._ny = XAC.float2int((bbox.max.y - bbox.min.y) / vxg._dim) + 1;
    vxg._nz = 1; //XAC.float2int((bbox.max.z - bbox.min.z) / vxg._dim) + 1;

    log('distance field: ' + vxg._nx + ' x ' + vxg._ny + ' x ' + vxg._nz)

    // initialize distance field
    for (var i = 0; i < vxg.nx; i++) {
        var dfyz = []
        for (var j = 0; j < vxg.ny; j++) {
            var dfz = []
            for (var k = 0; k < vxg.nz; k++) {
                dfz[k] = XAC.INFINITY;
            }
            dfyz.push(dfz);
        }
        df.push(dfyz)
    }
    var counter = 0; // goal is nx * ny * nz
    var numVoxels = vxg.nx * vxg.ny * vxg.nz;

    // set the zeros
    var bufPrev = [];
    var edges = medialAxis.edges;
    for (var i = 0; i < edges.length; i++) {
        bufPrev.push(assign(edges[i].node1.position, 0));
        bufPrev.push(assign(edges[i].node2.position, 0));
        var points = edges[i].points;
        for (var j = 0; j < points.length - 1; j++) {
            bufPrev.push(assign(points[j], 0));

            var nbtwn = points[j].clone().sub(points[j + 1]).length() / vxg.dim;
            var dx = (points[j + 1].x - points[j].x) / nbtwn;
            var dy = (points[j + 1].y - points[j].y) / nbtwn;
            // ignor z for now

            for (var k = 1; k < nbtwn; k++) {
                var p = points[j].clone().add(new THREE.Vector3(dx * k, dy * k, 0));
                bufPrev.push(assign(p, 0));
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
            }
        }

        bufPrev = XAC.copyArray(buf);
    }

    // visualize to debug
    for (var i = 0; i < vxg.nx; i++) {
        for (var j = 0; j < vxg.ny; j++) {
            for (var k = 0; k < vxg.nz; k++) {
                var mat = XAC.MATERIALWIRE.clone();
                mat.opacity = 1.0 / (1 + df[i][j][k]);
                var voxel = vxg._makeVoxel(vxg.dim, i, j + vxg.ny * 1.5, k, mat,
                    true);
                this._scene.add(voxel)
            }
        }
    }
}

MASHUP

//
//
//  extending other classes
//
//

MASHUP.MedialAxis.prototype.boundingBox = function() {
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

MASHUP.VoxelGrid.prototype.getIndex = function(v) {
    var vrel = v.clone().sub(this._origin);
    var i = XAC.clamp(XAC.float2int(vrel.x / this._dim), 0, this._nx - 1);
    var j = XAC.clamp(XAC.float2int(vrel.y / this._dim), 0, this._ny - 1);
    var k = XAC.clamp(XAC.float2int(vrel.z / this._dim), 0, this._nz - 1);
    return [i, j, k]
}
