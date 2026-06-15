
export const logError = (error: any, context: Record<string, any> = {}) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, {
    message: error?.message,
    stack: error?.stack,
    context,
  });
};

export const logInfo = (message: string, context: Record<string, any> = {}) => {
  console.info(`[${new Date().toISOString()}] INFO:`, {
    message,
    context,
  });
};
