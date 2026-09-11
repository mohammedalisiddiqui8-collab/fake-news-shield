"use client";
import { useRef, useMemo, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─── Floating Verification Ring ─── */
function VerificationRing({ mouse }: { mouse: React.RefObject<THREE.Vector2> }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const ringGeometry = useMemo(() => {
    return new THREE.TorusGeometry(1.8, 0.02, 16, 128);
  }, []);

  const glowMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2DD4A8"),
      emissive: new THREE.Color("#2DD4A8"),
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6,
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Mouse-driven rotation
    const targetRotX = (mouse.current?.y ?? 0) * 0.3;
    const targetRotY = (mouse.current?.x ?? 0) * 0.3;
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX + Math.sin(t * 0.3) * 0.1, 0.02);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY + t * 0.08, 0.02);

    // Ring pulse
    if (ringRef.current) {
      const scale = 1 + Math.sin(t * 1.5) * 0.02;
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main verification ring */}
      <mesh ref={ringRef} geometry={ringGeometry} material={glowMaterial} />

      {/* Inner ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.008, 16, 128]} />
        <meshStandardMaterial color="#1E2522" transparent opacity={0.4} roughness={0.5} />
      </mesh>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.2, 0.008, 16, 128]} />
        <meshStandardMaterial color="#1E2522" transparent opacity={0.3} roughness={0.5} />
      </mesh>

      {/* Center checkmark - vertical line */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 0.35, 0.04]} />
        <meshStandardMaterial color="#2DD4A8" emissive="#2DD4A8" emissiveIntensity={1.2} roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Checkmark - short diagonal */}
      <mesh position={[-0.12, -0.08, 0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.04, 0.2, 0.04]} />
        <meshStandardMaterial color="#2DD4A8" emissive="#2DD4A8" emissiveIntensity={1.2} roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Orbital dots */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        const r = 2.6;
        return (
          <Float key={i} speed={2 + i * 0.3} rotationIntensity={0} floatIntensity={0.3}>
            <mesh position={[Math.cos(angle) * r, Math.sin(angle) * r, 0]}>
              <sphereGeometry args={[0.025, 16, 16]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? "#2DD4A8" : "#C4985A"}
                emissive={i % 2 === 0 ? "#2DD4A8" : "#C4985A"}
                emissiveIntensity={0.5}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </Float>
        );
      })}
    </group>
  );
}

/* ─── Floating Data Lines ─── */
function DataLines({ mouse }: { mouse: React.RefObject<THREE.Vector2> }) {
  const groupRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const result: Array<{ start: THREE.Vector3; end: THREE.Vector3; color: string }> = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r1 = 3.2 + Math.random() * 0.5;
      const r2 = 4.0 + Math.random() * 1.0;
      const start = new THREE.Vector3(Math.cos(angle) * r1, Math.sin(angle) * r1, (Math.random() - 0.5) * 2);
      const end = new THREE.Vector3(Math.cos(angle) * r2, Math.sin(angle) * r2, (Math.random() - 0.5) * 3);
      result.push({ start, end, color: i % 3 === 0 ? "#2DD4A8" : i % 3 === 1 ? "#C4985A" : "#1E2522" });
    }
    return result;
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;
    const targetRotY = (mouse.current?.x ?? 0) * 0.05;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.01);
  });

  return (
    <group ref={groupRef}>
      {lines.map((line, i) => {
        const mid = new THREE.Vector3().lerpVectors(line.start, line.end, 0.5);
        const dir = new THREE.Vector3().subVectors(line.end, line.start);
        const len = dir.length();
        dir.normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), dir);
        return (
          <mesh key={i} position={[mid.x, mid.y, mid.z]} quaternion={quaternion}>
            <cylinderGeometry args={[0.003, 0.003, len, 4]} />
            <meshBasicMaterial color={line.color} transparent opacity={0.15} />
          </mesh>
        );
      })}

      {/* Floating particles at line endpoints */}
      {lines.slice(0, 6).map((line, i) => (
        <Float key={`p-${i}`} speed={1.5 + i * 0.2} floatIntensity={0.5}>
          <mesh position={[line.end.x, line.end.y, line.end.z]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color={line.color} emissive={line.color} emissiveIntensity={0.8} transparent opacity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ─── Scanning Plane ─── */
function ScanningPlane({ mouse }: { mouse: React.RefObject<THREE.Vector2> }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = Math.sin(t * 0.5) * 0.5;
    meshRef.current.rotation.x = Math.PI / 2 + (mouse.current?.y ?? 0) * 0.1;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.opacity = 0.03 + Math.sin(t * 2) * 0.01;
  });

  return (
    <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[6, 6]} />
      <meshStandardMaterial color="#2DD4A8" transparent opacity={0.03} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ─── Scene ─── */
function Scene({ mouse }: { mouse: React.RefObject<THREE.Vector2> }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#E8E4DC" />
      <pointLight position={[-5, -3, 3]} intensity={0.3} color="#2DD4A8" />
      <pointLight position={[0, 3, -5]} intensity={0.2} color="#C4985A" />

      <VerificationRing mouse={mouse} />
      <DataLines mouse={mouse} />
      <ScanningPlane mouse={mouse} />

      <Environment preset="night" />
    </>
  );
}

/* ─── Export ─── */
export default function HeroScene() {
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      onPointerMove={handlePointerMove}
      style={{ touchAction: "none" }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
      >
        <Scene mouse={mouseRef} />
      </Canvas>
    </div>
  );
}
