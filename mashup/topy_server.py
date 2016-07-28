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
import subprocess
import json
import math
import time

INFINITY = 1e9
EPSILON = 1e-9
ANALYSIS = 0
OPTIMIZATION = 1

test_data_01 = {"mashup":
 ['{"boundaries":[],"design":[{"node1":[-59.31,49.74,0.5],"node2":[26.53,-21.74,0.5],"points":[[-59.31,49.74,0.5],[-57.47,47.16,0.5],[-54.16,44.21,0.5],[-49.37,39.79,0.5],[-43.1,34.63,0.5],[-36.47,29.47,0.5],[-29.84,23.95,0.5],[-23.58,18.42,0.5],[-14.74,10.68,0.5],[-3.32,1.84,0.5],[4.05,-4.42,0.5],[9.95,-8.84,0.5],[15.47,-12.89,0.5],[20.26,-16.95,0.5],[25.7,-21.09,0.5],[26.53,-21.74,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[],"clearances":[]}']}

test_data_02 = {"mashup":
['{"boundaries":[],"design":[{"node1":[-99.84,45.68,0.5],"node2":[-58.28,-27.51,4.84],"points":[[-99.84,45.68,0.5],[-99.1,43.84,0.5],[-98.37,40.53,0.5],[-97.26,36.47,0.5],[-95.79,30.95,0.5],[-93.21,23.95,0.5],[-91,16.95,0.5],[-87.31,8.47,0.5],[-84.37,3.68,0.5],[-81.42,-1.11,0.5],[-78.84,-4.42,0.5],[-76.26,-8.11,0.5],[-74.79,-11.05,0.5],[-72.58,-13.63,0.5],[-70,-16.21,0.5],[-67.42,-18.79,0.5],[-64.47,-20.63,0.5],[-60.42,-23.58,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-58.28,-27.51,4.84],"node2":[-60.67,-65.08,1],"points":[[-58.28,-27.51,4.84],[-59.2,-29.41,1],[-58.83,-31.99,1],[-58.83,-35.3,1],[-58.83,-38.97,1],[-58.83,-42.28,1],[-58.83,-47.06,1],[-58.83,-51.47,1],[-58.83,-55.52,1],[-59.56,-59.2,1],[-59.93,-61.4,1],[-60.3,-62.87,1],[-60.67,-64.8,1],[-60.67,-65.08,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-58.28,-27.51,4.84],"node2":[-20.22,-40.08,5.47],"points":[[-50.47,-28.74,0.5],[-44.95,-31.68,0.5],[-40.16,-33.53,0.5],[-33.16,-35.74,0.5],[-27.26,-37.58,0.5]],"thickness":[5,5,5,5,5]},{"node1":[-20.22,-40.08,5.47],"node2":[13.26,-43.84,0.5],"points":[[-16.58,-40.89,0.5],[-10.68,-41.63,0.5],[-5.16,-42.74,0.5],[0,-43.1,0.5],[4.42,-43.84,0.5],[12.43,-43.84,0.5],[13.26,-43.84,0.5]],"thickness":[5,5,5,5,5,5,5]},{"node1":[-20.22,-40.08,5.47],"node2":[-13.24,-66.55,1],"points":[[-20.22,-40.08,5.47],[-20.59,-40.81,1],[-20.59,-41.91,1],[-20.22,-44.12,1],[-19.85,-45.96,1],[-19.49,-48.53,1],[-18.38,-51.84,1],[-16.91,-55.89,1],[-15.81,-59.56,1],[-15.07,-62.5,1],[-14.34,-63.98,1],[-13.6,-65.26,1],[-13.24,-66.27,1],[-13.24,-66.55,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[],"clearances":[]}']
}

