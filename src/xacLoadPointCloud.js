// function generateIndexedPointcloud( color, width, length ) {

// 	var geometry = generatePointCloudGeometry( color, width, length );
// 	var numPoints = width * length;
// 	var indices = new Uint16Array( numPoints );

// 	var k = 0;

// 	for( var i = 0; i < width; i++ ) {

// 		for( var j = 0; j < length; j++ ) {

// 			indices[ k ] = k;
// 			k++;

// 		}

// 	}

// 	geometry.addAttribute( 'index', new THREE.BufferAttribute( indices, 1 ) );

// 	var material = new THREE.PointCloudMaterial( { size: pointSize, vertexColors: THREE.VertexColors } );
// 	var pointcloud = new THREE.PointCloud( geometry, material );

// 	return pointcloud;

// }