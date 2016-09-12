var CMDKEYCODE = 91;

var isKeyHeld = false;
var lastPressedKey;

function onKeyDown(event) {
	// console.log(event.keyCode);
	lastPressedKey = event.keyCode;
	isKeyHeld = true;
}

function onKeyUp(event) {
	isKeyHeld = false;
}