XAC.computeBarycenter = function(pdfs, lambdas, numItrs) {
    if (pdfs == undefined || pdfs[0] == undefined || pdfs[0][0] == undefined) return undefined;

    var k = pdfs.length;
    var m = pdfs[0].length;
    var n = pdfs[0][0].length;

    // log([k, m, n])

    var geomMean = function(cnvla, result, lambdas, k, m, n) {
        var safeLog = function(x) {
            var eps = XAC.EPSILON == undefined ? 1e-9 : XAC.EPSILON;
            return Math.log(Math.max(eps, x));
        };

        for (var i = 0; i < k; i++) {
            for (var j = 0; j < m; j++) {
                for (var h = 0; h < n; h++) {
                    result[j][h] += safeLog(cnvla[i][j][h]) * lambdas[i];
                }
            }
        }

        for (var j = 0; j < m; j++) {
            for (var h = 0; h < n; h++) {
                result[j][h] = Math.exp(result[j][h]);
            }
        }
    }

    var gaussian = XAC.compute2DGaussianKernel(n / 160, n);

    var baryCenter = XAC.initMDArray([m, n], 0.0);

    var a = XAC.initMDArray([k, m, n], 1.0);
    var b = XAC.initMDArray([k, m, n], 1.0);
    var convolution = XAC.initMDArray([k, m, n], 0.0);

    for (var itr = 0; itr < numItrs; itr++) {
        for (var i = 0; i < k; i++) {
            XAC.convolve2D(b[i], convolution[i], gaussian);

            for (var j = 0; j < m; j++) {
                for (var h = 0; h < n; h++) {
                    a[i][j][h] = pdfs[i][j][h] / convolution[i][j][h];
                }
            }
            XAC.convolve2D(a[i], convolution[i], gaussian);
        }

        baryCenter = XAC.initMDArray([m, n], 0.0);
        geomMean(convolution, baryCenter, lambdas, k, m, n);

        for (var i = 0; i < k; i++) {
            for (var j = 0; j < m; j++) {
                for (var h = 0; h < n; h++) {
                    b[i][j][h] = baryCenter[j][h] / convolution[i][j][h]
                }
            }
        }
    }

    return baryCenter;
}

XAC.compute2DGaussianKernel = function(sigma, size) {
    var kernel = XAC.initMDArray([size, size], 0);
    var sumVal = 0;
    for (var i = 0; i < size; i++) {
        x = XAC.float2int(-size / 2) + i;
        for (var j = 0; j < size; j++) {
            y = XAC.float2int(-size / 2) + j;
            kernel[i][j] = Math.exp(-(x * x + y * y) * 1.0 / (2.0 * sigma * sigma));
            sumVal += kernel[i][j];
        }
    }

    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            kernel[i][j] /= sumVal;
        }
    }

    // for (var i = 0; i < size; i++) {
    // 	log(kernel[i])
    // }
    return kernel;
}

XAC.convolve2D = function(input, output, kernel) {
    var m = input.length;
    var n = input[0].length;
    var k = kernel.length;

    for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
            var cnvl = 0;
            for (var ki = 0; ki < k; ki++) {
                for (var kj = 0; kj < k; kj++) {
                    var ii = i - XAC.float2int(k / 2.0) + ki;
                    var jj = j - XAC.float2int(k / 2.0) + kj;
                    if (ii < 0 || ii >= m || jj < 0 || jj >= n) {
                        continue;
                    }
                    cnvl += input[ii][jj] * kernel[ki][kj];
                } // ki of kernel
            } // kj of kernel

            output[i][j] = cnvl;
        } // i of output
    } // j of output
}


