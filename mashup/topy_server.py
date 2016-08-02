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
import datetime

from nodenums import node_nums_3d
from nodenums import elm_num_3d

INFINITY = 1e9
EPSILON = 1e-9
ANALYSIS = 0
OPTIMIZATION = 1

tpd_template = '{"PROB_TYPE":"comp", "PROB_NAME":"NONAME", "ETA": "0.4", "DOF_PN": "3", "VOL_FRAC": "0.3", "FILT_RAD": "1.5", "ELEM_K": "H8", "NUM_ELEM_X":"10", "NUM_ELEM_Y":"10", "NUM_ELEM_Z":"10", "NUM_ITER":"50", "FXTR_NODE_X":"", "FXTR_NODE_Y":"", "FXTR_NODE_Z":"", "LOAD_NODE_X":"", "LOAD_VALU_X":"", "LOAD_NODE_Y":"", "LOAD_VALU_Y":"", "LOAD_NODE_Z":"", "LOAD_VALU_Z":"", "P_FAC":"1", "P_HOLD":"15", "P_INCR":"0.2", "P_CON":"1", "P_MAX":"3", "Q_FAC":"1", "Q_HOLD":"15", "Q_INCR":"0.05", "Q_CON":"1", "Q_MAX":"5"}';

test_data_01 = {"mashup":
 ['{"boundaries":[[[-80.68,37.21,0.5],[-80.68,32.42,0.5],[-80.68,27.63,0.5],[-80.31,22.47,0.5],[-79.95,17.32,0.5],[-79.58,13.26,0.5],[-79.21,9.58,0.5],[-78.84,6.63,0.5],[-78.84,4.05,0.5],[-78.84,2.21,0.5],[-78.47,0.74,0.5],[-78.47,-0.74,0.5],[-78.47,-3.68,0.5],[-78.47,-6.63,0.5],[-78.47,-9.21,0.5],[-78.47,-11.79,0.5],[-78.47,-14.55,0.5],[-78.47,-16.95,0.5],[-78.84,-18.79,0.5],[-79.02,-20.82,0.5],[-79.49,-22.57,0.5],[-79.58,-22.84,0.5]]],"design":[{"node1":[-74.42,4.05,0.5],"node2":[50.1,6.26,0.5],"points":[[-74.42,4.05,0.5],[-71.47,4.42,0.5],[-67.05,5.16,0.5],[-62.63,5.16,0.5],[-57.84,5.16,0.5],[-53.05,5.89,0.5],[-49.37,6.26,0.5],[-45.31,6.26,0.5],[-42,6.26,0.5],[-39.05,6.26,0.5],[-35.74,6.26,0.5],[-32.42,6.26,0.5],[-28.37,6.26,0.5],[-23.95,6.26,0.5],[-19.53,6.26,0.5],[-14.74,6.26,0.5],[-10.32,6.26,0.5],[-5.53,6.26,0.5],[-0.37,6.26,0.5],[5.89,6.26,0.5],[11.79,6.26,0.5],[19.16,6.26,0.5],[26.89,6.26,0.5],[34.63,6.26,0.5],[41.63,6.26,0.5],[45.68,6.26,0.5],[49.64,6.26,0.5],[50.1,6.26,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[{"points":[[-41.2,4.7,5.23],[-40.53,6.26,0.5],[-37.39,6.26,0.5],[-34.08,6.26,0.5],[-30.39,6.26,0.5],[-26.16,6.26,0.5],[-21.74,6.26,0.5],[-17.13,6.26,0.5],[-12.53,6.26,0.5],[-7.92,6.26,0.5],[-2.95,6.26,0.5],[2.76,6.26,0.5],[8.84,6.26,0.5],[15.47,6.26,0.5],[23.03,6.26,0.5],[30.76,6.26,0.5]],"vectors":[[-0.27,-1.86,0.15],[-0.27,-1.86,0.08],[-0.25,-1.87,0.07],[-0.23,-1.87,0.07],[-0.21,-1.87,0.06],[-0.18,-1.88,0.05],[-0.15,-1.88,0.05],[-0.12,-1.88,0.04],[-0.09,-1.88,0.04],[-0.06,-1.88,0.03],[-0.02,-1.89,0.03],[0.02,-1.89,0.03],[0.06,-1.88,0.03],[0.1,-1.88,0.04],[0.15,-1.88,0.05],[0.2,-1.87,0.06]]}],"clearances":[[[31.94,49.57,2.28],[31.94,49.49,-2.72],[31.42,5.89,3],[31.42,5.81,-2],[-36.79,50.31,-2.73],[-36.79,50.39,2.27],[-37.31,6.63,-2],[-37.31,6.72,3]]]}']}

