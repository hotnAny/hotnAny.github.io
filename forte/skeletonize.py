#!/usr/bin/env python

##########################################################################
#
#   follow topy, to extract explicit representations of added structures
#
##########################################################################

from sys import argv
from operator import sub
from PIL import Image
import skimage.io as io
from numpy import ndarray
from math import sqrt
from random import random, seed, shuffle
import json

NEIGHBORRADIUS = 3
ISOLATIONSIZE = 3
SPLITWINDOW = 3
SPLITCOS = 0.5
TOSPLITEDGE = True
NORMALWINDOW = 2
EPS = 1e-6

#
#   does the following:
#       * load vxg files from path, diff them
#       # perform zhang-suen thinning
#       * extract edges/structures
#
def skeletonize(dim_voxel, path, probname, path_design):
    design_obj = open(path_design, 'r').read()
    design_obj = json.loads(design_obj)

    edges, thicknesses, n, m = vxgs_to_edges(path, probname, design_obj)

    # write to fds file
    if 'optimizations' in design_obj:
        print 'appending'
    else:
        print 'newing'
        design_obj['optimizations'] = []
        design_obj['dimVoxel'] = dim_voxel
        design_obj['height'] = m
        design_obj['width'] = n

    edgeObjs = []
    for edge in edges:
        edgeObj = {}
        edgeObj['node1'] = [edge[0][1], edge[0][0], 0] #list(edge[0]) + [0]
        edgeObj['node2'] = [edge[-1][1], edge[-1][0], 0] #list(edge[-1]) + [0]
        edgeObj['points'] = [[p[1], p[0], 0] for p in edge]

        idx = edges.index(edge)
        edgeObj['thickness'] = thicknesses[idx]

        edgeObjs.append(edgeObj)

    # print design_obj['optimizations']
    design_obj['optimizations'].append(edgeObjs)

    # fds = open(path + '/' + probname + '.fds', 'w')
    fds = open(path_design, 'w')
    fds.write(json.dumps(design_obj))
    fds.close()

    # print design_obj

def vxgs_to_edges(path, probname, design_obj):
    str_vxg0 = open(path + '/' + probname + '_analyzed.vxg').read()
    str_vxg1 = open(path + '/' + probname + '_optimized.vxg').read()

    # diff the voxel grids
    rows_vxg0 = str_vxg0.split('\n')
    # rows_vxg0.reverse()
    rows_vxg1 = str_vxg1.split('\n')
    # rows_vxg1.reverse()

    m = len(rows_vxg0)
    n = len(rows_vxg0[0].split(','))
    vxg = ndarray(shape=(m, n), dtype=float, order='F')
    vxg0 = []
    vxg1 = []
    for i in xrange(0, m):
        row_vxg0 = rows_vxg0[i].split(',')
        row_vxg1 = rows_vxg1[i].split(',')
        vxg0.append([float(x) for x in row_vxg0])
        vxg1.append([float(x) for x in row_vxg1])
        for j in xrange(0, n):
            vxg[i, j] = 255 if float(row_vxg1[j]) - float(row_vxg0[j]) < 0.5 else 0

    save_vxg_to_image(vxg0, n, m, path + '/' + probname + '_original.bmp')
    save_vxg_to_image(vxg1, n, m, path + '/' + probname + '_optimized.bmp')

    # perform thinning
    Img_Original = vxg
    from skimage.filter import threshold_otsu
    Otsu_Threshold = 128
    BW_Original = Img_Original < Otsu_Threshold
    BW_Skeleton = zhangSuen(BW_Original)
    save_ndarr_to_image(BW_Original, path + '/' + probname + '_diff.bmp')
    save_ndarr_to_image(BW_Skeleton, path + '/' + probname + '_skel.bmp')

    # perform edge walking
    edges, thicknesses = edge_walk(BW_Skeleton, vxg)
    save_edges_to_image(edges, n, m, path + '/' + probname + '_deltas.bmp')

    return edges, thicknesses, n, m

