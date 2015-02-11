/* obselete */
function loadObj(objName, addToOctree) {
  objLoader.load(objName, function (object) {
    // object.geometry.center();
    var material = new THREE.MeshPhongMaterial( { color: colorNormal} ); 
    object.traverse( function ( child ) {
      if ( child instanceof THREE.Mesh ) {
        child.material = material;
      }
    } );

    scene.add(object);
    objects.push(object);

    if(addToOctree) {
      octree.add(object);
      // octree.add(object, { useVertices: true });
      // octree.add(object, { useFaces: true });
    }
  });
}

/* obselete */
function loadJSON(objName, isStatic) {
  jsonLoader.load( objName, function ( geometry ) {
        geometry.computeVertexNormals();
        
        var material = new THREE.MeshPhongMaterial( { ambient: 0x030303, color: 0x030303, specular: 0x030303, shininess: 30 } );
        var mesh = new THREE.Mesh(geometry, material); 
        // object.rotation.x = -Math.PI/2;

        if(isStatic) {
          
          // octree.add(object);
          octree.add(object, { useVertices: true });
          // octree.add(mesh, { useFaces: true });

        }

        scene.add(mesh);
        
        objects.push(mesh);
      } );
}

// var mWorld = new THREE.Matrix4();
  // console.log(obj.matrixWorld);
  // console.log(obj.matrixWorld.elements);
  // mWorld.copy(obj.matrixWorld);
  // console.log(mWorld.elements);
  // var cw = mWorld.elements[0];
  
  // console.log(cw);

//  var objProj = obj.clone();  
  //  // objProj.applyMatrix(mWorld);
  //  // objProj.position.set(0, 10 * Math.random(), 0);
    
  //  var cwProj = new Float32Array(16);
  //  // console.log(cw);
  //  for(var j=0; j<16; j++) {
  //    if(i*4 <= j && j < (i+1)*4) {
  //      cwProj[j] = 0;
  //    } else {
  //      cwProj[j] = cw[j];
  //    }
  //  }

  //  var mProj = new THREE.Matrix4();
  //  // console.log(cwProj);
  //  mProj.set(cwProj[0], cwProj[4], cwProj[8], cwProj[12],
  //        cwProj[1], cwProj[5], cwProj[9], cwProj[13],
  //        cwProj[2], cwProj[6], cwProj[10], cwProj[14],
  //        cwProj[3], cwProj[7], cwProj[11], cwProj[15]);

  //  // console.log(cw);
  //  // console.log(mProj);

  //  objProj.applyMatrix(mProj);
  //  objProj.position.set(0, 10 * Math.random(), 0);
    
  //  scene.add(objProj);
  //  array.push(objProj);
    
  // }

  // if(D_INTERSECTION) {
  //  scene.remove(balls);
  //  balls = new THREE.Object3D();

  //  scene.remove(boxes);
 //     boxes = new THREE.Object3D();

 //     for (var i = 0; i < objects.length; i++) {
  //    objects[i].material.color.setHex(colorNormal);
  //  };
  // }

  if(Math.random() < 0.01) {
        // addABall(v1.x, v1.y, v1.z, 0xff0000, 0.1);
        // addABall(va.x, va.y, va.z, 0xff0000, 0.15);
        // addABall(vb.x, vb.y, vb.z, 0x00ff00, 0.15);
        // addABall(vc.x, vc.y, vc.z, 0x0000ff, 0.15);
        // addATriangle(va, vb, vc);
        // console.log(va);
        // console.log(vb);
        // console.log(vc);
        // console.log("========");
        // console.log(elms[i]);
      }


  // function buildBoundingBox(obj) {
//  var rot = obj.rotation.clone();
//  obj.rotation.set(0, 0, 0);
//  obj.updateMatrixWorld();
//  var bbh = new THREE.BoundingBoxHelper(obj, 0xff0000);
//  bbh.rotation.set(rot.x, rot.y, rot.z);
//  obj.rotation.set(rot.x, rot.y, rot.z);
//  return bbh;
// }

