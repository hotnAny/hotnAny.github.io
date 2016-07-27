#!/usr/bin/env python

##########################################################################
#
#   an http server for calling topy python code
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

INFINITY = 1e9
ANALYSIS = 0
OPTIMIZATION = 1

def test():
    if isIn([2.0, -2.0], [1.0, 1.0], [-1.0, -3.0], 1, 3):
        print 'in'
    return

def isIn(p, p0, p1, t0, t1):
    # check if p's projection is on p0-p1
    v0 = [p[0]-p0[0], p[1] - p0[1]]
    u10 = [p1[0]-p0[0], p1[1] - p0[1]]
    l = math.sqrt(u10[0]**2 + u10[1]**2)
    dp0 = (v0[0] * u10[0] + v0[1] * u10[1]) / l

    v1 = [p[0]-p1[0], p[1] - p1[1]]
    u01 = [p0[0]-p1[0], p0[1] - p1[1]]
    dp1 = (v1[0] * u01[0] + v1[1] * u01[1]) / l

    if dp0 > l or dp1 > l:
        return False

    # if on, check if p is in the cone given by t0, t1
    dx1 = p0[0] - p[0]
    dy1 = p0[1] - p[1]
    dx2 = p1[0] - p[0]
    dy2 = p1[1] - p[1]
    tu = (dx2 - dx1) * dx1 + (dy2 - dy1) * dy1
    tb = (p1[0] - p0[0])**2 + (p1[1] - p0[1])**2
    t = -tu / tb

    dist = math.sqrt(dx1**2 + dy1**2 - tu**2 / tb);
    proj = [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];

    lp = math.sqrt((proj[0]-p0[0])**2 + (proj[1]-p0[1])**2)
    tp = lp/l * t0 + (1-lp/l) * t1

    print proj, tp
    return dist < tp

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

        if 'mashup' not in post_data:
            self.wfile.write('no design information')
            return;

        #
        # read parameters of the design & function spec.
        #
        mashup = json.loads(post_data['mashup'][0])
        dimension = int(mashup['dimension'][0]) if 'dimension' in mashup else 2
        design = mashup['design'] if 'design' in mashup else None
        loads = mashup['loads'][0] if 'loads' in mashup else None
        clearances = mashup['clearances'][0] if 'clearances' in mashup else None
        boundaries = mashup['boundaries'][0] if 'boundaries' in mashup else None

        #
        # read other params
        #
        query = int(post_data['query'][0]) if 'query' in post_data else ANALYSIS
        resolution = int(post_data['resolution'][0]) if 'resolution' in post_data else 64
        material = float(post_data['material'][0]) if 'material' in post_data else 0.3
        originality = float(post_data['originality'][0]) if 'originality' in post_data else 1.0
        verbose = int(post_data['verbose'][0]) if 'verbose' in post_data else 0

        #
        # TODO: convert everything to tpd and save it locally
        #

        # compute the resolution of the voxel grid
        vmin = [INFINITY, INFINITY, INFINITY]
        vmax = [-INFINITY, -INFINITY, -INFINITY]
        for edge in design:
            points = edge['points']
            for point in points:
                for i in xrange(0, 3):
                    vmin[i] = min(vmin[i], point[i])
                    vmax[i] = max(vmax[i], point[i])

        dim_voxel = None
        if dimension == 2:
            dim_voxel = min((vmax[0] - vmin[0]) / resolution, (vmax[1] - vmin[1]) / resolution);
        elif dimension == 3:
            self.wfile.write('3d is too slow; currently unsupported')
            return;

        nelx = int(math.ceil((vmax[0] - vmin[0]) / dim_voxel))
        nely = int(math.ceil((vmax[1] - vmin[1]) / dim_voxel))

        # compute the ACTV_ELEMs
        actv_elms = []
        for i in xrange(0, nelx):
            for j in xrange(0, nely):
                x = i * dim_voxel
                y = j * dim_voxel
                for edge in design:
                    points = edge['points']
                    thickness = edge['thickness']
                    for k in xrange(0, len(points) - 1):
                        p0 = points[k]
                        p1 = points[k+1]
                        t0 = thickness[k]
                        t1 = thickness[k+1]
                        if isIn([x, y], p0, p1, t0, t1):
                            actv_elms.append([i, j, 1])

        tpd_path = ''

        # call topy
        out_path = ' '  # timestamped temp output path
        # subprocess.call('python ' + rel_topy_path + ' ' + tpd_path + ' ' + query + ' ' + out_path, shell=True)

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
    	print 'usage: ./topy_server.py [port num] [abs path to topy optimize.py]'
    	exit()

    test()

    rel_topy_path = argv[2]

    # if len(argv) == 2:
    run(port=int(argv[1]))
    # else:
        # run()
