import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { advanceResident, createResident, type WeatherState } from '../../simulation/characters/resident-agent';
import { clampDelta, createSeededRandom } from '../../simulation/core/random';
import { dampResidentCoordinate } from '../characters/motion';
import { getMovementVector, type MovementVector } from '../../gameplay/player/movement';
import { getFacadeUvRepeat } from '../environment/facade-tiling';

type RenderDiagnosticsSnapshot = {
  frames: number;
  lastDeltaMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  programs: number;
};

declare global {
  interface Window {
    __livingAtlasRenderStats?: RenderDiagnosticsSnapshot;
    __livingAtlasFrameSamples?: Float32Array;
  }
}

type Interaction = { type: 'resident' | 'cafe' | 'vehicle'; id: string };
type WorldSceneProps = {
  weather: WeatherState;
  hour: number;
  vehicleMode: boolean;
  interiorOpen: boolean;
  onInteract: (interaction: Interaction) => void;
  onPosition: (position: [number, number]) => void;
};

const residents = [
  { id: 'mara', name: 'Mara', seed: 17, position: [-3.2, 1.2] as [number, number], color: '#c77e58' },
  { id: 'eli', name: 'Eli', seed: 8, position: [3.8, -1.5] as [number, number], color: '#5f8190' },
  { id: 'jonas', name: 'Jonas', seed: 33, position: [0.5, -5.5] as [number, number], color: '#8b9272' },
  { id: 'lina', name: 'Lina', seed: 54, position: [-7, -3] as [number, number], color: '#ad7890' },
];

