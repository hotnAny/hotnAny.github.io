#!/usr/bin/env python

##########################################################################
#
#   topy server for project mashup
#
#   by xiangchen@acm.org
#
##########################################################################

from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
from urlparse import urlparse, parse_qs
import time
import sys
sys.path.append('./scripts')
import subprocess
import json
import math
import datetime

from nodenums import node_nums_3d
from nodenums import elm_num_3d
from optimise import main
import traceback

INFINITY = 1e9
EPSILON = 1e-9
ANALYSIS = 0
OPTIMIZATION = 1

tpd_template = '{"PROB_TYPE":"comp", "PROB_NAME":"NONAME", "ETA": "0.4", "DOF_PN": "3", "VOL_FRAC": "0.3", "FILT_RAD": "1.5", "ELEM_K": "H8", "NUM_ELEM_X":"10", "NUM_ELEM_Y":"10", "NUM_ELEM_Z":"10", "NUM_ITER":"50", "FXTR_NODE_X":"", "FXTR_NODE_Y":"", "FXTR_NODE_Z":"", "LOAD_NODE_X":"", "LOAD_VALU_X":"", "LOAD_NODE_Y":"", "LOAD_VALU_Y":"", "LOAD_NODE_Z":"", "LOAD_VALU_Z":"", "P_FAC":"1", "P_HOLD":"15", "P_INCR":"0.2", "P_CON":"1", "P_MAX":"3", "Q_FAC":"1", "Q_HOLD":"15", "Q_INCR":"0.05", "Q_CON":"1", "Q_MAX":"5"}';

