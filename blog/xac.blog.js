var XAC = XAC || {}

XAC.renderMarkdown = function (file, container, callback) {
	// var file = file || "README.md";
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
		log(content)
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
	log(idBlog)

	YAML.load('posts/posts.yml', function (result) {
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
				var idx = $(this).attr('idx')
				var file = XAC.posts[idx].file
				XAC.renderMarkdown('posts/' + file, $('#divPostContent'), function () {
					$('#divPostContent').addClass('ppost')
				})
			})
			ulPosts.append(liPost)
		}
	})
})