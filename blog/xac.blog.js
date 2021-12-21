var XAC = XAC || {}

//
//	render markdown file into a html-based container
//
XAC.renderMarkdown = function (file, container, callback) {
	var reader = new stmd.DocParser();
	var writer = new stmd.HtmlRenderer();
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			display(xhr);
		}
	};

	function display(xhr) {
		var parsed = reader.parse(xhr.responseText);
		var content = writer.renderBlock(parsed);
		container.html(content);

		try {
			document.title = document.querySelector('h1').textContent
		} catch (e) {
			document.title = file;
		}

		callback()
	}

	xhr.open('GET', file);
	xhr.send();
}

//
//	get a string representation from a date object
//
XAC.getDateString = function (dateObj) {
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();

	var roundUp = function (num) {
		return num >= 10 ? num : ('0' + num)
	}

	var strDate = year + "/" + roundUp(month) + "/" + roundUp(day)
	return strDate
}

//
//	get a strip of meta info of a blog post
//
XAC.getMetaStrip = function (post) {
	var strip = '<label class="lbmeta">'
	strip += 'Published on: ' + XAC.getDateString(post.pubdate)
	strip += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tags: '
	var strSep = ' , '
	for (tag of post.tags) strip += tag + strSep
	strip = strip.substring(0, strip.length - strSep.length)
	strip += '</label>'
	return strip
}

//
//	post processing after loading
//
XAC.postProcessing = function (post) {
	$('#divPostContent').addClass('ppost')
	var metaStrip = XAC.getMetaStrip(post)
	var htmlPost = $('#divPostContent').html()
	htmlPost = htmlPost.replace('<h1>', '<h1 class="h1post">')
	$('#divPostContent').html(htmlPost.replace('</h1>', '</h1>' + metaStrip))
}

//
//	ready function
//
$(document).ready(function () {
	$('.divtitle').css('cursor', 'pointer')
	$('.divtitle').click(function (e) {
		var idxSharp = location.href.indexOf('#')
		var urlNew = location.href
		if (idxSharp >= 0)
			location.href = urlNew.substring(0, idxSharp)
		location.reload()
	})

	YAML.load('posts/posts.yml', function (result) {
		// load a list of posts as toc
		var ulPosts = $('#ulPosts')
		XAC.posts = result.posts
		XAC.posts.sort(function (a, b) {
			return new Date(b.pubdate) - new Date(a.pubdate)
		})
		for (i = 0; i < XAC.posts.length; i++) {
			var post = XAC.posts[i]
			var liPost = $('<li/>')
			liPost.css('cursor', 'pointer')
			var strDate = XAC.getDateString(post.pubdate)
			var lbDate = $('<label/>')
			lbDate.addClass('lbdate')
			lbDate.html(strDate)
			liPost.append(lbDate)
			liPost.append('&nbsp;&nbsp;&nbsp;&nbsp;')
			liPost.append(post.title || 'untitled')
			liPost.attr('idx', i)
			liPost.click(function (e) {
				var idxClicked = $(this).attr('idx')
				var postClicked = XAC.posts[idxClicked]
				var file = postClicked.file
				XAC.renderMarkdown('posts/' + file, $('#divPostContent'), function () {
					XAC.postProcessing(postClicked)
					var idxSharp = location.href.indexOf('#')
					var urlNew = location.href
					if (idxSharp >= 0) urlNew = urlNew.substring(0, idxSharp)
					location.href = urlNew + '#' + postClicked.url
					location.reload()
				})
			})
			ulPosts.append(liPost)
		}

		// load the post as shown in the url
		var url
		var idxSharp = location.href.indexOf('#')
		if (idxSharp >= 0) {
			url = location.href.substring(idxSharp + 1)
		}
		
		var postToLoad
		if (url != undefined) {
			$('#ulPosts').hide()
			for (post of XAC.posts) {
				if (post.url == url) {
					postToLoad = post
					break
				}
			}

			XAC.renderMarkdown('posts/' + postToLoad.file, $('#divPostContent'), function () {
				XAC.postProcessing(postToLoad)
			})
		}
		else {
			$('#divPost').hide()
		}

	})
})