test_data_03 = {"mashup":
['{"boundaries":[[[-93.58,-73.68,0.5],[-91.83,-73.68,0.5],[-86.21,-73.68,0.5],[-82.52,-73.68,0.5],[-77.55,-73.87,0.5],[-72.95,-74.05,0.5],[-68.62,-74.05,0.5],[-64.38,-74.05,0.5],[-60.24,-74.05,0.5],[-56.55,-74.05,0.5],[-52.5,-74.05,0.5],[-46.79,-74.05,0.5],[-43.84,-74.05,0.5],[-40.34,-74.79,0.5],[-33.48,-75.48,0.5],[-30.21,-75.89,0.5],[-25.79,-76.45,0.5],[-21,-76.91,0.5],[-16.21,-77.37,0.5],[-12.16,-77.37,0.5],[-8.11,-77.37,0.5],[5.85,-77.37,0.5],[23.02,-78.47,0.5],[23.58,-78.47,0.5]]],"design":[{"node1":[-126,67.79,0.5],"node2":[-51.06,-19.56,4.75],"points":[[-126,67.79,0.5],[-124.52,65.39,0.5],[-122.31,60.79,0.5],[-120.47,56.37,0.5],[-117.16,50.47,0.5],[-112.37,43.84,0.5],[-108.31,38.31,0.5],[-104.26,32.79,0.5],[-100.58,26.89,0.5],[-96.52,22.1,0.5],[-93.21,17.32,0.5],[-90.26,12.89,0.5],[-84.73,6.82,0.5],[-79.58,1.47,0.5],[-75.16,-2.21,0.5],[-70.74,-5.53,0.5],[-66.31,-8.11,0.5],[-62.26,-10.68,0.5],[-56.55,-13.82,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-51.06,-19.56,4.75],"node2":[-64.71,-70.96,1],"points":[[-51.06,-19.56,4.75],[-52.21,-20.22,1],[-52.21,-22.8,1],[-52.21,-25,1],[-52.21,-27.58,1],[-52.21,-30.15,1],[-52.21,-33.09,1],[-52.21,-36.03,1],[-52.21,-38.61,1],[-52.21,-41.18,1],[-52.58,-43.39,1],[-53.68,-45.22,1],[-54.6,-47.61,1],[-55.52,-50.37,1],[-55.89,-52.21,1],[-56.25,-53.68,1],[-56.62,-55.52,1],[-57.54,-57.91,1],[-58.64,-60.11,1],[-61.65,-66.28,1],[-64.59,-70.71,1],[-64.71,-70.96,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-51.06,-19.56,4.75],"node2":[0.72,-35.03,5.42],"points":[[-41.81,-21.18,0.5],[-35,-24.32,0.5],[-30.58,-26.16,0.5],[-25.79,-27.63,0.5],[-21.37,-28.74,0.5],[-16.58,-30.21,0.5],[-11.42,-31.32,0.5]],"thickness":[5,5,5,5,5,5,5]},{"node1":[0.72,-35.03,5.42],"node2":[53.05,-42.37,0.5],"points":[[10.68,-35.74,0.5],[16.95,-36.84,0.5],[22.84,-37.58,0.5],[27.63,-38.68,0.5],[33.71,-39.42,0.5],[43.29,-40.71,0.5],[52.18,-42.28,0.5],[53.05,-42.37,0.5]],"thickness":[5,5,5,5,5,5,5,5]},{"node1":[0.72,-35.03,5.42],"node2":[5.88,-75.01,1],"points":[[0.72,-35.03,5.42],[0.74,-36.77,1],[0.74,-39.34,1],[0.74,-41.91,1],[0.74,-44.49,1],[0.74,-48.17,1],[0.74,-51.47,1],[0.74,-54.78,1],[0.74,-57.72,1],[0.74,-59.56,1],[1.47,-61.77,1],[1.47,-62.87,1],[1.84,-64.34,1],[2.21,-65.45,1],[2.57,-66.55,1],[3.13,-68.48,1],[3.68,-69.49,1],[3.68,-70.96,1],[4.41,-72.06,1],[5.15,-73.35,1],[5.88,-75.01,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[{"points":[[-113.99,53.17,3.37],[-118.81,53.42,0.5],[-114.76,47.16,0.5],[-110.34,41.08,0.5],[-106.29,35.55,0.5],[-102.42,29.84,0.5],[-98.55,24.5,0.5],[-94.87,19.71,0.5],[-91.73,15.1,0.5],[-87.5,9.86,0.5],[-82.16,4.14,0.5],[-77.37,-0.37,0.5],[-72.95,-3.87,0.5],[-68.52,-6.82,0.5],[-64.29,-9.39,0.5],[-59.41,-12.25,0.5]],"vectors":[[-1.55,-1.06,0.08],[-1.56,-1.05,0.04],[-1.54,-1.08,0.04],[-1.51,-1.12,0.04],[-1.49,-1.15,0.04],[-1.46,-1.18,0.04],[-1.44,-1.21,0.04],[-1.41,-1.24,0.04],[-1.39,-1.27,0.03],[-1.36,-1.3,0.03],[-1.33,-1.33,0.03],[-1.3,-1.36,0.03],[-1.28,-1.38,0.03],[-1.26,-1.4,0.04],[-1.23,-1.42,0.04],[-1.21,-1.44,0.05]]},{"points":[[-37.92,-22.39,5.45],[-38.41,-22.75,0.5],[-32.79,-25.24,0.5],[-28.18,-26.89,0.5],[-23.58,-28.18,0.5],[-18.97,-29.47,0.5],[-14,-30.76,0.5],[-5.35,-33.17,2.96]],"vectors":[[-0.78,-2.84,0.17],[-0.79,-2.84,0.06],[-0.66,-2.87,0.06],[-0.56,-2.89,0.06],[-0.45,-2.91,0.06],[-0.35,-2.93,0.06],[-0.24,-2.94,0.06],[-0.04,-2.94,0.11]]},{"points":[[14.81,-35.4,5.38],[13.82,-36.29,0.5],[19.89,-37.21,0.5],[25.24,-38.13,0.5],[30.67,-39.05,0.5],[38.5,-40.06,0.5],[47.73,-41.49,0.5]],"vectors":[[0.05,-3.09,0.1],[0.04,-3.09,0.07],[0.07,-3.09,0.07],[0.1,-3.09,0.07],[0.14,-3.09,0.07],[0.18,-3.09,0.07],[0.23,-3.08,0.07]]}],"clearances":[[[2.98,27.92,1.9],[2.94,27.82,-3.1],[-52.27,-25.57,3.5],[-52.32,-25.67,-1.5],[-75.94,109.27,-4.1],[-75.9,109.37,0.9],[-131.2,55.78,-2.5],[-131.15,55.88,2.5]],[[21.73,26.12,1.77],[21.73,26.01,-3.22],[12.41,-33.74,3.06],[12.4,-33.84,-1.94],[-50.24,37.22,-3.34],[-50.23,37.33,1.65],[-59.56,-22.63,-2.06],[-59.56,-22.52,2.94]],[[55.62,13.89,1.37],[55.62,13.74,-3.62],[56.07,-38.75,3],[56.08,-38.91,-2],[4.81,13.3,-3.62],[4.81,13.45,1.38],[5.27,-39.35,-2],[5.27,-39.2,3]]]}']}

