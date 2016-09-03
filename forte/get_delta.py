#!/usr/bin/env python

##########################################################################
#
#   get delta design by optimization
#
##########################################################################

from sys import argv
import json
from skeletonize import vxgs_to_edges

if __name__ == "__main__":
    if len(argv) < 4:
        print 'usage: ./get_delta.py <path_to_design> <path_to_optimization_data> <problem_name>'
        quit()

    path_design = argv[1]
    path_opt = argv[2]
    probname = argv[3]

    design_file = open(path_design, 'r')
    design_obj = json.loads(design_file.read())
    edges, thicknesses, w, h = vxgs_to_edges(path_opt, probname, design_obj)
    design_file.close()

    edgeObjs = []
    for edge in edges:
        edgeObj = {}
        edgeObj['node1'] = [edge[0][1], edge[0][0], 0]
        edgeObj['node2'] = [edge[-1][1], edge[-1][0], 0]
        edgeObj['points'] = [[p[1], p[0], 0] for p in edge]

        idx = edges.index(edge)
        edgeObj['thickness'] = thicknesses[idx]

        edgeObjs.append(edgeObj)

    delta = {}
    delta['design'] = edgeObjs

    print delta

    delta_file = open(path_design + '.delta', 'w')
    delta_file.write(json.dumps(delta))
    delta_file.close()
