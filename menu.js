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

var testText = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum."
var testItem = {
	imgUrl: 'smachno_03.jpg',
	name: 'Project Name',
	descp: 'This is an awesome project. This is an awesome project. This is an awesome project. This is an awesome project. This is an awesome project. This is an awesome project.',
	venue: "UIST '18"
};
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
	var tdImage = $('<td class="tdimg"><image src=' + item.imgUrl + '/></td>');
	var tdDescp = $('<td></td>');

	var strEllips = " ";
	var numEllipsDots = 40;
	for (var i = 0; i < numEllipsDots - item.name.length; i++) {
		strEllips += '. '
	}

	var tbDescp = $('<table class="tbdescp" border="0"><tr>'
		+ '<td class="tdprojname"><b>' + item.name
		+ '</b></td>' + '<td class="tdpubvenue">'
		+ item.venue + strEllips
		+ '</td>' + '</tr><tr><td colspan="2"><div class="divdescp">' + item.descp + '</div></td></tr></table>');
	// tdDescp.append($('<h4>' + item.name + '</h4>'));
	// tdDescp.append($('<div>' + item.descp + '</div>'));
	tdDescp.append(tbDescp);

	tb.append(tr);
	tr.append(tdImage);
	tr.append(tdDescp);
	return tb
}
