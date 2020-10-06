import { OrbitControls } from './lib/OrbitControls.js';
import { TrackballControls } from './lib/TrackballControls.js';
import { DynamicsController } from './dynamics.js';

var scene, camera, renderer, controls;
var sunlight, sun, earth, leader, follower;

var rArrow, vArrow, sArrow;
var xArrow, yArrow, zArrow;

var dynamics;
var t = 0;
const dt_animation = 0.1; // dt corresponds to a minute of simulated time,
                          // and to a frame of real time ~ 1/60 seconds.
                          // This is a reasonable frame rate that makes the
                          // animation fast but not too fast.
const dt_realtime = 1 / 3600; // This will produce a realtime simulation.
const dt = dt_animation;

const sunRadius = 30;
const earthRadius = 63.7;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    controls = new TrackballControls(camera, renderer.domElement);

    scene.add(new THREE.AmbientLight(0x333333));

    // Sun and sunlight
    sunlight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(sunlight);
    const sunMaterial = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/sunmap.jpg'),
    })
    sun = new THREE.Mesh(new THREE.SphereGeometry(1, 50, 50), sunMaterial);
    sun.scale.set(sunRadius, sunRadius, sunRadius);
    scene.add(sun);

    // Earth and its textures
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
        bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
        bumpScale: 0.005,
        specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
        specular: new THREE.Color('grey'),
    });
    earth = new THREE.Mesh(new THREE.SphereGeometry(1, 50, 50), earthMaterial);
    earth.scale.set(earthRadius, earthRadius, earthRadius);
    scene.add(earth);

    // Spacecrafts
    var leaderSpacecraftMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b535 });
    var followerSpacecraftMaterial = new THREE.MeshBasicMaterial({ color: 0xa241cc });
    leader = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), leaderSpacecraftMaterial);
    follower = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), followerSpacecraftMaterial);
    scene.add(leader);
    scene.add(follower);

    dynamics = new DynamicsController(sun, earth, leader, follower);
    dynamics.setMode("leader", camera);

    rArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0xffffff);
    vArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0x707070);
    sArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0xffff00);
    xArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0xff0000);
    yArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0x00ff00);
    zArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 2, 0x0000ff);
    scene.add(rArrow);
    scene.add(vArrow);
    scene.add(sArrow);
    scene.add(xArrow);
    scene.add(yArrow);
    scene.add(zArrow);

    var loader = new THREE.FontLoader();

    loader.load('fonts/helvetiker_regular.typeface.json', function (font) {
        var geometry = new THREE.TextGeometry('Hello three.js!', {
            font: font,
            size: 80,
            height: 5,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 8,
            bevelOffset: 0,
            bevelSegments: 5
        });
    });
}

var animate = function () {
    requestAnimationFrame(animate);

    dynamics.update(t, dt);
    sunlight.position.x = sun.position.x;
    sunlight.position.y = sun.position.y;
    sunlight.position.z = sun.position.z;
    rArrow.setDirection(new THREE.Vector3().copy(dynamics.leaderPosition).normalize());
    vArrow.setDirection(new THREE.Vector3().copy(dynamics.leaderVelocity).normalize());
    sArrow.setDirection(new THREE.Vector3().copy(sun.position).normalize());
    xArrow.setDirection(new THREE.Vector3(1,0,0));
    yArrow.setDirection(new THREE.Vector3(0,1,0));
    zArrow.setDirection(new THREE.Vector3(0,0,1));
    rArrow.position.x = dynamics.leaderPosition.x;
    rArrow.position.y = dynamics.leaderPosition.y;
    rArrow.position.z = dynamics.leaderPosition.z;
    vArrow.position.x = dynamics.leaderPosition.x;
    vArrow.position.y = dynamics.leaderPosition.y;
    vArrow.position.z = dynamics.leaderPosition.z;
    sArrow.position.x = dynamics.leaderPosition.x;
    sArrow.position.y = dynamics.leaderPosition.y;
    sArrow.position.z = dynamics.leaderPosition.z;
    xArrow.position.x = dynamics.leaderPosition.x;
    xArrow.position.y = dynamics.leaderPosition.y;
    xArrow.position.z = dynamics.leaderPosition.z;
    yArrow.position.x = dynamics.leaderPosition.x;
    yArrow.position.y = dynamics.leaderPosition.y;
    yArrow.position.z = dynamics.leaderPosition.z;
    zArrow.position.x = dynamics.leaderPosition.x;
    zArrow.position.y = dynamics.leaderPosition.y;
    zArrow.position.z = dynamics.leaderPosition.z;

    controls.update();

    t += dt;

    renderer.render(scene, camera);
};

init();
animate();

var buttons = document.getElementsByTagName("button");
for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener("click", onButtonClick, false);
};

function onButtonClick(event) {
    if (event.target.id == "leader" || event.target.id == "follower")
    {
        dynamics.setMode("leader", camera);
    }
    else if (event.target.id == "earth")
    {
        dynamics.setMode("earth", camera);
    }
}
