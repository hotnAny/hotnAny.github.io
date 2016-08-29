#!/usr/bin/env python

##########################################################################
#
#   extract edges from thinned binary image (skeleton)
#
##########################################################################
from sys import argv
from PIL import Image
from math import sqrt
from random import random, seed, shuffle

NEIGHBORRADIUS = 3
ISOLATIONSIZE = 3
SPLITWINDOW = 1
SPLITCOS = 0.5

def is_disconnected(skel, i, j):
    return False

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
    # SPLITWINDOW = len(edge) / 4
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

def write_to_image(edges, w, h):
    shuffle(edges)

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
            pixels[i * w + j] = (r, g, b)

    img = Image.new('RGB', (w, h))
    img.putdata(pixels)
    img = img.resize((w*8, h*8))
    img.save('edges.bmp')

if __name__ == "__main__":
    if len(argv) < 2:
        print 'usage: ./extract_edge <path_to_input_skeleton>'
        edge = [(0, 0), (3, 1), (4, 4)]
        print split(edge)
        exit()

    str_skel_data = open(argv[1], 'r').read()
    skel_data = str_skel_data.split('\n')
    skel = []
    for row_str in skel_data:
        row_str_arr = row_str.split(',')
        skel.append([float(x) for x in row_str_arr])

    h = len(skel)
    w = len(skel[0])

    edges = []
    for i in xrange(0, h):
        for j in xrange(0, w):
            # print skel[i][j]
            if skel[i][j] <= 0:
                continue

            if is_disconnected(skel, i, j):
                continue

            edge = find_edge(skel, i, j, w, h)

            # if len(edge) <= ISOLATIONSIZE:
            #     continue;

            split_edges = split(edge)
            for edge in split_edges:
                if len(edge) > ISOLATIONSIZE:
                    edges.append(edge)

            # edges.append(edge)

    print 'totol num of edges: ', len(edges)

    write_to_image(edges, w, h)
