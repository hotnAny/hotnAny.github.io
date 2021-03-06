var XAC = XAC || {}

XAC.divVideos = []
XAC.dirImages = 'image/'

//
//	check mobile platform
//
window.mobilecheck = function () {
	var check = false;
	(function (a) {
		if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
	})(navigator.userAgent || navigator.vendor || window.opera)
	return check
};

//
//	check whether need to be responsive
//
XAC.checkResponsiveness = function () {
	if ($(window).width() < 640 || window.mobilecheck() == true) {
		XAC.col = 1
	} else if ($(window).width() < 1150) {
		XAC.col = 1
	} else {
		XAC.col = 2
	}

	$('#divMenu').css('column-count', XAC.col)
	$('#divMenu').css('-moz-column-count', XAC.col)
	$('#divMenu').css('-webkit-column-count', XAC.col)
}

//
//	the ready function
//
$(document).ready(function () {
	$(window).resize(function () {
		XAC.checkResponsiveness()
	});

	$('.divtitle').css('cursor', 'pointer')
	$('.divtitle').click(function (e) {
		location.reload()
	})

	XAC.htProjects = {}

	YAML.load('data.yml', function (result) {
		var menuObj = result;

		// $('#divSpecial').append(XAC.makeTitle('SELECTED PROJECTS'))
		// for (var i = 0; i < menuObj.specials.length; i++) {
		// 	$('#divSpecial').append(XAC.makeItem(menuObj.specials[i]))
		// }

		$('#divMenu').append(XAC.makeTitle('INTELLIGENT USER INTERFACES', true))
		for (var i = 0; i < menuObj.intelligentuserinterfaces.length; i++) {
			$('#divMenu').append(XAC.makeItem(menuObj.intelligentuserinterfaces[i]))
		}

		$('#divMenu').append(XAC.makeTitle('SENSING & INTERACTION TECHNIQUES'))
		for (var i = 0; i < menuObj.interactiontechniques.length; i++) {
			$('#divMenu').append(XAC.makeItem(menuObj.interactiontechniques[i]))
		}

		$('#divMenu').append(XAC.makeTitle('COMPUTATIONAL DESIGN & FABRICATION'))
		for (var i = 0; i < menuObj.fabrication.length; i++) {
			$('#divMenu').append(XAC.makeItem(menuObj.fabrication[i]))
		}

		$('#divMenu').append(XAC.makeTitle('SIDE PROJECTS'))
		for (var i = 0; i < menuObj.sideprojects.length; i++) {
			$('#divMenu').append(XAC.makeItem(menuObj.sideprojects[i]))
		}

		XAC.checkResponsiveness()

		var url
		var idxSharp = location.href.indexOf('#')
		if (idxSharp >= 0) url = location.href.substring(idxSharp + 1)
		var projToLoad
		if (url != undefined) {
			var idImgToClick = XAC.htProjects[url]
			$('#' + idImgToClick).trigger('click')
		}
	})

});

//
//  make a project item displayed on the menu
//
XAC.makeItem = function (item) {
	var tb = $('<table class="tbresearch" border="0"></table>')
	var tr = $('<tr></tr>')
	var idImg = 'tdImg_' + XAC.createUrl(item.name).replace(/-/g, '_')
	var imgStr = '<image src="' + XAC.dirImages + item.imgUrl +
		'" id="' + idImg + '" class="imgicon"/>'
	var url = XAC.createUrl(item.name)
	XAC.htProjects[url] = idImg
	var img = $(imgStr)
	var tdImage = $('<td class="tdimg"></td>')
	tdImage.append(img);

	// 1. has a stand-alone project page
	if (item.title != undefined) {
		img.css('cursor', 'pointer')
		img.click(function (e) {
			var divItem = $('<div class="divpage"></div>');

			divItem.popup({
				transition: 'all 0.3s',
				onclose: function () {
					console.log(this.attr('id'))
					var iframeId = 'v_' + this.attr('id')
					var src = $('iframe#' + iframeId).attr('src')
					$('iframe#' + iframeId).attr('src', '')
					$(document.body).css('overflow', 'scroll')
					XAC.updateUrl()
				}
			})
			divItem.popup('show')
			item.iframeId = 'v_' + divItem.attr('id')
			divItem.append(makePage(item))

			if (XAC.col <= 1) {
				$('.divpage').css('width', '70%')
			} else {
				$('.divpage').css('width', '55%')
			}

			$(document.body).css('overflow', 'hidden')

			XAC.updateUrl(item.name)
		})
	}
	// 2. link to external page
	else if (item.exturl != undefined) {
		tdImage = $('<td class="tdimg"><a href=' + item.exturl + ' target="_blank">' + imgStr + '</a></td>')
	}
	// 3. show embedded video
	else if (item.vimeoId != undefined || item.youtubeId != undefined) {
		var srcCode = item.vimeoId != undefined ? 'https://player.vimeo.com/video/' + item.vimeoId : 'https://www.youtube.com/embed/' + item.youtubeId + '?rel=0'
		var embedCode = '<iframe id="ifmVideo" src="' + srcCode + '" width="960" height="540" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
		XAC.divVideos[idImg] = embedCode
		img.css('cursor', 'pointer')
		img.click(function (e) {
			var embedCode = XAC.divVideos[$(e.target)[0].id]
			var divVideo = $('<div class="divvideo"></div>')
			divVideo.html(embedCode)
			divVideo.popup({
				transition: 'all 0.3s',
				onclose: function () {
					$('#ifmVideo').attr('src', '')
					$('#ifmVideo').attr('id', '_ifmVideo')
					XAC.updateUrl()
				}
			});

			divVideo.popup('show')

			XAC.updateUrl(item.name)
		})
	}

	var tdDescp = $('<td></td>')
	tdDescp.css('margin-right', '5%')

	var strEllips = " "
	var numEllipsDots = 50
	for (var i = 0; i < numEllipsDots - item.name.length; i++) {
		strEllips += '. '
	}

	var tbDescp = $('<table class="tbdescp" border="0"><tr>' + '<td class="tdprojname"><b>' + item.name + '</b></td>' + '<td class="tdpubvenue">' + item.venue + strEllips + '</td>' + '</tr><tr><td colspan="2"><div class="divdescp">' + item.descp + '</div></td></tr></table>')
	tdDescp.append(tbDescp);

	tb.append(tr)
	tr.append(tdImage)
	tr.append(tdDescp)

	return tb
}

