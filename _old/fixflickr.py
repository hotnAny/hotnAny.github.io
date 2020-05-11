#!/usr/bin/env python

import os 

if __name__ == "__main__":
	text = open('.flickr', 'r').read()
	text = text.replace('\"', '\'')
	# text = text.replace('500', '450')
	# text = text.replace('281', '252')
	print text
	os.system("echo '%s' | pbcopy" % text)
