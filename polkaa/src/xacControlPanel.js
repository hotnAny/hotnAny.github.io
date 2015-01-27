/**
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var stuffingNewLines = '\n\n\n\n\n\n\n\n\n\n\n';
var outputMsg = '';

var ControlPanel = function () {

	var container = document.createElement( 'div' );
	container.id = 'cp';
	// container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cssText = 'width:256px;height:100%;overflow:hidden;opacity:0.5;font-family:Helvetica;background-color:#444444;color:#ffffff';
	// container.innerHTML = "<div>Polka</div>"

	var txtTitle = document.createElement( 'div' );
	txtTitle.id = 'title';
	txtTitle.style.cssText = 'margin-left:3px;margin-top:5px;overflow:inherit;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:15px';
	txtTitle.innerHTML = '<b>Polka</b>';
	container.appendChild( txtTitle );

	var cssBtn = 'margin-left:3px;margin-top:5px;padding:1px 3px 1px 3px;font-family:Helvetica;border-radius:5px;font-size:10px;line-height:15px;text-align:left;background-color:#ffffff';
	var cssCb = 'margin-left:3px;margin-top:5px;padding:3px 1px 3px 1px;font-family:Helvetica;font-size:10px;line-height:15px;text-align:left';

	// check boxes
	var cb1 = document.createElement( 'input' );
	cb1.id = 'cb1';
	cb1.setAttribute('type', 'checkbox');
	cb1.style.cssText = cssCb;
	cb1.checked = true;
	container.appendChild( cb1 );
	var lb1 = document.createElement( 'label' );
	lb1.innerHTML = 'Debug mode &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	lb1.style.cssText = cssCb;
	container.appendChild( lb1 );

	var cb2 = document.createElement( 'input' );
	cb2.id = 'cb2';
	cb2.setAttribute('type', 'checkbox');
	cb2.style.cssText = cssCb;
	container.appendChild( cb2 );
	var lb2 = document.createElement( 'label' );
	lb2.innerHTML = 'Show octree';
	lb2.style.cssText = cssCb;
	container.appendChild( lb2 );

	container.appendChild(document.createElement('br'));

	var cb3 = document.createElement( 'input' );
	cb3.id = 'cb3';
	cb3.setAttribute('type', 'checkbox');
	cb3.style.cssText = cssCb;
	container.appendChild( cb3 );
	var lb3 = document.createElement( 'label' );
	lb3.innerHTML = 'Apply physics';
	lb3.style.cssText = cssCb;
	container.appendChild( lb3 );

	container.appendChild(document.createElement('br'));

	// button to build octree
	var btnAction1 = document.createElement( 'button' );
	btnAction1.id = 'action1';
	btnAction1.style.cssText = cssBtn;
	btnAction1.innerHTML = 'Build Octree';
	// container.appendChild( btnAction1 );
	// container.appendChild(document.createElement('br'));

	// button to find mutually bounded
	var btnAction4 = document.createElement( 'button' );
	btnAction4.id = 'action4';
	btnAction4.style.cssText = cssBtn;
	btnAction4.innerHTML = 'Mutually Bounded';
	// container.appendChild( btnAction4 );
	// container.appendChild(document.createElement('br'));

	// button to detect intersection
	var btnAction2 = document.createElement( 'button' );
	btnAction2.id = 'action2';
	btnAction2.style.cssText = cssBtn;
	btnAction2.innerHTML = 'Detect Intersection';
	// container.appendChild( btnAction2 );
	// container.appendChild(document.createElement('br'));

	// button to detect overlap
	var btnAction3 = document.createElement( 'button' );
	btnAction3.id = 'action3';
	btnAction3.style.cssText = cssBtn;
	btnAction3.innerHTML = 'Detect Overlap';
	// container.appendChild( btnAction3 );
	// container.appendChild(document.createElement('br'));

	// button to detect interlock
	var btnAction5 = document.createElement( 'button' );
	btnAction5.id = 'action5';
	btnAction5.style.cssText = cssBtn;
	btnAction5.innerHTML = 'Detect Interlock';
	container.appendChild( btnAction5 );

	container.appendChild(document.createElement('br'));

	var btnAction6 = document.createElement( 'button' );
	btnAction6.id = 'action6';
	btnAction6.style.cssText = cssBtn;
	btnAction6.innerHTML = 'Voxelize';
	container.appendChild( btnAction6 );

	container.appendChild(document.createElement('br'));	

	// var slider1 = document.createElement( 'input' );
	// slider1.id = 'sldr1';
	// slider1.setAttribute('type', 'range');
	// slider1.style.cssText = cssCb;
	// slider1.min = '0.1';
	// slider1.max = '200';
	// slider1.value = '100';
	// slider1.step = '1';
	// // slider1.onchange = "updateSlider(this.value)";
	// container.appendChild( slider1 );

	// var lb4 = document.createElement( 'label' );
	// lb4.innerHTML = slider1.value + "%";
	// lb4.style.cssText = cssCb;
	// container.appendChild( lb4 );

	container.appendChild(document.createElement('br'));
	// var btnAction6 = document.createElement( 'button' );
	// btnAction6.id = 'action6';
	// btnAction6.style.cssText = cssBtn;
	// btnAction6.innerHTML = 'Apply physics';
	// container.appendChild( btnAction6 );

	// container.appendChild(document.createElement('br'));

	// var outputLabel = document.createElement('label');
	// outputLabel.style.cssText = cssCb;
	// outputLabel.innerHTML = "Log: ";
	// container.appendChild( outputLabel );
	// container.appendChild(document.createElement('br'));

	// output area
	var outputArea = document.createElement( 'div' );
	outputArea.id = 'outputArea';
	outputArea.style.cssText = 'position:fixed;height:100%;left:3px;right:3px;top:120px;bottom:3px;overflow-x:hidden;overflow-y:scroll;';
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

		button2: btnAction2,

		button3: btnAction3,

		button4: btnAction4,

		button5: btnAction5,

		button6: btnAction6,

		checkbox1: cb1,

		checkbox2: cb2,

		checkbox3: cb3,

		// slider1: slider1,

		// label4: lb4,

		log: function (msg) {
			outputMsg += new Date().toLocaleTimeString() + ": " + msg + '\n';
			outputText.innerHTML = outputMsg + stuffingNewLines;
			// console.log(outputText.innerHTML);
			// outputText.innerHTML += "&#13;";
			outputArea.scrollTop = 1000000;
			outputText.scrollTop = 1000000;
		},

		update: function () {

		}
	}
};