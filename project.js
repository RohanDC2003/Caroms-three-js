import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'cannon-es';
import CannonDebugger from 'cannon-es-debugger';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
// import { VRButton } from 'three/addons/webxr/VRButton.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PDFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//attempt to implement in VR
// document.body.appendChild(VRButton.createButton(renderer));

renderer.xr.enabled = true;

const orbit = new OrbitControls(camera, renderer.domElement);
// orbit.update();

//setting orbit control constraints
orbit.minDistance = 3;
orbit.maxDistance = 7;
orbit.maxPolarAngle = Math.PI / 2.2;

const light = new THREE.SpotLight(0xffffff, 40);
light.castShadow = true; // default false
scene.add(light);
light.position.set(0, 5, 0);

const loader = new GLTFLoader();

loader.load('Assets/board1.glb', function (gltf) {

    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    model.position.y = 0.07;
    scene.add(model);

}, undefined, function (error) {

    console.error(error);

});
loader.load('Assets/game room.glb', function (gltf) {

    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    model.position.y = -3.04;
    model.scale.set(5.5, 5.5, 5.5);
    scene.add(model);

}, undefined, function (error) {

    console.error(error);

});
//Tools used for guidance

// const axesHelper = new THREE.AxesHelper(3);
// scene.add(axesHelper);

// const gridHelper = new THREE.GridHelper();
// scene.add(gridHelper);

// const lightHelper = new THREE.SpotLightHelper(light);
// scene.add(lightHelper);

//striker piece is created
const strikerGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1);
const strikerMat = new THREE.MeshStandardMaterial({ color: "#ffffff" });
const striker = new THREE.Mesh(strikerGeo, strikerMat);
scene.add(striker);
striker.castShadow = true;
striker.position.set(0, 0.2, 2.2);
striker.receiveShadow = true;

const arrowGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.03, 3);
const arrowMat = new THREE.MeshStandardMaterial({ color: "#0000ff", visible: true });
const arrow = new THREE.Mesh(arrowGeo, arrowMat);
striker.add(arrow);
arrow.position.z = -0.3;
arrow.rotation.y = Math.PI / 3;
var pieces = [];    //assigning pieces to the array
//default position of pieces is initialized
var defPos = [new THREE.Vector3(0.35, 0, 0), new THREE.Vector3(-0.35, 0, 0), new THREE.Vector3(0.17, 0, 0.3),
new THREE.Vector3(-0.17, 0, -0.3), new THREE.Vector3(0.17, 0, -0.3), new THREE.Vector3(-0.17, 0, 0.3),
new THREE.Vector3(0, 0, 0)];
for (let i = 0; i < 7; i++) {
    pieces[i] = createPiece();
    pieces[i].position.copy(defPos[i]);
    scene.add(pieces[i]);
}
//function to create different pieces
function createPiece() {
    const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.09);
    const mat = new THREE.MeshStandardMaterial({ color: "#262626" });
    const piece = new THREE.Mesh(geo, mat);
    piece.castShadow = true;
    return piece;
}
camera.position.set(0, 3, 5);
camera.lookAt(0, 0, 0);

//introducing physics world
const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0),
});
const groundPhysMat = new CANNON.Material();
const groundBody1 = new CANNON.Body({
    // shape: new CANNON.Plane(),
    shape: new CANNON.Box(new CANNON.Vec3(2.38, 2.85, 0.25)),
    position: new CANNON.Vec3(0, -0.264, 0),
    material: groundPhysMat,
    type: CANNON.Body.STATIC
});
world.addBody(groundBody1);
groundBody1.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const groundBody2 = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(2.85, 2.38, 0.25)),
    position: new CANNON.Vec3(0, -0.264, 0),
    material: groundPhysMat,
    type: CANNON.Body.STATIC
}
);
world.addBody(groundBody2);
groundBody2.quaternion.setFromEuler(-Math.PI / 2, 0, 0);

