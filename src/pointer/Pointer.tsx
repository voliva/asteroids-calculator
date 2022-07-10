import { useStateObservable } from "@react-rxjs/core";
import { useEffect } from "react";
import { clickEffect$, isAccelerating$, position$, rotation$ } from "./state";
import mouseDrift from "./mouse_drift.png";
import mouseFire from "./mouse_fire.png";

export function Pointer() {
  const rotation = useStateObservable(rotation$);
  const position = useStateObservable(position$);
  const isAccelerating = useStateObservable(isAccelerating$);

  const icon = isAccelerating ? mouseFire : mouseDrift;

  useEffect(() => {
    const sub = clickEffect$.subscribe();
    return () => sub.unsubscribe();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 14,
        height: 32,
        backgroundImage: `url('${icon}')`,
        transform: `translate(${position.x - 7}px, ${
          position.y + 16
        }px) rotate(${rotation}rad)`,
        transformOrigin: "top center",
      }}
    />
  );
}