def edge_walk(img, vxg):
    skel = []
    for xslice in img:
        skel.append([1 if x==True else 0 for x in xslice])

    h = len(skel)
    w = len(skel[0])
    edges = []
    for i in xrange(0, h):
        for j in xrange(0, w):
            if skel[i][j] <= 0:
                continue

            edge = find_edge(skel, i, j, w, h)

            if TOSPLITEDGE:
                split_edges = split(edge)
                for edge in split_edges:
                    if len(edge) > ISOLATIONSIZE:
                        edges.append(edge)
            else:
                if len(edge) > ISOLATIONSIZE:
                    edges.append(edge)

    print 'totol num of edges: ', len(edges)

    #
    # retrieve thickness for each edge
    #
    voxels = []
    for i in xrange(0, h):
        row = []
        for j in xrange(0, w):
            voxel_value = 0 if vxg[i, j] == 255 else 1
            row.append(voxel_value)
        voxels.append(row)

    if h != len(voxels) or w != len(voxels[0]):
        print 'error: .skeleton and .vxg dimension mismatch!'
        exit()

    thicknesses = []
    for edge in edges:
        thickness = []
        for idx in xrange(0, len(edge)):
            # compute its normal
            i0 = clamp(idx - NORMALWINDOW, 0, len(edge)-1)
            i1 = clamp(idx + NORMALWINDOW, 0, len(edge)-1)
            di, dj = compute_normal(edge[i0], edge[i1])
            di, dj = (1, (dj+EPS)/(di+EPS)) if abs(dj) < abs(di) else ((di+EPS)/(dj+EPS), 1)

            # retrieve num of voxels along the normal
            t = 1
            radii = [1, 1]
            for s in xrange(-1, 3, 2):
                i, j = edge[idx]
                si, sj = sign(di), sign(dj)
                while True:
                    ii, jj = clamp(int(i + s * di), 0, h-1), clamp(int(j + s * dj), 0, w-1)
                    if ii == i and jj == j:
                        break
                    if voxels[ii][jj] > 0.5 or voxels[clamp(ii+si, 0, h-1)][jj] > 0.5 or voxels[ii][clamp(jj+sj, 0, w-1)] > 0.5:
                        radii[(s + 1) / 2] += 1
                        i, j = ii, jj
                    else:
                        break

            thres_bal = 3
            bal = (radii[0] + EPS) / (radii[1] + EPS)
            if bal < 1/thres_bal or bal > thres_bal:
                t += min(radii[0], radii[1]) * (thres_bal + 1) / 2
            else:
                t += (radii[0] + radii[1]) / 2

            thickness.append(min(3, max(1, t/2)))

            # visualization, must remove when not needed
            # print idx, ':', t
            # for s in xrange(-1, 3, 2):
            #     i, j = edge[idx]
            #     for tt in xrange(1, t):
            #         ii, jj = clamp(int(i + s * tt * di), 0, h-1), clamp(int(j + s * tt * dj), 0, w-1)
            #         edge.append((ii, jj))

        tavg = 0;
        for t in thickness:
            tavg += t
        tavg /= len(thickness)
        for i in xrange(0, len(thickness)):
            thickness[i] += tavg
            thickness[i] /= 2

        # print len(edge), len(thickness)

        thicknesses.append(thickness)

    # output an image for debugging
    # save_edges_to_image(edges, w, h)

    # print thicknesses
    return edges, thicknesses

def save_vxg_to_image(vxg, w, h, fname):
    pixels = []
    for i in xrange(0, h):
        for j in xrange(0, w):
            pixels.append(255 if float(vxg[h - 1 - i][j]) < 0.75 else 0)

    img = Image.new('L', (w, h))
    img.putdata(pixels)
    img.save(fname)

def save_ndarr_to_image(arr, fname):
    pixels = []
    for i in xrange(0, len(arr)):
    # for xslice in arr:
        xslice = arr[len(arr) - 1 - i]
        pixels.append([0 if x else 255 for x in xslice])
    io.imsave(fname, pixels)

def neighbours(x,y,image):
    "Return 8-neighbours of image point P1(x,y), in a clockwise order"
    img = image
    x_1, y_1, x1, y1 = x-1, y-1, x+1, y+1
    return [ img[x_1][y], img[x_1][y1], img[x][y1], img[x1][y1],     # P2,P3,P4,P5
                img[x1][y], img[x1][y_1], img[x][y_1], img[x_1][y_1] ]    # P6,P7,P8,P9

def transitions(neighbours):
    "No. of 0,1 patterns (transitions from 0 to 1) in the ordered sequence"
    n = neighbours + neighbours[0:1]      # P2, P3, ... , P8, P9, P2
    return sum( (n1, n2) == (0, 1) for n1, n2 in zip(n, n[1:]) )  # (P2,P3), (P3,P4), ... , (P8,P9), (P9,P2)