//
//  make a detailed project page
//
function makePage(item) {
	var divPage = $('<div></div>');

	//
	// abstract & title
	//
	divPage.append($('<h1 class="h1project">' + item.title + '</h1>'))
	divPage.append($('<p class="pabstract">' + item.abstract + '</p>'));

	//
	// video
	//
	if (item.videoId != undefined) {
		var divVideo = $('<br><div class="divvideo"></div>')
		var wvideo = XAC.col > 2 ? 640 : window.innerWidth * 0.5
		var hvideo = wvideo * 9 / 16
		divVideo.html(XAC.getVideoEmbedCode(item.videoType, item.videoId, wvideo, hvideo, item.iframeId))
		divPage.append(divVideo)
		divPage.append($('<br><br><br>'))
	}

	//
	// album
	// ref: https://flickrembed.com/
	//
	if (item.flickr != undefined) {
		var walbum = XAC.col > 2 ? 640 : window.innerWidth * 0.5
		var halbum = walbum * 9 / 16 * 1.2;

		var codeOnLoad = ''
		var divPhotos = $('<iframe id="ifPhotos" onload="' + codeOnLoad +
			'" style="position: relative; top: 0; left: 0; text-align: left; width: 100%; height: ' +
			halbum + 'px;" src="https://flickrembed.com/cms_embed.php?source=flickr&layout=responsive&input=' + item.flickr + '&sort=0&by=album&theme=default_notextpanel&scale=fit&limit=100&skin0&skin=alexis&autoplay=false" scrolling="no" frameborder="0" allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>')

		divPage.append(divPhotos)
		// divPage.append($('<br/><br/>'))
	}

	//
	// pub & bib tex
	//
	var divPubBib = $('<div class="divpubbib"></div>')
	// divPubBib.append($('<ul>' + '<li><a href="#tabPub">Publication</a></li>' + '<li><a href="#tabBib">Bibtex</a></li>' + '</ul>'))
	
	var divPub = $('<div></div>')
	divPub.append($('<table class="tbpubinfo" width="95%" align="center" border="0" cellspacing="0" cellpadding="10px">' + 
		'<tr><td><a href="' + item.paperUrl + '" target="_blank">' + '<img class="imgpaper" src="' + XAC.dirImages + item.paperThumbnail + '"/></a></td>' 
		+ '<td class="tdpubinfo">' + item.paperInfo + '</td></tr>'
		+ '<tr><td colspan=2><div class="div-bib">' + item.bibtex + '</div></td></tr></table>'));

	// var divBib = $('<div class="div-bib"></div>');
	// divBib.css('width', '95%');
	// divBib.append(item.bibtex)
	divPubBib.append(divPub)
	// divPubBib.append($('<br>'));
	// divPubBib.append(divBib)
	// divPubBib.tabs();

	divPage.append(divPubBib)
	divPage.append($('<br>'));

	return divPage
}

//
//	create title for menu items
//
XAC.makeTitle = function (title, isFirst) {
	var hTitle = $('<div class="divtitle">' + title + '</div>')
	if (isFirst) hTitle.css('margin-top', 0)
	return hTitle
}

//
//  get video embed code with updated info
//
XAC.getVideoEmbedCode = function (type, vid, w, h, iframeId) {
	var srcCode = type == 'youtube' ? 'https://www.youtube.com/embed/' + vid + '?rel=0' :
		'https://player.vimeo.com/video/' + vid
	console.info(iframeId)
	return '<iframe id="' + iframeId + '" src="' + srcCode + '" width="' + w + '" height="' + h + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
}

//
//  create a unique part of the url from the title
//
XAC.createUrl = function (title) {
	if (title == undefined) return ''
	return title.replace(/[&\/\\#,+()$~%.'":*;?<>{}]/g, '')
		.replace(/ /g, '-').toLowerCase()
}

//
//  update window url with project name (that's been clicked)
//
XAC.updateUrl = function (name) {
	var idxSharp = location.href.indexOf('#')
	var urlNew = location.href
	if (idxSharp >= 0) urlNew = urlNew.substring(0, idxSharp)
	// if(name != undefined) 
	location.href = urlNew + '#' + XAC.createUrl(name)
	// else location.href = urlNew
}