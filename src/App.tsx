import React, { RefObject, useEffect, useRef, useState } from "react";
import { Calculator } from "./calculator/Calculator";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const [isLocked, requestLock] = usePointerLock(ref);

  function handleMouseMove(evt: React.MouseEvent) {
    if (!isLocked) return;

    console.log(evt.movementX, evt.movementY);
  }

  return (
    <div id="app" ref={ref} onMouseMove={handleMouseMove}>
      <button disabled={isLocked} onClick={requestLock}>
        Start
      </button>
      <Calculator />
    </div>
  );
}

function usePointerLock(elementRef: RefObject<HTMLElement>) {
  const [isLocked, setIsLocked] = useState(false);
  function requestLock() {
    elementRef.current?.requestPointerLock() as any as Promise<void>;
  }

  useEffect(() => {
    function handler() {
      setIsLocked(Boolean(document.pointerLockElement));
    }
    document.addEventListener("pointerlockchange", handler);

    return () => document.removeEventListener("pointerlockchange", handler);
  }, []);

  return [isLocked, requestLock] as const;
}

export default App;
