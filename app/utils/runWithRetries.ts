// Types
import { databaseRetries } from "../types/DatabaseRetries";

export const runWithRetries = async (
  codeToRun: (args: any) => void,
  ...args: any
) => {
  const retries = databaseRetries;
  let attempt = 0;

  while (attempt < retries) {
    const isOnline = navigator.onLine;

    if (isOnline && codeToRun) {
      codeToRun(args);
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempt++;
      console.warn(`Attempt to run ${attempt}`);
    }
  }

  return false;
};
