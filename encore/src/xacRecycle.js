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

// if(i == 0 && j > 16) {
              //  // addALine(ctr, pr, 0xffff00);
              //  addATriangle(va, vb, vc, 0xffff00);
              //  console.log(va);
              //  console.log(vb);
              //  console.log(vc);
              //  console.log(" ========= "); 
              // }

/* 
        
        ref: http://geomalgorithms.com/a06-_intersect-2.html
      */

      // var v = f.centroid.clone();
      // v.applyMatrix4(objD.matrixWorld);
      // // addABall(v.x, v.y, v.z, 0xff0000, 1);
      // // console.log(v.x + ", " + v.y + ", " + v.z);

      // var nml = f.normal.clone();
      
      // var xs = [bboxHelper.box.min.x, bboxHelper.box.max.x];
      // var ys = [bboxHelper.box.min.y, bboxHelper.box.max.y];
      // var zs = [bboxHelper.box.min.z, bboxHelper.box.max.z];

      // for(var ix=0; ix<2; ix++) {
      //  for(var iy=0; iy<2; iy++) {
      //    for(var iz=0; iz<2; iz++) {
      //      var ctr = new THREE.Vector3(xs[ix], ys[iy], zs[iz]);
      //      // addABall(ctr.x, ctr.y, ctr.z, 0xff0000, 1);
      //      // ctr.applyMatrix4(objS.matrixWorld);

      //      if(isShadowingTriangle(ctr, nml, v, va, vb, vc, bboxHelper.box)) {
      //        if(D_INTERSECTION) {
      //          if(i % 10 == 0) addATriangle(va, vb, vc, 0x00ffff);
      //        }
      //        arrMulBounded.push(i);

      //        break;
      //      }
      //    }
      //  }
      // }

      
      // addATriangle(va, vb, vc, 0xffff00);
      // break;
      // // if(0)
      // // {
      // //   if(D_INTERSECTION) {
      // //     if(i % 10 == 0) addATriangle(va, vb, vc, 0x00ffff);
      // //   }
      // //   arrMulBounded.push(i);
      // // }

      // // console.log(va + ", " + vb + ", " + vc);
      
      // // return;


      /* if any of the triangle's verext is in the bounding box */
      /* UPDATE: this alone doesn't work for very big triangle */
      
      // if(isInBoundingBox(va, bboxHelper.box) 
      //  || isInBoundingBox(vb, bboxHelper.box)
      //  || isInBoundingBox(vc, bboxHelper.box)) {

      //  if(D_INTERSECTION) {
      //    if(i % 10 == 0) addATriangle(va, vb, vc, 0x00ffff);
      //  }

      //  arrMulBounded.push(i);
      //  continue;
      // }


// function isShadowingTriangle(ctr, nml, v, va, vb, vc, bbox) {
//  var v1 = ctr.clone();
//  var v2 = ctr.clone().add(nml);
//  var denominator = nml.dot(new THREE.Vector3().subVectors(v2, v1));

//  if(denominator == 0) {
//    return false;
//  }

//  var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / denominator;
//  var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

//  addALine(ctr, pr, 0x66aaff);
//  addABall(pr.x, pr.y, pr.z, 0xff0000, 1);

//  /* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
//  if(isInTriangle(pr, va, vb, vc) && isInBoundingBox(pr, bbox)) {
//    return true;
//  }
//  return false;
// }

// console.log(minHeight + ", " + maxHeight);

      // var deltaMinMax = 1000;
      // if(preMinHeight != undefined && preMaxHeight != undefined) {
      //  deltaMinMax = Math.max(Math.abs(maxHeight - preMaxHeight), Math.abs(minHeight - preMinHeight));
      // }
      // preMinHeight = minHeight;
      // preMaxHeight = maxHeight;

      // if(deltaMinMax < 0.0001) {
      //  usingPhysics = false;
      //  controlPanel.checkbox3.checked = usingPhysics;
      // }

      // var cubeHeight = maxDimExisting;
          // var geometry = new THREE.CubeGeometry(
          //   Math.max(2, Math.abs(objects[i].bbox.max.x - objects[i].bbox.min.x)), 
          //   2, 
          //   Math.max(2, Math.abs(objects[i].bbox.max.z - objects[i].bbox.min.z))
          // );
          // var material = new THREE.MeshBasicMaterial( { color: 0x22FF66 } );
          // var box = new Physijs.BoxMesh(geometry, material, 0);
          // // box.position.y -= (cubeHeight + objects[i].maxDimExisting) / 2
          // box.position.set(objects[i].position.x, cubeHeight/2, objects[i].position.z)
          // // objects[i].add(box);
          // scene.add(box);
/* create pre-computed projections and their octrees */
      // makeProjections(object, projStatic);

      // var len = projStatic.length;
      // for(var i=0; i<len; i++) {
      //   // console.log(projStatic[i]);
      //   var ot = new THREE.Octree({
      //     undeferred: false,
      //     depthMax: Infinity,
      //     objectsThreshold: 1,
      //     scene: scene
      //   });
      //   ot.add(projStatic[i], { useFaces: true});
      //   octreesProj.push(ot); 
      // }
      // if(!D_OVERLAP) hideProjections();

