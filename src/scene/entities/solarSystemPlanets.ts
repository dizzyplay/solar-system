import * as THREE from "three";
import {
  EARTH_AXIAL_TILT,
  EARTH_ORBIT_LOCAL_OFFSET,
  EARTH_ORBIT_SPEED,
  EARTH_RADIUS,
  EARTH_ROTATION_SPEED,
  MOON_ORBIT_INCLINATION,
  MOON_ORBIT_RADIUS,
  MOON_ORBIT_SPEED,
  MOON_RADIUS_RATIO,
  SUN_POSITION,
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
      focusDistance: 3.3,
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
      focusDistance: 1.6,
      material: {
        map: texture,
        bumpMap: texture,
        bumpScale: 0.028,
        shininess: 5,
      },
    },
  };
}

type SolarSystemPlanetTextures = {
  earthDay: THREE.Texture;
  earthNormal: THREE.Texture;
  earthSpecular: THREE.Texture;
  moon: THREE.Texture;
};

export function getSolarSystemPlanetDefinitions(
  textures: SolarSystemPlanetTextures,
): PlanetNodeDefinition[] {
  return [
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
