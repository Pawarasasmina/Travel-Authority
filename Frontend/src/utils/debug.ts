/**
 * Utility for consistent debuggable logs
 * This makes it easy to identify auth-related logs in the console
 */
export const debugLog = (area: string, message: string, data?: any) => {
  const prefix = `[DEBUG:${area}]`;
  if (data !== undefined) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
};
