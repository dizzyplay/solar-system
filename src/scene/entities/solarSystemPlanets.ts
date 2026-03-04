import * as THREE from "three";
import {
  EARTH_AXIAL_TILT,
  EARTH_ORBIT_LOCAL_OFFSET,
  EARTH_ORBIT_SPEED,
  EARTH_RADIUS,
  EARTH_ROTATION_SPEED,
  JUPITER_AXIAL_TILT,
  JUPITER_ORBIT_INCLINATION,
  JUPITER_ORBIT_LOCAL_OFFSET,
  JUPITER_ORBIT_SPEED,
  JUPITER_RADIUS_RATIO,
  JUPITER_ROTATION_SPEED,
  MARS_AXIAL_TILT,
  MARS_ORBIT_INCLINATION,
  MARS_ORBIT_LOCAL_OFFSET,
  MARS_ORBIT_SPEED,
  MARS_RADIUS_RATIO,
  MARS_ROTATION_SPEED,
  MERCURY_AXIAL_TILT,
  MERCURY_ORBIT_INCLINATION,
  MERCURY_ORBIT_LOCAL_OFFSET,
  MERCURY_ORBIT_SPEED,
  MERCURY_RADIUS_RATIO,
  MERCURY_ROTATION_SPEED,
  MOON_ORBIT_INCLINATION,
  MOON_ORBIT_RADIUS,
  MOON_ORBIT_SPEED,
  MOON_RADIUS_RATIO,
  SUN_POSITION,
  VENUS_AXIAL_TILT,
  VENUS_CLOUD_ROTATION_SPEED,
  VENUS_ORBIT_INCLINATION,
  VENUS_ORBIT_LOCAL_OFFSET,
  VENUS_ORBIT_SPEED,
  VENUS_RADIUS_RATIO,
  VENUS_ROTATION_SPEED,
} from "../constants";
import type { PlanetConfig } from "./planet";
import type { PlanetNodeDefinition } from "./planetSystem";

type EarthTextureProps = {
  day: THREE.Texture;
  normal: THREE.Texture;
  specular: THREE.Texture;
};

export function getEarthPlanetConfig(textures: EarthTextureProps): PlanetConfig {
  return {
    axialTiltZ: EARTH_AXIAL_TILT,
    spinSpeed: EARTH_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: EARTH_ORBIT_LOCAL_OFFSET,
      speed: EARTH_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS,
      widthSegments: 160,
      heightSegments: 160,
      focusDistance: 1.5,
      material: {
        map: textures.day,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(0.72, 0.72),
        specularMap: textures.specular,
        specular: "#1d2f44",
        shininess: 8,
      },
      transform: {
        rotation: { x: 0.15 },
      },
    },
  };
}

export function getMoonPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    orbit: {
      initialOffset: new THREE.Vector3(MOON_ORBIT_RADIUS, 0, 0),
      inclinationX: MOON_ORBIT_INCLINATION,
      speed: MOON_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * MOON_RADIUS_RATIO,
      focusDistance: 0.8,
      material: {
        map: texture,
        bumpMap: texture,
        bumpScale: 0.028,
        shininess: 5,
      },
    },
  };
}

export function getMercuryPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    axialTiltZ: MERCURY_AXIAL_TILT,
    spinSpeed: MERCURY_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: MERCURY_ORBIT_LOCAL_OFFSET,
      inclinationX: MERCURY_ORBIT_INCLINATION,
      speed: MERCURY_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * MERCURY_RADIUS_RATIO,
      widthSegments: 120,
      heightSegments: 120,
      focusDistance: 1.0,
      material: {
        map: texture,
        specular: "#191919",
        shininess: 2,
      },
    },
  };
}