test_data_02 = {"mashup":
['{"boundaries":[],"design":[{"node1":[-99.84,45.68,0.5],"node2":[-58.28,-27.51,4.84],"points":[[-99.84,45.68,0.5],[-99.1,43.84,0.5],[-98.37,40.53,0.5],[-97.26,36.47,0.5],[-95.79,30.95,0.5],[-93.21,23.95,0.5],[-91,16.95,0.5],[-87.31,8.47,0.5],[-84.37,3.68,0.5],[-81.42,-1.11,0.5],[-78.84,-4.42,0.5],[-76.26,-8.11,0.5],[-74.79,-11.05,0.5],[-72.58,-13.63,0.5],[-70,-16.21,0.5],[-67.42,-18.79,0.5],[-64.47,-20.63,0.5],[-60.42,-23.58,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-58.28,-27.51,4.84],"node2":[-60.67,-65.08,1],"points":[[-58.28,-27.51,4.84],[-59.2,-29.41,1],[-58.83,-31.99,1],[-58.83,-35.3,1],[-58.83,-38.97,1],[-58.83,-42.28,1],[-58.83,-47.06,1],[-58.83,-51.47,1],[-58.83,-55.52,1],[-59.56,-59.2,1],[-59.93,-61.4,1],[-60.3,-62.87,1],[-60.67,-64.8,1],[-60.67,-65.08,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-58.28,-27.51,4.84],"node2":[-20.22,-40.08,5.47],"points":[[-50.47,-28.74,0.5],[-44.95,-31.68,0.5],[-40.16,-33.53,0.5],[-33.16,-35.74,0.5],[-27.26,-37.58,0.5]],"thickness":[5,5,5,5,5]},{"node1":[-20.22,-40.08,5.47],"node2":[13.26,-43.84,0.5],"points":[[-16.58,-40.89,0.5],[-10.68,-41.63,0.5],[-5.16,-42.74,0.5],[0,-43.1,0.5],[4.42,-43.84,0.5],[12.43,-43.84,0.5],[13.26,-43.84,0.5]],"thickness":[5,5,5,5,5,5,5]},{"node1":[-20.22,-40.08,5.47],"node2":[-13.24,-66.55,1],"points":[[-20.22,-40.08,5.47],[-20.59,-40.81,1],[-20.59,-41.91,1],[-20.22,-44.12,1],[-19.85,-45.96,1],[-19.49,-48.53,1],[-18.38,-51.84,1],[-16.91,-55.89,1],[-15.81,-59.56,1],[-15.07,-62.5,1],[-14.34,-63.98,1],[-13.6,-65.26,1],[-13.24,-66.27,1],[-13.24,-66.55,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[],"clearances":[]}']
}