// function isInBoundingBox(v, objStatic) {
//  var b = objStatic.geometry.boundingBox.clone();
//  b.min.add(new THREE.Vector3().getPositionFromMatrix(objStatic.matrixWorld));
//  b.max.add(new THREE.Vector3().getPositionFromMatrix(objStatic.matrixWorld));

//  return b.min.x < v.x && v.x < b.max.x &&
//       b.min.y < v.y && v.y < b.max.y &&
//       b.min.z < v.z && v.z < b.max.z;  
// }

// elms[i].object.material.color.setHex(colorCollided);

// var nml = elms[i].faces.normal.clone();

    // var pointToFace = new THREE.Vector3();
    // pointToFace.subVectors(elms[i].faces.centroid, v1)
    // pointToFace.subVectors(c, v1)
    
    // var angleToFace = pointToFace.dot(elms[i].faces.normal);
    // var angleToFace = pointToFace.dot(nml);

    // var dist = pointToFace.length();

    // if(minDist < 0) {
    //  minDist = dist;
    // } else {
    //  if(dist < minDist) {
    //    idxClosestFace = i;
    //  }
    // }

    //  if(idxClosestFace >= 0) {
//    var fClosest = elms[idxClosestFace].faces;

//    var f = fClosest;
//    var va = objS.geometry.vertices[f.a].clone().applyMatrix4(objS.matrixWorld);
//    var vb = objS.geometry.vertices[f.b].clone().applyMatrix4(objS.matrixWorld);
//    var vc = objS.geometry.vertices[f.c].clone().applyMatrix4(objS.matrixWorld);

//    // var v1Outside = isPointOutsideFace(v1, fClosest, objS);
//    // var v2Outside = isPointOutsideFace(v2, fClosest, objS);

//    // if((v1Outside && !v2Outside) || (!v1Outside && v2Outside)) {
//    //  // addABall(v1.x, v2.y, v2.z, 0xff0000, 0.5);
//    //  // addABall(v1.x, v2.y, v2.z, 0xff0000, 0.5);
//    //  if(!oneTimeStopper) {
//    //    addALine(v1, v2, 0xffff00);
//    //    addATriangle(va, vb, vc, 0xffff00);
//    //    oneTimeStopper = true;

//    //    isPointOutsideFace(v1, fClosest, objS, true);
//    //    isPointOutsideFace(v2, fClosest, objS, true);
//    //  }
//    //  // console.log(v1);
//    //    return true;
//    // }

//    var v = fClosest.centroid.clone();
//    v.applyMatrix4(objS.matrixWorld);

//    var nml = fClosest.normal.clone();
//    var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / 
//        nml.dot(new THREE.Vector3().subVectors(v2, v1));
//    var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

// // 0 <= r && r <= 1 && 
//    if(0 <= r && r <= 1 && isInTriangle(pr, va, vb, vc)) {
//      if(stopper < 5) {
//        addALine(v, new THREE.Vector3().addVectors(v, nml), 0x00ff00);
//        addALine(v1, v2, 0xffff00);
//        addALine(new THREE.Vector3().addVectors(v1, v2).divideScalar(2), pr, 0xff0000);
//        addATriangle(va, vb, vc, 0xffff00);
//        // addABall(pr.x, pr.y, pr.z, 0xff0000, 0.1);
        
//        stopper++;

//        console.log("r = " + r);
//      }

//      return true;
//    }


  // }

/*
  v: point of query
  f: one face of obj
  obj: an object
*/
// function isPointOutsideFace(v, f, obj, show) {
//  var c = f.centroid.clone();
//  c.applyMatrix4(obj.matrixWorld);
//  var pointToFace = new THREE.Vector3().subVectors(c, v);

//  var nml = f.normal.clone();
//  var angleToFace = pointToFace.dot(nml);

//  if(show) {
//    addALine(c, new THREE.Vector3().addVectors(c, nml), 0x00ff00);
//    addALine(v, c, 0x0000ff);
//    console.log(angleToFace);
//  }
//  // outside<0 inside>0
//  return angleToFace < 0;
// }


// var ground_material = Physijs.createMaterial(
//       new THREE.MeshLambertMaterial({ map: THREE.ImageUtils.loadTexture( 'images/rocks.jpg' ) }),
//       .8, // high friction
//       .4 // low restitution
//     );
//     ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
//     ground_material.map.repeat.set( 2.5, 2.5 );