// console.log(triangleArea(new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0), new THREE.Vector3(0, 10, 0)));
    // createBoxelizedSphere(7, 18);
    // createBoxelizedSphere(10, 36);

    // loadStl(ringStand, "ring", false);
    // loadStl(mug, "mug", true);

    /*
      example #1 key + ring
    */
    // loadStl(ring3, "ring", false);
    // loadStl(key, "key", true);

    // loadStl(ringStand, "ring", true);
    // loadStl(dodecahedron, "dodecahedron1", false);
    // loadStl(dodecahedron, "dodecahedron2", false);
    // loadStl(meshBall, "meshBall", true);

    // addTheBall();

    /* 
      exampe #2 heart+bracelet
    */
    // loadStl(heart, "heart", false);
    // loadStl(bracelet, "bracelet", true);
    

    // loadStl(scissors, "scissors", false);

    // console.log(scene);

    scene.updateMatrixWorld();
  for(var i=0; i<voxelGrids.length; i++) {

    // var geometry = new THREE.CubeGeometry(voxelGrids[i]._unitSize, voxelGrids[i]._unitSize, voxelGrids[i]._unitSize);
    var geometrySmall = new THREE.CubeGeometry(0, 0, 0);
    var material = new THREE.MeshBasicMaterial( {color: (voxelGrids[i].obj.isStatic ? 0xff0f0f : 0x0ffff0), transparent: true, opacity: 0.25} );
    var voxelGroupNew = new Physijs.BoxMesh(geometrySmall, material, voxelGrids[i].obj.isStatic ? 0 : 10);
    voxelGroupNew.position = voxelGrids[i]._voxelGroup.position;
    if(voxelGrids[i].obj.isStatic) {
      voxelGroupStatic = voxelGroupNew;
    } else {
      voxelGroupDynamic = voxelGroupNew;
    }
    // console.log(voxelGroupNew.position);
    // voxelGroupNew.rotation = voxelGrids[i]._voxelGroup.rotation;

    // if(objectPair == undefined) {
    //  objects[i].updateMatrixWorld();
    // } else {
    //  objectPair.children[i].updateMatrixWorld();
    // }

    // var mat = (objectPair == undefined ? objects[i].matrixWorld : objectPair.children[i].matrixWorld);

    voxelGrids[i].obj.updateMatrixWorld();
    var mat = voxelGrids[i].obj.matrixWorld;
    // console.log(objectPair.children[i].geometry.matrixWorld);
    // voxelGrids[i]._voxelGroup.matrixWorld = new THREE.Matrix4();
    // voxelGridsDyn[i]._voxelGroup = voxelGrids[i]._voxelGroup.clone();
    
    // voxelGrids[i]._voxelGroup.updateMatrix();
    // objectPair.remove(voxelGrids[i]._voxelGroup);
    // if(objectPair == undefined) {
      var geometry = new THREE.CubeGeometry(voxelGrids[i]._unitSize, voxelGrids[i]._unitSize, voxelGrids[i]._unitSize);
    for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
      // scene.remove(voxelGrids[i]._voxelGroup.children[j]);
      // objectPair.remove(voxelGrids[i]._voxelGroup.children[j]);
      // voxelGrids[i]._voxelGroup.children[j].applyMatrix(objectPair.children[i].matrixWorld);
      var voxel = new Physijs.BoxMesh(geometry, material, voxelGrids[i].obj.isStatic ? 0 : 10);
      voxel.position = voxelGrids[i]._voxelGroup.children[j].position;

      // var cube = ;//.clone();
      // cube.position.x += voxelGroupNew.position.x;
      // cube.position.y += voxelGroupNew.position.y;
      // cube.position.z += voxelGroupNew.position.z;
      // cube.applyMatrix(objectPair.children[i].matrixWorld);
      voxelGroupNew.add(voxel);
      // }
    }

    voxelGroupNew.applyMatrix(mat);
    // console.log(mat);

    if(voxelGridsDyn.length > i) {
      scene.remove(voxelGridsDyn[i]);
      voxelGridsDyn[i] = voxelGroupNew;
    } else {
      scene.remove(voxelGrids[i]._voxelGroup);
      voxelGridsDyn.push(voxelGroupNew);
    }
    scene.add(voxelGridsDyn[i]);
  }

  if(objectPair == undefined) {
    objectPair = new THREE.Object3D();
    scene.add(objectPair)
    for(var i=0; i<objects.length; i++) {
      objectPair.add(objects[i]);
    }

  //  // objectPair.position.set(0, 0, 0);
  //  scene.add(objectPair);
  //  // THREE.GeometryUtils.center(objectPair);
    // voxelize();
  }

  function rotateObjectPair() {
  if(objectPair != undefined) {
    // objectPair.rotateOnAxis(AXISX, rotX);
    // objectPair.rotateOnAxis(AXISZ, rotZ);

    // objectPair.position.set(0, 0, 0);
    // usingPhysics = false;
    
    // for(var i=0; i<voxelGrids.length; i++) {
    //  scene.remove(voxelGrids[i]._voxelGroup);
    //  objectPair.add(voxelGrids[i]._voxelGroup);
    //  for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
    //    // scene.remove(voxelGrids[i]._voxelGroup.children[j]);
    //    objectPair.add(voxelGrids[i]._voxelGroup.children[j]);
    //  }
    // }
    
    /* method 1. naive step-wise */
    // if(objectPair.rotation.x >= Math.PI - rotX) {
    //  objectPair.rotation.x = 0;
    //  objectPair.rotation.z += rotZ;
    // } else {
    //  objectPair.rotation.x += rotX;
    // }

    /* method 2. shrinking step */
    if(objectPair.rotation.x >= Math.PI - rot) {
      objectPair.rotation.x = 0;
      if(objectPair.rotation.z >= Math.PI - rot) {
        objectPair.rotation.z = 0;
        rot /= 2; 
      } else {
        objectPair.rotation.z += rot;
      }
    } else {
      objectPair.rotation.x += rot;
    }

    // objectPair.children.splice(0, objectPair.children.length);
    
    // for(var i=0; i<voxelGrids.length; i++) {
      
    //  for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
    //    scene.add(voxelGrids[i]._voxelGroup.children[j]);
    //  }
    // }
    // for(var i=0; i<voxelGrids.length; i++) {
    //  scene.add(voxelGrids[i]._voxelGroup);
    // }

    // for(var i=0; i<objectPair.children.length; i++) {
    //  objectPair.children[i].ot.rebuild();
    //  console.log(objectPair.children[i].name + " octree rebuilt");
    // }

    // console.log("rotated");
    
  }
  // else 
    // console.log("not rotated");
}