var dimDebug = XAC.getParameterByName('dim', window.location);
// DEBUG: mass transport 1d
if (dimDebug == 1) {
    var n = 25;
    var f1 = [];
    var f2 = [];

    var computePDF = function(f) {
        var pdf = [];
        for (var i = 0; i < f1.length; i++) {
            pdf.push(f[i] + (pdf[i - 1] == undefined ? 0 : pdf[i - 1]));
        }
        return pdf;
    }

    var visualizeDistr = function(f) {
        var bar = '';
        for (var i = 0; i < f.length; i++) {
            bar += (i < 10 ? '0' : '') + i + ' '
            for (var j = 0; j < f[i]; j++) {
                bar += '*'
            }
            bar += '\n'
        }
        log(bar)
    }

    var getDistr = function(pdf) {
        var f = [pdf[0]];
        for (var i = 0; i < pdf.length - 1; i++) {
            f.push(pdf[i + 1] - pdf[i])
        }
        return f;
    }

    var polarized = true;
    var seed = n / 3; //XAC.float2int(n / 2 * Math.random())
    var sumf1 = 0;
    var sumf2 = 0;
    for (var i = 0; i < n; i++) {
        f1[i] = 30 * Math.pow(1 - Math.abs(i - seed) / n, 10);
        f2[i] = 30 * Math.pow(1 - Math.abs(i - n + seed) / n, 10);
    }

    visualizeDistr(f1);
    log('----')

    visualizeDistr(f2);
    log('----')

    // naive linear interpolation
    var t = 0.95;
    var fint1 = [];
    for (var i = 0; i < f1.length; i++) {
        fint1[i] = t * f1[i] + (1 - t) * f2[i];
    }
    visualizeDistr(fint1);
    log('----')

    // mass transport
    var mt = XAC.computeBarycenter([
        [f1],
        [f2]
    ], [1 - t, t], 100);
    visualizeDistr(mt[0]);
}
// DEBUG mass transport 2d
else if (dimDebug == 2) {
    t = 0.5;

    // show distance fields
    mi1 = new FORTE.MixedInitiatives(FORTE.canvasScene, FORTE.canvasCamera);
    mi1._showDistanceField(df1, new THREE.Vector3(-50, 0, 0));
    mi2 = new FORTE.MixedInitiatives(FORTE.canvasScene, FORTE.canvasCamera);
    mi2._showDistanceField(df2, new THREE.Vector3(50, 0, 0));
    mili = new FORTE.MixedInitiatives(FORTE.canvasScene, FORTE.canvasCamera);
    mili._interpolateDistanceFields(df1, df2, t);

    var m = df1.length;
    var n = df1[0].length;
    var df2d1 = XAC.initMDArray([m, n], 0);
    var df2d2 = XAC.initMDArray([m, n], 0);
    var sumdf1 = 0.0;
    var sumdf2 = 0.0;
    for (var i = 0; i < m; i++) {
        for (var j = 0; j < n; j++) {
            df2d1[i][j] = Math.max(XAC.EPSILON, Math.exp(-df1[i][j][0]));
            // sumdf1 += df2d1[i][j];
            df2d2[i][j] = Math.max(XAC.EPSILON, Math.exp(-df2[i][j][0]));
            // sumdf2 += df2d2[i][j];
        }
    }

    // for (var i = 0; i < m; i++) {
    // 	for (var j = 0; j < n; j++) {
    // 		df2d1[i][j] = Math.max(XAC.EPSILON, df2d1[i][j] / sumdf1);
    // 		df2d2[i][j] = Math.max(XAC.EPSILON, df2d2[i][j] / sumdf2);
    // 	}
    // }

    log('precomputing')
    step = 0.02
    for (var t = 1; t >= 0.85; t -= step) {
        log('t = ' + t);
        var df2dt = XAC.computeBarycenter([
            df2d1,
            df2d2
        ], [t, 1 - t], 50);
        var dfmt = XAC.initMDArray([m, n, 1], 0);
        var mindf = m + n;
        var maxdf = 0;
        // var summt = sumdf1 * t + sumdf2 * (1 - t);
        for (var i = 0; i < m; i++) {
            for (var j = 0; j < n; j++) {
                dfmt[i][j][0] = -Math.log(Math.max(XAC.EPSILON, df2dt[i][j]));
                // mindf = Math.min(mindf, dfmt[i][j][0]);
                // maxdf = Math.max(maxdf, dfmt[i][j][0]);
            }
        }
        // for (var i = 0; i < m; i++) {
        // 	for (var j = 0; j < n; j++) {
        // 		dfmt[i][j][0] = maxdf * (dfmt[i][j][0] - mindf) / (maxdf - mindf);
        // 	}
        // }
        dfmts.push(dfmt);
    }

    idxt = XAC.float2int(dfmts.length / 2);

    // log(JSON.stringify(dfmt))
    mimt = new FORTE.MixedInitiatives(FORTE.canvasScene, FORTE.canvasCamera);
    mimt._showDistanceField(dfmts[idxt], new THREE.Vector3(0, 50, 0));
}


