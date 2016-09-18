var XAC = XAC || {};

XAC.readTextFile = function(file, followup) {
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function() {
		if (rawFile.readyState === 4) {
			if (rawFile.status === 200 || rawFile.status == 0) {
				if (followup != undefined) followup(rawFile.responseText);
			}
		}
	}
	rawFile.send(null);
}

function checkResponsiveness() {
	if ($(window).width() < 750) {
		$('.menu').css('column-count', '1');
	}
}

var divPages = [];
var divVideos = [];
var menuObj;

var imgServer, docServer;
var thbnServer = 'images/'

$(document).ready(function() {
	$(window).resize(function() {
		// console.log($(window).width())
		checkResponsiveness();
	});

	checkResponsiveness();

	XAC.readTextFile('menu.json', function(text) {
		menuObj = JSON.parse(text);
	})

	// console.log(menuObj)

	imgServer = menuObj.imgServer;
	docServer = menuObj.docServer;

	$('.menu').append(makeTitle('FABITIZERS'));
	for (var i = 0; i < menuObj.fabrication.length; i++) {
		$('.menu').append(makeItem(menuObj.fabrication[i]));
	}

	$('.menu').append($('<br/><br/>'));
	$('.menu').append(makeTitle('ENTR&Eacute;ERACTION TECHNIQUES'));
	for (var i = 0; i < menuObj.interactiontechniques.length; i++) {
		$('.menu').append(makeItem(menuObj.interactiontechniques[i]));
	}

	$('.menu').append($('<br/><br/>'));
	$('.menu').append(makeTitle('DISSERNET OF THINGS'));
	for (var i = 0; i < menuObj.internetofthings.length; i++) {
		$('.menu').append(makeItem(menuObj.internetofthings[i]));
	}

	$('.menu').append($('<br/><br/>'));
	$('.menu').append(makeTitle('SIDES'));
	for (var i = 0; i < menuObj.sideprojects.length; i++) {
		$('.menu').append(makeItem(menuObj.sideprojects[i]));
	}
});

function makeTitle(title) {
	var hTitle = '<div class="divtitle">' + title + '</div>';
	return hTitle;
}

function makeItem(item) {
	var tb = $('<table class="tbresearch" border="0"></table>');
	var tr = $('<tr></tr>');
	var imgStr = '<image src="' + thbnServer + item.imgUrl + '" id="tdImg_' + item.name + '" class="imgicon"/>';
	var tdImage = $('<td class="tdimg">' + imgStr + '</td>');

	if (item.title != undefined) {
		XAC.readTextFile(item.pageSrc, function(text) {
			divPages['tdImg_' + item.name] = text;
		});
		tdImage.css('cursor', 'pointer');
		tdImage.click(function(e) {
			var htmlText = divPages[$(e.target)[0].id];
			var divPage = $('<div class="divpage"></div>');
			divPage.append(makePage(item))
			divPage.popup({
				transition: 'all 0.3s'
			});
			divPage.popup('show');
		});
	} else if (item.exturl != undefined) {
		tdImage = $('<td class="tdimg"><a href=' + item.exturl + ' target="_blank">' + imgStr + '</a></td>');
	} else if (item.vimeoId != undefined || item.youtubeId != undefined) {
		var srcCode = item.vimeoId != undefined ? 'https://player.vimeo.com/video/' + item.vimeoId : 'https://www.youtube.com/embed/' + item.youtubeId + '?rel=0';
		var embedCode = '<iframe id="ifmVideo" src="' + srcCode + '" width="960" height="540" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
		divVideos['tdImg_' + item.name] = embedCode;
		tdImage.css('cursor', 'pointer');
		tdImage.click(function(e) {
			// console.log($(e.target)[0].id);
			var embedCode = divVideos[$(e.target)[0].id];
			var divVideo = $('<div class="divvideo"></div>');
			divVideo.html(embedCode);
			divVideo.popup({
				transition: 'all 0.3s',
				onclose: function() {
					// console.log('closing vimeo')
					$('#ifmVideo').attr('src', '');
					$('#ifmVideo').attr('id', '_ifmVideo');
				}
			});

			divVideo.popup('show');
		});
	}

	var tdDescp = $('<td></td>');

	var strEllips = " ";
	var numEllipsDots = 50;
	for (var i = 0; i < numEllipsDots - item.name.length; i++) {
		strEllips += '. '
	}

	var tbDescp = $('<table class="tbdescp" border="0"><tr>' + '<td class="tdprojname"><b>' + item.name + '</b></td>' + '<td class="tdpubvenue">' + item.venue + strEllips + '</td>' + '</tr><tr><td colspan="2"><div class="divdescp">' + item.descp + '</div></td></tr></table>');
	tdDescp.append(tbDescp);

	tb.append(tr);
	tr.append(tdImage);
	tr.append(tdDescp);

	return tb;
}

function makePage(item) {
	var divPage = $('<div class="divPage"></div>');

	//
	// abstract & title
	//
	divPage.append($('<h1>' + item.title + '</h1>'));
	divPage.append($('<br>'));
	//
	// pub & bib tex
	//
	var divPubBib = $('<div class="divpubbib"></div>');
	divPubBib.append($('<ul>' + '<li><a href="#tabPub">Publication</a></li>' + '<li><a href="#tabBib">Bibtex</a></li>' + '</ul>'))
	var divPub = $('<div id="tabPub"></div>');
	divPub.append($('<table class="tbpubinfo" align="center" border="0" cellspacing="0" cellpadding="10px">' + '<tr><td><a href="' + docServer + item.paperUrl + '" target="_blank">' + '<img class="imgpaper" src="' + thbnServer + item.paperThumbnail + '"/></a></td>' + '<td class="tdpubinfo">' + item.paperInfo + '</td></tr></table>'));

	var divBib = $('<div id="tabBib"></div>');
	divBib.append(item.bibtex);
	divPubBib.append(divPub);
	divPubBib.append(divBib);
	divPubBib.tabs();

	divPage.append(divPubBib);
	divPage.append($('<br>'));

	divPage.append($('<p class="pabstract">' + item.abstract + '</p>'));

	//
	// video
	//
	var divVideo = $('<br><div class="divvideo"></div>');
	divVideo.html(getVideoEmbedCode(item.videoType, item.videoId));
	divPage.append(divVideo);
	divPage.append($('<br>'));
	divPage.append($('<br>'));


	//
	// album
	//
	var divPhotos = $('<div class="divphotos"><div>');
	item.flickr = item.flickr.replace('500', '640');
	item.flickr = item.flickr.replace('281', '360');
	divPhotos.html(item.flickr);
	divPage.append(divPhotos);

	return divPage;
}

function getVideoEmbedCode(type, id) {
	var srcCode = type == 'youtube' ? 'https://www.youtube.com/embed/' + id + '?rel=0' :
		'https://player.vimeo.com/video/' + id;
	return '<iframe id="ifmVideo" src="' + srcCode + '" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>';
}