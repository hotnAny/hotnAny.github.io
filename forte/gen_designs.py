#!/usr/bin/env python

##########################################################################
#
#   generate design using topology optimization based on user's sketch
#
##########################################################################

from sys import argv
import json
import subprocess

from topy_api import gen_tpd, optimize

if __name__ == "__main__":
    num_req_params = 4
    if len(argv) < num_req_params + 1:
        print 'usage: ./gen_designs.py <path_to_design_file> <reslution> <amount_of_material> <output_path>'
        quit()

    design = json.loads(open(argv[1], 'r').read())
    resolution = int(argv[2])
    material = float(argv[3])
    output_path = argv[4]

    # cutoffs = [0.1]
    mincutoff = 2
    maxcutoff = 7
    step = 0.05

    for i in range(mincutoff, maxcutoff):
        cutoff = i * step
        tpd, debug_voxelgrid = gen_tpd(design, resolution, material)
        print ''.join(debug_voxelgrid)[::-1]
        probname = optimize(tpd, cutoff)
        sub_outpath = output_path + '/' + str(cutoff)
        print sub_outpath
        subprocess.call('mkdir ' + sub_outpath, shell=True)
        subprocess.call('mv ' + probname + '* ' + sub_outpath, shell=True)