//     // Ground
//     var ground = new Physijs.BoxMesh(
//       new THREE.CubeGeometry(500, 1, 500),
//       //new THREE.PlaneGeometry(50, 50),
//       ground_material,
//       0 // mass
//     );
//     ground.receiveShadow = true;
//     // scene.add( ground );


  // var srcScene =  usingPhysics ? scene : scenePhysics;
  // var dstScene = !usingPhysics ? scene : scenePhysics;

  // // console.log(srcScene);

  // // var toTransfer = new Array();
  // // srcScene.traverse(function(object) {
  // //   if(object instanceof THREE.Mesh || 
  // //     object instanceof THREE.Line || 
  // //     object instanceof THREE.DirectionalLight ||
  // //     object instanceof THREE.AmbientLight) {
  // //     toTransfer.push(object);
  // //   }
  // // });

  // // for(var i=0; i<toTransfer.length; i++) {
  // //   srcScene.remove(toTransfer[i]);
  // //   dstScene.add(toTransfer[i]);
  // // }

  // for(var i=0; i<objects.length; i++) {
  //  srcScene.remove(objects[i]);
  //  dstScene.add(objects[i]);
  // }

  // srcScene.remove(camera);
  // dstScene.add(camera);

  // console.log(dstScene);

  // console.log(usingPhysics);

    // var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF} );  
   //    var object = new Physijs.BoxMesh(new THREE.CubeGeometry( 3, 3, 3 ), material);
   //    object.position.set(20 * Math.random(), 20 + 10 * Math.random(), 20 * Math.random()); 
   //        object.rotation.y = -Math.PI/2 * Math.random();
   //        object.castShadow = true;
   //    object.receiveShadow = true;
   //    scenePhysics.add(object); 
   //    objects.push(object);
   //    new TWEEN.Tween(object.material).to({opacity: 1}, 500).start();
//  scene = new Physijs.Scene({ fixedTimeStep: 1 / 120 });

//  scene.add(ground.clone());

//  scene.add( directionalLight.clone() );
// // scenePhysics.add(directionalLight);
// // ambient light
// scene.add( new THREE.AmbientLight( 0x888888 ) );
// scene.add( line.clone() );

//    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
//      scene.addEventListener(
//        'update',
//        function() {
//          if(usingPhysics) {
//            // if(!isMouseDown) {
//              // console.log("updating ...");
//              scene.simulate();
//            // }
//            // console.log("physics engine running ... ");
//          } else {
//          //  // console.log("physics engine NOT running ... ");
//          }
//        }
//      );
    
//    // scene.add(camera);

//    for(var i=0; i<objects.length; i++) {
//    // srcScene.remove(objects[i]);
//      scene.add(objects[i].clone());
//    }

//    addAPhyCube();


// VoxelGrid.prototype.fillVoxels = function() {
//  for(var i=0; i<this._dim.x; i++) {
//    for(var j=0; j<this._dim.y; j++) {
//      for(var k=0; k<this._dim.z; k++) {
//        var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;

//        if(this._markedGrid[idx] == 1) continue;
        
//        /* test x axis */
//        var ii;
//        for(ii = i; ii < this._dim.x && this._markedGrid[ii * (this._dim.y * this._dim.z) + j * this._dim.z + k] == 0; ii++);
//        if(ii >= this._dim.x) continue;

//        for(ii = i; ii >= 0 && this._markedGrid[ii * (this._dim.y * this._dim.z) + j * this._dim.z + k] == 0; ii--);
//        if(ii < 0) continue;

//        /* test y axis */
//        var jj;
//        for(jj = j; jj < this._dim.y && this._markedGrid[i * (this._dim.y * this._dim.z) + jj * this._dim.z + k] == 0; jj++);
//        if(jj >= this._dim.y) continue;

//        for(jj = j; jj >= 0 && this._markedGrid[i * (this._dim.y * this._dim.z) + jj * this._dim.z + k] == 0; jj--);
//        if(jj < 0) continue;