const strikerPhyMat = new CANNON.Material();
const strikerBody = new CANNON.Body({
    mass: 1,
    shape: new CANNON.Cylinder(0.2, 0.2, 0.1),
    position: new CANNON.Vec3(0, 0.2, 2.05),
    material: strikerPhyMat
});
world.addBody(strikerBody);

//collision boundaries
var pos = [new CANNON.Vec3(0, 0, -3.3), new CANNON.Vec3(3.3, 0, 0), new CANNON.Vec3(0, 0, 3.3), new CANNON.Vec3(-3.3, 0, 0),]
const wallPhyMat = new CANNON.Material();
const wall1 = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(2.8, 0.3, 0.5)),
    position: pos[0],
    material: wallPhyMat
});
world.addBody(wall1);
const wall2 = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(2.8, 0.3, 0.5)),
    position: pos[1],
    material: wallPhyMat
});
world.addBody(wall2);
wall2.quaternion.setFromEuler(0, Math.PI / 2, 0);

const wall3 = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(2.8, 0.3, 0.5)),
    position: pos[2],
    material: wallPhyMat
});
world.addBody(wall3);
const wall4 = new CANNON.Body({
    type: CANNON.Body.STATIC,
    shape: new CANNON.Box(new CANNON.Vec3(2.8, 0.3, 0.5)),
    position: pos[3],
    material: wallPhyMat
});
world.addBody(wall4);
wall4.quaternion.setFromEuler(0, Math.PI / 2, 0);

var walls = [wall1, wall2, wall3, wall4];

var pieceBodies = [];
for (let i = 0; i < 7; i++) {
    pieceBodies[i] = createPieceBody();
    pieceBodies[i].position.copy(defPos[i]);
    world.addBody(pieceBodies[i]);
}

//create function for creating bodies for each piece
function createPieceBody() {
    const pieceBody = new CANNON.Body({
        mass: 0.5,
        shape: new CANNON.Cylinder(0.155, 0.155, 0.1),
        material: strikerPhyMat
    });
    pieceBody.angularDamping = 0.2;
    return pieceBody;
}

//contact between piece and ground
const groundBoxContactMat = new CANNON.ContactMaterial(
    groundPhysMat,
    strikerPhyMat,
    { friction: 0.0006 }
);
world.addContactMaterial(groundBoxContactMat);

//contact material between pieces
const pieceContactMat = new CANNON.ContactMaterial(
    strikerPhyMat,
    strikerPhyMat,
    { restitution: 0.5 },
    { friction: 0.001 }
);
world.addContactMaterial(pieceContactMat);

const wallContactMat = new CANNON.ContactMaterial(
    wallPhyMat,
    strikerPhyMat,
    { friction: 0.001 },
    { restitution: 0.24 }
);
world.addContactMaterial(wallContactMat);

scene.background = new THREE.Color("#808080");

//controls
var spd = 5, displaySpeed = 1, movespd = 0.05, stop = 1, rot = 0.1, xpoint, zpoint;
var arPos = new THREE.Vector3();
document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {

    var keyCode = event.which;
    // up w
    if (keyCode == 87 && spd < 50) {
        spd += 5;
        displaySpeed++;
        console.log("Speed is ", spd);
    }
    //down s 
    else if (keyCode == 83 && spd > 5) {
        spd -= 5;
        displaySpeed--;
        console.log("Speed is ", spd);
    }
    //space bar, shoot
    else if (keyCode == 32 && stop == 1) {
        stop = 0;
        arrow.getWorldPosition(arPos);
        xpoint = arPos.x - strikerBody.position.x;
        zpoint = arPos.z - strikerBody.position.z;
        console.log("x ", xpoint, "z", zpoint);
        strikerBody.velocity.set(xpoint * spd, 0, zpoint * spd);
    }
    //left a (rotate anti-clockwise)
    else if (keyCode == 65 && stop == 1) {
        rot += 0.1
        strikerBody.quaternion.setFromEuler(0, rot, 0);
        arrow.getWorldPosition(arPos);
        console.log("Arrow position ", arPos);
    }
    //right d (rotate clockwise)
    else if (keyCode == 68 && stop == 1) {
        rot -= 0.1;
        strikerBody.quaternion.setFromEuler(0, rot, 0);
        arrow.getWorldPosition(arPos);
        console.log("Arrow position ", arPos);
    }
    //right
    else if (keyCode == 39 && strikerBody.position.x < 1.7 && stop == 1) {
        strikerBody.position.x += movespd;
    }
    //left
    else if (keyCode == 37 && strikerBody.position.x > -1.7 && stop == 1) {
        strikerBody.position.x -= movespd;
    }
    //reset r
    else if (keyCode == 82) {
        stop = 1;
        rot = 0;
        strikerBody.quaternion.setFromEuler(0, rot, 0);
        strikerBody.position.set(0, 0.05, 2.05);
        strikerBody.velocity.set(0, 0, 0);
        arrow.getWorldPosition(arPos);
        arrow.material.visible = true;
    }
}