export function getVenusPlanetConfig(
  surfaceTexture: THREE.Texture,
  cloudTexture: THREE.Texture,
): PlanetConfig {
  return {
    axialTiltZ: VENUS_AXIAL_TILT,
    spinSpeed: VENUS_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: VENUS_ORBIT_LOCAL_OFFSET,
      inclinationX: VENUS_ORBIT_INCLINATION,
      speed: VENUS_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * VENUS_RADIUS_RATIO,
      widthSegments: 128,
      heightSegments: 128,
      focusDistance: 1.35,
      material: {
        map: surfaceTexture,
        specular: "#7d6140",
        shininess: 18,
      },
    },
    layers: [
      {
        radiusScale: 1.01,
        spinSpeed: VENUS_CLOUD_ROTATION_SPEED,
        material: {
          map: cloudTexture,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
          color: "#fff5dc",
          shininess: 24,
        },
      },
    ],
  };
}

export function getMarsPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    axialTiltZ: MARS_AXIAL_TILT,
    spinSpeed: MARS_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: MARS_ORBIT_LOCAL_OFFSET,
      inclinationX: MARS_ORBIT_INCLINATION,
      speed: MARS_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * MARS_RADIUS_RATIO,
      widthSegments: 128,
      heightSegments: 128,
      focusDistance: 1.1,
      material: {
        map: texture,
        specular: "#2f1f16",
        shininess: 5,
      },
    },
  };
}

export function getJupiterPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    axialTiltZ: JUPITER_AXIAL_TILT,
    spinSpeed: JUPITER_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: JUPITER_ORBIT_LOCAL_OFFSET,
      inclinationX: JUPITER_ORBIT_INCLINATION,
      speed: JUPITER_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * JUPITER_RADIUS_RATIO,
      widthSegments: 160,
      heightSegments: 160,
      focusDistance: 3.0,
      material: {
        map: texture,
        specular: "#4a3425",
        shininess: 8,
      },
    },
  };
}

type SolarSystemPlanetTextures = {
  earthDay: THREE.Texture;
  earthNormal: THREE.Texture;
  earthSpecular: THREE.Texture;
  moon: THREE.Texture;
  mercury: THREE.Texture;
  venus: THREE.Texture;
  venusClouds: THREE.Texture;
  mars: THREE.Texture;
  jupiter: THREE.Texture;
};

export function getSolarSystemPlanetDefinitions(
  textures: SolarSystemPlanetTextures,
): PlanetNodeDefinition[] {
  return [
    {
      id: "mercury",
      config: getMercuryPlanetConfig(textures.mercury),
      orbitLine: {
        color: 0xb0b0b0,
        dashSize: 0.22,
        gapSize: 0.14,
        opacity: 0.28,
      },
    },
    {
      id: "venus",
      config: getVenusPlanetConfig(textures.venus, textures.venusClouds),
      orbitLine: {
        color: 0xe0bb85,
        dashSize: 0.28,
        gapSize: 0.16,
        opacity: 0.28,
      },
    },
    {
      id: "earth",
      config: getEarthPlanetConfig({
        day: textures.earthDay,
        normal: textures.earthNormal,
        specular: textures.earthSpecular,
      }),
      orbitLine: {
        color: 0xffd791,
        dashSize: 0.35,
        gapSize: 0.2,
        opacity: 0.3,
        pointCount: 400,
      },
    },
    {
      id: "mars",
      config: getMarsPlanetConfig(textures.mars),
      orbitLine: {
        color: 0xd07851,
        dashSize: 0.34,
        gapSize: 0.2,
        opacity: 0.28,
      },
    },
    {
      id: "jupiter",
      config: getJupiterPlanetConfig(textures.jupiter),
      orbitLine: {
        color: 0xe0c6a0,
        dashSize: 0.42,
        gapSize: 0.24,
        opacity: 0.28,
      },
    },
    {
      id: "moon",
      parentId: "earth",
      config: getMoonPlanetConfig(textures.moon),
      orbitLine: {
        color: 0x8db5cf,
        dashSize: 0.12,
        gapSize: 0.08,
        opacity: 0.3,
      },
      lookAtId: "earth",
    },
  ];
}