# TODO: fix hard coding
# path to topy's optimization code
rel_topy_path = './scripts/optimise.py'
# rel_topy_path = '~/Dropbox/Projects/ProjectMashup/libs/topy-master/scripts/optimise.py'

#
#   for logging timestamp
#
time0 = None
def timestamp(msg='time elapsed', t=None):
    global time0
    time1 = time.time() * 1000
    if msg != None:
        if t != None:
            print '[xac] ' + msg + ': ', time1 - t
        elif time0 != None:
            print '[xac] ' + msg + ': ', time1 - time0
    time0 = time1
    return time1

#
#   offline testing
#
def test():
    # if is_in_segment([2.0, -2.0], [1.0, 1.0], [-1.0, -3.0], 1, 3):
    #     print 'in'

    # print on_left_side([1,2],[0,1],[3,3])
    # print on_left_side([2,1],[0,1],[3,3])

    # tpd = json.loads(tpd_template)
    # print tpd["DOF_PN"]

    # print bound([4, 3, 19], [3, 8, 10], [9, 20, 15])

    # print on_left_side([4, 3], [65.0, 1.0], [65.0, 1.0])

    t0 = timestamp()
    proc_post_data(test_data_03)
    timestamp(t=t0, msg='total time')
    return


def bound(ls, ls_min, ls_max):
    ls_bounded = []
    for i in xrange(0, len(ls)):
        ls_bounded.append(min(max(ls[i], ls_min[i]), ls_max[i]))
    return ls_bounded

#
#   check if a point p is in the segment p0-p1 with t0-t1 thickness
#
def is_in_segment(p, p0, p1, t0, t1):
    # check if p's projection is on p0-p1
    v0 = [p[0]-p0[0], p[1] - p0[1]]
    u10 = [p1[0]-p0[0], p1[1] - p0[1]]
    l = math.sqrt(u10[0]**2 + u10[1]**2)
    dp0 = (v0[0] * u10[0] + v0[1] * u10[1]) / l

    v1 = [p[0]-p1[0], p[1] - p1[1]]
    u01 = [p0[0]-p1[0], p0[1] - p1[1]]
    dp1 = (v1[0] * u01[0] + v1[1] * u01[1]) / l

    if dp0 > l or dp1 > l:
        # check if p is close enough to p0 p1
        if abs(v0[0])>t0 or abs(v0[1])>t0 or abs(v1[0])>t1 or abs(v1[1])>t1:
            return False

        if v0[0]**2 + v0[1]**2 <= t0**2 or v1[0]**2 + v1[1]**2 <= t1**2:
            return True
        else:
            return False

    # if on, check if p is in the cone given by t0, t1
    dx1 = p0[0] - p[0]
    dy1 = p0[1] - p[1]
    dx2 = p1[0] - p[0]
    dy2 = p1[1] - p[1]
    tu = (dx2 - dx1) * dx1 + (dy2 - dy1) * dy1
    tb = (p1[0] - p0[0])**2 + (p1[1] - p0[1])**2
    t = -tu / tb

    dist = dx1**2 + dy1**2 - tu**2 / tb
    proj = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t]

    lp = math.sqrt((proj[0]-p0[0])**2 + (proj[1]-p0[1])**2)
    tp = lp/l * t0 + (1-lp/l) * t1

    return dist < tp * tp