// if(cntFramesPerSimulation > NUMFRAMESPERSIMULATION) { 
  //  // 

  //  // log("Range of height: [" + minHeight + ", " + maxHeight + "]");

    

  //  // for(var i=0; i<voxelGrids.length; i++) {
  //    // var lv = new Object();
  //    // lv.x = lv.y = lv.z = 0;
  //    // voxelGrids[i]._voxelGroup.setLinearVelocity(lv);
  //    // for(var j=0; j<voxelGrids[i]._voxelGroup.children.length; j++) {
  //    //  voxelGrids[i]._voxelGroup.children[j].setLinearVelocity(lv);
  //    // }
  //  // }

  //  // scene.simulate();
  //  if(gravityReversed) {
  //    legends[0].material.color.setHex(colorNormal);
  //    log("Range of height: [" + minHeight + ", " + maxHeight + "]");
  //    usingPhysics = false;
  //    controlPanel.checkbox3.checked = usingPhysics;
  //    // switchGravity();
  //  } else {
  //    legends[0].material.color.setHex(colorCollided);
  //    reverseGravity();
  //    // usingPhysics = false;
  //    // controlPanel.checkbox3.checked = usingPhysics;
  //  }

  //  return;

  // }


  function VoxelGrid(dim, obj) {
  if(!this instanceof VoxelGrid) {
    return new VoxelGrid();
  } 

  this._name = obj.name;
  this.obj = obj;

  // var matObj3d = objectPair == undefined ? new THREE.Matrix4() : objectPair.matrixWorld;

  scene.updateMatrixWorld();
  obj.updateMatrixWorld();

  var geom = obj.geometry.clone();
  // geom.applyMatrix(obj.matrixWorld);
  geom.computeBoundingBox();

  //addABall(obj.geometry.boundingBox.min.x, obj.geometry.boundingBox.min.y, obj.geometry.boundingBox.min.z, 0x00ff00, 3);
  //addABall(obj.geometry.boundingBox.max.x, obj.geometry.boundingBox.max.y, obj.geometry.boundingBox.max.z, 0x00ff00, 3);

  
  // var vmin = obj.geometry.boundingBox.min.clone().applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
  // var vmax = obj.geometry.boundingBox.max.clone().applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);

  var vmin = geom.boundingBox.min.clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
  var vmax = geom.boundingBox.max.clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);

  // var m = new THREE.Matrix4().multiplyMatrices(matObj3d, obj.matrixWorld);
  // var vmin = obj.geometry.boundingBox.min.clone().applyMatrix4(m);//.applyMatrix4(matObj3d);
  // var vmax = obj.geometry.boundingBox.max.clone().applyMatrix4(m);//.applyMatrix4(matObj3d);

  // vmin.applyMatrix4(matObj3d);
  // vmax.applyMatrix4(matObj3d);

  // scene.remove(balls);
  // balls.children.splice(0, 2);
  // addABall(vmin.x, vmin.y, vmin.z, 0xffff00, 1);
  // addABall(vmax.x, vmax.y, vmax.z, 0xffff00, 1);
  // scene.add(balls);

  // console.log("VoxelGrid:");
  // console.log(matObj3d);
  

  this._vmin = new THREE.Vector3(Math.min(vmin.x, vmax.x), Math.min(vmin.y, vmax.y), Math.min(vmin.z, vmax.z));
  this._vmax = new THREE.Vector3(Math.max(vmin.x, vmax.x), Math.max(vmin.y, vmax.y), Math.max(vmin.z, vmax.z));

  var maxEdge = Math.max(Math.max(this._vmax.x - this._vmin.x, this._vmax.y - this._vmin.y), this._vmax.z - this._vmin.z);
  this._unitSize = Math.ceil(maxEdge / (dim <= 0 ? 1 : dim), 1.0);

  // console.log(this._unitSize);

  this._dim = new THREE.Vector3();
  this._dim.x = Math.ceil((this._vmax.x - this._vmin.x) / this._unitSize, 1.0);
  this._dim.y = Math.ceil((this._vmax.y - this._vmin.y) / this._unitSize, 1.0);
  this._dim.z = Math.ceil((this._vmax.z - this._vmin.z) / this._unitSize, 1.0);

  this._markedVoxels = [];
  this._markedGrid = [];

  for(var i=0; i<this._dim.x; i++) {
    for(var j=0; j<this._dim.y; j++) {
      for(var k=0; k<this._dim.z; k++) {
        // int idx = i * (this._dim.x * this._dim.y) + j * this._dim.y + k;
        this._markedGrid.push(0);
      }
    }
  }

  return this;
}

