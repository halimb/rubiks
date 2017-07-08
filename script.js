"use strict";
var positions = [];
var objects = [];
var cubes = [];
var edges = [];
var opacity = 0;
var autoRot = false;
var block = true;
var scene, camera, renderer, controls, light, 
    light2, axis, ambient, group, angle = 0, indexOffset;
var clearColor = new THREE.Color(0xffeb3b);
var cubeColor = new THREE.Color(0xfff9c4 );
var hitColor = new THREE.Color(0x000000);
var lineColor = new THREE.Color(0xaaffaa/*0xff5016*/);
var edgeColor = new THREE.Color(0x000);
var canvas = document.getElementById("cnv");
var resetBtn = document.getElementById("reset");
var rotate = document.getElementById('rotate');

//Block arrangement params
var rows = 3; var dim = 4; var gap = 2;
var step = dim + gap;

// [0 .. rows * rows]
var canon = Array(rows * rows)
              .fill(0)
              .map(function(el, i){return i});

//Random arrangement params
var n = 100; var maxDim = 4; var scope = 50;

//

init();
anim();

window.addEventListener("resize", update);
canvas.addEventListener("mousedown", onClick);
document.addEventListener("mouseup", mouseUp);
rotate.onclick = function(){makeMove(arr[0], arr[1]);};
resetBtn.onclick = reset;


function init() {
  //Scene
  scene =  new THREE.Scene();
  //scene.fog = new THREE.FogExp2(0x404040, 0.0075);

  //Lights
  light = new THREE.PointLight(0xffffff);
  light.position.set(40, 40, 40);
  light.intensity = 0.8;

  light2 = light.clone();
  light2.position.set(-40, -40, -40);

  ambient = new THREE.AmbientLight(0xffffff);
  ambient.intensity = 0.65;

  //Renderer
  renderer = new THREE.WebGLRenderer( { canvas: canvas,
                                       antialias: true } );
  renderer.setClearColor(clearColor, 1);

  //Camera
  camera = new THREE.PerspectiveCamera(45, 1.0, 0.5, 10000);
  camera.position.set(60, 60, 60);
  camera.updateProjectionMatrix();

  //setting the orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.5;
  controls.rotateSpeed = 0.55;
  controls.maxPolarAngle = 3 * Math.PI / 2
  controls.minPolarAngle = -Infinity
  
  axis = new THREE.AxisHelper(20);
  
  //Populating the scene
  reset();
}

function render() {
   renderer.setSize(window.innerWidth, window.innerHeight);
   update();
   renderer.render(scene, camera);
}
var myc;
function drawCubes(n, dim, gap) {
  var step = dim + gap;
  var length = n * step - gap;
  var offset = length / 2;
  var id = 0;
  indexOffset = scene.children.length;
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      for(var k = 0; k < n; k++) {
        var pos = {};
        pos.x = i * step - offset + dim / 2;
        pos.y = j * step - offset + dim / 2;
        pos.z = k * step - offset + dim / 2;
        positions.push(pos);

        var mat = new THREE.MeshPhongMaterial({color: cubeColor,
                                               transparent: true,
                                               side: THREE.DoubleSide,
                                               vertexColors: THREE.FaceColors
                                               //shininess: 70,
                                             });
        var geo = new THREE.BoxGeometry(dim, dim, dim);
        var edgesGeo = new THREE.EdgesGeometry(geo);
        var edge = new THREE.LineSegments(
                            edgesGeo, 
                            new THREE.LineBasicMaterial(
                                    { color: edgeColor,
                                      transparent: true,
                                      linewidth: 3})
                                         );
        edge.position.x = pos.x;
        edge.position.y = pos.y;
        edge.position.z = pos.z;
      
        var obj = new THREE.Mesh(geo, mat);
        for(var p = 0; p < obj.geometry.faces.length; p++) {
          obj.geometry.faces[p].color = getFaceColor(p);
        }

        obj.position.x = pos.x;
        obj.position.y = pos.y;
        obj.position.z = pos.z;

        var c = new THREE.Group();
        c.add(obj);
        c.add(edge);
        edge.name = id;
        obj.name = id;
        c.name = "gr" + id;
        id++;
        cubes.push(obj);
        objects.push(c);
        scene.add(c);
        // scene.add(pr);
      }
    }
  }
}

function getFaceColor(i) {
  switch(i) {
    // 1
    case 0:
    case 1:
      return {r: 0,
              g: 0,
              b: 0 };

    // 2
    case 2:
    case 3:
      return {r: .57,
              g: .57,
              b: .57 };
    
    //3
    case 4:
    case 5:
      return {r: .35,
              g: .35,
              b: .35 };
    // 4
    case 6:
    case 7:
      return {r: .55,
              g: .55,
              b: .55 };
    // 5
    case 8:
    case 9:
      return {r: .75,
              g: .75,
              b: .75 };
    
    //6           
    case 10:
    case 11:
      return {r: 1,
              g: 1,
              b: 1 };
  }
}

