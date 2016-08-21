#!/usr/bin/env python

##########################################################################
#
#   script for running a bunch of optimization
#
##########################################################################

import time
import datetime
import subprocess
import sys
from topy_server import proc_post_data

# examples x amnt material x resolution
example_files = ['chair_02.forte', 'bookcase_02.forte', 'stepstool_02.forte']
example_data = []
amnts_mats = [0.05 *  x for x in range(1, 6)]
resolutions = [32 * x for x in range(4, 8)]

for ex_file in example_files:
    example_data.append(open(ex_file, 'r').read())

exp_dir = 'recycle/forte_exp_' + str(long(time.time()))
subprocess.call('mkdir ' + exp_dir, shell=True)
log_file = open(exp_dir + '/log.txt', 'w')
log_file.write(str(datetime.datetime.now()) + '\n')

for res in resolutions:
    for amnt in amnts_mats:
        for i in xrange(0, len(example_data)):
            log_file = open(exp_dir + '/log.txt', 'a')

            ex = example_data[i]
            log_file.write('-------------------------------------------------------------------\n')
            trial_name = '_'.join([str(example_files[i]), str(res), str(amnt)])

            print 'running ' + trial_name + ' ...'
            log_file.write(trial_name + ':\n')
            log_file.write('started at ' + str(datetime.datetime.now()) + '\n')
            log_file.close()

            subprocess.call('mkdir ' + exp_dir + '/' + trial_name, shell=True)
            try:
                proc_post_data({'forte': [ex]}, res, amnt, exp_dir + '/' + trial_name)
                log_file.write('success!' + '\n')
            except:
                print sys.exc_info()
                log_file.write(str(sys.exc_info()))
                log_file.write('\n')

            log_file = open(exp_dir + '/log.txt', 'a')
            log_file.write('finished at ' + str(datetime.datetime.now()) + '\n')
            log_file.close()