function Building({ x, z, width, depth, height, color, accent = '#c28e67', floors = 3 }: {
  x: number; z: number; width: number; depth: number; height: number; color: string; accent?: string; floors?: number;
}) {
  const [facadeColor, facadeNormal, facadeRoughness] = useLoader(THREE.TextureLoader, [
    '/assets/materials/plaster/plastered_wall_diff_1k.jpg',
    '/assets/materials/plaster/plastered_wall_nor_gl_1k.jpg',
    '/assets/materials/plaster/plastered_wall_rough_1k.jpg',
  ]) as [THREE.Texture, THREE.Texture, THREE.Texture];

  const facadeGeometry = useMemo(() => {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const repeat = getFacadeUvRepeat(width, height, 2);
    const uv = geometry.attributes.uv;
    for (let index = 0; index < uv.count; index += 1) {
      uv.setXY(index, uv.getX(index) * repeat.u, uv.getY(index) * repeat.v);
    }
    uv.needsUpdate = true;
    return geometry;
  }, [width, height, depth]);

  useEffect(() => {
    for (const texture of [facadeColor, facadeNormal, facadeRoughness]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 2;
      texture.needsUpdate = true;
    }
    facadeColor.colorSpace = THREE.SRGBColorSpace;
  }, [facadeColor, facadeNormal, facadeRoughness]);

  const windows = useMemo(() => Array.from({ length: floors * 3 }, (_, i) => ({
    x: -width * 0.34 + (i % 3) * width * 0.34,
    y: 1.25 + Math.floor(i / 3) * (height / floors),
  })), [floors, width, height]);
  const paneRef = useRef<THREE.InstancedMesh>(null);
  const frameRef = useRef<THREE.InstancedMesh>(null);
  const windowGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const paneMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#30474c',
    metalness: 0.24,
    roughness: 0.2,
  }), []);
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: accent,
    roughness: 0.82,
  }), [accent]);

  useEffect(() => {
    const dummy = new THREE.Object3D();
    windows.forEach((window, index) => {
      const paneWidth = width * 0.16;
      dummy.position.set(window.x, window.y, depth / 2 + 0.012);
      dummy.scale.set(paneWidth, 0.72, 0.055);
      dummy.updateMatrix();
      paneRef.current?.setMatrixAt(index, dummy.matrix);

      const frameParts = [
        { x: window.x - paneWidth / 2 - 0.035, y: window.y, sx: 0.07, sy: 0.79 },
        { x: window.x + paneWidth / 2 + 0.035, y: window.y, sx: 0.07, sy: 0.79 },
        { x: window.x, y: window.y - 0.395, sx: paneWidth + 0.14, sy: 0.07 },
        { x: window.x, y: window.y + 0.395, sx: paneWidth + 0.14, sy: 0.07 },
      ];
      frameParts.forEach((part, frameIndex) => {
        dummy.position.set(part.x, part.y, depth / 2 + 0.045);
        dummy.scale.set(part.sx, part.sy, 0.09);
        dummy.updateMatrix();
        frameRef.current?.setMatrixAt(index * 4 + frameIndex, dummy.matrix);
      });
    });
    if (paneRef.current) paneRef.current.instanceMatrix.needsUpdate = true;
    if (frameRef.current) frameRef.current.instanceMatrix.needsUpdate = true;
  }, [windows, width, depth]);

  return (
    <group position={[x, 0, z]}>
      <mesh geometry={facadeGeometry} position={[0, height / 2, 0]} castShadow={false} receiveShadow>
        <meshStandardMaterial
          map={facadeColor}
          normalMap={facadeNormal}
          roughnessMap={facadeRoughness}
          color={color}
          roughness={0.9}
        />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow={false}>
        <boxGeometry args={[width + 0.22, 0.4, depth + 0.22]} />
        <meshStandardMaterial color="#8e897e" roughness={0.94} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (width / 2 - 0.13), height / 2, depth / 2 + 0.09]} castShadow={false}>
          <boxGeometry args={[0.18, height, 0.18]} />
          <meshStandardMaterial color={accent} roughness={0.78} />
        </mesh>
      ))}
      <mesh position={[0, height + 0.13, 0]} castShadow={false}>
        <boxGeometry args={[width + 0.3, 0.24, depth + 0.3]} />
        <meshStandardMaterial color={accent} roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.42, depth / 2 + 0.08]}>
        <boxGeometry args={[width * 0.88, 0.84, 0.12]} />
        <meshStandardMaterial color="#d5c4a7" roughness={0.9} />
      </mesh>
      <instancedMesh ref={paneRef} args={[windowGeometry, paneMaterial, windows.length]} />
      <instancedMesh ref={frameRef} args={[windowGeometry, frameMaterial, windows.length * 4]} />
      {floors > 1 && (
        <>
          <mesh position={[0, height * 0.62, depth / 2 + 0.38]}>
            <boxGeometry args={[width * 0.54, 0.12, 0.68]} />
            <meshStandardMaterial color="#827766" roughness={0.82} />
          </mesh>
          <mesh position={[0, height * 0.62 + 0.36, depth / 2 + 0.68]}>
            <boxGeometry args={[width * 0.54, 0.07, 0.07]} />
            <meshStandardMaterial color="#354143" metalness={0.55} roughness={0.42} />
          </mesh>
        </>
      )}
      <mesh position={[0, 1.35, depth / 2 + 0.12]}>
        <boxGeometry args={[width * 0.46, 0.9, 0.1]} />
        <meshStandardMaterial color="#273d40" roughness={0.4} />
      </mesh>
      <mesh position={[0, 2.05, depth / 2 + 0.18]}>
        <boxGeometry args={[width * 0.56, 0.12, 0.22]} />
        <meshStandardMaterial color={accent} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 2.1, 7]} />
        <meshStandardMaterial color="#6f5944" roughness={1} />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow={false}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshStandardMaterial color="#647a62" roughness={1} />
      </mesh>
      <mesh position={[0.48, 2.05, 0.12]}>
        <icosahedronGeometry args={[0.66, 1]} />
        <meshStandardMaterial color="#829173" roughness={1} />
      </mesh>
    </group>
  );
}

function Lamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.1, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 4.2, 6]} />
        <meshStandardMaterial color="#293536" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[0.36, 4.05, 0]}>
        <boxGeometry args={[0.82, 0.09, 0.13]} />
        <meshStandardMaterial color="#2c3838" metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh position={[0.69, 3.98, 0]}>
        <sphereGeometry args={[0.16, 8, 6]} />
        <meshStandardMaterial color="#f7d9a0" emissive="#e9b76d" emissiveIntensity={0.5} roughness={0.25} />
      </mesh>
    </group>
  );
}

