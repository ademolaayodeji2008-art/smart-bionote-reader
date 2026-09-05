import { useEffect, useRef } from "react";

/**
 * Adds the `is-visible` class to all `.reveal` children inside the returned
 * ref container when they enter the viewport. Works with the `.reveal` +
 * `.reveal-delay-*` CSS classes defined in index.css.
 */
const useScrollReveal = () => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll(".reveal");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // only fire once
          }
        });
      },
      { threshold: 0.15 },
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
};

export default useScrollReveal;
