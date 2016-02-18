/**
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var ControlPanel = function () {

	var container = $('<div></div>');
	container.css('width', '256px');
	container.css('height', '100%');
	container.css('opacity', '0.5');
	container.css('color', '#ffffff');
	container.css('background-color', '#444444');
	container.css('top', '0px');
	container.css('position', 'absolute');
	container.css('font-family', 'Helvetica');
	container.css('font-size', '12px');
	
	

	var title = $('<b></b>');
	title.html('Template');
	title.css('margin-top', '10px');
	title.css('margin-bottom', '10px');
	title.css('margin-left', '10px');
	title.css('margin-right', '10px');
	container.append(title);

	return {

		// REVISION: 0,

		domElement: container

		// button1: btnAction1,

		// button7: btnAction7,

		// checkbox1: cb1,

		// slider1: slider1,

		// slider2: slider2,

		// slider3: slider3,

		// // label4: lb4,
		// label7: lb7,

		// dd1: dd1,

		// // dd2: dd2,

		// log: function (msg) {
		// 	outputMsg += new Date().toLocaleTimeString() + ": " + msg + '\n';
		// 	outputText.innerHTML = outputMsg + stuffingNewLines;
		// 	// console.log(outputText.innerHTML);
		// 	// outputText.innerHTML += "&#13;";
		// 	outputArea.scrollTop = 1000000;
		// 	outputText.scrollTop = 1000000;
		// }, 

		// ddOption: function (txt, val) {
		// 	var opt = document.createElement('option');
		// 	opt.innerHTML = txt;
		// 	opt.value = val;
		// 	return opt;
		// }
	}
};