// var f = obj.geometry.faces[h];
            var f = elms[h].faces;

            var va = obj.geometry.vertices[f.a].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
            var vb = obj.geometry.vertices[f.b].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
            var vc = obj.geometry.vertices[f.c].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);

            // var nml1 = f.normal.clone().applyMatrix4(obj.matrixWorld);
            var nml1 = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va));
            var nml2 = new THREE.Vector3().crossVectors(vc.clone().sub(vb), va.clone().sub(vb));
            var nml3 = new THREE.Vector3().crossVectors(va.clone().sub(vc), vb.clone().sub(vc));
            
            // va.applyMatrix4(obj.matrixWorld);
            // vb.applyMatrix4(obj.matrixWorld);
            // vc.applyMatrix4(obj.matrixWorld);
            // nml2.applyMatrix4(obj.matrixWorld);


            // var va = obj.geometry.vertices[f.a].clone().applyMatrix4(obj.matrixWorld).applyMatrix4(matObj3d);
            // var vb = obj.geometry.vertices[f.b].clone().applyMatrix4(obj.matrixWorld).applyMatrix4(matObj3d);
            // var vc = obj.geometry.vertices[f.c].clone().applyMatrix4(obj.matrixWorld).applyMatrix4(matObj3d);

            // if(triangleArea(va, vb, vc) < 1) {
            //  continue;
            // }

            
            
            // if(elms.length > 10 && !hasShwonNormals) {
            //  addABall(v.x, v.y, v.z, 0xff0000, 1);
            //  addALine(v, v.clone().add(nml).multiplyScalar(5), 0xffff00);
            //  console.log(nml);
            // }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* 
              the SAT approach, just another approach 
            */

            var xmin = this._vmin.x + i * this._unitSize;
            var ymin = this._vmin.y + j * this._unitSize;
            var zmin = this._vmin.z + k * this._unitSize;

            var bbox = new Object();
            bbox.min = new THREE.Vector3(xmin, ymin, zmin);
            bbox.max = new THREE.Vector3(xmin + this._unitSize, ymin + this._unitSize, zmin + this._unitSize);
            // var nml = f.normal.clone();
            if( testTriBoxIntersection(va, vb, vc, nml1, bbox)
              || testTriBoxIntersection(va, vb, vc, nml2, bbox)
              || testTriBoxIntersection(va, vb, vc, nml3, bbox)) {
              this.mark(i, j, k);
              break;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* 
              calculating the intersecting point between |v1v2| and the plane of the elms[i].face 
              ref: http://geomalgorithms.com/a06-_intersect-2.html
            */

            // var v1 = ctr.clone();
            // var v2 = ctr.clone().add(nml);
            // var denominator = nml.dot(new THREE.Vector3().subVectors(v2, v1));

            // if(denominator == 0) {
            //  continue;
            // }

            // var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / denominator;
            // var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

            // /* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
            // if(isInTriangle(pr, va, vb, vc) && ctr.distanceTo(pr) < this._unitSize / 2) {
            //  this.mark(i, j, k);
            //  break;
            // }


function voxelize() {
  // for(var i=0; i<objects.length; i++) {
  //  voxelizeObject(objects[i]);
  // }
  // voxelizeObject(objects[1]);
  // if(objectPair != undefined) {
  //  objectPair = new THREE.Object3D();
  // }
  //  for(var i=0; i<objectPair.children.length; i++) {
  //    voxelizeObject(objectPair.children[i]);
  //  }
  // } else {
    for(var i=0; i<objects.length; i++) {
      voxelizeObject(objects[i]);
    }
  // }
}

function voxelizeObject(obj) {

  var voxelGrid = new VoxelGrid(DIMVOXELS, obj);

  // console.log(obj.name + "\'s voxel dimension: ")
  // console.log(voxelGrid._dim);

  voxelGrid.voxelizeSurface(obj);
  // if(objectPair == undefined) {
  //  scene.remove(obj);
  // } else {
  //  scene.remove(objectPair);
  // }
  voxelGrids.push(voxelGrid);
  // objects.push(VoxelGrid._voxelGroup);
}

VoxelGrid.prototype.voxelizeSurface = function (obj) {

  this._isStatic = obj.isStatic;

  scene.updateMatrixWorld();
  obj.updateMatrixWorld();

  /* using octree for searching potential in-voxel triangles */
  if(obj.ot == undefined) {
    obj.ot = new THREE.Octree({
            undeferred: false,
            depthMax: Infinity,
            scene: scene
          });
    obj.ot.add(obj, { useFaces: true });
    obj.ot.update();
  } else {
    obj.ot.rebuild();
  }
  // obj.ot.setVisibility(true);

  /* surface-in-cude test */
  obj.geometry.computeFaceNormals();
  for(var i=0; i<this._dim.x; i++) {
    for(var j=0; j<this._dim.y; j++) {
      for(var k=0; k<this._dim.z; k++) {

        var ctr = this.getVoxelCentroid(i, j, k);
        // console.log(ctr);
        var elms = obj.ot.search(ctr, 0.5);
        // console.log(elms.length);
        // if(elms.length > 0) {
        //  this.mark(i, j, k);
        // }

        // if(elms.length == 0) {
        //  console.log("octree return 0 founds");
        // }
        for(var h=0; h<elms.length; h++) {
        
        /* alternative: search through all faces */
        // for(var h=0; h<obj.geometry.faces.length; h++) {
          
          /* face centroid */         
          var v = elms[h].faces.centroid.clone();
          // var v = obj.geometry.faces[i].centroid.clone();

          // v.applyMatrix4(obj.matrixWorld);

          /* if a face center is in this voxel, include this voxel */
          if(this.isInThisVoxel(v, i, j, k)) {
            this.mark(i, j, k);
            break;
          } 
          /* otherwise test the case where a triangle might span multiple voxels */
          else {
            /* faces and their vertices */

            // var f = obj.geometry.faces[h];
            var f = elms[h].faces;

            var va = obj.geometry.vertices[f.a].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
            var vb = obj.geometry.vertices[f.b].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);
            var vc = obj.geometry.vertices[f.c].clone();//.applyMatrix4(obj.matrixWorld);//.applyMatrix4(matObj3d);

            // var nml1 = f.normal.clone().applyMatrix4(obj.matrixWorld);
            var nml1 = new THREE.Vector3().crossVectors(vb.clone().sub(va), vc.clone().sub(va));
            var nml2 = new THREE.Vector3().crossVectors(vc.clone().sub(vb), va.clone().sub(vb));
            var nml3 = new THREE.Vector3().crossVectors(va.clone().sub(vc), vb.clone().sub(vc));

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* 
              the SAT approach, just another approach 
            */

            var xmin = this._vmin.x + i * this._unitSize;
            var ymin = this._vmin.y + j * this._unitSize;
            var zmin = this._vmin.z + k * this._unitSize;

            var bbox = new Object();
            bbox.min = new THREE.Vector3(xmin, ymin, zmin);
            bbox.max = new THREE.Vector3(xmin + this._unitSize, ymin + this._unitSize, zmin + this._unitSize);
            // var nml = f.normal.clone();
            if( testTriBoxIntersection(va, vb, vc, nml1, bbox)
              || testTriBoxIntersection(va, vb, vc, nml2, bbox)
              || testTriBoxIntersection(va, vb, vc, nml3, bbox)) {
              this.mark(i, j, k);
              break;
            }

            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            /* 
              calculating the intersecting point between |v1v2| and the plane of the elms[i].face 
              ref: http://geomalgorithms.com/a06-_intersect-2.html
            */

            // var v1 = ctr.clone();
            // var v2 = ctr.clone().add(nml);
            // var denominator = nml.dot(new THREE.Vector3().subVectors(v2, v1));

            // if(denominator == 0) {
            //  continue;
            // }

            // var r = nml.dot(new THREE.Vector3().subVectors(v, v1)) / denominator;
            // var pr = v1.clone().add(new THREE.Vector3().subVectors(v2, v1).multiplyScalar(r));

            // /* find out if the intersecting point is i) between v1 and v2; and ii) inside the triangle */
            // if(isInTriangle(pr, va, vb, vc) && ctr.distanceTo(pr) < this._unitSize / 2) {
            //  this.mark(i, j, k);
            //  break;
            // }
          }
        } /* end of octree search */

        hasShwonNormals = true;
      }
    }
  }

  // var voxels = this.exportMarkedVoxels();
  // console.log(voxels.length);
  // console.log(obj.name);
  this.exportMarkedVoxels(obj.isStatic);
  
  this._voxelGroup.name = obj.name + "_voxelized";
  
  // scene.add(objectPair);
  // scene.add(this._voxelGroup);
}

