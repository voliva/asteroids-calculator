import { useStateObservable } from "@react-rxjs/core";
import React, { useRef } from "react";
import { Calculator } from "./calculator/Calculator";
import { Pointer } from "./pointer/Pointer";
import { isLocked$, reportMovement } from "./pointer/state";

function App() {
  const ref = useRef<HTMLDivElement>(null);
  const isLocked = useStateObservable(isLocked$);

  function handleMouseMove(evt: React.MouseEvent) {
    if (!isLocked) return;

    reportMovement({ deltaX: evt.movementX, deltaY: evt.movementY });
  }

  function requestLock() {
    ref.current?.requestPointerLock() as any as Promise<void>;
  }

  return (
    <div id="app" ref={ref} onMouseMove={handleMouseMove}>
      <button disabled={isLocked} onClick={requestLock}>
        Start
      </button>
      <Calculator />
      {isLocked ? <Pointer /> : null}
    </div>
  );
}

export default App;
