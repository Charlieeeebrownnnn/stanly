import type { MutableRefObject } from "react";

export type RideInputState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

export type RideMotionState = {
  x: number;
  z: number;
  forwardVelocity: number;
  steerVelocity: number;
  yaw: number;
};

export type RoomExploreState = {
  x: number;
  z: number;
  yaw: number;
  forwardVelocity: number;
  turnVelocity: number;
};

export type RoomSceneProps = {
  input: MutableRefObject<RideInputState>;
  onReady?: () => void;
};
