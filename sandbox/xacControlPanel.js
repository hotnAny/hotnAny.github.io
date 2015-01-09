/**
 * @author Xiang 'Anthony' Chen http://xiangchen.me
 */

var ControlPanel = function () {

	var container = document.createElement( 'div' );
	container.id = 'cp';
	// container.addEventListener( 'mousedown', function ( event ) { event.preventDefault(); setMode( ++ mode % 2 ) }, false );
	container.style.cssText = 'width:256px;height:100%;overflow:hidden;opacity:0.5;font-family:Helvetica;background-color:#444444;color:#ffffff';
	// container.innerHTML = "<div>Polka</div>"

	var txtTitle = document.createElement( 'div' );
	txtTitle.id = 'title';
	txtTitle.style.cssText = 'margin-left:5px;margin-top:5px;overflow:inherit;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:15px';
	txtTitle.innerHTML = 'Polka';
	container.appendChild( txtTitle );

	var cssBtn = 'margin-left:5px;margin-top:5px;padding:1px 3px 1px 3px;font-family:Helvetica;border-radius:5px;font-size:10px;line-height:15px;text-align:left;background-color:#ffffff';
	
	// button to build octree
	var btnAction1 = document.createElement( 'button' );
	btnAction1.id = 'action1';
	btnAction1.style.cssText = cssBtn;
	btnAction1.innerHTML = 'Build Octree';
	container.appendChild( btnAction1 );

	// button to show octree
	var btnAction3 = document.createElement( 'button' );
	btnAction3.id = 'action3';
	btnAction3.style.cssText = cssBtn;
	btnAction3.innerHTML = 'Show/Hide Octree';
	container.appendChild( btnAction3 );
	container.appendChild(document.createElement('br'));

	// button to find mutually bounded
	var btnAction4 = document.createElement( 'button' );
	btnAction4.id = 'action4';
	btnAction4.style.cssText = cssBtn;
	btnAction4.innerHTML = 'Mutually Bounded';
	container.appendChild( btnAction4 );

	// button to detect intersection
	var btnAction2 = document.createElement( 'button' );
	btnAction2.id = 'action2';
	btnAction2.style.cssText = cssBtn;
	btnAction2.innerHTML = 'Detect Intersection';
	container.appendChild( btnAction2 );

	var outputArea = document.createElement( 'div' );
	outputArea.id = 'outputArea';
	outputArea.style.cssText = 'width:256px;height:100%;overflow:hidden;';
	container.appendChild( outputArea );

	var outputText = document.createElement( 'div' );
	outputText.id = 'outputText';
	outputText.style.cssText = 'margin-left:5px;margin-top:5px;overflow:inherit;color:#ffffff;font-family:Helvetica,Arial,sans-serif;font-size:10px;line-height:15px';
	outputText.innerHTML = '';
	outputArea.appendChild( outputText );

	return {

		REVISION: 0,

		domElement: container,

		button1: btnAction1,

		button2: btnAction2,

		button3: btnAction3,

		button4: btnAction4,

		log: function (msg) {
			outputText.innerHTML += "<br>";
			outputText.innerHTML += msg;
			outputArea.scrollTop = 1000000;
		},

		update: function () {

		}

	}

};