test_data_03 = {"mashup":
['{"boundaries":[[[-93.58,-73.68,0.5],[-91.83,-73.68,0.5],[-86.21,-73.68,0.5],[-82.52,-73.68,0.5],[-77.55,-73.87,0.5],[-72.95,-74.05,0.5],[-68.62,-74.05,0.5],[-64.38,-74.05,0.5],[-60.24,-74.05,0.5],[-56.55,-74.05,0.5],[-52.5,-74.05,0.5],[-46.79,-74.05,0.5],[-43.84,-74.05,0.5],[-40.34,-74.79,0.5],[-33.48,-75.48,0.5],[-30.21,-75.89,0.5],[-25.79,-76.45,0.5],[-21,-76.91,0.5],[-16.21,-77.37,0.5],[-12.16,-77.37,0.5],[-8.11,-77.37,0.5],[5.85,-77.37,0.5],[23.02,-78.47,0.5],[23.58,-78.47,0.5]]],"design":[{"node1":[-126,67.79,0.5],"node2":[-51.06,-19.56,4.75],"points":[[-126,67.79,0.5],[-124.52,65.39,0.5],[-122.31,60.79,0.5],[-120.47,56.37,0.5],[-117.16,50.47,0.5],[-112.37,43.84,0.5],[-108.31,38.31,0.5],[-104.26,32.79,0.5],[-100.58,26.89,0.5],[-96.52,22.1,0.5],[-93.21,17.32,0.5],[-90.26,12.89,0.5],[-84.73,6.82,0.5],[-79.58,1.47,0.5],[-75.16,-2.21,0.5],[-70.74,-5.53,0.5],[-66.31,-8.11,0.5],[-62.26,-10.68,0.5],[-56.55,-13.82,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-51.06,-19.56,4.75],"node2":[-64.71,-70.96,1],"points":[[-51.06,-19.56,4.75],[-52.21,-20.22,1],[-52.21,-22.8,1],[-52.21,-25,1],[-52.21,-27.58,1],[-52.21,-30.15,1],[-52.21,-33.09,1],[-52.21,-36.03,1],[-52.21,-38.61,1],[-52.21,-41.18,1],[-52.58,-43.39,1],[-53.68,-45.22,1],[-54.6,-47.61,1],[-55.52,-50.37,1],[-55.89,-52.21,1],[-56.25,-53.68,1],[-56.62,-55.52,1],[-57.54,-57.91,1],[-58.64,-60.11,1],[-61.65,-66.28,1],[-64.59,-70.71,1],[-64.71,-70.96,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-51.06,-19.56,4.75],"node2":[0.72,-35.03,5.42],"points":[[-41.81,-21.18,0.5],[-35,-24.32,0.5],[-30.58,-26.16,0.5],[-25.79,-27.63,0.5],[-21.37,-28.74,0.5],[-16.58,-30.21,0.5],[-11.42,-31.32,0.5]],"thickness":[5,5,5,5,5,5,5]},{"node1":[0.72,-35.03,5.42],"node2":[53.05,-42.37,0.5],"points":[[10.68,-35.74,0.5],[16.95,-36.84,0.5],[22.84,-37.58,0.5],[27.63,-38.68,0.5],[33.71,-39.42,0.5],[43.29,-40.71,0.5],[52.18,-42.28,0.5],[53.05,-42.37,0.5]],"thickness":[5,5,5,5,5,5,5,5]},{"node1":[0.72,-35.03,5.42],"node2":[5.88,-75.01,1],"points":[[0.72,-35.03,5.42],[0.74,-36.77,1],[0.74,-39.34,1],[0.74,-41.91,1],[0.74,-44.49,1],[0.74,-48.17,1],[0.74,-51.47,1],[0.74,-54.78,1],[0.74,-57.72,1],[0.74,-59.56,1],[1.47,-61.77,1],[1.47,-62.87,1],[1.84,-64.34,1],[2.21,-65.45,1],[2.57,-66.55,1],[3.13,-68.48,1],[3.68,-69.49,1],[3.68,-70.96,1],[4.41,-72.06,1],[5.15,-73.35,1],[5.88,-75.01,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[{"points":[[-113.99,53.17,3.37],[-118.81,53.42,0.5],[-114.76,47.16,0.5],[-110.34,41.08,0.5],[-106.29,35.55,0.5],[-102.42,29.84,0.5],[-98.55,24.5,0.5],[-94.87,19.71,0.5],[-91.73,15.1,0.5],[-87.5,9.86,0.5],[-82.16,4.14,0.5],[-77.37,-0.37,0.5],[-72.95,-3.87,0.5],[-68.52,-6.82,0.5],[-64.29,-9.39,0.5],[-59.41,-12.25,0.5]],"vectors":[[-1.55,-1.06,0.08],[-1.56,-1.05,0.04],[-1.54,-1.08,0.04],[-1.51,-1.12,0.04],[-1.49,-1.15,0.04],[-1.46,-1.18,0.04],[-1.44,-1.21,0.04],[-1.41,-1.24,0.04],[-1.39,-1.27,0.03],[-1.36,-1.3,0.03],[-1.33,-1.33,0.03],[-1.3,-1.36,0.03],[-1.28,-1.38,0.03],[-1.26,-1.4,0.04],[-1.23,-1.42,0.04],[-1.21,-1.44,0.05]]},{"points":[[-37.92,-22.39,5.45],[-38.41,-22.75,0.5],[-32.79,-25.24,0.5],[-28.18,-26.89,0.5],[-23.58,-28.18,0.5],[-18.97,-29.47,0.5],[-14,-30.76,0.5],[-5.35,-33.17,2.96]],"vectors":[[-0.78,-2.84,0.17],[-0.79,-2.84,0.06],[-0.66,-2.87,0.06],[-0.56,-2.89,0.06],[-0.45,-2.91,0.06],[-0.35,-2.93,0.06],[-0.24,-2.94,0.06],[-0.04,-2.94,0.11]]},{"points":[[14.81,-35.4,5.38],[13.82,-36.29,0.5],[19.89,-37.21,0.5],[25.24,-38.13,0.5],[30.67,-39.05,0.5],[38.5,-40.06,0.5],[47.73,-41.49,0.5]],"vectors":[[0.05,-3.09,0.1],[0.04,-3.09,0.07],[0.07,-3.09,0.07],[0.1,-3.09,0.07],[0.14,-3.09,0.07],[0.18,-3.09,0.07],[0.23,-3.08,0.07]]}],"clearances":[[[2.98,27.92,1.9],[2.94,27.82,-3.1],[-52.27,-25.57,3.5],[-52.32,-25.67,-1.5],[-75.94,109.27,-4.1],[-75.9,109.37,0.9],[-131.2,55.78,-2.5],[-131.15,55.88,2.5]],[[21.73,26.12,1.77],[21.73,26.01,-3.22],[12.41,-33.74,3.06],[12.4,-33.84,-1.94],[-50.24,37.22,-3.34],[-50.23,37.33,1.65],[-59.56,-22.63,-2.06],[-59.56,-22.52,2.94]],[[55.62,13.89,1.37],[55.62,13.74,-3.62],[56.07,-38.75,3],[56.08,-38.91,-2],[4.81,13.3,-3.62],[4.81,13.45,1.38],[5.27,-39.35,-2],[5.27,-39.2,3]]]}']}

