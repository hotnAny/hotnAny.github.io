var XAC = XAC || {}

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

XAC.getDateString = function (dateObj) {
	var month = dateObj.getUTCMonth() + 1; //months from 1-12
	var day = dateObj.getUTCDate();
	var year = dateObj.getUTCFullYear();

	return year + "/" + month + "/" + day;
}

$(document).ready(function () {
	var url = window.location.href
	var idxLastSlash = url.lastIndexOf('#')
	var idBlog = url.substring(idxLastSlash + 1)

	YAML.load('posts/posts.yml', function (result) {
		// load a list of posts as toc
		var ulPosts = $('#ulPosts')
		XAC.posts = result.posts
		var idx = 0
		for (post of XAC.posts) {
			var liPost = $('<li/>')
			liPost.css('cursor', 'pointer')
			var strDate = XAC.getDateString(post.pubdate)
			var lbDate = $('<label/>')
			lbDate.addClass('lbdate')
			lbDate.html(strDate)
			liPost.append(lbDate)
			liPost.append('&nbsp;&nbsp;&nbsp;')
			liPost.append(post.title || 'untitled')
			liPost.attr('idx', idx++)
			liPost.click(function (e) {
				var idxClicked = $(this).attr('idx')
				var postClicked = XAC.posts[idxClicked]
				var file = postClicked.file
				XAC.renderMarkdown('posts/' + file, $('#divPostContent'), function () {
					$('#divPostContent').addClass('ppost')
					var idxSharp = window.location.href.indexOf('#')
					var urlNew = window.location.href
					if (idxSharp >= 0) urlNew = urlNew.substring(0, idxSharp)
					window.location.href = urlNew + '#' + postClicked.url
				})
			})
			ulPosts.append(liPost)
		}

		// load the post as shown in the url
		var url
		var idxSharp = window.location.href.indexOf('#')
		if (idxSharp >= 0) url = window.location.href.substring(idxSharp + 1)
		var postToLoad
		if (url != undefined)
			for (post of XAC.posts) {
				if (post.url == url) {
					postToLoad = post
					break
				}
			}
		else
			postToLoad = XAC.posts[XAC.posts.length - 1]
			
		XAC.renderMarkdown('posts/' + post.file, $('#divPostContent'), function () {
			$('#divPostContent').addClass('ppost')
		})
	})
})