import * as THREE from "three";

export const EARTH_RADIUS = 0.38;
export const MOON_RADIUS_RATIO = 0.273;
export const MOON_DISTANCE_RATIO = 60.3;
export const MERCURY_RADIUS_RATIO = 0.383;
export const VENUS_RADIUS_RATIO = 0.949;
export const MARS_RADIUS_RATIO = 0.532;
export const JUPITER_RADIUS_RATIO = 2.8;
export const MERCURY_ORBIT_DISTANCE_RATIO = 0.387;
export const VENUS_ORBIT_DISTANCE_RATIO = 0.723;
export const MARS_ORBIT_DISTANCE_RATIO = 1.524;
export const JUPITER_ORBIT_DISTANCE_RATIO = 5.203;
export const DISTANCE_COMPRESSION = 0.09;
export const MOON_ORBIT_RADIUS = MOON_DISTANCE_RATIO * DISTANCE_COMPRESSION;

export const EARTH_DAY_SECONDS = 24;
export const MOON_ORBIT_PERIOD_DAYS = 27.321661;
export const EARTH_ORBIT_PERIOD_DAYS = 365.256363004;
export const MERCURY_ORBIT_PERIOD_DAYS = 87.9691;
export const VENUS_ORBIT_PERIOD_DAYS = 224.701;
export const MARS_ORBIT_PERIOD_DAYS = 686.98;
export const JUPITER_ORBIT_PERIOD_DAYS = 4332.59;
export const MERCURY_ROTATION_PERIOD_HOURS = 1407.6;
export const VENUS_ROTATION_PERIOD_HOURS = 5832.5;
export const VENUS_CLOUD_ROTATION_PERIOD_HOURS = 96;
export const MARS_ROTATION_PERIOD_HOURS = 24.6229;
export const JUPITER_ROTATION_PERIOD_HOURS = 9.925;

export const EARTH_ROTATION_SPEED = (Math.PI * 2) / EARTH_DAY_SECONDS;
export const MERCURY_ROTATION_SPEED =
  (Math.PI * 2) / MERCURY_ROTATION_PERIOD_HOURS;
export const VENUS_ROTATION_SPEED =
  (-Math.PI * 2) / VENUS_ROTATION_PERIOD_HOURS;
export const VENUS_CLOUD_ROTATION_SPEED =
  (Math.PI * 2) / VENUS_CLOUD_ROTATION_PERIOD_HOURS;
export const MARS_ROTATION_SPEED = (Math.PI * 2) / MARS_ROTATION_PERIOD_HOURS;
export const JUPITER_ROTATION_SPEED =
  (Math.PI * 2) / JUPITER_ROTATION_PERIOD_HOURS;
export const MOON_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MOON_ORBIT_PERIOD_DAYS);
export const EARTH_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * EARTH_ORBIT_PERIOD_DAYS);
export const MERCURY_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MERCURY_ORBIT_PERIOD_DAYS);
export const VENUS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * VENUS_ORBIT_PERIOD_DAYS);
export const MARS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MARS_ORBIT_PERIOD_DAYS);
export const JUPITER_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * JUPITER_ORBIT_PERIOD_DAYS);

export const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.44);
export const MERCURY_AXIAL_TILT = THREE.MathUtils.degToRad(0.03);
export const VENUS_AXIAL_TILT = THREE.MathUtils.degToRad(177.36);
export const MARS_AXIAL_TILT = THREE.MathUtils.degToRad(25.19);
export const JUPITER_AXIAL_TILT = THREE.MathUtils.degToRad(3.13);
export const MOON_ORBIT_INCLINATION = THREE.MathUtils.degToRad(5.145);
export const MERCURY_ORBIT_INCLINATION = THREE.MathUtils.degToRad(7.0);
export const VENUS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(3.39);
export const MARS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.85);
export const JUPITER_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.304);

export const REAL_SUN_DISTANCE_RATIO = 23455;
export const REAL_SUN_RADIUS_RATIO = 109;
export const SUN_DISTANCE_COMPRESSION = 0.00175;
export const SUN_RADIUS_COMPRESSION = 0.012;

export const SUN_DISTANCE = REAL_SUN_DISTANCE_RATIO * SUN_DISTANCE_COMPRESSION;
export const SUN_POSITION = new THREE.Vector3(-8.5, 2.8, -SUN_DISTANCE);
export const SUN_RADIUS = REAL_SUN_RADIUS_RATIO * SUN_RADIUS_COMPRESSION;
export const SUN_DISTANCE_COMPRESS_FACTOR = Math.round(1 / SUN_DISTANCE_COMPRESSION);

export const EARTH_ORBIT_LOCAL_OFFSET = new THREE.Vector3(
  -SUN_POSITION.x,
  0,
  -SUN_POSITION.z,
);
export const MERCURY_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(MERCURY_ORBIT_DISTANCE_RATIO);
export const VENUS_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(VENUS_ORBIT_DISTANCE_RATIO);
export const MARS_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(MARS_ORBIT_DISTANCE_RATIO);
export const JUPITER_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(JUPITER_ORBIT_DISTANCE_RATIO);

export const TEXTURES = {
  earthDay: "/textures/earth_day.jpg",
  earthNormal: "/textures/earth_normal.jpg",
  earthSpecular: "/textures/earth_specular.jpg",
  moon: "/textures/moon.jpg",
  mercury: "/textures/mercury_albedo.jpg",
  venus: "/textures/venus.jpg",
  venusClouds: "/textures/venus_clouds.jpg",
  mars: "/textures/mars.jpg",
  jupiter: "/textures/jupiter.jpg",
} as const;