function Bench({ x, z, rotation = 0 }: { x: number; z: number; rotation?: number }) {
  return (
    <group position={[x, 0, z]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[1.65, 0.13, 0.48]} />
        <meshStandardMaterial color="#80644d" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.93, -0.19]}>
        <boxGeometry args={[1.65, 0.62, 0.12]} />
        <meshStandardMaterial color="#80644d" roughness={0.8} />
      </mesh>
      {[-0.58, 0.58].map((xPos) => (
        <mesh key={xPos} position={[xPos, 0.27, 0]}>
          <boxGeometry args={[0.12, 0.54, 0.12]} />
          <meshStandardMaterial color="#394342" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function Car({ position = [7, 0, 8] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.62, 0]} castShadow={false}>
        <boxGeometry args={[2.3, 0.72, 4.2]} />
        <meshStandardMaterial color="#d2d5ce" metalness={0.45} roughness={0.28} />
      </mesh>
      <mesh position={[0, 1.18, -0.18]}>
        <boxGeometry args={[1.82, 0.78, 2.05]} />
        <meshStandardMaterial color="#435a60" metalness={0.32} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.32, 2.13]}>
        <boxGeometry args={[1.55, 0.18, 0.08]} />
        <meshStandardMaterial color="#9d4d3c" emissive="#5b201a" emissiveIntensity={0.18} />
      </mesh>
      {[-1, 1].flatMap((side) => [-1.3, 1.3].map((axle) => (
        <mesh key={side + ':' + axle} position={[side * 1.13, 0.4, axle]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.42, 0.42, 0.22, 14]} />
          <meshStandardMaterial color="#202728" roughness={0.95} />
        </mesh>
      )))}
    </group>
  );
}

type MovementRef = { current: boolean };

function Humanoid({ color, movementRef }: { color: string; movementRef?: MovementRef }) {
  const body = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const moving = movementRef?.current ?? false;
    const phase = state.clock.elapsedTime * 7.5;
    const stride = moving ? Math.sin(phase) * 0.42 : 0;
    if (arms.current) {
      arms.current.rotation.x = THREE.MathUtils.damp(arms.current.rotation.x, -stride * 0.7, 16, delta);
    }
    if (leftLeg.current) {
      leftLeg.current.rotation.x = THREE.MathUtils.damp(leftLeg.current.rotation.x, stride, 16, delta);
    }
    if (rightLeg.current) {
      rightLeg.current.rotation.x = THREE.MathUtils.damp(rightLeg.current.rotation.x, -stride, 16, delta);
    }
    if (body.current) {
      const bob = moving ? Math.abs(Math.sin(phase * 2)) * 0.025 : 0;
      body.current.position.y = THREE.MathUtils.damp(body.current.position.y, bob, 12, delta);
    }
  });

  return (
    <group>
      <group ref={body}>
        <mesh position={[0, 1.03, 0]}>
          <capsuleGeometry args={[0.28, 0.62, 4, 7]} />
          <meshStandardMaterial color={color} roughness={0.82} />
        </mesh>
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial color="#d4aa88" roughness={0.86} />
        </mesh>
      </group>
      <group ref={arms} position={[0, 1.27, 0]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.35, -0.04, 0]} rotation={[0, 0, side * -0.13]}>
            <capsuleGeometry args={[0.09, 0.48, 3, 6]} />
            <meshStandardMaterial color={color} roughness={0.86} />
          </mesh>
        ))}
      </group>
      <group ref={leftLeg} position={[-0.13, 0.68, 0]}>
        <mesh position={[0, -0.29, 0]}>
          <capsuleGeometry args={[0.105, 0.55, 3, 6]} />
          <meshStandardMaterial color="#39464a" roughness={0.92} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.13, 0.68, 0]}>
        <mesh position={[0, -0.29, 0]}>
          <capsuleGeometry args={[0.105, 0.55, 3, 6]} />
          <meshStandardMaterial color="#39464a" roughness={0.92} />
        </mesh>
      </group>
    </group>
  );
}

