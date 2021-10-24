import { useEffect, EffectCallback } from "react";

// used to run functions only once on the component's initial render
export const useMountEffect = (callback: EffectCallback) => useEffect(callback, [])
