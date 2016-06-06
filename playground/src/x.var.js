var DIMVOXEL = 10;
var gVoxels = [];
var gVoxelTable = []; // a lookup table for meshes that represetn each voxel
var gma; // = new MedialAxis(); // medial axis
var gGlue = false;
var tSnapMode = false;

// input
var gMouseDown = false;
var gMousePrev = undefined;
var gVoxelSelected;