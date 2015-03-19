/**
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var stuffingNewLines = '\n\n\n\n\n\n\n\n\n\n\n';
var outputMsg = '';

// function ddOption (txt, val) {
// 	var opt = document.createElement('option');
// 	opt.innerHTML = txt;
// 	opt.value = val;
// 	return opt;
// }

var ControlPanel = function () {

	var container = document.createElement( 'div' );
	container.id = 'cp';
	// container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cssText = 'width:256px;height:100%;overflow:hidden;opacity:0.5;font-family:Helvetica;background-color:#444444;color:#ffffff';
	// container.innerHTML = "<div>Polka</div>"

	var txtTitle = document.createElement( 'div' );
	txtTitle.id = 'title';
	txtTitle.style.cssText = 'margin-left:3px;margin-top:5px;overflow:inherit;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:15px';
	txtTitle.innerHTML = '<b>Bach</b>';
	container.appendChild( txtTitle );

	var cssBtn = 'margin-left:3px;margin-top:5px;padding:1px 3px 1px 3px;font-family:Helvetica;border-radius:5px;font-size:10px;line-height:15px;text-align:left;background-color:#ffffff';
	var cssCb = 'margin-left:3px;margin-top:5px;padding:3px 1px 3px 1px;font-family:Helvetica;font-size:10px;line-height:25px;text-align:left';
	var cssLb = 'margin-left:3px;margin-top:5px;padding:5px 5px 5px 5px;font-family:Helvetica;font-size:10px;line-height:25px;text-align:left';

	/*
		debug mode
	*/
	var cb1 = document.createElement( 'input' );
	cb1.id = 'cb1';
	cb1.setAttribute('type', 'checkbox');
	cb1.style.cssText = cssCb;
	cb1.checked = false;
	container.appendChild( cb1 );
	var lb1 = document.createElement( 'label' );
	lb1.innerHTML = 'Debug mode';
	lb1.style.cssText = cssCb;
	container.appendChild( lb1 );
	container.appendChild(document.createTextNode( '\u00A0\u00A0' ));

	container.appendChild(document.createElement('br'));

	/*
		loading objects
	*/
	var lb5 = document.createElement( 'label' );
	lb5.innerHTML = 'Object to print:  ';
	lb5.style.cssText = cssLb;
	container.appendChild( lb5 );

	var dd1 = document.createElement( 'select' );
	container.appendChild(dd1);

	container.appendChild(document.createElement('br'));



	/*
		orientation sliders
	*/
	var lb7 = document.createElement( 'label' );
	lb7.innerHTML = 'Orientation';
	lb7.style.cssText = cssCb;
	container.appendChild( lb7 );
	container.appendChild(document.createElement('br'));

	var slider1 = document.createElement( 'input' );
	slider1.id = 'sldr1';
	slider1.setAttribute('type', 'range');
	slider1.style.cssText = cssCb;
	slider1.min = '0';
	slider1.max = '360';
	slider1.value = '0';
	slider1.step = '1';
	// slider1.onchange = "updateSlider(this.value)";
	container.appendChild( slider1 );

	container.appendChild(document.createElement('br'));

	var slider2 = document.createElement( 'input' );
	slider2.id = 'sldr2';
	slider2.setAttribute('type', 'range');
	slider2.style.cssText = cssCb;
	slider2.min = '0';
	slider2.max = '360';
	slider2.value = '0';
	slider2.step = '1';
	// slider2.onchange = "updateSlider(this.value)";
	container.appendChild( slider2 );

	container.appendChild(document.createElement('br'));

	var slider3 = document.createElement( 'input' );
	slider3.id = 'sldr3';
	slider3.setAttribute('type', 'range');
	slider3.style.cssText = cssCb;
		slider3.min = '0';
	slider3.max = '360';
	slider3.value = '0';
	slider3.step = '1';
	// slider3.onchange = "updateSlider(this.value)";
	container.appendChild( slider3 );

	container.appendChild(document.createElement('br'));



	/*
		find printable sub surfaces
	*/
	var btnAction1 = document.createElement( 'button' );
	btnAction1.id = 'action1';
	btnAction1.style.cssText = cssBtn;
	btnAction1.innerHTML = 'Do nothing';
	container.appendChild( btnAction1 );

	container.appendChild(document.createTextNode( '\u00A0\u00A0' ));



	/*
		save file
	*/
	var btnAction7 = document.createElement( 'button' );
	btnAction7.id = 'action7';
	btnAction7.style.cssText = cssBtn;
	btnAction7.innerHTML = 'Save STL';
	// container.appendChild( btnAction7 );

	// container.appendChild(document.createElement('br'));

	var aDownload = document.createElement( 'a' );
	aDownload.style.cssText = cssLb;
	aDownload.innerHTML = 'Save data';
	container.appendChild( aDownload );	

	container.appendChild(document.createElement('br'));

	// output area
	var outputArea = document.createElement( 'div' );
	outputArea.id = 'outputArea';
	outputArea.style.cssText = 'position:fixed;height:100%;left:3px;right:3px;top:220;bottom:3px;overflow-x:hidden;overflow-y:scroll;';
	container.appendChild( outputArea );

	var outputText = document.createElement( 'textarea' );
	outputText.id = 'outputText';
	outputText.style.cssText = 'height:100%;width:270;margin-left:0px;border-width:0px;margin-top:5px;margin-bottom:15px;margin-right:50px;white-space:pre-wrap;overflow:inherit;color:#ffffff;background-color:#444444;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:15px;';
	outputText.innerHTML = '';
	outputArea.appendChild( outputText );

	outputArea.appendChild(document.createElement('br'));

	return {

		REVISION: 0,

		domElement: container,

		button1: btnAction1,

		button7: btnAction7,

		checkbox1: cb1,

		slider1: slider1,

		slider2: slider2,

		slider3: slider3,

		// label4: lb4,
		label7: lb7,

		dd1: dd1,

		// dd2: dd2,

		a1: aDownload,

		log: function (msg) {
			outputMsg += new Date().toLocaleTimeString() + ": " + msg + '\n';
			outputText.innerHTML = outputMsg + stuffingNewLines;
			// console.log(outputText.innerHTML);
			// outputText.innerHTML += "&#13;";
			outputArea.scrollTop = 1000000;
			outputText.scrollTop = 1000000;
		}, 

		ddOption: function (txt, val) {
			var opt = document.createElement('option');
			opt.innerHTML = txt;
			opt.value = val;
			return opt;
		}
	}
};