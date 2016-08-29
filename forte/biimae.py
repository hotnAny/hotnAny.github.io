#!/usr/bin/env python

##########################################################################
#
#   voxel grid (2d) to binary image
#
##########################################################################
from sys import argv
from PIL import Image

if __name__ == "__main__":
    if len(argv) < 2:
        print 'usage: ./biimage <path_to_input_image>'
    else:
        pixels = []
        w = -1
        h = -1
        for i in xrange(1, len(argv)):
            vxg_file = open(argv[i], 'r')
            vxg_data = vxg_file.read()
            rows = vxg_data.split('\n')
            rows.reverse()

            h = len(rows) if h == -1 else h

            pixel_idx = 0
            for row in rows:
                row_arr = row.split(',')

                w = len(row_arr) if w == -1 else w

                for voxel in row_arr:
                    pixel_value = 255 if float(voxel) < 0.75 else 0
                    if i == 1:
                        pixels.append(pixel_value)
                    elif i == 2:
                        if pixel_value == 0 and pixels[pixel_idx] == 0:
                            pixels[pixel_idx] = 255
                        else:
                            pixels[pixel_idx] = min(pixels[pixel_idx], pixel_value)

                    pixel_idx += 1

            vxg_file.close()

        img = Image.new('L', (w, h))
        img.putdata(pixels)
        img.save('image.bmp')

# im = Image.open(argv[1])
# pixels = list(im.getdata())
# print pixels
# print im.format, im.size, im.mode
