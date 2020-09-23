import * as THREE from './lib/three.module.js';

const R_sun = 500;
const R_orbit = 68.7;

const T_orbit = 90; // Corresponds to 90 minutes
const T_earth_revolution = 60 * 24; // Corresponds to a day
const T_sun_orbit = 60 * 24 * 365; // Corresponds to a year

// Normalized orbit times are used to reduce computational burden
const T_orbit_normalized = T_orbit / (2 * Math.PI);
const T_earth_revolution_normalized = T_earth_revolution / (2 * Math.PI);
const T_sun_orbit_normalized = T_sun_orbit / (2 * Math.PI);

class DynamicsController {
    constructor(sun, sunlight, earth, spacecraft)
    {
        this.sun = sun;
        this.sunlight = sunlight;
        this.earth = earth;
        this.spacecraft = spacecraft;
    }

    setMode(mode)
    {
        this.mode = mode;
    }

    initialize_positions(camera)
    {
        if (this.mode == "spacecraft")
        {
            this.earth.position.set(-R_orbit, 0, 0);
            this.sunlight.position.z = this.sun.position.z;
            this.spacecraft.position.set(0, 0, 0);
            camera.position.x = 50;
        }
        else if (this.mode == "earth") {
            this.earth.position.set(0, 0, 0);
            this.sunlight.position.z = this.sun.position.z;
            this.spacecraft.position.set(R_orbit, 0, 0);
            camera.position.z = 200;
        }

        this.sunInclinationMatrix = new THREE.Matrix3();
        const sunInclination = (23.5 / 360) * 2 * Math.PI;
        this.sunInclinationMatrix.set(1, 0, 0,
            0, Math.cos(sunInclination), Math.sin(sunInclination),
            0, -Math.sin(sunInclination), Math.cos(sunInclination));

        this.spacecraftInclinationMatrix = new THREE.Matrix3();
        const orbitInclination = (45 / 360) * 2 * Math.PI;
        this.spacecraftInclinationMatrix.set(1, 0, 0,
            0, Math.cos(orbitInclination), Math.sin(orbitInclination),
            0, -Math.sin(orbitInclination), Math.cos(orbitInclination));
    }

    /**
     * Compute the real positions of objects in ECEF.
     */
    updateRealPhysics(t, dt) {
        var planarSunOrbit = new THREE.Vector3(R_sun * Math.sin(t / T_sun_orbit_normalized), 0, R_sun * Math.cos(t / T_sun_orbit_normalized));
        this.sunOrbit = planarSunOrbit.applyMatrix3(this.sunInclinationMatrix);
        
        var planarSpacecraftOrbit = new THREE.Vector3(R_orbit * Math.sin(t / T_orbit_normalized), 0, R_orbit * Math.cos(t / T_orbit_normalized));
        this.spacecraftOrbit = planarSpacecraftOrbit.applyMatrix3(this.spacecraftInclinationMatrix);

        this.earthRotation = new THREE.Vector3(0, t / T_earth_revolution_normalized, 0);
    }

    update(t, dt)
    {
        this.updateRealPhysics(t, dt);
        if (this.mode == "earth") this.updateEarth();
        if (this.mode == "spacecraft") this.updateSpacecraft();
    }

    updateEarth()
    {
        this.sun.position.x = this.sunOrbit.x;
        this.sun.position.y = this.sunOrbit.y;
        this.sun.position.z = this.sunOrbit.z;
        this.sunlight.position.x = this.sunOrbit.x;
        this.sunlight.position.y = this.sunOrbit.y;
        this.sunlight.position.z = this.sunOrbit.z;
        this.spacecraft.position.x = this.spacecraftOrbit.x;
        this.spacecraft.position.y = this.spacecraftOrbit.y;
        this.spacecraft.position.z = this.spacecraftOrbit.z;

        this.earth.rotation.x = this.earthRotation.x;
        this.earth.rotation.y = this.earthRotation.y;
        this.earth.rotation.z = this.earthRotation.z;

        console.log(this.spacecraft.position);
    }

    updateSpacecraft()
    {

    }
}

export { DynamicsController };