def on_left_side(p, p0, p1):
    v = [p[0]-p0[0], p[1]-p0[1]]
    v1 = [p1[0]-p0[0], p1[1]-p0[1]]
    if abs(v[0]-v1[0]) < EPSILON or abs(v[1]-v1[1]) < EPSILON:
        return None
    return v1[0]*v[1] - v1[1]*v[0] > 0

#
#   safely retrieve key-value from object
#
def safe_retrieve_one(buffer, key, alt):
    return buffer[key][0] if key in buffer and len(buffer[key]) > 0 else alt

def safe_retrieve_all(buffer, key, alt):
    return buffer[key] if key in buffer else alt

#
#   processing incoming data
#
def proc_post_data(post_data):
    subprocess.call('rm mashup_*', shell=True)

    if 'mashup' not in post_data:
        # self.wfile.write('no design information')
        return 'no design information'
    #
    # read parameters of the design & function spec.
    #
    mashup = json.loads(post_data['mashup'][0])
    dimension = int(safe_retrieve_one(post_data, 'dimension', 2))
    design = safe_retrieve_all(mashup, 'design', None)
    loads = safe_retrieve_all(mashup, 'loads', None)
    clearances = safe_retrieve_all(mashup, 'clearances', None)
    boundaries = safe_retrieve_all(mashup, 'boundaries', None)

    #
    # read other params
    #
    query = int(safe_retrieve_one(post_data, 'query', ANALYSIS))
    resolution = int(safe_retrieve_one(post_data, 'resolution', 64))
    material = float(safe_retrieve_one(post_data, 'material', 0.3))
    originality = float(safe_retrieve_one(post_data, 'originality', 1.0))
    verbose = int(safe_retrieve_one(post_data, 'verbose', 0))

    #
    # convert everything to tpd and save it locally
    #

    # compute resolution of the voxel grid
    timestamp(msg=None)
    vmin = [INFINITY, INFINITY, INFINITY]
    vmax = [-INFINITY, -INFINITY, -INFINITY]
    for edge in design:
        points = edge['points']
        for point in points:
            for i in xrange(0, 3):
                vmin[i] = min(vmin[i], point[i])
                vmax[i] = max(vmax[i], point[i])
    timestamp(msg='compute resolution of the voxel grid')

    # compute dimensions of the voxel grid
    dim_voxel = None
    if dimension == 2:
        dim_voxel = min((vmax[0] - vmin[0]) / resolution, (vmax[1] - vmin[1]) / resolution)
    elif dimension == 3:
        print '3d is too slow currently unsupported'
        return

    dim_voxel = max(dim_voxel, 2)   # avoid very tiny voxels

    #
    #
    #   from here on assumes 2d
    #
    #

    nelx = int(math.ceil((vmax[0] - vmin[0]) / dim_voxel))
    nely = int(math.ceil((vmax[1] - vmin[1]) / dim_voxel))

    # relaxing the boundary of the voxel grid to avoid boundary condition
    relaxation = 0.2
    vmin[0] -= nelx * relaxation * dim_voxel
    vmin[1] -= nely * relaxation * dim_voxel
    vmax[0] += nelx * relaxation * dim_voxel
    vmax[1] += nely * relaxation * dim_voxel

    nelx_old = nelx
    nely_old = nely
    nelx = int(nelx * (1+ 2 * relaxation))
    nely = int(nely * (1+ 2 * relaxation))

    print 'voxel grid size: ', nelx, nely
    print 'min/max:', vmin, vmax

    # convert points to voxels
    for edge in design:
        edge['voxels'] = []
        edge['voxelmin'] = [INFINITY, INFINITY]
        edge['voxelmax'] = [-INFINITY, -INFINITY]

        for point in edge['points']:
            vx = math.floor((point[0]-vmin[0])/dim_voxel)
            vy = math.floor((point[1]-vmin[1])/dim_voxel)
            voxel = [vx, vy]
            edge['voxels'].append(voxel)
            for i in xrange(0, len(voxel)):
                edge['voxelmin'][i] = min(edge['voxelmin'][i], voxel[i])
                edge['voxelmax'][i] = max(edge['voxelmax'][i], voxel[i])

        maxThick = 0
        for t in edge['thickness']:
            maxThick = max(t, maxThick)
        maxThick /= dim_voxel

        edge['voxelmin'][0] -= maxThick
        edge['voxelmin'][1] -= maxThick
        edge['voxelmax'][0] += maxThick
        edge['voxelmax'][1] += maxThick

    timestamp(msg='convert points to voxels')

    # compute the design elements
    actv_elms = []
    for edge in design:
        voxels = edge['voxels']
        thickness = edge['thickness']

        for k in xrange(0, len(voxels) - 1):
            p0 = voxels[k]
            p1 = voxels[k+1]
            t0 = thickness[k] / dim_voxel
            t1 = thickness[k+1] / dim_voxel

            for j in xrange(0, nely):
                if j < edge['voxelmin'][1] or j > edge['voxelmax'][1]:
                    continue

                for i in xrange(0, nelx):
                    if i < edge['voxelmin'][0] or i > edge['voxelmax'][0]:
                        continue
                    try:
                        if is_in_segment([i * 1.0, j * 1.0], p0, p1, t0, t1):
                            actv_elms.append([i, j, 1])
                    except:
                        continue

    timestamp(msg='compute design elements')

    # compute load points
    load_points = []
    load_values_x = []
    load_values_y = []
    for load in loads:
        points = load['points']
        vectors = load['vectors']
        for i in xrange(0, len(points)):
            point = bound(points[i], vmin, vmax)
            load_point = [int((point[0]-vmin[0])/dim_voxel), int((point[1]-vmin[1])/dim_voxel)]
            load_points.append(load_point)
            load_values_x.append(vectors[i][0])     # assuming vectors' norms sum up to 1
            load_values_y.append(vectors[i][1])

    timestamp(msg='compute load points')

    # compute clearances
    pasv_elms = []
    for clearance in clearances:
        voxels_clearance = []
        for point in clearance:
            point = bound(point, vmin, vmax)
            cx = math.floor((point[0]-vmin[0])/dim_voxel)
            cy = math.floor((point[1]-vmin[1])/dim_voxel)
            # voxels_clearance.append([min(max(0, cx), nelx), min(max(0, cy), nely)])
            voxels_clearance.append([cx, cy])

        p0 = voxels_clearance[0]
        p1 = voxels_clearance[2]
        p2 = voxels_clearance[6]
        p3 = voxels_clearance[4]

        for j in xrange(0, nely):
            for i in xrange(0, nelx):
                p = [i*1.0, j*1.0]
                side0 = on_left_side(p, p0, p1)
                side1 = on_left_side(p, p1, p2)
                if side0 != side1 or side0 == None:
                    continue

                side2 = on_left_side(p, p2, p3)
                if side1 != side2 or side1 == None:
                    continue

                side3 = on_left_side(p, p3, p0)
                if side2 != side3 or side2 == None:
                    continue

                pasv_elms.append([i, j, 1])

    timestamp(msg='compute clearances')

    # set extended domain to be passive
    dnelx = int(math.floor((nelx - nelx_old) / 2))
    dnely = int(math.floor((nely - nely_old) / 2))
    for j in xrange(0, dnely):
        for i in xrange(0, nelx):
            pasv_elms.append([i, j, 1])
            pasv_elms.append([i, nely - 1 - j, 1])

    for j in xrange(0, nely):
        for i in xrange(0, dnelx):
            pasv_elms.append([i, j, 1])
            pasv_elms.append([nelx - 1 - i, j, 1])

    # compute boundaries
    boundary_elms = []

    for boundary in boundaries:
        voxels = []

        for point in boundary:
            point = bound(point, vmin, vmax)
            bx = math.floor((point[0]-vmin[0])/dim_voxel)
            by = math.floor((point[1]-vmin[1])/dim_voxel)

            voxels.append([bx, by])

        for k in xrange(0, len(voxels) - 1):
            p0 = voxels[k]
            p1 = voxels[k+1]

            boundary_elms.append([int(p0[0]), int(p0[1])])
            boundary_elms.append([int(p1[0]), int(p1[1])])
            # empirically set boundary to have width 5*2=10
            t0 = 5
            t1 = 5

            xmin = min(p0[0], p1[0]) - 1
            xmax = max(p0[0], p1[0]) + 1
            ymin = min(p0[1], p1[1]) - 1
            ymax = max(p0[1], p1[1]) + 1

            xmin = int(max(0, xmin))
            xmax = int(min(xmax, vmax[0]))
            ymin = int(max(0, ymin))
            ymax = int(min(ymax, vmax[1]))

            for j in xrange(ymin, ymax):
                for i in xrange(xmin, xmax):
                    try:
                        if is_in_segment([i * 1.0, j * 1.0], p0, p1, t0, t1):
                            boundary_elms.append([i, j, 1])
                    except:
                        continue

    timestamp(msg='compute boundaries')

    show_debug = True

    # DEBUG: print out the design and specs
    if show_debug:
        debug_voxelgrid = ''
        for j in xrange(0, nely):
            debug_voxelrow = ''
            for i in xrange(0, nelx):
                debug_voxelrow += ('  ')
            debug_voxelgrid += debug_voxelrow + ' \n'

        debug_voxelgrid = list(debug_voxelgrid)

        for elm in actv_elms:
            i = elm[0]
            j = elm[1]
            idx = j * (nelx + 1) + nelx - 1 - i
            debug_voxelgrid[2 * idx + 1] = '.'

        for cp in pasv_elms:
            i = cp[0]
            j = cp[1]
            idx = 2 * (j * (nelx + 1) + nelx - 1 - i) + 1
            if idx < len(debug_voxelgrid):
                debug_voxelgrid[idx] = 'x'

        for lp in load_points:
            i = lp[0]
            j = lp[1]
            idx = 2 * (j * (nelx + 1) + nelx - 1 - i) + 1
            if idx < len(debug_voxelgrid):
                debug_voxelgrid[idx] = 'O'

        for bp in boundary_elms:
            i = bp[0]
            j = bp[1]
            idx = 2 * (j * (nelx + 1) + nelx - 1 - i) + 1
            if idx < len(debug_voxelgrid):
                debug_voxelgrid[idx] = '*'

        print ''.join(debug_voxelgrid)[::-1]
    # END DEBUG

    timestamp(msg='print out design for debugging')

    # preparing for tpd file
    str_load_points = ''
    load_values_x_str = []
    load_values_y_str = []
    load_nodes = [node_nums_3d(nelx, nely, 1, x[0]+1, x[1]+1, 1) for x in load_points]
    for i in xrange(0, len(load_points)):
        node_str_array = [str(x) for x in load_nodes[i]]

        str_load_points += ';'.join(node_str_array)
        if i < len(load_points) - 1:
            str_load_points += ';'

        load_values_x_str.append(str(load_values_x[i]/len(node_str_array)) + '@' + str(len(node_str_array)))
        load_values_y_str.append(str(load_values_y[i]/len(node_str_array)) + '@' + str(len(node_str_array)))

    boundary_nodes = [node_nums_3d(nelx, nely, 1, x[0]+1, x[1]+1, 1) for x in boundary_elms]
    str_boundary = ''
    for i in xrange(0, len(boundary_nodes)):
        node_str_array = [str(x) for x in boundary_nodes[i]]
        str_boundary += ';'.join(node_str_array)
        if i < len(boundary_nodes) - 1:
            str_boundary += ';'

    tpd = json.loads(tpd_template)
    tpd['PROB_NAME'] = 'mashup_' + str(long(time.time()))
    tpd['NUM_ELEM_X'] = nelx
    tpd['NUM_ELEM_Y'] = nely
    tpd['NUM_ELEM_Z'] = 1
    tpd['FXTR_NODE_X'] = str_boundary
    tpd['FXTR_NODE_Y'] = str_boundary
    tpd['FXTR_NODE_Z'] = str_boundary
    tpd['LOAD_NODE_X'] = str_load_points
    tpd['LOAD_VALU_X'] = ';'.join(load_values_x_str)
    tpd['LOAD_NODE_Y']= str_load_points
    tpd['LOAD_VALU_Y'] = ';'.join(load_values_y_str)
    tpd['ACTV_ELEM'] = ';'.join([str(elm_num_3d(nelx, nely, 1, x[0]+1, x[1]+1, 1)) for x in actv_elms])
    tpd['PASV_ELEM'] = ';'.join([str(elm_num_3d(nelx, nely, 1, x[0]+1, x[1]+1, 1)) for x in pasv_elms])

    str_tpd = '[ToPy Problem Definition File v2007]\n'
    for var in tpd:
        str_tpd += var + ': ' + str(tpd[var]) + '\n'

    tpd_path = 'mashup_' + time.strftime("%m%d_%H%M%S") + '.tpd'
    f = open(tpd_path, 'w')
    f.write(str_tpd)
    f.close()

    timestamp(msg='writing to tpd file')

    # call topy
    out_path = ' '  # timestamped temp output path

    # subprocess.call('python ' + rel_topy_path + ' ' + tpd_path + ' ' + str(query), shell=True)
    main([rel_topy_path, tpd_path, str(query)]);

    timestamp(msg='topy')

    str_result = '?'
    str_result += 'name=' + tpd['PROB_NAME'] + '&'
    str_result += 'query=' + str(query) + '&'
    str_result += 'dim_voxel=' + str(dim_voxel) + '&'
    str_result += 'xmin=' + str(vmin[0]) + '&'
    str_result += 'ymin=' + str(vmin[1])

    return str_result
    # return tpd['PROB_NAME']

#
#   handling requests
#
class S(BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        BaseHTTPRequestHandler.__init__(self, request, client_address, server)

    def _set_headers(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        # do something

    def do_HEAD(self):
        self._set_headers()
        # do something

    def do_POST(self):
    	# prepare for response
        self._set_headers()

        content_length = int(self.headers['Content-Length'])
        post_str = self.rfile.read(content_length)
        post_data = parse_qs(urlparse(self.path + post_str).query)

        t0 = timestamp()
        try:
            result_msg = proc_post_data(post_data)
        except:
            traceback.print_exc()
            # print sys.exc_info()
            result_msg = 'error'
        timestamp(t=t0, msg='total time')

        print result_msg
        self.wfile.write(result_msg)

#
#   running the server
#
def run(server_class=HTTPServer, handler_class=S, port=80):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'topy server up...'
    httpd.serve_forever()

#
#   main function entry point
#
if __name__ == "__main__":
    from sys import argv

    if len(argv) != 3:
        print 'test mode'
        test()
    	# print 'usage: ./topy_server.py [port num] [abs path to topy optimize.py]'
    	exit()

    rel_topy_path = argv[2]
    run(port=int(argv[1]))