function Resident({ id, name, seed, color, start, weather, hour }: {
  id: string; name: string; seed: number; color: string; start: [number, number]; weather: WeatherState; hour: number;
}) {
  const group = useRef<THREE.Group>(null);
  const agent = useRef(createResident(id, name, seed));
  const elapsed = useRef(0);
  const moving = useRef(false);

  useFrame((_, delta) => {
    if (!group.current) return;

    elapsed.current += clampDelta(delta, 0.1);
    while (elapsed.current >= 0.2) {
      const previous = agent.current;
      const next = advanceResident(previous, 0.2, weather, hour);
      moving.current = Math.hypot(next.x - previous.x, next.z - previous.z) > 0.0001;
      agent.current = next;
      elapsed.current -= 0.2;
    }

    const targetX = start[0] + agent.current.x * 0.18;
    const targetZ = start[1] + agent.current.z * 0.18;
    group.current.position.x = dampResidentCoordinate(group.current.position.x, targetX, delta);
    group.current.position.z = dampResidentCoordinate(group.current.position.z, targetZ, delta);

    if (moving.current) {
      const directionX = agent.current.targetX - agent.current.x;
      const directionZ = agent.current.targetZ - agent.current.z;
      if (Math.hypot(directionX, directionZ) > 0.01) {
        group.current.rotation.y = Math.atan2(directionX, directionZ);
      }
    }
  });

  return (
    <group ref={group} position={[start[0], 0, start[1]]}>
      <Humanoid color={color} movementRef={moving} />
    </group>
  );
}

function Player({ vehicleMode, interiorOpen, onInteract, onPosition }: {
  vehicleMode: boolean; interiorOpen: boolean; onInteract: (interaction: Interaction) => void; onPosition: (position: [number, number]) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const previousInterior = useRef(false);
  const keys = useRef<Record<string, boolean>>({});
  const direction = useRef<MovementVector>({ x: 0, z: 0 });
  const walking = useRef(false);
  const lastReport = useRef(0);
  const cameraTarget = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const onInteractRef = useRef(onInteract);
  onInteractRef.current = onInteract;

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      keys.current[event.code] = true;
      if (event.code === 'KeyE' && !event.repeat && group.current) {
        if (vehicleMode) {
          onInteractRef.current({ type: 'vehicle', id: 'coastal-sedan' });
          return;
        }
        if (interiorOpen) {
          onInteractRef.current({ type: 'cafe', id: 'exit' });
          return;
        }
        const p = group.current.position;
        const options: Array<{ type: Interaction['type']; id: string; x: number; z: number }> = [
          { type: 'resident', id: 'mara', x: -3.2, z: 1.2 },
          { type: 'resident', id: 'eli', x: 3.8, z: -1.5 },
          { type: 'resident', id: 'jonas', x: 0.5, z: -5.5 },
          { type: 'resident', id: 'lina', x: -7, z: -3 },
          { type: 'cafe', id: 'seabreeze-cafe', x: -7.5, z: 0.5 },
          { type: 'vehicle', id: 'coastal-sedan', x: 7, z: 8 },
        ];
        const nearest = options
          .map((item) => ({ ...item, distance: Math.hypot(item.x - p.x, item.z - p.z) }))
          .sort((a, b) => a.distance - b.distance)[0];
        if (nearest && nearest.distance < 3.1) onInteractRef.current({ type: nearest.type, id: nearest.id });
      }
    };
    const up = (event: KeyboardEvent) => { keys.current[event.code] = false; };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [interiorOpen, vehicleMode]);

  useEffect(() => {
    if (!group.current) return;
    if (interiorOpen) group.current.position.set(0, 0, 2.5);
    else if (previousInterior.current) group.current.position.set(-7.5, 0, 2.8);
    previousInterior.current = interiorOpen;
  }, [interiorOpen]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const dt = clampDelta(delta, 0.1);
    const movement = getMovementVector(keys.current, direction.current);
    walking.current = movement.x !== 0 || movement.z !== 0;
    if (walking.current) {
      const speed = vehicleMode ? 10 : keys.current.ShiftLeft || keys.current.ShiftRight ? 5.2 : 3.1;
      const nextX = THREE.MathUtils.clamp(group.current.position.x + movement.x * speed * dt, -19, 19);
      const nextZ = THREE.MathUtils.clamp(group.current.position.z + movement.z * speed * dt, -19, 17);
      if (!(nextX < -11 && nextZ < -13)) group.current.position.x = nextX;
      group.current.position.z = nextZ;
      group.current.rotation.y = Math.atan2(movement.x, movement.z);
    }
    const p = group.current.position;
    const desired = cameraTarget.current.set(p.x, p.y + (vehicleMode ? 8.2 : 7.6), p.z + (vehicleMode ? 22 : 20));
    camera.position.lerp(desired, 1 - Math.exp(-3.4 * dt));
    camera.lookAt(p.x, p.y + 1.0, p.z - 10.5);
    lastReport.current += dt;
    if (lastReport.current > 0.35) {
      onPosition([p.x, p.z]);
      lastReport.current = 0;
    }
  });

  return (
    <group ref={group} position={[0, 0, 7]}>
      {vehicleMode ? <Car position={[0, 0, 0]} /> : <Humanoid color="#d8d3c3" movementRef={walking} />}
    </group>
  );
}