def zhangSuen(image):
    "the Zhang-Suen Thinning Algorithm"
    Image_Thinned = image.copy()  # deepcopy to protect the original image
    changing1 = changing2 = 1        #  the points to be removed (set as 0)
    while changing1 or changing2:   #  iterates until no further changes occur in the image
        # Step 1
        changing1 = []
        rows, columns = Image_Thinned.shape               # x for rows, y for columns
        for x in range(1, rows - 1):                     # No. of  rows
            for y in range(1, columns - 1):            # No. of columns
                P2,P3,P4,P5,P6,P7,P8,P9 = n = neighbours(x, y, Image_Thinned)
                if (Image_Thinned[x][y] == 1     and    # Condition 0: Point P1 in the object regions
                    2 <= sum(n) <= 6   and    # Condition 1: 2<= N(P1) <= 6
                    transitions(n) == 1 and    # Condition 2: S(P1)=1
                    P2 * P4 * P6 == 0  and    # Condition 3
                    P4 * P6 * P8 == 0):         # Condition 4
                    changing1.append((x,y))
        for x, y in changing1:
            Image_Thinned[x][y] = 0
        # Step 2
        changing2 = []
        for x in range(1, rows - 1):
            for y in range(1, columns - 1):
                P2,P3,P4,P5,P6,P7,P8,P9 = n = neighbours(x, y, Image_Thinned)
                if (Image_Thinned[x][y] == 1   and        # Condition 0
                    2 <= sum(n) <= 6  and       # Condition 1
                    transitions(n) == 1 and      # Condition 2
                    P2 * P4 * P8 == 0 and       # Condition 3
                    P2 * P6 * P8 == 0):            # Condition 4
                    changing2.append((x,y))
        for x, y in changing2:
            Image_Thinned[x][y] = 0
    return Image_Thinned

def sign(x):
    return 0 if x == 0 else (1 if x > 0 else -1);

def clamp(v, vmin, vmax):
    v = max(vmin, v)
    v = min(v, vmax)
    return v

def find_neighbor(skel, i, j, w, h, r):
    for di in xrange(-r, r+1):
        for dj in xrange(-r, r+1):
            ii = clamp(i+di, 0, h-1)
            jj = clamp(j+dj, 0, w-1)
            if ii==i and jj==j:
                continue
            if skel[ii][jj] > 0:
                clear_neighbors(skel, i, j, w, h, r)
                return ii, jj
    return -1, -1

def clear_neighbors(skel, i, j, w, h, r):
    for di in xrange(-r, r+1):
        for dj in xrange(-r, r+1):
            ii = clamp(i+di, 0, h-1)
            jj = clamp(j+dj, 0, w-1)
            skel[ii][jj] = 0

def find_edge(skel, i, j, w, h):
    edge = [(i, j)]
    while True:
        ii, jj = find_neighbor(skel, i, j, w, h, NEIGHBORRADIUS)
        if ii >= 0 and jj >= 0:
            edge.append((ii, jj))
            skel[i][j] = 0
            i = ii
            j = jj
        else:
            break
    return edge

def split(edge):
    edges = []
    last_start = 0
    for idx in xrange(SPLITWINDOW, len(edge)-SPLITWINDOW):
        i0, j0 = edge[idx - SPLITWINDOW]
        i, j = edge[idx]
        i1, j1 = edge[idx + SPLITWINDOW]
        x0, y0 = i0-i, j0-j
        x1, y1 = i1-i, j1-j
        cos_angle = (x0*x1 + y0*y1) / (sqrt(x0**2+y0**2) * sqrt(x1**2+y1**2))
        # print cos_angle
        if abs(cos_angle) < SPLITCOS:
            edges.append(edge[last_start: idx + 1])
            last_start = idx
    edges.append(edge[last_start:])
    return edges

def get_rand_rgb(s):
    seed(s)
    return int(int(random() * 1024) % 97 * 255 / 100)

def compute_normal(p1, p2):
    vi, vj = p1[0]-p2[0], p1[1]-p2[1]
    di, dj = vj, -vi
    norm = sqrt(di**2 + dj**2)
    return di/norm, dj/norm

def save_edges_to_image(edges, w, h, fname):
    # shuffle(edges)
    pixels = []
    for i in xrange(0, h):
        for j in xrange(0, w):
            pixels.append((255, 255, 255))

    for edge in edges:
        # print len(edge)
        idx = edges.index(edge)
        r = get_rand_rgb(idx)
        g = get_rand_rgb(255 - r + idx)
        b = get_rand_rgb(255 - g + r * idx)
        for i, j in edge:
            pixels[(h - 1 - i) * w + j] = (r, g, b)

    img = Image.new('RGB', (w, h))
    img.putdata(pixels)
    img = img.resize((w*8, h*8))
    img.save(fname)

if __name__ == "__main__":
    if len(argv) > 4:
        dim_voxel = float(argv[1])
        # design_obj = open(argv[2], 'r').read()
        path_design = argv[2]
        path_opt = argv[3]
        probname = argv[4]
        skeletonize(dim_voxel, path_opt, probname, path_design)
