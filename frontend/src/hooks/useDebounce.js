import { useEffect, useRef } from "react";

/**
 * Returns a debounced version of `fn` that delays invocation by `delay` ms.
 * Useful for throttling progress-save API calls.
 */
export const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const debounced = useRef((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fnRef.current(...args), delay);
  });

  useEffect(() => () => clearTimeout(timer.current), []);

  return debounced.current;
};