function Rain() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(420 * 3);
    const random = createSeededRandom(20261117);
    for (let i = 0; i < 420; i += 1) {
      values[i * 3] = (random() - 0.5) * 46;
      values[i * 3 + 1] = random() * 18 + 2;
      values[i * 3 + 2] = (random() - 0.5) * 46;
    }
    return values;
  }, []);
  useFrame((_, delta) => {
    const attribute = points.current?.geometry.attributes.position as THREE.BufferAttribute | undefined;
    if (!attribute) return;
    const array = attribute.array as Float32Array;
    for (let i = 1; i < array.length; i += 3) {
      array[i] -= delta * 15;
      if (array[i] < 0) array[i] = 18;
    }
    attribute.needsUpdate = true;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#d6e1df" size={0.045} transparent opacity={0.48} sizeAttenuation />
    </points>
  );
}

function Environment({ weather, hour }: { weather: WeatherState; hour: number }) {
  const sun = hour >= 6 && hour < 18;
  const light = sun ? 1.25 : 0.42;
  const hdri = useLoader(RGBELoader, '/assets/hdri/sunset_jhbcentral_1k.hdr');
  const { scene } = useThree();
  useEffect(() => {
    hdri.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = hdri;
    scene.background = hdri;
    scene.environmentIntensity = sun ? 0.32 : 0.22;
    scene.backgroundIntensity = sun ? 0.58 : 0.38;
    return () => {
      scene.environment = null;
      scene.background = null;
    };
  }, [hdri, scene, sun]);
  return (
    <>
      <fog attach="fog" args={[sun ? '#b6c6c2' : '#26373b', 42, 125]} />
      <hemisphereLight args={[sun ? '#e4ece8' : '#a1b0c6', '#716959', sun ? 1.15 : 0.58]} />
      <directionalLight position={[-12, 22, 8]} intensity={light} color={sun ? '#ffe1b8' : '#a7c5e6'} />
      <ambientLight intensity={sun ? 0.38 : 0.2} />
      {weather === 'rain' || weather === 'storm' ? <Rain /> : null}
    </>
  );
}

function RoadSurface({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  const [colorMap, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
    '/assets/materials/asphalt/asphalt_02_diff_1k.jpg',
    '/assets/materials/asphalt/asphalt_02_nor_gl_1k.jpg',
    '/assets/materials/asphalt/asphalt_02_rough_1k.jpg',
  ]) as [THREE.Texture, THREE.Texture, THREE.Texture];
  useEffect(() => {
    for (const texture of [colorMap, normalMap, roughnessMap]) {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(Math.max(2, size[0] / 5), Math.max(1, size[1] / 4));
      texture.anisotropy = 2;
      texture.needsUpdate = true;
    }
    colorMap.colorSpace = THREE.SRGBColorSpace;
  }, [colorMap, normalMap, roughnessMap, size]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial map={colorMap} normalMap={normalMap} roughnessMap={roughnessMap} roughness={0.92} />
    </mesh>
  );
}

