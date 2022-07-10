import { useStateObservable } from "@react-rxjs/core";
import { position$, rotation$ } from "./state";

export function Pointer() {
  const rotation = useStateObservable(rotation$);
  const position = useStateObservable(position$);

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        width: 10,
        height: 20,
        background: "red",
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}rad)`,
      }}
    />
  );
}
