"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import FeedbackWidget, { type FeedbackFeature } from "./feedback-widget";

interface FeedbackContextValue {
  /** Call to show the feedback widget for a feature.
   *  Will not show again for the same feature in the same browser session. */
  triggerFeedback: (feature: FeedbackFeature) => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  triggerFeedback: () => {},
});

export function useFeedback() {
  return useContext(FeedbackContext);
}

const STORAGE_PREFIX = "ci_csat_";

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [activeFeature, setActiveFeature] = useState<FeedbackFeature | null>(null);

  const triggerFeedback = useCallback((feature: FeedbackFeature) => {
    // Only show once per feature per browser session
    const key = `${STORAGE_PREFIX}${feature}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) return;
    setActiveFeature(feature);
  }, []);

  const handleClose = useCallback(() => {
    if (activeFeature) {
      const key = `${STORAGE_PREFIX}${activeFeature}`;
      if (typeof window !== "undefined") localStorage.setItem(key, "1");
    }
    setActiveFeature(null);
  }, [activeFeature]);

  return (
    <FeedbackContext.Provider value={{ triggerFeedback }}>
      {children}
      <AnimatePresence>
        {activeFeature && (
          <FeedbackWidget
            key={activeFeature}
            feature={activeFeature}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}