function WorldGeometry() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]} receiveShadow>
        <planeGeometry args={[130, 130]} />
        <meshStandardMaterial color="#b9b5a6" roughness={1} />
      </mesh>
      <RoadSurface position={[0, -0.09, 11]} size={[90, 8]} />
      <RoadSurface position={[12, -0.08, -1]} size={[7, 62]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.07, -23]}>
        <planeGeometry args={[120, 28]} />
        <meshStandardMaterial color="#d1c09d" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, -43]}>
        <planeGeometry args={[150, 42]} />
        <meshStandardMaterial color="#426f79" metalness={0.2} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.08, -29]}>
        <boxGeometry args={[120, 0.45, 1.4]} />
        <meshStandardMaterial color="#9c9b8b" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.02, -14]}>
        <boxGeometry args={[42, 0.08, 28]} />
        <meshStandardMaterial color="#c8bca5" roughness={1} />
      </mesh>
      <mesh position={[0, 0.03, -14]}>
        <cylinderGeometry args={[2.4, 2.4, 0.12, 24]} />
        <meshStandardMaterial color="#8e9b8a" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.2, -14]}>
        <cylinderGeometry args={[1.2, 1.4, 0.35, 18]} />
        <meshStandardMaterial color="#b3c0b5" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.42, -14]}>
        <cylinderGeometry args={[0.82, 0.82, 0.12, 18]} />
        <meshStandardMaterial color="#8fb4b5" roughness={0.24} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.58, -14]}>
        <cylinderGeometry args={[0.08, 0.08, 0.55, 8]} />
        <meshStandardMaterial color="#c5d3d0" metalness={0.2} roughness={0.25} />
      </mesh>
      {[-17, -11, -5, 1, 7, 13, 19].map((x) => (
        <mesh key={x} position={[x, 0.015, 11]}>
          <boxGeometry args={[0.16, 0.025, 2.2]} />
          <meshStandardMaterial color="#e5ddc7" roughness={0.9} />
        </mesh>
      ))}
      <Building x={-16} z={-1} width={8} depth={7} height={8.5} color="#d9c9ad" accent="#b47b59" floors={3} />
      <Building x={-7.5} z={-0.2} width={7.5} depth={8} height={6.8} color="#e1d4bf" accent="#9b7058" floors={2} />
      <Building x={9.5} z={-1.2} width={7.2} depth={7.4} height={9.8} color="#d4c6ae" accent="#a4775f" floors={3} />
      <Building x={20} z={-1} width={9} depth={8} height={12} color="#d8d2c2" accent="#8e9a91" floors={4} />
      <Building x={-18} z={17} width={10} depth={8} height={9} color="#c8b49a" accent="#8c6756" floors={3} />
      <Building x={-6} z={19} width={8} depth={8} height={7.4} color="#d7c6a9" accent="#a56d54" floors={3} />
      <Building x={18} z={18} width={10} depth={8} height={10.5} color="#d7cdb8" accent="#9b8a70" floors={3} />
      <Building x={-28} z={-7} width={8} depth={8} height={10} color="#d9d0bd" accent="#9d785e" floors={3} />
      {[-18, -11, 11, 19].map((x) => <Tree key={x} x={x} z={-8} scale={0.9} />)}
      {[-18, -11, 11, 19].map((x) => <Tree key={'b' + x} x={x} z={7} scale={0.85} />)}
      {[-10, -4, 4, 10].map((x) => <Lamp key={x} x={x} z={4} />)}
      <Bench x={-4} z={-11} rotation={Math.PI / 2} />
      <Bench x={5} z={-11} rotation={-Math.PI / 2} />
      <Car />
      <mesh position={[-7.5, 0.08, 0.5]}>
        <boxGeometry args={[5.6, 0.16, 1.2]} />
        <meshStandardMaterial color="#c28e67" roughness={0.85} />
      </mesh>
      <mesh position={[-7.5, 1.3, 0.5]}>
        <boxGeometry args={[5.1, 2.45, 0.16]} />
        <meshStandardMaterial color="#e8d9c1" roughness={0.95} />
      </mesh>
      <mesh position={[-7.5, 1.1, 0.42]}>
        <boxGeometry args={[3.5, 1.5, 0.05]} />
        <meshStandardMaterial color="#354f53" roughness={0.32} />
      </mesh>
    </>
  );
}

