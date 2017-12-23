var XAC = XAC || {}

XAC.renderMarkdown = function (file, container) {
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

		/* try to extract h1 title and use as title for page
		 if no h1, use name of file 
	  */
		try {
			document.title = document.querySelector('h1').textContent
		} catch (e) {
			document.title = file;
		}
	}

	xhr.open('GET', file);
	xhr.send();
}

$(document).ready(function () {
	var url = window.location.href
	var idxLastSlash = url.lastIndexOf('#')
	var idBlog = url.substring(idxLastSlash + 1)
	log(idBlog)

	YAML.load('posts/posts.yml', function (result) {
		var ulPosts = $('#ulPosts')
		XAC.posts = result.posts
		log(result.posts)
		var idx = 0
		for (post of XAC.posts) {
			var liPost = $('<li/>')
			liPost.css('cursor', 'pointer')
			liPost.html(post.title || 'untitled')
			liPost.attr('idx', idx++)
			liPost.click(function (e) {
				var idx = $(this).attr('idx')
				var file = XAC.posts[idx].file
				XAC.renderMarkdown('posts/' + file, $('#divPostContent'))
			})
			ulPosts.append(liPost)
		}
	})
})