test_data_04 = {"mashup":
['{"boundaries":[[[-104.26,-114.21,0.5],[-102.79,-114.21,0.5],[-100.21,-114.21,0.5],[-98,-113.84,0.5],[-95.05,-113.84,0.5],[-92.1,-113.47,0.5],[-89.89,-113.47,0.5],[-87.31,-113.47,0.5],[-84.73,-113.47,0.5],[-82.89,-113.47,0.5],[-79.95,-113.47,0.5],[-77.37,-113.84,0.5],[-73.68,-114.21,0.5],[-70.74,-114.94,0.5],[-66.68,-115.31,0.5],[-63,-115.68,0.5],[-60.79,-115.68,0.5],[-58.03,-115.68,0.5],[-55.17,-115.68,0.5],[-53.05,-115.68,0.5],[-50.47,-115.68,0.5],[-48.63,-115.68,0.5],[-46.24,-116.05,0.5],[-44.12,-116.33,0.5],[-42.37,-116.42,0.5],[-40.16,-116.79,0.5],[-37.3,-117.16,0.5],[-36.84,-117.16,0.5]],[[1.84,-101.68,0.5],[2.76,-102.79,0.5],[3.87,-103.71,0.5],[4.42,-104.63,0.5],[5.53,-105.37,0.5],[6.63,-106.47,0.5],[8.11,-108.31,0.5],[9.95,-109.42,0.5],[11.42,-110.16,0.5],[12.53,-110.89,0.5],[14,-112,0.5],[15.47,-112.92,0.5],[17.32,-114.21,0.5],[19.16,-115.31,0.5],[20.63,-116.05,0.5],[21.37,-116.79,0.5],[22.47,-117.52,0.5],[23.95,-118.26,0.5],[25.42,-119,0.5],[27.63,-119.73,0.5],[29.1,-120.47,0.5],[30.95,-121.21,0.5],[32.42,-121.94,0.5],[33.89,-122.31,0.5],[35,-123.05,0.5],[36.1,-123.42,0.5],[38.31,-123.79,0.5],[39.79,-124.52,0.5],[41.26,-125.26,0.5],[43.29,-126.14,0.5],[43.47,-126.37,0.5]]],"design":[{"node1":[-92.1,33.16,0.5],"node2":[-8.23,29.86,0.5],"points":[[-92.1,33.16,0.5],[-91,33.16,0.5],[-85.84,33.16,0.5],[-80.31,33.16,0.5],[-74.05,33.16,0.5],[-67.42,33.16,0.5],[-61.52,33.16,0.5],[-55.63,33.16,0.5],[-48.26,33.16,0.5],[-38.87,33.16,0.5],[-30.95,33.16,0.5],[-22.84,33.16,0.5],[-15.29,33.16,0.5],[-8.23,29.86,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-8.23,29.86,0.5],"node2":[-34.4,-31.5,4.76],"points":[[-8.23,29.86,0.5],[-11.61,24.13,0.5],[-15.1,19.16,0.5],[-17.32,14.74,0.5],[-20.45,7.92,0.5],[-28.74,-12.53,0.5],[-32.42,-20.26,0.5],[-35.37,-27.26,0.5]],"thickness":[5,5,5,5,5,5,5,5]},{"node1":[-34.4,-31.5,4.76],"node2":[-74.05,-113.84,0.5],"points":[[-41.26,-39.42,0.5],[-43.47,-45.68,0.5],[-46.05,-51.95,0.5],[-48.63,-58.21,0.5],[-51.95,-65.95,0.5],[-54.53,-72.21,0.5],[-57.47,-78.1,0.5],[-60.05,-83.26,0.5],[-63,-88.42,0.5],[-65.58,-93.21,0.5],[-68.34,-100.58,0.5],[-73.84,-113.23,0.5],[-74.05,-113.84,0.5]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[-34.4,-31.5,4.76],"node2":[49.43,-30.7,1],"points":[[-34.4,-31.5,4.76],[-33.09,-31.8,1],[-26.47,-31.25,1],[-20.96,-30.88,1],[-14.34,-30.52,1],[-7.72,-30.52,1],[-1.1,-30.52,1],[5.88,-30.52,1],[11.77,-30.52,1],[16.55,-30.52,1],[22.43,-30.15,1],[27.76,-29.78,1],[33.09,-29.78,1],[39.34,-29.78,1],[49.43,-30.7,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]},{"node1":[49.43,-30.7,1],"node2":[20.59,-111.41,1],"points":[[49.43,-30.7,1],[48.17,-34.56,1],[45.59,-38.24,1],[43.75,-43.39,1],[41.18,-50.37,1],[38.24,-59.56,1],[35.3,-66.92,1],[33.09,-74.27,1],[30.15,-80.52,1],[27.94,-86.4,1],[25.37,-91.55,1],[23.53,-96.7,1],[20.61,-110.51,1],[20.59,-111.41,1]],"thickness":[5,5,5,5,5,5,5,5,5,5,5,5,5,5]}],"loads":[{"points":[[-77.98,33.22,5.49],[-77.18,33.16,0.5],[-70.74,33.16,0.5],[-64.47,33.16,0.5],[-58.58,33.16,0.5],[-51.95,33.16,0.5],[-43.56,33.16,0.5],[-34.91,33.16,0.5],[-26.89,33.16,0.5]],"vectors":[[0.53,-3.85,-0.2],[0.5,-3.86,-0.05],[0.38,-3.87,0],[0.24,-3.88,0.03],[0.1,-3.89,0.05],[-0.07,-3.89,0.06],[-0.28,-3.88,0.02],[-0.47,-3.86,-0.04],[-0.62,-3.84,-0.12]]},{"points":[[43.97,-44.69,5.94],[42.47,-46.88,1],[39.71,-54.97,1],[36.77,-63.24,1],[34.19,-70.59,1],[31.62,-77.4,1],[29.05,-83.46,1]],"vectors":[[-4.64,1.45,0.02],[-4.63,1.48,0.07],[-4.6,1.56,0.07],[-4.57,1.64,0.07],[-4.54,1.72,0.07],[-4.52,1.79,0.07],[-4.49,1.85,0.07]]}],"clearances":[[[-13.21,86.24,1.91],[-13.21,86.13,-3.09],[-13.43,33.05,3],[-13.43,32.94,-2],[-90.23,86.46,-3.09],[-90.23,86.56,1.91],[-90.46,33.27,-2],[-90.46,33.37,3]],[[72.08,-103.25,3.15],[71.86,-103.4,-1.84],[27.99,-86.07,4.59],[27.77,-86.22,-0.41],[89.64,-57.59,-4.02],[89.86,-57.43,0.97],[45.54,-40.41,-2.59],[45.77,-40.26,2.41]]]}']}

