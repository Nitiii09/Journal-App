import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scrolls to the top on navigation and exposes a short "transitioning" flag
 * that layout chrome can use to soften itself while the page swaps.
 */
export function usePageTransition({ duration = 450 } = {}) {
  const location = useLocation();
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    setTransitioning(true);
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

    const timer = setTimeout(() => setTransitioning(false), duration);
    return () => clearTimeout(timer);
  }, [location.pathname, duration]);

  return { transitioning, pathname: location.pathname, locationKey: location.key };
}

export default usePageTransition;
