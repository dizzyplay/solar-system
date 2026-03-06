import * as THREE from "three";

export const EARTH_RADIUS = 0.38;
export const MOON_RADIUS_RATIO = 0.273;
export const MOON_DISTANCE_RATIO = 60.3;
export const MERCURY_RADIUS_RATIO = 0.38;
export const VENUS_RADIUS_RATIO = 0.95;
export const MARS_RADIUS_RATIO = 0.53;
export const JUPITER_RADIUS_RATIO = 11.2;
export const SATURN_RADIUS_RATIO = 9.45;
export const URANUS_RADIUS_RATIO = 4.01;
export const NEPTUNE_RADIUS_RATIO = 3.88;
export const IO_RADIUS_RATIO = 0.286;
export const EUROPA_RADIUS_RATIO = 0.245;
export const GANYMEDE_RADIUS_RATIO = 0.413;
export const CALLISTO_RADIUS_RATIO = 0.378;
export const TITAN_RADIUS_RATIO = 0.404;
export const RHEA_RADIUS_RATIO = 0.12;
export const IAPETUS_RADIUS_RATIO = 0.12;
export const DIONE_RADIUS_RATIO = 0.088;
export const TETHYS_RADIUS_RATIO = 0.083;
export const ENCELADUS_RADIUS_RATIO = 0.04;
export const MIMAS_RADIUS_RATIO = 0.031;
export const MERCURY_ORBIT_DISTANCE_RATIO = 0.387;
export const VENUS_ORBIT_DISTANCE_RATIO = 0.723;
export const MARS_ORBIT_DISTANCE_RATIO = 1.524;
export const JUPITER_ORBIT_DISTANCE_RATIO = 5.203;
export const SATURN_ORBIT_DISTANCE_RATIO = 9.537;
export const URANUS_ORBIT_DISTANCE_RATIO = 19.191;
export const NEPTUNE_ORBIT_DISTANCE_RATIO = 30.07;
export const ASTEROID_BELT_INNER_AU = 2.1;
export const ASTEROID_BELT_OUTER_AU = 3.3;
export const ASTEROID_BELT_PARTICLE_COUNT = 2200;
export const ASTEROID_BELT_TILT_X = THREE.MathUtils.degToRad(1.45);
export const DISTANCE_COMPRESSION = 0.09;
export const MOON_ORBIT_RADIUS = MOON_DISTANCE_RATIO * DISTANCE_COMPRESSION;
export const JUPITER_MOON_DISTANCE_COMPRESSION = 0.32;
export const SATURN_MOON_DISTANCE_COMPRESSION = 0.4;

export const EARTH_DAY_SECONDS = 23 + 56 / 60;
export const MOON_ORBIT_PERIOD_DAYS = 27.321661;
export const EARTH_ORBIT_PERIOD_DAYS = 365.256363004;
export const MERCURY_ORBIT_PERIOD_DAYS = 87.9691;
export const VENUS_ORBIT_PERIOD_DAYS = 224.701;
export const MARS_ORBIT_PERIOD_DAYS = 686.98;
export const JUPITER_ORBIT_PERIOD_DAYS = 4332.59;
export const SATURN_ORBIT_PERIOD_DAYS = 10759.22;
export const URANUS_ORBIT_PERIOD_DAYS = 30688.5;
export const NEPTUNE_ORBIT_PERIOD_DAYS = 60182;
export const IO_ORBIT_PERIOD_DAYS = 1.769;
export const EUROPA_ORBIT_PERIOD_DAYS = 3.551;
export const GANYMEDE_ORBIT_PERIOD_DAYS = 7.155;
export const CALLISTO_ORBIT_PERIOD_DAYS = 16.689;
export const TITAN_ORBIT_PERIOD_DAYS = 15.945;
export const RHEA_ORBIT_PERIOD_DAYS = 4.518;
export const IAPETUS_ORBIT_PERIOD_DAYS = 79.3215;
export const DIONE_ORBIT_PERIOD_DAYS = 2.7369;
export const TETHYS_ORBIT_PERIOD_DAYS = 1.8878;
export const ENCELADUS_ORBIT_PERIOD_DAYS = 1.3702;
export const MIMAS_ORBIT_PERIOD_DAYS = 0.9424;
export const MERCURY_ROTATION_PERIOD_HOURS = 1407.6;
export const VENUS_ROTATION_PERIOD_HOURS = 5832.5;
export const VENUS_CLOUD_ROTATION_PERIOD_HOURS = 96;
export const MARS_ROTATION_PERIOD_HOURS = 24.6229;
export const JUPITER_ROTATION_PERIOD_HOURS = 9.925;
export const SATURN_ROTATION_PERIOD_HOURS = 10 + 33 / 60;
export const URANUS_ROTATION_PERIOD_HOURS = 17 + 14 / 60;
export const NEPTUNE_ROTATION_PERIOD_HOURS = 16.11;

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
export const SATURN_ROTATION_SPEED =
  (Math.PI * 2) / SATURN_ROTATION_PERIOD_HOURS;
