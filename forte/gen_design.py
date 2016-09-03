#!/usr/bin/env python

##########################################################################
#
#   generate designs using topology optimization
#
##########################################################################

from sys import argv
import json
from topy_api import gen_tpd, optimize

RESOLUTION = 64
AMNTMAT = 1.0

def gen_design(original, favored, disfavored, resolution, material):
    tpd = gen_tpd(original, resolution, material)
    optimize(tpd)
    return

if __name__ == "__main__":
    if len(argv) < 4:
        print 'usage: ./gen_design.py <path_to_origiinal_design> <path_to_favored_design> <path_to_disfavored_design>\n\t* use None as default'
        quit()

    original = json.loads(open(argv[1], 'r').read())
    favored = json.loads(open(argv[2], 'r').read()) if argv[2] != 'None' else None
    disfavored = json.loads(open(argv[3], 'r').read()) if argv[3] != 'None' else None

    resolution = int(argv[4]) if len(argv) > 4 else RESOLUTION
    material = float(argv[5]) if len(argv) > 5 else AMNTMAT

    # print original, favored, disfavored, resolution, material
    gen_design(original, favored, disfavored, resolution, material)