test_data_03 = {"mashup":
['{"boundaries":[],"design":[{"node1":[-48.63,-68.52,0.5],"node2":[22.84,-76.63,0.5],"points":[[-48.63,-68.52,0.5],[-61.62,-60.24,0.5],[-65.39,-53.6,0.5],[-69.08,-46.42,0.5],[-72.21,-38.68,0.5],[-74.42,-33.89,0.5],[-75.89,-28.74,0.5],[-77.37,-23.58,0.5],[-78.47,-16.95,0.5],[-79.21,-10.68,0.5],[-79.58,-4.42,0.5],[-79.58,2.21,0.5],[-79.58,9.21,0.5],[-79.58,15.1,0.5],[-78.84,21,0.5],[-77.37,26.89,0.5],[-75.52,31.68,0.5],[-73.5,38.31,0.5],[-69.81,45.31,0.5],[-65.21,50.66,0.5],[-59.31,55.81,0.5],[-52.68,59.87,0.5],[-43.29,63.18,0.5],[-34.08,66.13,0.5],[-26.71,67.24,0.5],[-19.53,67.42,0.5],[-13.26,67.42,0.5],[-7.74,67.42,0.5],[-1.11,66.68,0.5],[4.05,66.31,0.5],[11.97,64.66,0.5],[21.09,61.06,0.5],[27.45,57.47,0.5],[33.16,52.87,0.5],[40.06,46.42,0.5],[44.39,39.97,0.5],[48.45,33.16,0.5],[50.84,26.89,0.5],[52.31,22.1,0.5],[53.05,15.84,0.5],[54.16,9.95,0.5],[55.26,3.32,0.5],[56.37,-2.95,0.5],[57.66,-11.79,0.5],[57.84,-20.63,0.5],[57.84,-30.03,0.5],[56.92,-39.42,0.5],[54.34,-47.53,0.5],[51.39,-55.63,0.5],[42.39,-68.03,0.5],[36.29,-70.92,0.5],[23.66,-76.35,0.5],[22.84,-76.63,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,7.410324396583751,10.87750248016185,15.822729758652832,10.87750248016185,7.410324396583751,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,7.79951600902571,12.029413802728762,18.35614188835285,12.029413802728762,7.79951600902571,5,5,5,5,5,5]}],"loads":[],"clearances":[]}']}

time0 = None
def timestamp(msg='time elapsed', t=None):
    global time0
    time1 = time.time() * 1000
    if msg != None:
        if t != None:
            print msg + ': ', time1 - t
        elif time0 != None:
            print msg + ': ', time1 - time0
    time0 = time1
    return time1

def test():
    # if is_in_segment([2.0, -2.0], [1.0, 1.0], [-1.0, -3.0], 1, 3):
    #     print 'in'

    t0 = timestamp()
    proc_post_data(test_data_02)
    timestamp(t=t0)
    return

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

def safe_retrieve_one(buffer, key, alt):
    return buffer[key][0] if key in buffer and len(buffer[key]) > 0 else alt

def safe_retrieve_all(buffer, key, alt):
    return buffer[key] if key in buffer else alt

def proc_post_data(post_data):
    if 'mashup' not in post_data:
        # self.wfile.write('no design information')
        print 'no design information'

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
    resolution = int(safe_retrieve_one(post_data, 'resolution', 100))
    material = float(safe_retrieve_one(post_data, 'material', 0.3))
    originality = float(safe_retrieve_one(post_data, 'originality', 1.0))
    verbose = int(safe_retrieve_one(post_data, 'verbose', 0))

    #
    # TODO: convert everything to tpd and save it locally
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

    nelx = int(nelx * (1+ 2 * relaxation))
    nely = int(nely * (1+ 2 * relaxation))

    # convert points to voxels
    for edge in design:
        edge['voxels'] = []
        edge['voxelmin'] = [INFINITY, INFINITY]
        edge['voxelmax'] = [-INFINITY, -INFINITY]

        for point in edge['points']:
            voxel = [math.floor((point[0]-vmin[0])/dim_voxel), math.floor((point[1]-vmin[1])/dim_voxel)]
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

    # compute the ACTV_ELEMs
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

    timestamp(msg='compute ACTV_ELEMs')

    # DEBUG: print out the design
    debug_voxelgrid = ''
    for j in xrange(0, nely):
        debug_voxelrow = ''
        for i in xrange(0, nelx):
            debug_voxelrow += (' .')
        debug_voxelgrid += debug_voxelrow + ' \n'

    debug_voxelgrid = list(debug_voxelgrid)
    for elm in actv_elms:
        i = elm[0]
        j = elm[1]
        idx = j * (nelx + 1) + nelx - 1 - i
        debug_voxelgrid[2 * idx + 1] = '0'

    print ''.join(debug_voxelgrid)[::-1]
    # END DEBUG

    tpd_path = ''

    # call topy
    out_path = ' '  # timestamped temp output path
    # subprocess.call('python ' + rel_topy_path + ' ' + tpd_path + ' ' + query + ' ' + out_path, shell=True)

    print 'process successful'

#
#   handling requests
#
class S(BaseHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        BaseHTTPRequestHandler.__init__(self, request, client_address, server)
        # self.timeout = 10

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

        proc_post_data(post_data)

        # TODO: package the result
        self.wfile.write('roger that!')

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