# path to topy's optimization code
rel_topy_path = None
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
            print msg + ': ', time1 - t
        elif time0 != None:
            print msg + ': ', time1 - time0
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

    t0 = timestamp()
    proc_post_data(test_data_01)
    timestamp(t=t0, msg='total time')
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

def on_left_side(p, p0, p1):
    v = [p[0]-p0[0], p[1]-p0[1]]
    v1 = [p1[0]-p0[0], p1[1]-p0[1]]
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

    dim_voxel = max(dim_voxel, 2)

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

    print nelx, nely

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
            load_point = [int((points[i][0]-vmin[0])/dim_voxel), int((points[i][1]-vmin[1])/dim_voxel)]
            load_points.append(load_point)
            load_values_x.append(vectors[i][0])     # assuming vectors' norms sum up to 1
            load_values_y.append(vectors[i][1])

    timestamp(msg='compute load points')

    # compute clearances
    pasv_elms = []
    for clearance in clearances:
        voxels_clearance = []
        for v in clearance:
            vx = math.floor((v[0]-vmin[0])/dim_voxel)
            vy = math.floor((v[1]-vmin[1])/dim_voxel)
            voxels_clearance.append([min(max(0, vx), nelx), min(max(0, vy), nely)])

        p0 = voxels_clearance[0]
        p1 = voxels_clearance[2]
        p2 = voxels_clearance[6]
        p3 = voxels_clearance[4]

        for j in xrange(0, nely):
            for i in xrange(0, nelx):
                p = [i*1.0, j*1.0]
                side0 = on_left_side(p, p0, p1)
                side1 = on_left_side(p, p1, p2)
                if side0 != side1:
                    continue

                side2 = on_left_side(p, p2, p3)
                if side1 != side2:
                    continue

                side3 = on_left_side(p, p3, p0)
                if side2 != side3:
                    continue

                pasv_elms.append([i, j, 1])

    timestamp(msg='compute clearances')

    # compute boundaries
    boundary_elms = []

    for boundary in boundaries:
        voxels = []

        for point in boundary:
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

            xmin = min(int(p0[0]), int(p1[0])) - 1
            xmax = max(int(p0[0]), int(p1[0])) + 1
            ymin = min(int(p0[1]), int(p1[1])) - 1
            ymax = max(int(p0[1]), int(p1[1])) + 1

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
            idx = j * (nelx + 1) + nelx - 1 - i
            debug_voxelgrid[2 * idx + 1] = 'x'

        for lp in load_points:
            i = lp[0]
            j = lp[1]
            idx = j * (nelx + 1) + nelx - 1 - i
            debug_voxelgrid[2 * idx + 1] = 'O'

        for bp in boundary_elms:
            i = bp[0]
            j = bp[1]
            idx = j * (nelx + 1) + nelx - 1 - i
            debug_voxelgrid[2 * idx + 1] = '*'

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

        load_values_x_str.append(str(load_values_x[i]) + '@' + str(len(node_str_array)))
        load_values_y_str.append(str(load_values_y[i]) + '@' + str(len(node_str_array)))

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
    subprocess.call('python ' + rel_topy_path + ' ' + tpd_path + ' ' + str(query), shell=True)

    print 'process successful'

    return tpd['PROB_NAME']

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

        result_initial = proc_post_data(post_data)

        # TODO: package the result
        self.wfile.write(result_initial)

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
