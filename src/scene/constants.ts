import * as THREE from "three";

export const EARTH_RADIUS = 1;
export const MOON_RADIUS_RATIO = 0.273;
export const MOON_DISTANCE_RATIO = 60.3;
export const DISTANCE_COMPRESSION = 0.09;
export const MOON_ORBIT_RADIUS = MOON_DISTANCE_RATIO * DISTANCE_COMPRESSION;

export const EARTH_DAY_SECONDS = 24;
export const MOON_ORBIT_PERIOD_DAYS = 27.321661;
export const EARTH_ORBIT_PERIOD_DAYS = 365.256363004;

export const EARTH_ROTATION_SPEED = (Math.PI * 2) / EARTH_DAY_SECONDS;
export const MOON_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MOON_ORBIT_PERIOD_DAYS);
export const EARTH_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * EARTH_ORBIT_PERIOD_DAYS);

export const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.44);
export const MOON_ORBIT_INCLINATION = THREE.MathUtils.degToRad(5.145);

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

export const TEXTURES = {
  earthDay: "/textures/earth_day.jpg",
  earthNormal: "/textures/earth_normal.jpg",
  earthSpecular: "/textures/earth_specular.jpg",
  moon: "/textures/moon.jpg",
} as const;
