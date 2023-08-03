import { useState } from "react";
import { useWakeLock as _useWakeLock } from "react-screen-wake-lock";

export type UseWakeLockType = () => ReturnType<typeof _useWakeLock> & {
  isRunning: boolean;
};
export const useWakeLock: UseWakeLockType = () => {
  const [isRunning, setIsRunning] = useState(false);
  const wakeLock = _useWakeLock({
    onRequest: () => setIsRunning(true),
    onError: () => setIsRunning(false),
    onRelease: () => setIsRunning(false),
  });

  return {
    ...wakeLock,
    isRunning,
  };
};
