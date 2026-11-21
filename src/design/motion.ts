import { useSyncExternalStore } from 'react';

export type Direction = 'forward' | 'back';

interface TransitionDocument {
  documentElement: { dataset: Record<string, string | undefined> };
  startViewTransition?: (update: () => void) => { finished: Promise<unknown>; ready?: Promise<unknown> };
}

const prefersReducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Runs a state change inside a View Transition when the browser has them, and plainly when it does not.
 * `update` runs exactly once on every path, so a step change can never be lost or doubled.
 */
export function runTransition(
  update: () => void,
  direction: Direction,
  doc: TransitionDocument = document as unknown as TransitionDocument,
  reduced: boolean = prefersReducedMotion(),
): void {
  doc.documentElement.dataset.dir = direction; // design.css slides by this
  if (reduced || typeof doc.startViewTransition !== 'function') {
    update();
    return;
  }
  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    update();
  };
  try {
    // A newer transition skips this one; its promises then reject, which is fine.
    const transition = doc.startViewTransition(once);
    transition.finished.catch(() => {});
    transition.ready?.catch(() => {});
  } catch {
    once();
  }
}

// ---- "A slider is moving": numbers follow the finger with no roll while this is true.
let sliding = false;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();
const setSliding = (value: boolean) => {
  if (sliding === value) return;
  sliding = value;
  listeners.forEach((notify) => notify());
};

/** Call on every slider change (pointer or keyboard). The flag clears shortly after the last change. */
export const markSliding = (): void => {
  setSliding(true);
  clearTimeout(timer);
  timer = setTimeout(() => setSliding(false), 350);
};

export const useSliding = (): boolean =>
  useSyncExternalStore((notify) => { listeners.add(notify); return () => listeners.delete(notify); }, () => sliding);