// marked.push(voxel);
    // if(idx == 0) {
    //  x0 = voxel.position.x;
    //  y0 = voxel.position.y;
    //  z0 = voxel.position.z;
    //  this._voxelGroup = voxel;
    //  // this._voxelGroup.matrixAutoUpdate = false;
    //  // objectPair.add(this._voxelGroup);
    // } else {
    //  // if(objectPair == undefined) {
    //  //  objectPair =  new THREE.Object3D();
    //  // }
    //  this._voxelGroup.add(voxel);
    //  // objectPair.add(voxel);
    // }


    // VoxelGrid.prototype.sliceToHeight = function(height) {

//  scene.updateMatrixWorld();
//  this._voxelGroup.updateMatrixWorld();

//  var geometry = new THREE.CubeGeometry(0, 0, 0);
//  var material = new THREE.MeshBasicMaterial( {color: 0xffff00, transparent: true, opacity: 0.25} );
//  var voxelGroupSliced = new Physijs.BoxMesh(geometry, material, 0);
//  voxelGroupSliced.position = this._voxelGroup.position;
  
//  var childrenToKeep = new Array();
//  for(var j=0; j<this._voxelGroup.children.length; j++) {
    
//    var pos = new THREE.Vector3().getPositionFromMatrix(this._voxelGroup.children[j].matrixWorld);//.add(this._voxelGroup.position);
//    // var pos = new this._voxelGroup.children[j].position.clone().add(this._voxelGroup.position);
//    // console.log(pos);
//    if(pos.y + this._unitSize / 2 <= height ) {

//      childrenToKeep.push(this._voxelGroup.children[j]);
//      // scene.remove(this._voxelGroup.children[j]);

//      // this._voxelGroup.children[j].material = new THREE.MeshBasicMaterial( {color: 0xf0ff0f, transparent: true, opacity: 0.25} );
//      // this._voxelGroup.children[j].scale.set(0, 0, 0);
//    } 
//  }

//  // this._voxelGroup.children.splice(0, this._voxelGroup.children.length);
//  scene.remove(this._voxelGroup);
//  this._voxelGroup = voxelGroupSliced;
//  for(var i=0; i<childrenToKeep.length; i++) {
//    voxelGroupSliced.add(childrenToKeep[i]);
//  }
//  scene.add(voxelGroupSliced);

//  this._voxelGroup = voxelGroupSliced;
// }

// VoxelGrid.prototype.sliceToHeight = function(height) {

//  scene.updateMatrixWorld();
//  this._voxelGroup.updateMatrixWorld();

//  var geometry = new THREE.CubeGeometry(this._unitSize, this._unitSize, this._unitSize);
//  var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, transparent: true, opacity: 0.25} );
//  var voxelGroupNew = new Physijs.BoxMesh(geometry, material, 0);
//  voxelGroupNew.position = this._voxelGroup.position;
  
//  var childrenBelow = new Array();
//  for(var j=0; j<this._voxelGroup.children.length; j++) {
    
