import { useStateObservable } from "@react-rxjs/core";
import React, { useRef } from "react";
import { Calculator } from "./calculator/Calculator";
import { Pointer } from "./pointer/Pointer";
import { isLocked$, performClick, reportMovement } from "./pointer/state";

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
    <div ref={ref} onMouseMove={handleMouseMove} onClick={performClick}>
      <button
        disabled={isLocked}
        onClick={requestLock}
        style={{
          position: "absolute",
          top: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        Start
      </button>
      <div id="wrapper">
        <div id="calculator-app">
          <Calculator />
        </div>
      </div>
      {isLocked ? <Pointer /> : null}
    </div>
  );
}

export default App;