//background music
// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add(listener);

var collisionSound = new Audio('Assets/bounce-8111.mp3');
strikerBody.addEventListener("collide", function (e) {
    if (stop != 1) {
        collisionSound.play();
    }
});
var scoreSound = new Audio('Assets/success.mp3');
var beeps = new Audio('Assets/negative_beeps-6008.mp3');
var victory = new Audio('Assets/victory.mp3');
// create a global audio source
const sound = new THREE.Audio(listener);

// load a sound and set it as the Audio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load('Assets/Raphael Olivier - Grandma Radio.mp3', function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(1);
    sound.play();
});

//adding text elements
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.fontSize = '30px';
labelRenderer.domElement.style.color = "#ffffff";
labelRenderer.domElement.style.pointerEvents = 'none';  //used to enable orbit control
document.body.appendChild(labelRenderer.domElement);

const p = document.createElement('p');
const cPointLabel = new CSS2DObject(p);
scene.add(cPointLabel);
cPointLabel.position.set(0, 0, 2.7);

const g = document.createElement('p');
const cPointLabel1 = new CSS2DObject(g);
scene.add(cPointLabel1);
cPointLabel1.position.set(0, 2, 0);

const timeStep = 1 / 60;
//used for debugging session
const cannonDebugger = new CannonDebugger(scene, world);

var score = 0;
var scorepos = [new THREE.Vector3(3.5, 0.5, -0.6), new THREE.Vector3(3.5, 0.5, -0.4), new THREE.Vector3(3.5, 0.5, -0.2),
new THREE.Vector3(3.5, 0.5, 0), new THREE.Vector3(3.5, 0.5, 0.2), new THREE.Vector3(3.5, 0.5, 0.3), new THREE.Vector3(3.5, 0.5, 0.6),];
function animate() {
    requestAnimationFrame(animate);
    world.step(timeStep);
    document.getElementById("details").innerHTML = "<b>Details:</b>Speed: " + displaySpeed + "<br>Score: " + score;
    labelRenderer.render(scene, camera);
    // cannonDebugger.update();
    striker.position.copy(strikerBody.position);
    striker.quaternion.copy(strikerBody.quaternion);
    if (score == 7) {
        g.textContent = "Game Over";
        victory.play();
    }
    for (let i = 0; i < 7; i++) {
        pieces[i].position.copy(pieceBodies[i].position);
        pieces[i].quaternion.copy(pieceBodies[i].quaternion);
    }
    if (strikerBody.position.y < -1) {
        stop = 1;
        beeps.play();
        strikerBody.quaternion.setFromEuler(0, Math.PI / 2, 0);
        strikerBody.position.set(0, 0.2, 2.05);
        strikerBody.velocity.set(0, 0, 0);
        arrow.material.visible = true;
    }
    for (let i = 0; i < 7; i++) {
        if (pieceBodies[i].position.y < -1) {
            score++;
            scoreSound.play();
            pieceBodies[i].position.copy(scorepos[i]);
            pieceBodies[i].velocity.set(0, 0, 0);
            pieceBodies[i].quaternion.setFromEuler(0, Math.PI / 2, 0);
        }
    }
    if (stop == 0) {
        arrow.material.visible = false;
    }
    renderer.render(scene, camera);
}

animate();