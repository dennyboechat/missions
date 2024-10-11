export const runWithRetries = async (codeToRun: () => void) => {
  const retries = 10;
  let attempt = 0;

  while (attempt < retries) {
    const isOnline = navigator.onLine;

    if (isOnline) {
      codeToRun();
      return true;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempt++;
      console.warn(`Attempt to run ${attempt}`);
    }
  }

  return false;
};