// function getFaceColor(i) {
//   switch(i) {
//     // 1
//     case 0:
//     case 1:
//       return {r: 1,
//               g: .5,
//               b: 0 };

//     // 2
//     case 2:
//     case 3:
//       return {r: 1,
//               g: 0,
//               b: 0 };
    
//     //3
//     case 4:
//     case 5:
//       return {r: 0,
//               g: 1,
//               b: 0 };
//     // 4
//     case 6:
//     case 7:
//       return {r: 0,
//               g: 0,
//               b: 1 };
//     // 5
//     case 8:
//     case 9:
//       return {r: 1,
//               g: 1,
//               b: 0 };
    
//     //6           
//     case 10:
//     case 11:
//       return {r: 1,
//               g: 1,
//               b: 1 };
//   }
// }


function getIntersects(event) {
  var raycaster = new THREE.Raycaster();
  var click = new THREE.Vector2();
  var offset = canvas.offsetLeft;
  var top = canvas.offsetTop;
  click.x = 2 * (event.clientX - offset) / (canvas.width)- 1;
  click.y =  - (2 * (event.clientY - offset) / canvas.height - 1);
  raycaster.setFromCamera(click, camera);
  var intersects = raycaster.intersectObjects(cubes, true);
  return intersects.length > 0 ? intersects[0] : false;
}

function reset() {
  scene.children = [];
  scene.add(light);
  scene.add(light2);
  scene.add(ambient)
  scene.add(camera);
  scene.add(axis);
  cubes = [];
  edges = []; 
  objects = [];
  drawCubes(rows, dim, gap);
}

function update() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var arr = [];
function onClick(event) {
  var intersects = getIntersects(event);
  if(intersects) {
    controls.enabled = false;
    arr.push(intersects);
   }
}

function mouseUp() {
  controls.enabled = true;
}

function anim() {
   requestAnimationFrame(anim);
   controls.update();
   render();
}



function rotateGroup(group, axis, dir) {

  printCube();

  var before = [];
  var after = [];
  var finalRot = Math.PI / 2;
  //var angle = getAngleOnAxis(/*objects[indices[0]]*/, axis);
  var limit = dir * finalRot// + angle;
  var incr = dir * .05;
  var count = 0;
  function animGroup() {
      angle += incr;
      count += incr;
      if(Math.abs(count) < finalRot) {
        for(var i = 0; i < group.length; i++) {
          var o = group[i];
          // o.matrixWorldNeedsUpdate = true;
          o.rotation[getAxis(axis)] += incr
          // o.matrixWorldNeedsUpdate = true;
          //o.rotateOnAxis(axis, incr);
        }
        requestAnimationFrame(animGroup);
      }
      else {
        var delta = dir * ( finalRot - Math.abs(count - incr)) ;
        for(var i = 0; i < group.length; i++) {
          var ob = group[i];
          // ob.matrixWorldNeedsUpdate = true;
         // var ob = objects[indices[i]];
          before.push(ob);
          ob.rotation[getAxis(axis)] += delta;
          // ob.matrixWorldNeedsUpdate = true;
          //ob.rotateOnAxis(axis, delta);
        }
    }
  }
  axis.x = Math.abs(axis.x);
  axis.y = Math.abs(axis.y);
  axis.z = Math.abs(axis.z);
  animGroup();

  // function updateCube() {    
  //   var rotated = rotateIndices(indices, -dir);
  //   var clone = objects.slice();
  //   console.log('\n\n')
  //   printFace(before, "before");
  //   for(var i = 0; i < indices.length; i++) {
  //     var newObj = clone[ rotated[i] ];
  //     after.push(newObj);   
  //     objects[indices[i]] = newObj;
  //   }
  //   printFace(after, "after");
  //   console.log('\n\n')
  //   printCube();
  // }

  // window.setTimeout(updateCube, 1000);
  arr = [];
}

function printFace(arr, msg) {
  if(msg) console.log(msg);
  for(var i = 0; i < 3; i++) {
      console.log(arr[i + i * 2].name + ", " + arr[i + 1 + i * 2].name + ", " + arr[i + 2 + i * 2].name);
  }
}

function printCube() {
  console.log("< CUBE >")
  for(var j = 0; j < 3; j++) {
    var face = objects.slice(j*9, (j + 1) * 9);
    printFace(face, j);
  }
  console.log("< CUBE />")
}

