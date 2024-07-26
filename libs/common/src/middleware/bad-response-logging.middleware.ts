import { NextFunction, Request, Response, Send } from 'express';
import util from 'util';

const generateConsoleMessage = ({ originalUrl, method, res, body }: { originalUrl: string; method: string; res: Response; body: unknown }) => {
  return `Bad response to request: ${method} ${originalUrl}
    status code: ${res.statusCode}
    message: ${res.statusMessage}
    body: ${util.inspect(body, { depth: null })}`;
};

function handleResponse(
  this: Response,
  { originalProperty, res, originalUrl, method, body }: { originalProperty: Send; res: Response; originalUrl: string; method: string; body: unknown },
) {
  if (res.statusCode >= 400) {
    console.error(generateConsoleMessage({ originalUrl, method, res, body }));
  }

  return originalProperty.call(this, body);
}

/**
 * This middleware function logs bad responses to the console, and serves to aid in debugging.
 * It works by modifying the `res.send` function to log the response body if the status code is 400 or greater.
 * It should be used before any other middleware that sends a response is used.
 */
export function badResponseLogging(req: Request, res: Response, next: NextFunction) {
  const { method, originalUrl } = req;
  const originalProperty = res.send;
  // eslint-disable-next-line func-names
  res.send = function (body: unknown) {
    return handleResponse.call(this, { originalProperty, res, originalUrl, method, body });
  };

  next();
}
