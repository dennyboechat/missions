"use client";

// Hooks
import { useEffect, useState } from "react";

/**
 * The host this page was actually asked for, once there is a browser to ask.
 *
 * Undefined on the server and on the first client render, and that is the point:
 * only the browser knows which deployment it is talking to, and a link built
 * from a guessed origin scans cleanly and lands somewhere else. Callers draw the
 * space the link will occupy and fill it when this arrives.
 */
export const useOrigin = () => {
  const [origin, setOrigin] = useState<string>();

  useEffect(() => setOrigin(window.location.origin), []);

  return origin;
};
