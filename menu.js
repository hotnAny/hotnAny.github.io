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


var divPages = [];
var menuObj;


$(document).ready(function() {

	XAC.readTextFile('menu.json', function(text) {
		menuObj = JSON.parse(text);
	})

	console.log(menuObj)

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
	var imgStr = '<image src=' + item.imgUrl + ' id="tdImg_' + item.name + '" class="imgicon"/>';
	var tdImage = $('<td class="tdimg">' + imgStr + '</td>');
	
	if (item.pageSrc != undefined) {
		XAC.readTextFile(item.pageSrc, function(text){
			// console.log(text)
			var divPage = $('<div class="divpage"></div>');
			divPage.html(text);
			divPage.popup({
				transition: 'all 0.3s'
			});
			divPages['tdImg_' + item.name] = divPage;
		});
		tdImage.css('cursor', 'pointer');
		tdImage.click(function(e) {
			console.log($(e.target)[0].id);
			var divPage = divPages[$(e.target)[0].id];
			divPage.popup('show');
		});
	} else if (item.exturl != undefined) {
		tdImage = $('<td class="tdimg"><a href=' + item.exturl + ' target="_blank">' + imgStr + '</a></td>');
	}

	var tdDescp = $('<td></td>');

	var strEllips = " ";
	var numEllipsDots = 40;
	for (var i = 0; i < numEllipsDots - item.name.length; i++) {
		strEllips += '. '
	}

	var tbDescp = $('<table class="tbdescp" border="0"><tr>' + '<td class="tdprojname"><b>' + item.name + '</b></td>' + '<td class="tdpubvenue">' + item.venue + strEllips + '</td>' + '</tr><tr><td colspan="2"><div class="divdescp">' + item.descp + '</div></td></tr></table>');
	// tdDescp.append($('<h4>' + item.name + '</h4>'));
	// tdDescp.append($('<div>' + item.descp + '</div>'));
	tdDescp.append(tbDescp);

	tb.append(tr);
	tr.append(tdImage);
	tr.append(tdDescp);
	return tb
}