//    var pos = new THREE.Vector3().getPositionFromMatrix(this._voxelGroup.children[j].matrixWorld);//.add(this._voxelGroup.position);
//    // var pos = new this._voxelGroup.children[j].position.clone().add(this._voxelGroup.position);
//    // console.log(pos);
//    if(pos.y + this._unitSize / 2 <= height ) {

//      childrenBelow.push(this._voxelGroup.children[j]);
//      this._voxelGroup.children[j].material = new THREE.MeshBasicMaterial( {color: 0xf0ff0f, transparent: true, opacity: 0.25} );

//      voxelGroupNew.add(this._voxelGroup.children[j].clone());
//    } 
//  }

//  for(var i=0; i<childrenBelow.length; i++) {
//    voxelGroupNew.add(childrenBelow[i]);
//  }

//  this.selfRemove();
//  scene.add(voxelGroupNew);
//  this._voxelGroup = voxelGroupNew;
// }

function reverseGravity() {
  // gravity.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
  // gravityDir *= -1;
  // gravity.multiplyScalar(gravityDir);
  // console.log(gravity);
  // rotateGravity(new THREE.Vector3(1, 0, 0), Math.PI);
  var minusGravity = gravity.clone().multiplyScalar(-1);
  scene.setGravity(minusGravity);

  // usingPhysics = true;
  // controlPanel.checkbox3.checked = usingPhysics;
  // scene.simulate();
  
  // reset variables
  initPhysics();

  gravityReversed = true;
}


function switchGravity() {
  // var step = Math.PI / 2;
  // var gravity = new THREE.Vector3(0, gravityDir * GRAVITYSCALE, 0);

  var axisX = new THREE.Vector3(1, 0, 0);
  rotateGravity(axisX, rotX);

  var axisZ = new THREE.Vector3(0, 0, 1);
  rotateGravity(axisZ, rotZ);

  log("Range of height: [" + minHeight + ", " + maxHeight + "]");
  gravityReversed = false;
  cntFramesPerSimulation = 0;
  // gravity.applyAxisAngle(axis1, step);

  // for(var i=0; i<legends.length; i++) {
  //  if(legends[i].name == 'arrow') {
  //    legends[i].rotateOnAxis(axis1, step);
  //  }
  // }
}

// function computeMedialAxis(voxelGrid) {
//  // voxelize object's surface as S

//  // for each voxel v in the nxnxn space
//  //  if(v is in the object) then
//  //    find v's shortest distance to S
//  //    if(there are 2 or more)
//  //      medial_axis <- v

//  // for(var i=0; i<voxelGrid._dim.x; i++) {
//  //  for(var j=0; j<voxelGrid._dim.y; j++) {
//  //    for(var k=0; k<voxelGrid._dim.z; k++) {

//  var medialAxis = [];
//  for(var i=0; i < voxelGrid._interiorVoxels.length; i++) {
//    // var i = voxels[idx].x;
//    // var j = voxels[idx].y;
//    // var k = voxels[idx].z;

//    // var xmin = this._vmin.x + i * this._unitSize;
//    // var ymin = this._vmin.y + j * this._unitSize;
//    // var zmin = this._vmin.z + k * this._unitSize;

//    var coordInterior = voxelGrid._interiorVoxels[i];

//    // var voxelPos = new THREE.Vector3(xmin + this._unitSize / 2 - x0, 
//    //                ymin + this._unitSize / 2 - y0, 
//    //                zmin + this._unitSize / 2 - z0);

//    // if(!isVoxelInMesh(voxelPos, voxelGrid._unitSize, voxelGrid.obj)) {
//    //  continue;
//    // }

//    var closest1 = INFINITY;
//    var closest2 = 0;

//    for(var j=0; j < voxelGrid._surfaceVoxels.length; j++) {
//      var coordSurface = voxelGrid._surfaceVoxels[j];
//      // var ii = this._surfaceVoxels[idx].x;
//      // var jj = this._surfaceVoxels[idx].y;
//      // var kk = this._surfaceVoxels[idx].z;

//      // var xxctr = this._vmin.x + ii * this._unitSize/2;
//      // var yyctr = this._vmin.y + jj * this._unitSize/2;
//      // var zzctr = this._vmin.z + kk * this._unitSize/2;
//      // console.log(coordSurface);
//      var dist = coordSurface.distanceTo(coordInterior);
//      // if(dist <= 2) {
//      //  continue;
//      // }

//      if(dist < closest1) {
//        closest2 = closest1;
//        closest1 = dist;
//      } else {
//        closest2 = Math.min(dist, closest2);
//      }

//    }
    
//    if(Math.abs(closest1 - closest2) < EPSILON) {
//      medialAxis.push(coordInterior.clone());
//    }

//    // console.log(closest1 + ", " + closest2);
//    // console.log("---");
//  }
//  // scene
//  voxelGrid.exportVoxels(medialAxis);
//  console.log(medialAxis.length / voxelGrid._interiorVoxels.length);
//  // voxelGrid._interiorVoxels = medialAxis;

//  scene.add(voxelGrid._voxelGroup);

// }

/*
  work in progress
*/
function isVoxelInMesh(voxelPos, voxelDim, obj) {
  return true;
}