//        /* test z axis */
//        var kk;
//        for(kk = k; kk < this._dim.z && this._markedGrid[i * (this._dim.y * this._dim.z) + j * this._dim.z + kk] == 0; kk++);
//        if(kk >= this._dim.z) continue;

//        for(kk = k; kk >= 0 && this._markedGrid[i * (this._dim.y * this._dim.z) + j * this._dim.z + kk] == 0; kk--);
//        if(kk < 0) continue;


//        this._markedGrid[idx] = 1;
//      }
//    }
//  }
// }


/* 
    grid based approach 
  */
  // var cnt = 0;
  // for(var i=0; i<this._dim.x; i++) {
  //  for(var j=0; j<this._dim.y; j++) {
  //    for(var k=0; k<this._dim.z; k++) {
  //      var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;
        
  //      if(this._markedGrid[idx] == 1) {
  //        var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
  //        var material = new THREE.MeshBasicMaterial( {color: (isStatic ? 0xf00f0f : 0x0ff0f0), transparent: true, opacity: 0.25} );
  //        var voxel = isStatic ? new Physijs.BoxMesh(geometry, material, 0) : new Physijs.BoxMesh(geometry, material);

  //        var xmin = this._vmin.x + i * this._unitSize;
  //        var ymin = this._vmin.y + j * this._unitSize;
  //        var zmin = this._vmin.z + k * this._unitSize;

  //        voxel.position.set(xmin + this._unitSize / 2 - x0, ymin + this._unitSize / 2 - y0, zmin + this._unitSize / 2 - z0);

  //        if(cnt == 0) {
  //          x0 = voxel.position.x;
  //          y0 = voxel.position.y;
  //          z0 = voxel.position.z;
  //          this._voxelGroup = voxel;
  //        } else {
  //          this._voxelGroup.add(voxel);
  //        }

  //        cnt++;
  //      }
  //    }
  //  }
  // }

  // log(this._name + ": " + cnt + " voxels, computed in " + timeStamp() + " msec");

  // VoxelGrid.prototype.peelVoxels = function() {
  
//  /* find max # of neighbours */

//  // while (true) {
//    var maxNbrCnt = 0;
//    var minNbrCnt = 27;
//    var nbrCntGrid = [];
//    for(var i=0; i<this._dim.x; i++) {
//      for(var j=0; j<this._dim.y; j++) {
//        for(var k=0; k<this._dim.z; k++) {
//          var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;
//          nbrCntGrid.push(0);

//          if(this._markedGrid[idx] == 0) {
//            continue;
//          }

//          /* counting neighbors */
//          var nbrCnt = 0;
//          for(var ii=i-1; ii<=i+1; ii+=1) {
//            for(var jj=j-1; jj<=j+1; jj+=1) {
//              for(var kk=k-1; kk<=k+1; kk+=1) {
                
//                /* boundary test */
//                if( ii<0 || ii>=this._dim.x ||
//                  jj<0 || jj>=this._dim.y ||
//                  kk<0 || kk>=this._dim.z) {
//                  continue;
//                }

//                /* finding neighbors */
//                var idxNbr = ii * (this._dim.y * this._dim.z) + jj * this._dim.z + kk;

//                if(idxNbr != idx && this._markedGrid[idxNbr] == 1) {
//                  nbrCnt++;
//                }
//              }
//            }
//          } /* end of counting neighbors */

//          nbrCntGrid[idx] = nbrCnt;
//          maxNbrCnt = Math.max(maxNbrCnt, nbrCnt);
//          minNbrCnt = Math.min(nbrCnt, minNbrCnt);
//        }
//      }
//    }

//    // if(minNbrCnt <= 2) {
//    //  break;
//    // }

//    console.log("max # of neighbours: " + maxNbrCnt + "; min: " + minNbrCnt);

//    /* he who has less neighbours than max shall be peeled */
//    for(var i=0; i<this._dim.x; i++) {
//      for(var j=0; j<this._dim.y; j++) {
//        for(var k=0; k<this._dim.z; k++) {
//          var idx = i * (this._dim.y * this._dim.z) + j * this._dim.z + k;

//          if(nbrCntGrid[idx] > 2) {
//            this._markedGrid[idx] = 0;
//          }
//        }
//      }
//    }
//  // }

// }