// DEBUG: server communication
// try {
// XAC.pingServer(FORTE.xmlhttp, 'localhost', '9999', ['tpd'], ['testpath']);
// log('server ok')
// } catch (e) {
// err('cannot connect to server')
// }


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



        // // case #1: elm is indep
        // if (elm._projEdge != undefined) {
        //     elm.node1 = _interpolate(elm._node1, elm._projNode1, t);
        //     elm.node2 = _interpolate(elm._node2, elm._projNode2, t);
        //     for (var j = 0; j < elm._projEdge.points.length; j++) {
        //         elm.edge.points.push(_interpolate(elm._edge.points[j], elm._projEdge.points[
        //             j], t));
        //         elm.edge.thickness[j].push(_interpolate(elm._edge.thickness[j], elm._projEdge
        //             .thickness[j], t));
        //     }
        // }
        // // case #2: elm is partially projected or dependent on other elms
        // else {
        //     var nodes = [elm.node1, elm.node2];
        //     var dps = [elm._dp1, elm._dp2];
        //     var projNodes = [elm._projNode1, elm._projNode2];
        //     for (var i = 0; i < dps.length; i++) {
        //         if (dps[i] != undefined) {
        //             _updateElm(dps[i].elm, t);
        //             nodes[i] = dps[i].elm.edge.points[dps[i].idx];
        //         } else if (projNodes[i] != undefined) {
        //             nodes[i] = _interpolate(nodes[i], projNodes[i], t);
        //         } else {
        //             err('we have a problem ...')
        //         }
        //     }
        // }


        // here assume all the dependencies are on the original design
        // var computeProjection = function(design, elm) {
        //     var dp1 = elm._dp1;
        //     var dp2 = elm._dp2;
        //
        //     var projInfo = {
        //         projection: undefined,
        //         path: undefined
        //     };
        //     var intpnt1 = dp1.elm == undefined ? undefined : dp1.elm.points[elm._dp1.idxIntPnt];
        //     var intpnt2 = dp2.elm == undefined ? undefined : dp2.elm.points[elm._dp2.idxIntPnt];
        //
        //     if (dp1.elm == undefined && dp1.elm == undefined) {
        //         return;
        //     }
        //
        //     if (dp1.elm != undefined && dp1.elm != undefined) {
        //         // TODO: handle later
        //         project
        //     } else {
        //         // if one of the ends is one the original design, gonna project the other end
        //         var node = intpnt1 != undefined ? elm._node2 : elm._node1;
        //     }
        // }

        if (elm._neighbors1.) {
            for (var k = 0; k < dps.length; k++) {
                if (neighbors[k].length == 0) {
                    projectToGround
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

        // switch (dps[i].type) {
        //     case 0: // depend on original design
        //         // interpolate in geodesic space
        //         if (dps[i].path != undefined) {
        //             var idx = XAC.float2int(dps[i].path.length * t);
        //             nodes[i].coppy(dps[i].path[idx]);
        //         } else {
        //             nodes[i].copy(_nodes[i].clone());
        //         }
        //         break;
        //     case 1: // depend on new design
        // if (elm == dps[i].elm && dps[i].projection != undefined) {
        //     nodes[i].copy(_nodes[i].clone().times(t).add(dps[i].projection.clone().times(
        //         1 - t)));
        //     // addABall(FORTE.canvasScene, new THREE.Vector3().fromArray(nodes[i]), 0xffff00, 2,
        //     //     0.5);
        // } else {

        // addABall(FORTE.canvasScene, new THREE.Vector3().fromArray(nodes[i]), 0x00ff00, 2,
        //     0.5);
        // }
        //         break;
        // }


        FORTE.MixedInitiatives.prototype.buildDependencyGraph = function(designOriginal, designNew,
            boundaries) {
            //
            //
            // helper methods
            var getIntersectingEdge = function(pos, edges, oneHit) {
                var intEdgesInfo = [];
                var rndnum = Math.random() * 10;
                for (var i = edges.length - 1; i >= 0; i--) {
                    var edge = edges[i];
                    var points = edge.points;
                    var thickness = edge.thickness;

                    var idxIntPnt = undefined;
                    if (XAC.getDist(pos, edge.node1) < thickness[0] * 4) {
                        idxIntPnt = 0;
                    } else if (XAC.getDist(pos, edge.node2) < thickness[0] * 4) {
                        idxIntPnt = points.length - 1;
                    } else {
                        for (var j = points.length - 1; j >= 0; j--) {
                            if (XAC.getDist(pos, points[j]) < thickness[j] * 2) {
                                idxIntPnt = j;
                                break;
                            }
                        } // for the poitns on each edge
                    }

                    if (idxIntPnt != undefined) {
                        var edgeInfo = {
                            idxEdge: i,
                            idxIntPnt: idxIntPnt
                        };
                        if (oneHit == true) {
                            return edgeInfo;
                        }
                        intEdgesInfo.push(edgeInfo);
                    }
                } // for each edge
                return intEdgesInfo;
            };

            var project = function(design, node, showLine) {
                var minDist = Number.MAX_VALUE;
                var projection = undefined;
                var idxProjEdge = -1;
                var idxIntPnt = -1;
                for (var i = 0; i < design.length; i++) {
                    for (var j = 0; j < design[i].points.length; j++) {
                        var dist = XAC.getDist(node, design[i].points[j]);
                        if (dist < minDist) {
                            minDist = dist;
                            projection = design[i].points[j];
                            idxIntPnt = j;
                            idxProjEdge = i;
                        }
                    }
                }

                if (showLine == true) addALine(FORTE.canvasScene, new THREE.Vector3().fromArray(node), new THREE.Vector3()
                    .fromArray(projection), 0xff0000);
                return {
                    idxEdge: idxProjEdge,
                    proj: projection,
                    idxIntPnt: idxIntPnt
                };
            };

            // find a path from node1 to node2
            var neighborsOriginal = undefined;
            var find = function(i, j, k, record) {
                if (i == j) {
                    return [];
                }

                // for (var k = 0; k < neighborsOriginal[i].length; k++) {
                var nbgrs = neighborsOriginal[i][k];
                for (var h = 0; h < nbgrs.length; h++) {
                    if (nbgrs[h] == j) return [i];
                    // if (record[nbgrs[h]] == true) continue;
                }

                for (var h = 0; h < nbgrs.length; h++) {
                    // if (record[nbgrs[h]] == true) continue;
                    var kk = neighborsOriginal[nbgrs[h]][0].indexOf(i) >= 0 ? 1 : 0;
                    var path = find(nbgrs[h], j, kk, record);
                    if (path != undefined) {
                        return [i].concat(path);
                        // return path; // FIXME: for now exit when found, not optimized for shortest path
                    }
                    // record[nbgrs[h]] = true;
                }
                // }
                return undefined;
            };

            var getPointsOnPath = function(design, idxElm1, idxElm2, idxIntPnt1, idxIntPnt2) {
                // make sure a connectivity graph is built for original design
                // NOTE: this step is not needed when actually deployed
                if (neighborsOriginal == undefined) {
                    neighborsOriginal = XAC.initMDArray([design.length, 2], undefined);
                    for (var i = 0; i < designOriginal.length; i++) {
                        var nodes = [designOriginal[i].node1, designOriginal[i].node2];
                        for (var j = 0; j < nodes.length; j++) {
                            neighborsOriginal[i][j] = [];
                            var edgesInfo = getIntersectingEdge(nodes[j], designOriginal);
                            for (var k = 0; k < edgesInfo.length; k++) {
                                if (edgesInfo[k].idxEdge != i) {
                                    neighborsOriginal[i][j].push(edgesInfo[k].idxEdge);
                                }
                            }
                        }
                    }

                    // // do a pass address 'T' type connection
                    // for (var i = 0; i < neighborsOriginal.length; i++) {
                    //     var nbgrs = neighborsOriginal[i];
                    //     for (var j = 0; j < nbgrs.length; j++) {
                    //         for (var k = 0; k < nbgrs[j].length; k++) {
                    //             var idxNbgr = nbgrs[j][k];
                    //             if (neighborsOriginal[idxNbgr][0].indexOf(i) < 0 &&
                    //                 neighborsOriginal[idxNbgr][1].indexOf(i) < 0) {
                    //                 neighborsOriginal[idxNbgr][0].push(i);
                    //             }
                    //         }
                    //     }
                    // }

                    // log(neighborsOriginal);
                }
                var record = XAC.initMDArray([neighborsOriginal.length], false)
                record[idxElm1] = true;
                var path1 = find(idxElm1, idxElm2, 0, record); // || find(idxElm2, idxElm1, 0, record).reverse();
                var path2 = find(idxElm1, idxElm2, 1, record); // || find(idxElm2, idxElm1, 1, record).reverse();

                if (path1 == undefined && path2 == undefined) {
                    path1 = find(idxElm2, idxElm1, 0, record);
                    if (path1 != undefined) path1.reverse();
                    path2 = find(idxElm2, idxElm1, 1, record);
                    if (path2 != undefined) path2.reverse();
                }

                if (path1 != undefined && path2 != undefined) {
                    path = path2.length < path1.length ? path2 : path1;
                } else if (path1 != undefined || path2 != undefined) {
                    path = path1 || path2;
                } else {
                    err('disconnected components');
                }

                if (path[0] != idxElm1) path.unshift(idxElm1);
                if (idxElm1 != idxElm2) path.push(idxElm2);
                // log(path)

                // divide the path by mid point
                // var lenPath = 0;
                var pointsOnPath = [];
                for (var i = 0; i < path.length; i++) {
                    var idx = path[i];
                    var edge = design[idx];
                    var start, end;
                    if (i == 0) {
                        start = idxIntPnt1;
                        if (path.length > 1) {
                            end = neighborsOriginal[idx][0].indexOf(path[i + 1]) >= 0 ? 0 : edge.points.length -
                                1;
                        } else {
                            end = idxIntPnt2;
                        }
                    } else if (i == path.length - 1) {
                        end = idxIntPnt2;
                        start = neighborsOriginal[idx][0].indexOf(path[i - 1]) >= 0 ? 0 : edge.points.length -
                            1;
                    } else {
                        var lastPoint = pointsOnPath.slice(-1)[0];
                        if (XAC.getDist(lastPoint, edge.points[0]) < XAC.getDist(lastPoint, edge.points.slice(-
                                1)[0])) {
                            start = 0;
                            end = edge.points.length - 1;
                        } else {
                            start = edge.points.length - 1;
                            end = 0;
                        }

                    }
                    // if (start > end) {
                    //     var tmp = start;
                    //     start = end;
                    //     end = tmp;
                    // }
                    var sign = end >= start ? 1 : -1;
                    // if(end < start) {
                    // log([path[i] + ': ', start, end])
                    // }

                    for (var j = start; sign * j <= sign * end; j += sign) {
                        // var lastPoint = pointsOnPath.slice(-1)[0];
                        // lenPath += lastPoint == undefined ? 0 : XAC.getDist(edge.points[j], lastPoint);
                        pointsOnPath.push(edge.points[j]);
                    }
                }

                return pointsOnPath;
            }

            var projectOneEnd = function(design, dp, idxElm, idxIntPnt, showPath) {
                dp.isIndependent = true;
                dp.path = getPointsOnPath(design, dp.idxElm, idxElm, dp.idxIntPnt, idxIntPnt).reverse();
                if (showPath)
                    for (var i = 0; i < dp.path.length; i++) {
                        var pos = dp.path[i]
                        addABall(FORTE.canvasScene, new THREE.Vector3().fromArray(pos), 0xff0000, 1 + i *
                            4.0 / dp.path.length, 0.25 + i *
                            0.5 / dp.path.length);
                    }

            }

            var projectTwoEnds = function(design, dp1, dp2) {
                pointsOnPath = getPointsOnPath(design, dp1.idxElm, dp2.idxElm, dp1.idxIntPnt, dp2.idxIntPnt);

                var lenPath = 0;
                for (var i = 0; i < pointsOnPath.length; i++) {
                    var lastPoint = pointsOnPath[i - 1];
                    lenPath += lastPoint == undefined ? 0 : XAC.getDist(pointsOnPath[i], lastPoint);
                }

                var lenHalf = 0;
                var idxHalf = -1;
                for (var i = 0; i < pointsOnPath.length; i++) {
                    var lastPoint = pointsOnPath[i - 1];
                    dLen = lastPoint == undefined ? 0 : XAC.getDist(pointsOnPath[i], lastPoint);
                    if (lenHalf <= lenPath / 2 && lenHalf + dLen >= lenPath / 2) {
                        idxHalf = i;
                        break;
                    }
                    lenHalf += dLen;
                }

                dp1.path = pointsOnPath.slice(0, idxHalf).reverse();
                dp2.path = pointsOnPath.slice(idxHalf);
            };

            var independentNumber = function(elm) {
                var num = 0;
                if (elm._dp1.isIndependent) num++;
                if (elm._dp2.isIndependent) num++;
                return num;
            }

            this._graph = [];

            // initialization, find connectivity between edges & compute projection
            for (var idx = 0; idx < designNew.length; idx++) {
                var edge = designNew[idx];

                var elm = {
                    // original stuff
                    _id: idx,
                    _node1: edge.node1,
                    _node2: edge.node2,
                    _edge: {
                        points: XAC.copyArray(edge.points),
                        thickness: XAC.copyArray(edge.thickness)
                    },

                    // connectivity, storing indices of neighbors
                    _neighbors1: [],
                    _neighbors2: [],

                    // corresponded & projection stuff
                    _dp1: {
                        idxElm: -1, // index of the elm in the graph (mostly for debug use)
                        elm: undefined, // elm to depend upon
                        idx: -1, // which point on the dependUpon is the closest
                        projection: undefined,
                        path: undefined
                    },
                    _dp2: {
                        idxElm: -1,
                        elm: undefined,
                        idx: -1,
                        projection: undefined,
                        path: undefined
                    },

                    // interpolated stuff
                    node1: [],
                    node2: [],
                    edge: {
                        points: [],
                        thickness: []
                    }
                };

                var nodes = [elm._node1, elm._node2];
                var dps = [elm._dp1, elm._dp2];
                var neighbors = [elm._neighbors1, elm._neighbors2];
                // log(idx)
                for (var j = 0; j < nodes.length; j++) {
                    var edgesInfo = getIntersectingEdge(nodes[j], designNew);
                    for (var k = 0; k < edgesInfo.length; k++) {
                        if (edgesInfo[k].idxEdge != idx) {
                            neighbors[j].push({
                                idxElm: edgesInfo[k].idxEdge,
                                idxIntPnt: edgesInfo[k].idxIntPnt
                            });
                        }
                    }

                    // indices = [];
                    // neighbors[j].forEach(function(e) {
                    //     indices.push(e.idxElm)
                    // });
                    // log(indices);

                    // if a node has no neighbors and doesn't rest on the original design
                    // stick it to the ground
                    // if (neighbors[j].length == 0 && dps[j].elm == undefined) {
                    //     dps[j].projection = projectToGround(designOriginal, boundaries, nodes[j]);
                    // }
                }

                //
                // decide which edge to project on
                //
                var votes = XAC.initMDArray([designOriginal.length], 0);
                votes[project(designOriginal, elm._node1).idxEdge]++;
                votes[project(designOriginal, elm._node2).idxEdge]++;
                for (var j = 0; j < elm._edge.points.length; j++) {
                    votes[project(designOriginal, elm._edge.points[j]).idxEdge]++;
                }

                var idxProjEdge = -1;
                var maxVote = Number.MIN_VALUE;
                for (var j = 0; j < votes.length; j++) {
                    if (votes[j] > maxVote) {
                        maxVote = votes[j];
                        idxProjEdge = j;
                    }
                }

                var projEdge = designOriginal[idxProjEdge];
                var v1 = new THREE.Vector3().fromArray(elm._node1.clone().sub(elm._node2));
                var v2 = new THREE.Vector3().fromArray(projEdge.node1.clone().sub(projEdge.node2));
                var angle = v1.angleTo(v2);
                if (v1.angleTo(v2) < v2.angleTo(v1.clone().multiplyScalar(-1))) {
                    elm._dp1.projection = projEdge.node1;
                    elm._dp1.idxIntPnt = 0;
                    elm._dp2.projection = projEdge.node2;
                    elm._dp2.idxIntPnt = projEdge.points.length - 1;
                } else {
                    elm._dp1.projection = projEdge.node2;
                    elm._dp1.idxIntPnt = projEdge.points.length - 1;
                    elm._dp2.projection = projEdge.node1;
                    elm._dp2.idxIntPnt = 0;
                }
                elm._dp1.idxEdge = elm._dp2.idxEdge = idxProjEdge;

                if (idx == -1) {
                    log([v1.angleTo(v2), v2.angleTo(v1.clone().multiplyScalar(-1))])
                    addALine(FORTE.canvasScene, new THREE.Vector3().fromArray(elm._node1), new THREE.Vector3()
                        .fromArray(elm._dp1.projection), 0xff0000);
                    addALine(FORTE.canvasScene, new THREE.Vector3().fromArray(elm._node2), new THREE.Vector3()
                        .fromArray(elm._dp2.projection), 0xff0000);
                }

                // log(idx)
                // log(votes)

                this._graph.push(elm);
            }

            //  find correspondence to original design and boundary
            for (var idx = 0; idx < this._graph.length; idx++) {
                var elm = this._graph[idx];
                var dps = [elm._dp1, elm._dp2];
                var posNodes = [elm._node1, elm._node2];
                var projNodes = [elm._projNode1, elm._projNode2];
                var neighbors = [elm._neighbors1, elm._neighbors2];

                //
                // find incident edge from the original design, if there is any
                //
                for (var k = 0; k < dps.length; k++) {
                    var pos = posNodes[k];
                    for (var i = designOriginal.length - 1; i >= 0 && dps[k].elm == undefined; i--) {
                        var edge = designOriginal[i];
                        var points = edge.points;
                        var thickness = edge.thickness;
                        for (var j = points.length - 1; j >= 0; j--) {
                            if (XAC.getDist(pos, points[j]) < thickness[j] * 4) {
                                dps[k].type = 0; // original
                                dps[k].elm = edge
                                dps[k].idxIntPnt = j;
                                dps[k].idxElm = i;
                                dps[k].isIndependent = true;
                                // addABall(this._scene, new THREE.Vector3().fromArray(pos), 0xff0000, 5, 1);
                                break;
                            }
                        } // for the poitns on each edge
                    } // for each edge
                } // for each dependency

                //
                // compute projections
                //
                // if (elm._dp1.elm == undefined && elm._dp2.elm == undefined) {
                //
                // }
                // // both ends on original design
                // else if (elm._dp1.elm != undefined && elm._dp2.elm != undefined) {
                //     // log(elm._id)
                //     // addABall(this._scene, new THREE.Vector3().fromArray(elm._dp1.elm.points[elm._dp1.idxIntPnt]), 0xff0000, 2.5, 0.5);
                //     // addABall(this._scene, new THREE.Vector3().fromArray(elm._dp2.elm.points[elm._dp2.idxIntPnt]), 0x00ff00, 2.5, 0.5);
                //     projectTwoEnds(designOriginal, elm._dp1, elm._dp2);
                //     elm._dp1.isIndependent = true;
                //     elm._dp2.isIndependent = true;
                // } else {
                //     var dp = elm._dp1.elm != undefined ? elm._dp1 : elm._dp2;
                //     var dp2 = dp == elm._dp1 ? elm._dp2 : elm._dp1;
                //     var nodeToProj = elm._dp1.elm != undefined ? elm._node2 : elm._node1;
                //     var projInfo = project(designOriginal, nodeToProj, true);
                //     if (elm._id == 0) {
                //         log('')
                //     }
                //     projectOneEnd(designOriginal, dp, dp2.idxEdge, dp2.idxIntPnt, elm._id == -1);
                //     // dp2.projection = projInfo.proj;
                //     // dp2.isIndependent = true;
                //     // addABall(this._scene, new THREE.Vector3().fromArray(dp.projection), 0x00ff00, 2.5, 0.5);
                // }

                // one end on original design
                // else {
                // var dp = elm._dp1.elm == undefined ? elm._dp1 : elm._dp2;
                // var node = elm._dp1.elm == undefined ? elm._node1 : elm._node2;
                // dp.projection = project(designOriginal, node);
                // }
            }

            // find inter-correspondence in new design
            for (var idx = 0; idx < this._graph.length; idx++) {
                var elm = this._graph[idx];
                var dps = [elm._dp1, elm._dp2];
                var nodes = [elm._node1, elm._node2];
                var neighbors = [elm._neighbors1, elm._neighbors2];
                var indnum = independentNumber(elm);
                for (var j = 0; j < dps.length; j++) {
                    if (dps[j].isIndependent != true) {
                        for (var k = 0; k < neighbors[j].length; k++) {
                            var idxNeighbor = neighbors[j][k].idxElm;
                            var idxIntPnt = neighbors[j][k].idxIntPnt;
                            var elmNeighbor = this._graph[idxNeighbor];
                            // if ((elmNeighbor._dp1.isIndependent) && (elmNeighbor._dp2.isIndependent)) {
                            if(indnum < independentNumber(elmNeighbor)){
                                dps[j].type = 1; // new design
                                dps[j].elm = elmNeighbor;
                                dps[j].idxElm = idxNeighbor;
                                dps[j].idxIntPnt = idxIntPnt;
                                dps[j].dp = elmNeighbor._neighbors1.indexOf(idx) > 0 ? elmNeighbor._dp1 :
                                    elmNeighbor._dp2;
                                break;
                            }
                        }

                        // if find no dependUpons, depend on itself
                        if (dps[j].elm == undefined) {
                            dps[j].type = 1;
                            dps[j].elm = elm;
                            dps[j].idxElm = idx;
                            dps[j].isIndependent = true;
                            // dps[j].projection = project(designOriginal, nodes[j]);
                            // log(elm._id)
                            // addABall(this._scene, new THREE.Vector3().fromArray(nodes[j]), 0xff0000, 2.5, 0.5);

                        }
                    } // looking for neighbor to depend on
                } // each node (2 in total)
            } // each graph elm

            for (var idx = 0; idx < this._graph.length; idx++) {
                var elm = this._graph[idx];

                if (elm._dp1.type != 0 && elm._dp2.type != 0) {

                } else if (elm._dp1.type == 0 && elm._dp2.type == 0) {
                    // log(elm._id)
                    // addABall(this._scene, new THREE.Vector3().fromArray(elm._dp1.elm.points[elm._dp1.idxIntPnt]), 0xff0000, 2.5, 0.5);
                    // addABall(this._scene, new THREE.Vector3().fromArray(elm._dp2.elm.points[elm._dp2.idxIntPnt]), 0x00ff00, 2.5, 0.5);
                    projectTwoEnds(designOriginal, elm._dp1, elm._dp2);
                    elm._dp1.isIndependent = true;
                    elm._dp2.isIndependent = true;
                } else {
                    var dp1 = elm._dp1.type == 0 ? elm._dp1 : elm._dp2;
                    var dp2 = dp1 == elm._dp1 ? elm._dp2 : elm._dp1;
                    var nodeToProj = elm._dp1.type == 0 ? elm._node2 : elm._node1;
                    // var projInfo = project(designOriginal, nodeToProj, true);
                    var dp = dp2;
                    // log(idx);
                    for (; dp.isIndependent != true; dp = dp.dp) {}

                    if (elm._id == 3) {
                        log('-')
                    }
                    projectOneEnd(designOriginal, dp1, dp.idxEdge, dp.idxIntPnt, elm._id == -1);
                    // dp2.projection = projInfo.proj;
                    // dp2.isIndependent = true;
                    // addABall(this._scene, new THREE.Vector3().fromArray(dp.projection), 0x00ff00, 2.5, 0.5);
                }
            }


            // for (var idx = 0; idx < this._graph.length; idx++) {
            //     log(idx)
            //     var elm = this._graph[idx];
            //     log([elm._dp1.type == 1 ? elm._dp1.idxElm + '-' + elm._dp1.idxIntPnt : '',
            //         elm._dp2.type == 1 ? elm._dp2.idxElm + '-' + elm._dp2.idxIntPnt : ''
            //     ]);
            // }
        }

        //
        //
        //  return the interpolated new design (not including the original one)
        //
        FORTE.MixedInitiatives.prototype.interpolate = function(t) {
            if (this._graph == undefined) {
                return;
            }

            // recursive update routine
            var _updateElm = function(elm, t) {
                // log(elm._id);
                var dps = [elm._dp1, elm._dp2];
                var _nodes = [elm._node1, elm._node2];
                var nodes = [elm.node1, elm.node2];

                for (var i = 0; i < dps.length; i++) {
                    if (nodes[i].length > 0) {
                        continue;
                    }
                    if (dps[i].elm.needsUpdate) {
                        _updateElm(dps[i].elm, t);
                    }

                    if (dps[i].type == 1) {
                        var posSnapTo;
                        if (dps[i].idxIntPnt == 0) {
                            posSnapTo = dps[i].elm.node1;
                        } else if (dps[i].idxIntPnt == dps[i].elm.edge.points.length - 1) {
                            posSnapTo = dps[i].elm.node2;
                        } else {
                            posSnapTo = dps[i].elm.edge.points[dps[i].idxIntPnt];
                        }
                        nodes[i].copy(posSnapTo);
                    } else {
                        nodes[i].copy(_nodes[i]);
                    }
                }

                var len = XAC.getDist(elm._node1, elm._node2) + XAC.EPSILON;
                var dnode1 = elm.node1.clone().sub(elm._node1);
                var dnode2 = elm.node2.clone().sub(elm._node2);
                for (var i = 0; i < elm._edge.points.length; i++) {
                    var point = XAC.copyArray(elm._edge.points[i]);
                    point.add(dnode1.clone().times(1 - i * 1.0 / (elm._edge.points.length - 1)));
                    point.add(dnode2.clone().times(i * 1.0 / (elm._edge.points.length - 1)));
                    elm.edge.points.push(point);
                }

                // TODO: interpolate thickness
                elm.edge.thickness.copy(elm._edge.thickness);

                elm.needsUpdate = false;
            }

            // clean up previous values
            for (var i = 0; i < this._graph.length; i++) {
                this._graph[i].node1 = [];
                this._graph[i].node2 = [];
                this._graph[i].edge = {
                    points: [],
                    thickness: []
                }
                this._graph[i].needsUpdate = true;
            }

            var designInterpolated = [];

            // 1st pass: update independent elements (nodes)
            for (var i = 0; i < this._graph.length; i++) {
                var elm = this._graph[i];
                var dps = [elm._dp1, elm._dp2];
                var _nodes = [elm._node1, elm._node2];
                var nodes = [elm.node1, elm.node2];
                for (var k = 0; k < dps.length; k++) {
                    if (dps[k].isIndependent != true) continue;
                    if (dps[k].path != undefined) {
                        var idx = XAC.float2int(dps[k].path.length * t + 0.5);
                        idx = XAC.clamp(idx, 0, dps[k].path.length - 1);
                        // log([idx, dps[k].path.length]);
                        nodes[k].copy(dps[k].path[idx]);
                        // addABall(FORTE.canvasScene, new THREE.Vector3().fromArray(nodes[k]), 0xff0000, 2, 0.5);
                    } else if (dps[k].projection != undefined) {
                        nodes[k].copy(_nodes[k].clone().times(t).add(dps[k].projection.clone().times(1 - t)));
                    } else if (dps[k].type == 0) {
                        nodes[k].copy(_nodes[k].clone());
                    }
                }
            }

            // 2nd pass: update dependent elements
            for (var i = 0; i < this._graph.length; i++) {
                var elm = this._graph[i];
                if (elm.needsUpdate == true) {
                    _updateElm(elm, t);
                }

                designInterpolated.push({
                    node1: elm.node1,
                    node2: elm.node2,
                    points: elm.edge.points,
                    thickness: elm.edge.thickness
                });
            }

            return designInterpolated;
        }

// var container = $('<div></div>');
// container.css('width', FORTE.WIDTHCONTAINER + 'px');
// container.css('height', '100%');
// container.css('color', '#000000');
// container.css('background-color', 'rgba(192, 192, 192, 0.5)');
// container.css('top', '0px');
// container.css('right', '0px');
// container.css('position', 'absolute');
// container.css('font-family', 'Helvetica');
// container.css('font-size', '12px');
// container.css('overflow', 'auto');
//
// container.on('mousedown', function(e) {
//     log('propagation stopped');
//     e.stopPropagation();
// });
//
// var title = $('<h3></h3>');
// title.html('FORTE');
// title.css('margin-top', '10px');
// title.css('margin-bottom', '10px');
// title.css('margin-left', '10px');
// title.css('margin-right', '10px');
// container.append(title);
//
// var divAccordion = $('<div></div>');
// divAccordion.append($('<h3>Form</h3>'));
// divAccordion.append($('<div>Place holder</div>'));
// divAccordion.append($('<h3>Function</h3>'));
// divAccordion.append($('<div>Place holder</div>'));
// divAccordion.append($('<h3>Fabrication</h3>'));
// divAccordion.append($('<div>Place holder</div>'));
// container.append(divAccordion);
// divAccordion.accordion();
//
// return container;

// reader.onload = (function(e) {
// 	FORTE.designVariations = FORTE.designVariations == undefined ? [] : FORTE.designVariations;
// 	var designObject = JSON.parse(e.target.result);
// 	FORTE.Design.cleanup(designObject);
// 	if (designObject.original == true) {
// 		FORTE.design = FORTE.Design.fromRawData(designObject, FORTE.canvasScene, FORTE.canvasCamera);
// 	}
//
// 	FORTE.designVariations.push(designObject);
//
// 	if (FORTE.designVariations.length > 1) {
// 		FORTE.design.interpolate(FORTE.designVariations, [FORTE.t, 1 - FORTE.t]);
// 	}
// });


def transfer(df, slope, cutoff):
    return 1 / (1 + math.exp(slope * (cutoff-df)))

#
#   [xac] compute distance field (2d)
#
def get_distance_field(elms, nelx, nely):
    infinity = 1e6
    epsilon = 1e-6
    df = []

    # initialize distance field
    for i in xrange(0, nelx):
        row = []
        for j in xrange(0, nely):
            row.append(infinity)
        df.append(row)

    cnt = 0
    buf_prev = []
    num = nelx * nely
    max_val = 0
    neighbors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
    ]

    for elm_num in elms:
        # elm_num -= 1
        mpz = int(math.floor(elm_num / (nelx * nely)))
        mpx = int(math.floor((elm_num - mpz * (nelx * nely)) / nely))
        mpy = int(math.floor(elm_num - mpz * (nelx * nely) - mpx * nely))
        df[mpx][mpy] = 0
        buf_prev.append([mpx, mpy])
        cnt += 1

    while cnt < num:
        buf = []
        for idx in buf_prev:
            val_df = df[idx[0]][idx[1]]
            for didx in neighbors:
                ii = idx[0] + didx[0]
                jj = idx[1] + didx[1]
                if 0<=ii and ii<nelx and 0<=jj and jj<nely:
                    # print df[ii][jj]
                    if df[ii][jj] == infinity:
                        df[ii][jj] = val_df + 1
                        max_val = max(df[ii][jj], max_val)
                        buf.append([ii, jj])
                        cnt += 1
        buf_prev = list(buf)

    # print max_val

    # slope = 64
    # cutoff = 0.1
    # tr_min = transfer(0, slope, cutoff)
    # tr_max = transfer(1, slope, cutoff)
    # max_val *= 1.0
    # for i in xrange(0, nelx):
    #     for j in xrange(0, nely):
    #         df[i][j] /= max_val
    #         df[i][j] = max(epsilon, df[i][j])
    #         tr_df = transfer(df[i][j], slope, cutoff)
    #         df[i][j] = (tr_df - tr_min) / (tr_max - tr_min)

    return df


    # for i in xrange(0, len(flatx)):
    #     mpz = int(math.floor(i / (self.nelx * self.nely)))
    #     mpx = int(math.floor((i - mpz * (self.nelx * self.nely)) / self.nely))
    #     mpy = int(math.floor(i - mpz * (self.nelx * self.nely) - mpx * self.nely))
    #     df_val = self.df_disfavored[mpx][mpy]
        # flatx[i] = (self.t_disf * df_val + (1 - self.t_disf) * flatx[i]) if flatx[i] > df_val else flatx[i]
        #
        # df_relaxed = max(VOID, math.sqrt(1 - df_val))
        # shrinking = self.transfer(df_val)
        # df_relaxed = max(VOID, pow(1 - df_val, 2))
        # flatx[i] = VOID if flatx[i] > df_relaxed else flatx[i]
        #
        # flatx[i] = SOLID if df_val <= 3 else flatx[i]
        #
        # flatx[i] = self.transfer(flatx[i], df_val, 64, self.t_disf)
        #
        # tr_df = self.transfer(df_val, slope, self.t_disf)
        # tr_df = (tr_df - tr_min) / (tr_max - tr_min)
        # flatx[i] *= tr_df


        # desvars[k, j, i] = VOID if df_val <= 2 else desvars[k, j, i]

        # df_relaxed = max(VOID, math.sqrt(1 - df_val))
        # shrinking = self.transfer(df_val)
        # df_relaxed = max(VOID, pow(1 - df_val, 2))
        # desvars[k, j, i] = VOID if desvars[k, j, i] > df_relaxed else desvars[k, j, i]


        # retrieve all elements that are connected to a given node
        def node2elms(nelx, nely, nelz, idx):
            noz = int(idx / ((nelx + 1) * (nely + 1)))
            nox = int((idx - noz * (nelx + 1) * (nely + 1)) / (nely + 1))
            noy = int(idx - noz * (nelx + 1) * (nely + 1) - nox * (nely + 1))

            elms = []
            for i in xrange(nox-1, nox+1):
                for j in xrange(noy-1, noy+1):
                    for k in xrange(noz-1, noz+1):
        				if 0 <= i and i < nelx and 0 <= j and j < nely and 0 <= k and k < nelz:
        					elms.append([i, j, k])

        	return elms

        def comp_disp(disp_str, nelx, nely, nelz, vxg):
            arrDisp = disp_str.split(',')

        	# initialize displacement arrays for the elements
            # dispElms = np.ndarray(shape=(1, nely, nelx), dtype=float, order='F')
            dispElms = []
            for i in xrange(0, nelx):
                dispElms_yz = []
                for j in xrange(0, nely):
                    dispElms_z = []
                    for k in xrange(0, nelz):
                        dispElms_z.append([])
                    dispElms_yz.append(dispElms_z)
                dispElms.append(dispElms_yz)

        	# collect displacement vector for corresponding elements
            for i in xrange(0, len(arrDisp)-2, 3):
                dispNode = [float(arrDisp[i]), float(arrDisp[i + 1]), float(arrDisp[i + 2])]
                elmsOfNode = node2elms(nelx, nely, nelz, i / 3)
                for j in xrange(0, len(elmsOfNode)):
                    idxElm = elmsOfNode[j]
                    disps = dispElms[idxElm[0]][idxElm[1]][idxElm[2]]
                    disps.append(dispNode)

            p = 3
        	# obtain the average displacement vector for each element
            for i in xrange(0, nelx):
        		for j in xrange(0, nely):
        			for k in xrange(0, nelz):
        				vdisp = [0, 0, 0]
                        for h in xrange(0, len(dispElms[i][j][k])):
                            disp_h = dispElms[i][j][k][h]
                            vdisp = [x + y for x, y in zip(vdisp, disp_h)]
                        vdisp = [x / len(dispElms[i][j][k]) for x in vdisp]

        				# take into account the penalty
                        xe = vxg[j][i] # density at this voxel
                        vdisp = [x * pow(xe, p) for x in vdisp]

                        dispElms[i][j][k] = [] # release the original array
                        dispElms[i][j][k] = vdisp # assign the displacement vector

            return dispElms
