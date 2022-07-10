import { state } from "@react-rxjs/core";
import { createSignal } from "@react-rxjs/utils";
import {
  concat,
  defer,
  filter,
  fromEvent,
  map,
  startWith,
  switchMap,
  scan,
  animationFrames,
  pairwise,
  withLatestFrom,
  tap,
} from "rxjs";

export const isLocked$ = state(
  defer(() =>
    fromEvent(document, "pointerlockchange").pipe(
      map(() => Boolean(document.pointerLockElement)),
      startWith(Boolean(document.pointerLockElement))
    )
  ),
  false
);

export const [movement$, reportMovement] = createSignal<{
  deltaX: number;
  deltaY: number;
}>();

const rotationSpeed = 0.01;
export const rotation$ = state(
  isLocked$.pipe(
    filter((isLocked) => isLocked),
    switchMap(() =>
      concat(
        [0],
        movement$.pipe(
          scan((acc, { deltaX }) => acc + deltaX * rotationSpeed, 0)
        )
      )
    )
  ),
  0
);

const initialSpeed = { x: 0, y: 0 };
const maxSpeed = 20;
const maxSpeed2 = maxSpeed * maxSpeed;
const speedSensitivity = 0.05;
const speed$ = state(
  isLocked$.pipe(
    filter((isLocked) => isLocked),
    switchMap(() =>
      concat(
        [initialSpeed],
        movement$.pipe(
          filter(({ deltaY }) => deltaY < 0), // You won't break by moving mouse backwards
          withLatestFrom(
            rotation$.pipe(map((rotation) => rotation + Math.PI / 2))
          ),
          scan((acc, [{ deltaY }, rotation]) => {
            const newSpeed = {
              x: acc.x + speedSensitivity * deltaY * Math.cos(rotation),
              y: acc.y + speedSensitivity * deltaY * Math.sin(rotation),
            };
            const absSpeed2 = abs2(newSpeed);
            const factor = Math.min(1, maxSpeed2 / absSpeed2);
            return {
              x: factor * newSpeed.x,
              y: factor * newSpeed.y,
            };
          }, initialSpeed)
        )
      )
    )
  ),
  initialSpeed
);

const initialPosition = { x: 0, y: 0 };
const positionSpeed = 0.01;
const calculatorSize = { width: 320, height: 520 };
export const position$ = state(
  animationFrames().pipe(
    pairwise(),
    map(([prev, curr]) => curr.elapsed - prev.elapsed),
    withLatestFrom(speed$),
    scan((prevPosition, [delta, speed]) => {
      const newPosition = {
        x: prevPosition.x + speed.x * delta * positionSpeed,
        y: prevPosition.y + speed.y * delta * positionSpeed,
      };

      // Warp around the calculator
      if (newPosition.x < -calculatorSize.width / 2) {
        newPosition.x += calculatorSize.width;
      }
      if (newPosition.x > calculatorSize.width / 2) {
        newPosition.x -= calculatorSize.width;
      }
      if (newPosition.y < -calculatorSize.height / 2) {
        newPosition.y += calculatorSize.height;
      }
      if (newPosition.y > calculatorSize.height / 2) {
        newPosition.y -= calculatorSize.height;
      }
      return newPosition;
    }, initialPosition)
  ),
  initialPosition
);

function abs2(vector: { x: number; y: number }) {
  return vector.x * vector.x + vector.y * vector.y;
}

const keySize = { width: 80, height: 80 };
const displayHeight = 120;
const keyboardLayout = [
  ["key-clear", "key-sign", "key-percent", "key-divide"],
  ["key-7", "key-8", "key-9", "key-multiply"],
  ["key-4", "key-5", "key-6", "key-subtract"],
  ["key-1", "key-2", "key-3", "key-add"],
  ["key-0", "key-0", "key-dot", "key-equals"],
];
const hoveringKey$ = position$.pipe(
  map(({ x, y }) => ({
    x: x + calculatorSize.width / 2,
    y: y + calculatorSize.height / 2 - displayHeight,
  })),
  map(({ x, y }) => {
    if (y < 0) return null;

    const col = Math.floor(x / keySize.width);
    const row = Math.floor(y / keySize.height);
    const className = keyboardLayout[row][col];
    return document.querySelector(`.${className}`) || null;
  })
);

export const [click$, performClick] = createSignal();

export const clickEffect$ = click$.pipe(
  withLatestFrom(hoveringKey$),
  tap(([_, element]) => {
    const button = element as HTMLButtonElement | null;
    button?.click?.();
  })
);
