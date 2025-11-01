/**
 * Registers global handlers for unhandled promise rejections and uncaught exceptions.
 *
 * This function attaches listeners to the Node.js process for the following events:
 * - `unhandledRejection`: Logs an error message when a promise rejection is not handled.
 * - `uncaughtException`: Logs an error message when an exception is thrown and not caught.
 *
 * Usage:
 * Call this function at the entry point of your application to ensure that
 * unexpected errors are logged for debugging purposes and service is not hard crashed.
 */
export const exceptionHandlers = () => {
  process.on('unhandledRejection', (error) => {
    console.error('An unhandled promise rejection was caught %o', error);
  });
  process.on('uncaughtException', (error) => {
    console.error('An uncaught exception was caught %o', error);
  });
};