/*
  obselete, no longer used
*/
function deform(obj1, obj2) {
  /* calculating center of mass */
  // var ctrMass = new THREE.Vector3(0, 0, 0);

  var numVertices = obj1.geometry.vertices.length;
  // var ctrMass = obj1.ctrMass.clone().applyMatrix4(obj1.matrixWorld);
  for(var i=0; i<numVertices; i++) {
    var v = obj1.geometry.vertices[i].clone().applyMatrix4(obj1.matrixWorld);

    // ctrMass.add(obj1.geometry.vertices[i].clone().applyMatrix4(obj1.matrixWorld));
    /* ray casting */
    var raycaster = new THREE.Raycaster(v, ctrMass.clone().sub(v).normalize(), 0, v.distanceTo(ctrMass));
    // raycaster.ray.set(v, ctrMass.clone().sub(v))
    var intersects = raycaster.intersectObjects([obj2]);

    if(intersects.length > 0) {
      console.log(intersects[0]);
      if(D_INTERLOCK) {
        addALine(v, ctrMass, 0xff0ff0);
      }
      console.log(obj1.name + " cannot deform to a point in R3 \\ " + obj2.name);
      return false;
    }
  }

  // ctrMass.divideScalar(numVertices);
  
  // addABall(ctrMass.x, ctrMass.y, ctrMass.z, 0xf00fee, 2);
  // scene.add(balls);
  console.log(obj1.name + " can deform to a point in R3 \\ " + obj2.name);
  return true;
}

/*
  obselete, no longer used
*/
function fillObjVoxels() {
  for(var i=0; i<voxelGrids.length; i++) {
    scene.remove(voxelGrids[i]._voxelGroup);
    voxelGrids[i].fillVoxels();
    voxelGrids[i].exportMarkedVoxels(i==0);
    scene.add(voxelGrids[i]._voxelGroup);
  }
}


/*
  obselete, no longer used
*/
function peelObjVoxels() {
  for(var i=0; i<voxelGrids.length; i++) {
    scene.remove(voxelGrids[i]._voxelGroup);
    voxelGrids[i].peelVoxels();
    voxelGrids[i].exportMarkedVoxels(i==0);
    scene.add(voxelGrids[i]._voxelGroup);
  }
}


  // for(var i=0; i<ungrouped.length; i++) {

  //  if(ungrouped[i].occluding == true || ungrouped[i].grouped == true) {
  //    continue;
  //  }

  //  var group = [ungrouped[i]];
  //  ungrouped[i].grouped = true;

  //  for(var j=i+1; j<ungrouped.length; j++) {
  //    if(ungrouped[j].occluding == true || ungrouped[j].grouped == true) {
  //      continue;
  //    }

  //    if(areNeighbors(ungrouped[i], ungrouped[j])) {
  //      ungrouped[j].grouped = true;
  //      group.push(ungrouped[j]);
  //    }
  //  }

  //  ofgs.push(group);
  // }

  // var rActual = 0;

    //  var f = neighbors[i];
    //  var indices = [f.a, f.b, f.c];
      
    //  var vertices = [];
    //  for(var j=0; j<indices.length; j++) {
    //    var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
    //    vertices.push(v);
    //    rActual = Math.max(rActual, v.distanceTo(ctr));
    //    // console.log("updating ctr to point radius: " + rActual);
    //  }

    //  for(var j=0; j<vertices.length; j++) {
    //    var p0 = vertices[j];
    //    var p1 = vertices[(j+1)%vertices.length];

    //    if(projectionOnSegments(ctr, p0, p1)) {
    //      rActual = Math.max(rActual, distanceToSegment(ctr, p0, p1));
    //      // console.log("updating ctr to edge radius: " + rActual);
    //    }
    //  }
    // }

    // console.log("actual radius: " + rActual);

    // var rReserved = r;
    // r = rActual;

