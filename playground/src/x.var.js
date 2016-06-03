"use strict";

class MedialAxis {
	constructor() {
		this._nodes = [];
		this._edges = [];

		this._colorNode = 0xfffa90;
		this._colorEdge = COLORCONTRAST;
	}

	addNodes(node, toConnect) {
		node.material.defaultColor = node.material.color;
		node.material.color = this._colorNode;
		node.material.needsUpdate = true;
	}
}

var gVoxels = [];
var gma = new MedialAxis(); // medial axis
var gGlue = false;