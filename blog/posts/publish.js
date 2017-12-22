//////////////////////////////////////////////////////////////////////
//
//	node js script for publishing blog post
//
//	by xiangchen@acm.org, v0.0, 12/2017
//
//////////////////////////////////////////////////////////////////////

var fs = require('fs')
var readYaml = require('read-yaml')
var writeYaml = require('write-yaml')
var process = require('process')
var util = require('util')
var objPost = {}

var usage = 'usage: node publish.js <post_file> <tag_#1> <tag_#2> ... <tag_#n>'

// parse input arguments that consist of meta data
var parseArguments = function (objPost, index, val) {
	if (index == 2) objPost.file = val
	else if (index > 2) {
		objPost.tags = objPost.tags || []
		objPost.tags.push(val)
	}
}

process.argv.forEach(function (val, index, array) {
	parseArguments(objPost, index, val)
})

if (objPost.file == undefined) {
	console.log(usage)
	return
}

// write post metadata into posts.yml
readYaml('posts.yml', function (err, data) {
	if (err) throw err
	console.log(data)

	if (data != null && data.posts != null) {
		// remove identical post for overwrite
		for (var i = 0; i < data.posts.length; i++) {
			var post = data.posts[i]
			if (post.file == objPost.file) {
				data.posts.splice(i, 1)
				break
			}
		}
	}

	data = data || {}
	data.posts = data.posts || []
	var stats = fs.statSync(objPost.file)
	objPost.birthdate = new Date(util.inspect(stats.birthtime))
	objPost.pubdate = new Date()
	data.posts.push(objPost)

	writeYaml('posts.yml', data, function (err) {
		if (err != null) console.log(err)
	})
})