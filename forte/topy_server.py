#!/usr/bin/env python

##########################################################################
#
#   topy server for project forte
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

test_data_03 = {"forte":
['{"boundaries":[[[-31.75,-74.81,0.5],[-29.6,-74.45,0.5],[-26.73,-74.45,0.5],[-23.14,-74.45,0.5],[-19.91,-74.45,0.5],[-17.04,-74.45,0.5],[-13.81,-74.45,0.5],[-10.58,-74.81,0.5],[-8.07,-75.16,0.5],[-4.48,-75.16,0.5],[-2.69,-75.52,0.5],[0.18,-75.88,0.5],[1.61,-76.24,0.5],[4.13,-76.6,0.5],[6.46,-76.96,0.5],[8.43,-76.96,0.5],[10.23,-76.96,0.5],[12.38,-76.96,0.5],[14.17,-76.96,0.5],[16.5,-77.32,0.5],[18.66,-77.68,0.5],[21.17,-77.68,0.5],[24.55,-77.68,0.5],[24.94,-77.68,0.5]]],"design":[{"node1":[-11.83,-22.79,4.33],"node2":[-54.35,-2.69,0.5],"points":[[-11.83,-22.79,4.33],[-15.97,-23.14,0.5],[-20.27,-19.91,0.5],[-24.58,-17.4,0.5],[-29.6,-14.89,0.5],[-34.98,-12.02,0.5],[-41.44,-9.51,0.5],[-46.46,-7.35,0.5],[-50.41,-5.56,0.5],[-53.95,-2.96,0.5],[-54.35,-2.69,0.5],[-54.35,-2.69,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,6.050000000000001]},{"node1":[-0.9,-69.78,0.5],"node2":[1.95,-50.76,4.03],"points":[[-0.9,-69.78,0.5],[-0.9,-69.78,0.5],[-0.9,-67.81,0.5],[-0.9,-65.12,0.5],[-0.9,-61.53,0.5],[-0.9,-57.94,0.5],[-0.9,-54,0.5],[1.95,-50.76,4.03]],"thickness":[6.050000000000001,5,5,5,5,5,5,5]},{"node1":[1.95,-50.76,4.03],"node2":[-11.83,-22.79,4.33],"points":[[1.95,-50.76,4.03],[-3.05,-45.39,0.5],[-4.48,-41.44,0.5],[-6.28,-37.13,0.5],[-8.07,-33.19,0.5],[-10.23,-29.6,0.5],[-11.83,-22.79,4.33]],"thickness":[5,5,5,5,5,5,5]},{"node1":[1.95,-50.76,4.03],"node2":[66.78,-30.26,1],"points":[[1.95,-50.76,4.03],[1.95,-50.76,4.03],[1.97,-51.02,1],[2.69,-49.59,1],[4.83,-47.44,1],[7.34,-44.94,1],[9.13,-42.79,1],[11.64,-40.64,1],[14.5,-38.49,1],[16.65,-37.06,1],[20.23,-35.98,1],[22.38,-35.27,1],[24.17,-34.55,1],[26.32,-34.19,1],[28.82,-33.48,1],[33.12,-33.12,1],[36.7,-32.76,1],[42.43,-32.05,1],[47.8,-31.33,1],[52.1,-30.97,1],[56.04,-30.97,1],[58.18,-30.97,1],[60.69,-30.97,1],[62.84,-30.97,1],[66.33,-30.44,1],[66.78,-30.26,1],[66.78,-30.26,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,6.050000000000001]},{"node1":[-11.83,-22.79,4.33],"node2":[22.75,14.63,4.76],"points":[[-11.83,-22.79,4.33],[-11.83,-22.79,4.33],[-11.64,-22.74,1],[-10.2,-20.23,1],[-7.34,-16.29,1],[-4.12,-12.35,1],[0.18,-6.98,1],[4.83,-1.25,1],[8.06,2.69,1],[10.2,5.19,1],[12.71,7.34,1],[15.22,9.31,1],[17.9,10.56,1],[22.75,14.63,4.76]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[22.75,14.63,4.76],"node2":[82.17,14.86,1],"points":[[22.75,14.63,4.76],[27.03,11.64,1],[33.12,11.99,1],[41.71,12.71,1],[49.95,13.79,1],[60.33,14.5,1],[67.85,14.86,1],[74.3,14.86,1],[78.95,14.86,1],[82.17,14.86,1],[82.17,14.86,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,6.050000000000001]},{"node1":[5.92,40.72,0.5],"node2":[-48.26,49.33,0.5],"points":[[5.92,40.72,0.5],[5.92,40.72,0.5],[-9.54,44.23,-3.02],[-23.04,46.17,-1.85],[-36.9,47.75,-0.67],[-48.26,49.33,0.5],[-48.26,49.33,0.5]],"thickness":[5,5,5,5,5,5,6.050000000000001]},{"node1":[22.75,14.63,4.76],"node2":[5.88,40.48,2],"points":[[22.75,14.63,4.76],[22.75,14.63,4.76],[22.69,15.63,1.5],[22.69,17.33,1.5],[22.69,19.12,1.5],[21.98,21.62,1.5],[21.98,24.12,1.5],[21.62,25.91,1.5],[20.73,28.59,1.5],[19.48,31.98,1.5],[17.51,34.3,1.5],[14.83,36.27,1.5],[11.97,37.34,1.5],[9.11,38.06,1.5],[5.88,40.48,2]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[{"points":[[-33.14,44.71,6.12],[-25.26,46.1,-2.43],[-9.46,43.14,1],[-18.9,44.76,2],[-15.33,44.22,2],[-11.59,43.69,2],[-8.74,43.33,2],[-9.47,42.52,1.5],[-6.6,43.15,2],[-4.46,42.79,2],[-2.67,42.44,2],[0,41.72,2],[2.5,41.19,2],[4.1,40.34,1.75],[3.74,41.01,2]],"vectors":[[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[0,-0.01,0],[-0.01,-0.01,0],[-0.01,-0.01,0],[-0.01,-0.01,0]]},{"points":[[35.99,13.52,5.81],[37.42,12.35,1],[45.83,13.25,1],[55.14,14.14,1],[64.09,14.68,1],[71.07,14.86,1]],"vectors":[[0.01,-0.04,0],[0.01,-0.04,0],[0,-0.04,0],[0,-0.04,0],[0,-0.04,0],[0,-0.04,0]]},{"points":[[-48.71,-5.45,5.42],[-48.44,-6.46,0.5],[-43.95,-8.43,0.5],[-38.21,-10.76,0.5],[-32.29,-13.45,0.5],[-27.09,-16.15,0.5],[-22.42,-18.66,0.5]],"vectors":[[-0.01,-0.04,0],[-0.01,-0.04,0],[-0.02,-0.04,0],[-0.02,-0.04,0],[-0.02,-0.04,0],[-0.02,-0.03,0],[-0.02,-0.03,0]]},{"points":[[23,-36.34,5.83],[23.27,-34.91,1],[25.24,-34.37,1],[27.57,-33.84,1],[30.97,-33.3,1],[34.91,-32.94,1],[39.57,-32.4,1],[45.12,-31.69,1],[49.95,-31.15,1],[54.07,-30.97,1],[57.11,-30.97,1]],"vectors":[[0.01,-0.02,0],[0.01,-0.02,0],[0.01,-0.02,0],[0.01,-0.02,0],[0.01,-0.02,0],[0.01,-0.02,0],[0,-0.02,0],[0,-0.02,0],[0,-0.02,0],[0,-0.02,0],[0,-0.02,0]]}],"clearances":[[[21.09,72.87,9.03],[21.14,73.57,4.08],[15.29,38.72,4.11],[15.35,39.43,-0.84],[-40.17,83.86,4.81],[-40.23,83.16,9.76],[-45.96,49.72,-0.11],[-46.02,49.02,4.84]],[[79.61,55.38,1.67],[79.62,55.15,-3.33],[82.53,16.3,3.45],[82.54,16.08,-1.54],[24.83,51.06,-3.24],[24.82,51.28,1.76],[27.75,11.98,-1.45],[27.74,12.21,3.54]],[[4.71,21.33,1.63],[4.67,21.16,-3.37],[-14.55,-21.34,3.18],[-14.58,-21.51,-1.81],[-42.61,42.49,-3.74],[-42.58,42.65,1.26],[-61.87,-0.18,-2.18],[-61.84,-0.02,2.81]],[[55.26,5.13,1.75],[55.27,4.89,-3.24],[60.51,-29.07,3.42],[60.53,-29.31,-1.57],[13.36,-1.54,-3.08],[13.35,-1.3,1.91],[18.62,-35.74,-1.42],[18.6,-35.5,3.57]]]}']}

# TODO: fix hard coding
# path to topy's optimization code
rel_topy_path = './scripts/optimise.py'
# rel_topy_path = '~/Dropbox/Projects/ProjectForte/libs/topy-master/scripts/optimise.py'

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
    if abs(v[0]-v1[0]) < EPSILON and abs(v[1]-v1[1]) < EPSILON:
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
    subprocess.call('rm forte_*', shell=True)

    if 'forte' not in post_data:
        # self.wfile.write('no design information')
        return 'no design information'
    #
    # read parameters of the design & function spec.
    #
    forte = json.loads(post_data['forte'][0])
    dimension = int(safe_retrieve_one(post_data, 'dimension', 2))
    design = safe_retrieve_all(forte, 'design', None)
    loads = safe_retrieve_all(forte, 'loads', None)
    clearances = safe_retrieve_all(forte, 'clearances', None)
    boundaries = safe_retrieve_all(forte, 'boundaries', None)

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
                if side1 != side2 or side2 == None:
                    continue

                side3 = on_left_side(p, p3, p0)
                if side2 != side3:
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
    tpd['PROB_NAME'] = 'forte_' + str(long(time.time()))
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

    tpd_path = 'forte_' + time.strftime("%m%d_%H%M%S") + '.tpd'
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