function CafeInterior() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
        <planeGeometry args={[18, 16]} />
        <meshStandardMaterial color="#9a8873" roughness={0.88} />
      </mesh>
      <mesh position={[0, 2.2, -7]}>
        <boxGeometry args={[18, 4.5, 0.3]} />
        <meshStandardMaterial color="#d7c8ae" roughness={0.9} />
      </mesh>
      <mesh position={[-8.8, 2.2, 0]}>
        <boxGeometry args={[0.3, 4.5, 14]} />
        <meshStandardMaterial color="#d7c8ae" roughness={0.9} />
      </mesh>
      <mesh position={[8.8, 2.2, 0]}>
        <boxGeometry args={[0.3, 4.5, 14]} />
        <meshStandardMaterial color="#d7c8ae" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.2, 7]}>
        <boxGeometry args={[18, 4.5, 0.3]} />
        <meshStandardMaterial color="#d7c8ae" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.45, 0]}>
        <boxGeometry args={[18, 0.2, 14]} />
        <meshStandardMaterial color="#776451" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.55, -6.78]}>
        <boxGeometry args={[8.5, 2.1, 0.08]} />
        <meshStandardMaterial color="#45636a" roughness={0.24} metalness={0.12} />
      </mesh>
      <mesh position={[0, 1.15, -6.45]}>
        <boxGeometry args={[5.4, 0.18, 1.3]} />
        <meshStandardMaterial color="#86664c" roughness={0.8} />
      </mesh>
      {[-4.8, 0, 4.8].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.85, -1]}>
            <cylinderGeometry args={[0.72, 0.72, 0.14, 16]} />
            <meshStandardMaterial color="#87694f" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.42, -1]}>
            <cylinderGeometry args={[0.09, 0.11, 0.8, 8]} />
            <meshStandardMaterial color="#4c4840" metalness={0.25} roughness={0.7} />
          </mesh>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 1.05, 0.55, -1]}>
              <boxGeometry args={[0.46, 0.92, 0.46]} />
              <meshStandardMaterial color="#a97c5e" roughness={0.86} />
            </mesh>
          ))}
        </group>
      ))}
      <pointLight position={[0, 3.8, 0]} intensity={18} distance={18} color="#ffd9a5" />
      <pointLight position={[-6, 3.3, -5]} intensity={8} distance={12} color="#f5c98d" />
    </group>
  );
}

function RenderDiagnostics() {
  const { gl } = useThree();
  const stats = useRef<RenderDiagnosticsSnapshot>({
    frames: 0,
    lastDeltaMs: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    programs: 0,
  });
  const samples = useRef(new Float32Array(120));
  const sampleIndex = useRef(0);

  useFrame((_, delta) => {
    const snapshot = stats.current;
    samples.current[sampleIndex.current] = delta * 1000;
    sampleIndex.current = (sampleIndex.current + 1) % samples.current.length;

    snapshot.frames += 1;
    snapshot.lastDeltaMs = delta * 1000;
    snapshot.drawCalls = gl.info.render.calls;
    snapshot.triangles = gl.info.render.triangles;
    snapshot.geometries = gl.info.memory.geometries;
    snapshot.textures = gl.info.memory.textures;
    snapshot.programs = gl.info.programs?.length ?? 0;

    window.__livingAtlasRenderStats = snapshot;
    window.__livingAtlasFrameSamples = samples.current;
  });

  return null;
}

function SceneContent({ weather, hour, vehicleMode, interiorOpen, onInteract, onPosition }: WorldSceneProps) {
  return (
    <>
      <Environment weather={weather} hour={hour} />
      {interiorOpen ? <CafeInterior /> : <WorldGeometry />}
      {!interiorOpen && residents.map((resident) => (
        <Resident key={resident.id} id={resident.id} name={resident.name} seed={resident.seed} color={resident.color} start={resident.position} weather={weather} hour={hour} />
      ))}
      <Player vehicleMode={vehicleMode} interiorOpen={interiorOpen} onInteract={onInteract} onPosition={onPosition} />
    </>
  );
}

export default function WorldScene(props: WorldSceneProps) {
  return (
    <Canvas
      dpr={[0.65, 0.9]}
      camera={{ position: [0, 7.6, 27], fov: 48, near: 0.1, far: 160 }}
      gl={{ antialias: false, powerPreference: 'high-performance', alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      {import.meta.env.DEV ? <RenderDiagnostics /> : null}
      <SceneContent {...props} />
    </Canvas>
  );
}