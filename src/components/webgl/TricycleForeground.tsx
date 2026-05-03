import { useFrame } from "@react-three/fiber";
import type { MutableRefObject } from "react";
import { useRef } from "react";
import * as THREE from "three";

export default function TricycleForeground({
  motion,
  headingOffset = 0,
  verticalOffset = 0,
}: {
  motion: MutableRefObject<{ steerVelocity?: number; turnVelocity?: number }>;
  headingOffset?: number;
  verticalOffset?: number;
}) {
  const rig = useRef<THREE.Group>(null);
  const frame = useRef<THREE.Group>(null);
  const leanFrame = useRef<THREE.Group>(null);
  const offset = useRef(new THREE.Vector3());
  const lean = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!rig.current || !frame.current || !leanFrame.current) {
      return;
    }

    rig.current.position.copy(camera.position);
    rig.current.quaternion.copy(camera.quaternion);

    offset.current.set(0, -0.54 + verticalOffset, -1.08).applyQuaternion(camera.quaternion);
    rig.current.position.add(offset.current);

    const steeringAmount = motion.current.steerVelocity ?? motion.current.turnVelocity ?? 0;

    lean.current = THREE.MathUtils.damp(lean.current, -steeringAmount * 0.12, 8, delta);
    frame.current.rotation.y = headingOffset;
    leanFrame.current.rotation.z = lean.current;
  });

  return (
    <group ref={rig}>
      <group ref={frame}>
        <group ref={leanFrame}>
          <mesh position={[-0.67, -0.05, 0.02]} rotation={[0.1, 0.08, -0.85]}>
            <cylinderGeometry args={[0.04, 0.04, 0.48, 10]} />
            <meshBasicMaterial color="#120506" />
          </mesh>

          <mesh position={[0.67, -0.05, 0.02]} rotation={[0.1, -0.08, 0.85]}>
            <cylinderGeometry args={[0.04, 0.04, 0.48, 10]} />
            <meshBasicMaterial color="#120506" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