function getAxis(axis) {
  if(axis.x) {
    return 'x';
  }
  else if(axis.y) {
    return 'y';
  }
  else {
    return 'z';
  }
}

function getAngleOnAxis(g, axis) {
  var res = 0;
  if(axis.x != 0) {
    return g.rotation.x;
  }
  if(axis.y != 0) {
    return g.rotation.y;
  }
  if(axis.z != 0) {
    return g.rotation.z
  }
}

// FIX THIS
function getGroup(normal, i) {
  var group = [];
  var axis = getAxis(normal);

  function getIndex(j, k) {
    switch(axis) {
      case 'x':
            return (i * rows * rows + k + j * rows);

      case 'y':
            return (rows * i + rows * rows * j + k);

      case 'z':
            return (i + rows * rows * j + k * rows);
    }
  }

  for(var j = 0; j < rows; j++) {
    for(var k = 0; k < rows; k++) {
      var index = getIndex(j, k);
      var pos = positions[index];
      var o = getCubeByPos(pos);
      group.push(o);
    }
  }

  return group;
}


function getAxis(normal) {
  var res = 0;
  for(var key in normal) {
    if(normal[key] != 0) {
      res = key;
      break;
    }
  }
  return res;
}

function roundTo(unit, value) {
  return Math.round(value / unit) * unit;
}

function getPos(p) {
  return {
          x: roundTo(step, p.x),
          y: roundTo(step, p.y),
          z: roundTo(step, p.z)
        }
}

function getDir(a, b) {
  return {
          x: (a.x - b.x) / step,
          y: (a.y - b.y) / step,
          z: (a.z - b.z) / step
        }
}

function diff(x, y) {
  return Math.abs(Math.abs(x) - Math.abs(y));
}

function getNormal(p) {
  var innerRad = step + dim / 2;
  var dx = diff(p.x, innerRad);
  var dy = diff(p.y, innerRad);
  var dz = diff(p.z, innerRad);
  return {
          x: (dx < .1) ? Math.sign(p.x) : 0,
          y: (dy < .1) ? Math.sign(p.y) : 0,
          z: (dz < .1) ? Math.sign(p.z) : 0
       }
}

function makeMove(intersectA, intersectB) {
  var dir;
  var index;
  var normal;
  var a = intersectA.point;
  var b = intersectB.point;
  var nA = getNormal(a);
  var nB = getNormal(b);
  var posA = getPos(a);
  var posB = getPos(b);
  if( nA.x == nB.x &&
      nA.y == nB.y &&
      nA.z == nB.z    ) {
    var face = getDir(posA, posB);
    normal = cross(face, nA);
  }
  else {
    normal = cross(nA, nB);
  }
  var i = getAxis(normal);
  index = (posA[i] + step) / step ;
  var gr = getGroup(normal, index);
  dir = normal.x + normal.y + normal.z;
  rotateGroup(gr, normal, dir);
}

//Cross product
function cross(u, v) {
  return {
    x: (u.y*v.z - u.z*v.y),
    y: (u.z*v.x - u.x*v.z),
    z: (u.x*v.y - u.y*v.x) 
  }
}


function rotateIndices(base, dir) {
  var res = [];
  var i0 = (dir < 0) ? 0 : rows - 1;
  var j0 = (dir < 0) ? rows - 1 : 0;
  var di = (dir < 0) ?  1 : -1;
  var dj = (dir < 0) ? -1 :  1;
  for(var i = i0; !(i == rows || i == -1); i += di) {
    for(var j = j0; !(j == rows || j == -1); j += dj) {
      var index = i + (j * rows); 
      res.push(base[index])
    }
  }
  return res;
}

function getCubeByPos(pos) {
  var origin = new THREE.Vector3(pos.x, pos.y, pos.z);
  var ray = new THREE.Raycaster( origin );
  ray.direction = new THREE.Vector3(1,0,0);
  ray.far = ( dim + gap ) / 2;
  var intersects = ray.intersectObjects(objects, true);
  /* the cube id precedes the id of the group 
    containing both the cube and its frame  */
  var name = intersects[0].object.name;
  return scene.getObjectByName("gr" + name);
}

function getFace(intersectA, intersectB) {
  var dir;
  var index;
  var normal;
  var a = intersectA.point;
  var b = intersectB.point;
  var nA = getNormal(a);
  var nB = getNormal(b);
  var posA = getPos(a);
  var posB = getPos(b);
  if( nA.x == nB.x &&
      nA.y == nB.y &&
      nA.z == nB.z    ) {
    var face = getDir(posA, posB);
    normal = cross(face, nA);
  }
  else {
    normal = cross(nA, nB);
  }
  var i = getAxis(normal);
  index = (posA[i] + step) / step ;
  return getGroup(normal, index)
}