// for(var i=0; i<neighbors.length; i++) {
    //  actualArea += neighbors[i].area;
    // }

  /*
  the current implementation is based on the 'let it drop' method
*/
function makeAdherePrintableOld(obj) {
  
  /* the selected face can't be occluding */
  obj.updateMatrixWorld();
  var faceSelected = neighbors[0];
  
  var va = obj.geometry.vertices[faceSelected.a].clone().applyMatrix4(obj.matrixWorld);
  var vb = obj.geometry.vertices[faceSelected.b].clone().applyMatrix4(obj.matrixWorld);
  var vc = obj.geometry.vertices[faceSelected.c].clone().applyMatrix4(obj.matrixWorld);

  // var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);
  var nmlFace = new THREE.Vector3().crossVectors(
        new THREE.Vector3().subVectors(vb, va),
        new THREE.Vector3().subVectors(vc, va));
  
  /* 
    find the largest connected occlusion free neighborhoods 
  */
  // var ungroupedNeighbors = neighbors.slice(0);
  
  // var ofgs = []; // occlusino free groups

  // for(var i=0; i<ungroupedNeighbors.length; i++) {
  //  if(ungroupedNeighbors[i].occluding == true || ungroupedNeighbors[i].grouped == true) {
  //    continue;
  //  }
  //  var group = [ungroupedNeighbors[i]];
  //  findOcclusionFreeNeighbors(ungroupedNeighbors[i], group);

  //  ofgs.push(group);
  // }

  // var maxGroup;
  // var maxArea = 0;
  // console.log(ofgs.length + " groups");
  // for(var i=0; i<ofgs.length; i++) {

  //  var area = 0;
  //  var clr = 0xff0f00 * Math.random() + 0x00f0ff * (1 - Math.random());
  //  for(var j=0; j<ofgs[i].length; j++) {
  //    // console.log(ofgs[i][j]);
  //    area += ofgs[i][j].area;

  //    /* for debugging */
  //    // var f = ofgs[i][j];
  //    // var indices = [f.a, f.b, f.c];
  //    // var vertices = [];
  //    // for(var k=0; k<indices.length; k++) {
  //    //  var v = obj.geometry.vertices[indices[k]].clone().applyMatrix4(obj.matrixWorld);
  //    //  // points.push(v);
  //    //  vertices.push(v);
  //    // }
  //    // addATriangle(vertices[0], vertices[1], vertices[2], clr);

  //  }

  //  if(maxGroup == undefined || area > maxArea) {
  //    maxGroup = ofgs[i];
  //    maxArea = area;
  //  }
  //  // console.log(area);
  // }

  // console.log("max group: " + maxGroup.length);

  var maxGroup = neighbors;
  
  /*  
    compute the projections
    ref: http://www.9math.com/book/projection-point-plane
  */
  var points = [];
  for(var i=0; i<maxGroup.length; i++) {
    var f = maxGroup[i];
    var indices = [f.a, f.b, f.c];
    var vertices = [];
    for(var j=0; j<indices.length; j++) {
      var v = obj.geometry.vertices[indices[j]].clone().applyMatrix4(obj.matrixWorld);
      points.push(v);
      vertices.push(v);
    }

    f.verts = vertices;
  }

  var planeParams = findPlaneToFitPoints(points);
  var a = planeParams.A;
  var b = planeParams.B;
  var c = planeParams.C;
  var d = planeParams.D;

  /* 
    rotate the object 
  */
  var yUp = new THREE.Vector3(0, 1, 0);
  var nml = new THREE.Vector3(a, b, c).normalize();

  if(Math.abs(nml.angleTo(nmlFace)) > Math.PI / 2) {
    nml.multiplyScalar(-1);
  }

  angleToRotate = nml.angleTo(yUp);
  axisToRotate = new THREE.Vector3().crossVectors(nml, yUp).normalize();

  obj.rotateOnAxis(axisToRotate, angleToRotate);
  obj.updateMatrixWorld();

  // var v0 = new THREE.Vector3(0, 0, -d/c);
  // var v1 = new THREE.Vector3(0, -d/b, 0);
  // var v2 = new THREE.Vector3(-d/a, 0, 0);

  // addATriangle(v0, v1, v2, 0xff00ff);

  // for(var i=0; i<maxGroup.length; i++) {
  //  var f = maxGroup[i];
  //  var projections = [];
  //  for(var j=0; j<f.verts.length; j++) {
  //    projections.push(getProjection(f.verts[j], a, b, c, d));
  //  }

  //  f.projs = projections;


  //  /*
  //    for debugging
  //  */
  //  // for(var j=0; j<projections.length; j++) {
  //  //  console.log(projections[j].x + ", " 
  //  //    + projections[j].y + ", "
  //  //    + projections[j].z);
  //  // }
  //  // console.log(" - - - - ");
    
  //  addATriangle(projections[0], projections[1], projections[2], 0x00ff00);
  // }

  
  /*
    raise the plane so it doesn't occlude any face
  */
  
  // update the center, since the object might have been rotated
  va = obj.geometry.vertices[faceSelected.a].clone().applyMatrix4(obj.matrixWorld);
  vb = obj.geometry.vertices[faceSelected.b].clone().applyMatrix4(obj.matrixWorld);
  vc = obj.geometry.vertices[faceSelected.c].clone().applyMatrix4(obj.matrixWorld);

  var ctr = new THREE.Vector3().addVectors(va, vb).add(vc).divideScalar(3);

  var lowestPoint;
  var maxNegDist = 0;
  for(var i=0; i<points.length; i++) {
    var v = points[i];
    var dist = (a*v.x + b*v.y + c*v.z + d) / Math.sqrt(a*a + b*b + c*c);

    if(dist < maxNegDist) {
      lowestPoint = v;
      maxNegDist = dist;
    }
  }

  // TODO: might want to check if it exceeds critical dropping distance

  // addABall(lowestPoint.x, lowestPoint.y, lowestPoint.z, 0xff0000, 1);

  /* 
    compute the largest circle that won't result in occlusion 
  */
  
  ctr.y -= maxNegDist;

  var shrinkRatio = 0.9;
  var rOcclFree;
  for(var r=radiusHandle; r>radiusMinimum; r*=shrinkRatio) {
    if(!isOccluding(ctr, r, obj)) {
      rOcclFree = r;
      break;
    }
  }
  console.log(rOcclFree);

  /* extrude a cylinder */
}

/*
  assuming the print head dimension is known
*/
// function isOccluding(ctr, r, obj) {
//  obj.updateMatrixWorld();

//  /* do a search based on a rough tessellation of a circle around ctr */
//  var dividsion = 36;

//  for(var i=0; i<dividsion; i++) {
//    var angle = i * 2 * Math.PI / dividsion;
//    var radiusVector = new THREE.Vector3(r * Math.sin(angle), 0, r * Math.cos(angle));
//    var testPoint = ctr.clone().add(radiusVector);

//    addABall(testPoint.x, testPoint.y, testPoint.z, 0xff0000, 1);
//  }

//  return false;
// }

function projectionOnSegments(ctr, p0, p1) {
  var v0 = new THREE.Vector3().subVectors(ctr, p0);
  var v1 = new THREE.Vector3().subVectors(p1, p0);

  var dotProduct = v0.dot(v1);
  return 0 <= dotProduct && dotProduct <= v1.length();
}

function distanceToSegment(ctr, p0, p1) {
  var v0 = new THREE.Vector3().subVectors(ctr, p0);
  var v1 = new THREE.Vector3().subVectors(p1, p0);

  // console.log("dist to seg: " + Math.pow(v0.length(), 2) + ", "+ Math.pow(v0.dot(v1), 2));
  return Math.sqrt(Math.pow(v0.length(), 2) - Math.pow(v0.dot(v1.clone().normalize()), 2));
}