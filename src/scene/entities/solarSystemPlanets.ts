import * as THREE from "three";
import {
  CALLISTO_ORBIT_INCLINATION,
  CALLISTO_ORBIT_RADIUS,
  CALLISTO_ORBIT_SPEED,
  CALLISTO_RADIUS_RATIO,
  EARTH_AXIAL_TILT,
  EARTH_ORBIT_LOCAL_OFFSET,
  EARTH_ORBIT_SPEED,
  EARTH_RADIUS,
  EARTH_ROTATION_SPEED,
  EUROPA_ORBIT_INCLINATION,
  EUROPA_ORBIT_RADIUS,
  EUROPA_ORBIT_SPEED,
  EUROPA_RADIUS_RATIO,
  GANYMEDE_ORBIT_INCLINATION,
  GANYMEDE_ORBIT_RADIUS,
  GANYMEDE_ORBIT_SPEED,
  GANYMEDE_RADIUS_RATIO,
  IO_ORBIT_INCLINATION,
  IO_ORBIT_RADIUS,
  IO_ORBIT_SPEED,
  IO_RADIUS_RATIO,
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
  SATURN_AXIAL_TILT,
  SATURN_ORBIT_INCLINATION,
  SATURN_ORBIT_LOCAL_OFFSET,
  SATURN_ORBIT_SPEED,
  SATURN_RADIUS_RATIO,
  SATURN_ROTATION_SPEED,
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

export function getSaturnPlanetConfig(
  surfaceTexture: THREE.Texture,
  ringTexture: THREE.Texture,
): PlanetConfig {
  return {
    axialTiltZ: SATURN_AXIAL_TILT,
    spinSpeed: SATURN_ROTATION_SPEED,
    orbit: {
      centerPosition: SUN_POSITION,
      initialOffset: SATURN_ORBIT_LOCAL_OFFSET,
      inclinationX: SATURN_ORBIT_INCLINATION,
      speed: SATURN_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * SATURN_RADIUS_RATIO,
      widthSegments: 150,
      heightSegments: 150,
      focusDistance: 3.2,
      material: {
        map: surfaceTexture,
        color: "#f1e1bf",
        specular: "#6b5842",
        shininess: 5,
      },
    },
    rings: [
      {
        innerRadiusScale: 1.38,
        outerRadiusScale: 2.62,
        tiltX: Math.PI / 2,
        material: {
          map: ringTexture,
          color: "#f0dfc5",
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
          side: THREE.DoubleSide,
          shininess: 1,
        },
      },
      {
        innerRadiusScale: 1.16,
        outerRadiusScale: 1.38,
        tiltX: Math.PI / 2,
        material: {
          map: ringTexture,
          color: "#c5ad87",
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
          side: THREE.DoubleSide,
          shininess: 1,
        },
      },
    ],
  };
}

export function getIoPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    orbit: {
      initialOffset: new THREE.Vector3(IO_ORBIT_RADIUS, 0, 0),
      inclinationX: IO_ORBIT_INCLINATION,
      speed: IO_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * IO_RADIUS_RATIO,
      widthSegments: 72,
      heightSegments: 72,
      focusDistance: 0.55,
      material: {
        map: texture,
        color: "#dfb668",
        specular: "#4b3522",
        shininess: 4,
      },
    },
  };
}

export function getEuropaPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    orbit: {
      initialOffset: new THREE.Vector3(EUROPA_ORBIT_RADIUS, 0, 0),
      inclinationX: EUROPA_ORBIT_INCLINATION,
      speed: EUROPA_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * EUROPA_RADIUS_RATIO,
      widthSegments: 72,
      heightSegments: 72,
      focusDistance: 0.5,
      material: {
        map: texture,
        color: "#c8baa0",
        specular: "#433a32",
        shininess: 3,
      },
    },
  };
}

export function getGanymedePlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    orbit: {
      initialOffset: new THREE.Vector3(GANYMEDE_ORBIT_RADIUS, 0, 0),
      inclinationX: GANYMEDE_ORBIT_INCLINATION,
      speed: GANYMEDE_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * GANYMEDE_RADIUS_RATIO,
      widthSegments: 72,
      heightSegments: 72,
      focusDistance: 0.65,
      material: {
        map: texture,
        color: "#9f8f79",
        specular: "#3a3027",
        shininess: 3,
      },
    },
  };
}

export function getCallistoPlanetConfig(texture: THREE.Texture): PlanetConfig {
  return {
    orbit: {
      initialOffset: new THREE.Vector3(CALLISTO_ORBIT_RADIUS, 0, 0),
      inclinationX: CALLISTO_ORBIT_INCLINATION,
      speed: CALLISTO_ORBIT_SPEED,
    },
    mesh: {
      radius: EARTH_RADIUS * CALLISTO_RADIUS_RATIO,
      widthSegments: 72,
      heightSegments: 72,
      focusDistance: 0.62,
      material: {
        map: texture,
        color: "#7f7465",
        specular: "#2f2923",
        shininess: 2,
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
  saturn: THREE.Texture;
  saturnRing: THREE.Texture;
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
      id: "saturn",
      config: getSaturnPlanetConfig(textures.saturn, textures.saturnRing),
      orbitLine: {
        color: 0xd8c69f,
        dashSize: 0.5,
        gapSize: 0.28,
        opacity: 0.24,
      },
    },
    {
      id: "io",
      parentId: "jupiter",
      config: getIoPlanetConfig(textures.moon),
      orbitLine: {
        color: 0xffc987,
        dashSize: 0.1,
        gapSize: 0.08,
        opacity: 0.3,
      },
      lookAtId: "jupiter",
    },
    {
      id: "europa",
      parentId: "jupiter",
      config: getEuropaPlanetConfig(textures.moon),
      orbitLine: {
        color: 0xd8d0be,
        dashSize: 0.11,
        gapSize: 0.085,
        opacity: 0.28,
      },
      lookAtId: "jupiter",
    },
    {
      id: "ganymede",
      parentId: "jupiter",
      config: getGanymedePlanetConfig(textures.moon),
      orbitLine: {
        color: 0xc2ad8a,
        dashSize: 0.12,
        gapSize: 0.09,
        opacity: 0.26,
      },
      lookAtId: "jupiter",
    },
    {
      id: "callisto",
      parentId: "jupiter",
      config: getCallistoPlanetConfig(textures.moon),
      orbitLine: {
        color: 0x92816d,
        dashSize: 0.13,
        gapSize: 0.095,
        opacity: 0.25,
      },
      lookAtId: "jupiter",
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
