"use strict";
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
var edgeColor = new THREE.Color(0x555555);
var canvas = document.getElementById("cnv");
var resetBtn = document.getElementById("reset");
var rotate = document.getElementById('rotate');

//Block arrangement params
var rows = 3; var dim = 4; var gap = 3;
//Random arrangement params
var n = 100; var maxDim = 4; var scope = 50;

init();
anim();

window.addEventListener("resize", update);
canvas.addEventListener("mousedown", onClick);
document.addEventListener("mouseup", mouseUp);
rotate.onclick = function(){rotateGroup(arr);};
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
  ambient.intensity = 0.4;

  //Renderer
  renderer = new THREE.WebGLRenderer( { canvas: canvas,
                                       antialias: true } );
  renderer.setClearColor(clearColor, 1);

  //Camera
  camera = new THREE.PerspectiveCamera(45, 1.0, 0.1, 10000);
  camera.position.set(30, 30, 30);
  camera.updateProjectionMatrix();

  //setting the orbit controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enabled = true;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.rotateSpeed = 0.15;
  
  axis = new THREE.AxisHelper(20);
  
  //Populating the scene
  reset();
}

function render() {
   renderer.setSize(window.innerWidth, window.innerHeight);
   update();
   renderer.render(scene, camera);
}

function drawCubes(n, dim, gap) {
  var step = dim + gap;
  var length = n * step - gap;
  var offset = length / 2;
  var op = .7;
  indexOffset = scene.children.length;
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      for(var k = 0; k < n; k++) {
        var mat = new THREE.MeshPhongMaterial({color: cubeColor,
                                               transparent: true,
                                               //shininess: 70,
                                               opacity: op});
        var geo = new THREE.BoxGeometry(dim, dim, dim);
        var edgesGeo = new THREE.EdgesGeometry(geo);
        var edge = new THREE.LineSegments(
                            edgesGeo, 
                            new THREE.LineBasicMaterial(
                                    { color: edgeColor,
                                      transparent: true,
                                      linewidth: 2})
                                         );
        var obj = new THREE.Mesh(geo, mat);
        obj.position.x = i * step - offset + dim / 2;
        obj.position.y = j * step - offset + dim / 2;
        obj.position.z = k * step - offset + dim / 2;
        edge.position.x = obj.position.x;
        edge.position.y = obj.position.y;
        edge.position.z = obj.position.z;
        var c = new THREE.Group();
        c.add(obj);
        c.add(edge);
        cubes.push(obj);
        objects.push(c);
        scene.add(c);
      }
    }
  }
}


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

function rotateGroup(group, a) {
  // console.log("inside rotateGroup")
  // var normal = a[0].face.normal;
  // group = new THREE.Group();

  // for(var i = 0; i < a.length; i++) {
  //   var cube = a[i].object;
  //   var index = i + indexOffset;
  //   group.add(objects[index]);
  // }
  group.rotateOnAxis(normal, angle +  Math.PI / 4)
  angle = getAngleOnAxis(group, normal);
  scene.add(group);
  arr = []
}

function getAngleOnAxis(g, axis) {
  var res = 0;
  if(axis.x != 0) {
    return g.rotation._x;
  }
  else if(axis.y != 0) {
    return g.rotation._y
  }
  else if(axis.z != 0) {
    return g.rotation._z
  }
}

function getGroup(normal, i) {
  var group = new THREE.Group();
  var index = dot(normal, [0,1,2]);
  var axes = ['x', 'y', 'z'];
  var axis = axes[index];

  switch(axis) {
    case 'x':
      for(var j = 0; j < rows; j++) {
        for(var k = 0; k < rows; k++) {
          index = i * rows * rows + k + j * rows;
          hideCube(index)
          // group.add(scene.children[index + indexOffset])
        }
      }
      break;

    case 'y':

      break; 

    case 'z':

      break;

    default:

      break;
  }
  return group;
}


var gr = new THREE.Group();
function hideCube(n) {
  var children = scene.children;
  gr.add(children[n + indexOffset]);
  //children[n + indexOffset].visible = false;
}

function dot(u, v) {
  var res = 0;
  if(u.length == v.length) {
    for(var i = 0; i < u.length; i++) {
      res += u[i] * v[i];
    }
  }
  return res;
}