export const URANUS_ROTATION_SPEED =
  (Math.PI * 2) / URANUS_ROTATION_PERIOD_HOURS;
export const NEPTUNE_ROTATION_SPEED =
  (Math.PI * 2) / NEPTUNE_ROTATION_PERIOD_HOURS;
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
export const SATURN_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * SATURN_ORBIT_PERIOD_DAYS);
export const URANUS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * URANUS_ORBIT_PERIOD_DAYS);
export const NEPTUNE_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * NEPTUNE_ORBIT_PERIOD_DAYS);
export const IO_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * IO_ORBIT_PERIOD_DAYS);
export const EUROPA_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * EUROPA_ORBIT_PERIOD_DAYS);
export const GANYMEDE_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * GANYMEDE_ORBIT_PERIOD_DAYS);
export const CALLISTO_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * CALLISTO_ORBIT_PERIOD_DAYS);
export const TITAN_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * TITAN_ORBIT_PERIOD_DAYS);
export const RHEA_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * RHEA_ORBIT_PERIOD_DAYS);
export const IAPETUS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * IAPETUS_ORBIT_PERIOD_DAYS);
export const DIONE_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * DIONE_ORBIT_PERIOD_DAYS);
export const TETHYS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * TETHYS_ORBIT_PERIOD_DAYS);
export const ENCELADUS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * ENCELADUS_ORBIT_PERIOD_DAYS);
export const MIMAS_ORBIT_SPEED =
  (Math.PI * 2) / (EARTH_DAY_SECONDS * MIMAS_ORBIT_PERIOD_DAYS);

export const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.44);
export const MERCURY_AXIAL_TILT = THREE.MathUtils.degToRad(0.03);
export const VENUS_AXIAL_TILT = THREE.MathUtils.degToRad(177.36);
export const MARS_AXIAL_TILT = THREE.MathUtils.degToRad(25.19);
export const JUPITER_AXIAL_TILT = THREE.MathUtils.degToRad(3.13);
export const SATURN_AXIAL_TILT = THREE.MathUtils.degToRad(26.73);
export const URANUS_AXIAL_TILT = THREE.MathUtils.degToRad(97.77);
export const NEPTUNE_AXIAL_TILT = THREE.MathUtils.degToRad(28.32);
export const MOON_ORBIT_INCLINATION = THREE.MathUtils.degToRad(5.145);
export const MERCURY_ORBIT_INCLINATION = THREE.MathUtils.degToRad(7.0);
export const VENUS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(3.39);
export const MARS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.85);
export const JUPITER_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.304);
export const SATURN_ORBIT_INCLINATION = THREE.MathUtils.degToRad(2.485);
export const URANUS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.773);
export const NEPTUNE_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.77);
export const IO_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.04);
export const EUROPA_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.47);
export const GANYMEDE_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.2);
export const CALLISTO_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.19);
export const TITAN_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.34854);
export const RHEA_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.345);
export const IAPETUS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(15.47);
export const DIONE_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.028);
export const TETHYS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.091);
export const ENCELADUS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(0.009);
export const MIMAS_ORBIT_INCLINATION = THREE.MathUtils.degToRad(1.574);

export const REAL_SUN_DISTANCE_RATIO = 23455;
export const REAL_SUN_RADIUS_RATIO = 109;
export const SUN_DISTANCE_COMPRESSION = 0.004375;
export const SUN_RADIUS_COMPRESSION = 0.12;

