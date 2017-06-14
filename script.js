"use strict";
var cubes = [];
var edges = [];
var opacity = 0;
var autoRot = false;
var block = true;
var clearColor = new THREE.Color(0xffeb3b);
var cubeColor = new THREE.Color(0xfff9c4 );
var hitColor = new THREE.Color(0x000000);
var lineColor = new THREE.Color(0xaaffaa/*0xff5016*/);
var edgeColor = new THREE.Color(0x555555);
var canvas = document.getElementById("cnv");
var resetBtn = document.getElementById("reset");
var scene, camera, renderer, controls, light, light2, axis, ambient;
//Block arrangement params
var rows = 3; var dim = 4; var gap = .5;
//Random arrangement params
var n = 100; var maxDim = 4; var scope = 50;

init();
anim();

window.addEventListener("resize", update);
canvas.addEventListener("mousedown", onClick);
document.addEventListener("mouseup", mouseUp);
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
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      for(var k = 0; k < n; k++) {
        var mat = new THREE.MeshPhongMaterial({color: cubeColor,
                                               transparent: true,
                                               shininess: 70});
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
        cubes.push(obj);
        edges.push(edge);
        scene.add(edge);
        scene.add(obj);
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
  var intersects = raycaster.intersectObjects(cubes);
  return intersects;
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
  drawCubes(rows, dim, gap);
}

function update() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onClick(event) {
  var intersects = getIntersects(event);
  if(intersects.length > 0) {
    controls.enabled = false;
    var i;
    for(i = 0; i < intersects.length; i++) {
      var cube = intersects[i].object;
      cube.material.color = hitColor;
      cube.material.opacity = 0.1;
      var index = getCubeIndex(cube);
      edges[index].material.opacity = 0.1;
    }
    var pos = camera.position;
    var start = new THREE.Vector3(pos.x, pos.y, pos.z);
    var end = intersects[i-1].point;
  }
}

function getCubeIndex(cube) {
  var res = -1;
  for(var i = 0; i < cubes.length; i++) {
    if(cubes[i] == cube) {
      res = i;
      break;
    }
  }
  return i;
}

function mouseUp() {
  controls.enabled = true;
}

function anim() {
   requestAnimationFrame(anim);
   controls.update();
   render();
}
