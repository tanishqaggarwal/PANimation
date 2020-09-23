import { OrbitControls } from './lib/OrbitControls.js';
import { TrackballControls } from './lib/TrackballControls.js';
import { DynamicsController } from './dynamics.js';

var scene, camera, renderer, controls;
var sunlight, sun, earth, spacecraft;
var dynamics;
var t = 0;
const dt = 0.1; // dt corresponds to a minute of simulated time,
                // and to a frame of real time ~ 1/60 seconds.

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
    sunlight = new THREE.PointLight(0xffffff, 1.25);
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

    // Spacecraft
    var greyMetalMaterial = new THREE.MeshBasicMaterial({ color: 0x999896 });
    spacecraft = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 2), greyMetalMaterial);
    scene.add(spacecraft);

    dynamics = new DynamicsController(sun, sunlight, earth, spacecraft);
    dynamics.setMode("earth");
    dynamics.initialize_positions(camera);
}

function update_spacecraft_centered(earth, sun, sunlight, spacecraft) {

}

function update_earth_centered(earth, sun, sunlight, spacecraft) {
    
}

var animate = function () {
    requestAnimationFrame(animate);

    dynamics.update(t, dt);
    controls.update();

    t += dt;

    renderer.render(scene, camera);
};

init();
animate();
