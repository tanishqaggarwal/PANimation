import * as THREE from './lib/three.module.js';

const R_sun = 1000;
const R_orbit = 68.7;

const T_orbit = 94; // Corresponds to 94 minutes, the period of a spacecraft orbit
const T_earth_revolution = 60 * 24; // Corresponds to a day
const T_sun_orbit = 60 * 24 * 365; // Corresponds to a year

// Normalized orbit times are used to reduce computational burden
const T_orbit_normalized = T_orbit / (2 * Math.PI);
const T_earth_revolution_normalized = T_earth_revolution / (2 * Math.PI);
const T_sun_orbit_normalized = T_sun_orbit / (2 * Math.PI);

class DynamicsController {
    constructor(sun, earth, leader, follower)
    {
        this.sun = sun;
        this.earth = earth;
        this.leader = leader;
        this.follower = follower;

        this.sunInclinationMatrix = new THREE.Matrix3();
        const sunInclination = (23.5 / 360) * 2 * Math.PI;
        this.sunInclinationMatrix.set(1, 0, 0,
            0, Math.cos(sunInclination), Math.sin(sunInclination),
            0, -Math.sin(sunInclination), Math.cos(sunInclination));

        this.leaderInclinationMatrix = new THREE.Matrix3();
        const orbitInclination = (45 / 360) * 2 * Math.PI;
        this.leaderInclinationMatrix.set(1, 0, 0,
            0, Math.cos(orbitInclination), Math.sin(orbitInclination),
            0, -Math.sin(orbitInclination), Math.cos(orbitInclination));
    }

    setMode(mode, camera)
    {
        this.mode = mode;
        if (this.mode == "leader" || this.mode == "follower") {
            this.earth.position.set(-R_orbit, 0, 0);
            this.leader.position.set(0, 0, 0);
            this.follower.position.set(0, 0, 0);
            camera.position.x = 50;
        }
        else if (this.mode == "earth") {
            this.earth.position.set(0, 0, 0);
            this.leader.position.set(R_orbit, 0, 0);
            this.follower.position.set(R_orbit, 0, 0);
            camera.position.z = 200;
        }
    }

    /**
     * Compute the real positions of objects in ECEF.
     */
    updatePhysics(t, dt) {
        var planarSunPosition = new THREE.Vector3(
            R_sun * Math.sin(t / T_sun_orbit_normalized), 0, R_sun * Math.cos(t / T_sun_orbit_normalized));
        this.sunPosition = planarSunPosition.applyMatrix3(this.sunInclinationMatrix);
        
        var planarLeaderPosition = new THREE.Vector3(
            R_orbit * Math.sin(t / T_orbit_normalized), 0, R_orbit * Math.cos(t / T_orbit_normalized));
        var planarLeaderVelocity = new THREE.Vector3(
            R_orbit * Math.cos(t / T_orbit_normalized), 0, - R_orbit * Math.sin(t / T_orbit_normalized));
        this.leaderPosition = planarLeaderPosition.applyMatrix3(this.leaderInclinationMatrix);
        this.leaderVelocity = planarLeaderVelocity.applyMatrix3(this.leaderInclinationMatrix);

        this.earthRotation = new THREE.Vector3(0, t / T_earth_revolution_normalized, 0);
    }

    update(t, dt)
    {
        this.updatePhysics(t, dt);
        if (this.mode == "earth") this.updateEarth(t, dt);
        else if (this.mode == "leader") this.updateLeader(t, dt);
    }

    updateEarth(t, dt)
    {
        this.sun.position.x = this.sunPosition.x;
        this.sun.position.y = this.sunPosition.y;
        this.sun.position.z = this.sunPosition.z;
        this.leader.position.x = this.leaderPosition.x;
        this.leader.position.y = this.leaderPosition.y;
        this.leader.position.z = this.leaderPosition.z;

        this.earth.rotation.x = this.earthRotation.x;
        this.earth.rotation.y = this.earthRotation.y;
        this.earth.rotation.z = this.earthRotation.z;
    }

    updateLeader(t, dt)
    {
        // Compute ECEF-to-leader transform
        var r = this.leaderPosition.normalize();
        var v = this.leaderVelocity.normalize();
        var w = v.cross(r).normalize();
        var T_ecef_hill = new THREE.Matrix3(); // Transformation from frame defined by r, v, r x v to ECEF
        T_ecef_hill.set(r.x, w.x, v.x,
                        r.y, w.y, v.y,
                        r.z, w.z, v.z);
        var T_hill_ecef = T_ecef_hill.transpose();

        var sunPosition = this.sunPosition.sub(this.leaderPosition);
        sunPosition = sunPosition.applyMatrix3(T_hill_ecef);

        this.sun.position.x = sunPosition.x;
        this.sun.position.y = sunPosition.y;
        this.sun.position.z = sunPosition.z;

        var earthRotation = new THREE.Vector3(0, t / T_earth_revolution_normalized, 0);
        this.earth.rotation.x = earthRotation.x;
        this.earth.rotation.y = earthRotation.y;
        this.earth.rotation.z = earthRotation.z;
    }
}

export { DynamicsController };