export const SUN_DISTANCE = REAL_SUN_DISTANCE_RATIO * SUN_DISTANCE_COMPRESSION;
export const SUN_POSITION = new THREE.Vector3(-8.5, 2.8, -SUN_DISTANCE);
export const SUN_RADIUS = REAL_SUN_RADIUS_RATIO * SUN_RADIUS_COMPRESSION;
export const SUN_DISTANCE_COMPRESS_FACTOR = Math.round(
  1 / SUN_DISTANCE_COMPRESSION,
);

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
export const SATURN_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(SATURN_ORBIT_DISTANCE_RATIO);
export const URANUS_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(URANUS_ORBIT_DISTANCE_RATIO);
export const NEPTUNE_ORBIT_LOCAL_OFFSET =
  EARTH_ORBIT_LOCAL_OFFSET.clone().multiplyScalar(NEPTUNE_ORBIT_DISTANCE_RATIO);
export const JUPITER_RADIUS = EARTH_RADIUS * JUPITER_RADIUS_RATIO;
export const SATURN_RADIUS = EARTH_RADIUS * SATURN_RADIUS_RATIO;
export const SOLAR_SYSTEM_OUTER_RADIUS =
  SUN_POSITION.length() +
  NEPTUNE_ORBIT_LOCAL_OFFSET.length() +
  EARTH_RADIUS * NEPTUNE_RADIUS_RATIO;
export const SOLAR_SYSTEM_CAMERA_FAR = SOLAR_SYSTEM_OUTER_RADIUS * 4.5;
export const IO_ORBIT_RADIUS =
  JUPITER_RADIUS * 5.89856 * JUPITER_MOON_DISTANCE_COMPRESSION;
export const EUROPA_ORBIT_RADIUS =
  JUPITER_RADIUS * 9.38679 * JUPITER_MOON_DISTANCE_COMPRESSION;
export const GANYMEDE_ORBIT_RADIUS =
  JUPITER_RADIUS * 14.97203 * JUPITER_MOON_DISTANCE_COMPRESSION;
export const CALLISTO_ORBIT_RADIUS =
  JUPITER_RADIUS * 26.33469 * JUPITER_MOON_DISTANCE_COMPRESSION;
export const TITAN_ORBIT_RADIUS =
  SATURN_RADIUS * 20.273 * SATURN_MOON_DISTANCE_COMPRESSION;
export const RHEA_ORBIT_RADIUS =
  SATURN_RADIUS * 8.74 * SATURN_MOON_DISTANCE_COMPRESSION;
export const IAPETUS_ORBIT_RADIUS =
  SATURN_RADIUS * 59.09 * SATURN_MOON_DISTANCE_COMPRESSION;
export const DIONE_ORBIT_RADIUS =
  SATURN_RADIUS * 6.26 * SATURN_MOON_DISTANCE_COMPRESSION;
export const TETHYS_ORBIT_RADIUS =
  SATURN_RADIUS * 4.89 * SATURN_MOON_DISTANCE_COMPRESSION;
export const ENCELADUS_ORBIT_RADIUS =
  SATURN_RADIUS * 3.95 * SATURN_MOON_DISTANCE_COMPRESSION;
export const MIMAS_ORBIT_RADIUS =
  SATURN_RADIUS * 3.08 * SATURN_MOON_DISTANCE_COMPRESSION;

export const TEXTURES = {
  earthDay: "/textures/planets/earth_day.jpg",
  earthNormal: "/textures/planets/earth_normal.jpg",
  earthSpecular: "/textures/planets/earth_specular.jpg",
  earthNight: "/textures/planets/earth_night.png",
  mercury: "/textures/planets/mercury.jpg",
  venus: "/textures/planets/venus.jpg",
  venusClouds: "/textures/planets/venus_clouds.jpg",
  mars: "/textures/planets/mars.jpg",
  jupiter: "/textures/planets/jupiter.jpg",
  saturn: "/textures/planets/saturn.jpg",
  uranus: "/textures/planets/uranus.jpg",
  neptune: "/textures/planets/neptune.jpg",
  moon: "/textures/moons/moon.jpg",
  io: "/textures/moons/io.jpg",
  europa: "/textures/moons/europa.jpg",
  ganymede: "/textures/moons/ganymede.jpg",
  callisto: "/textures/moons/callisto.jpg",
  titan: "/textures/moons/titan.jpg",
  rhea: "/textures/moons/rhea.jpg",
  iapetus: "/textures/moons/iapetus.jpg",
  dione: "/textures/moons/dione.jpg",
  tethys: "/textures/moons/tethys.jpg",
  enceladus: "/textures/moons/enceladus.jpg",
  mimas: "/textures/moons/mimas.jpg",
  saturnRing: "/textures/rings/saturn_ring_alpha.png",
  sun: "/textures/planets/sun.jpg",
} as const;
