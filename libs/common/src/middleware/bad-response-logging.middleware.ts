// Overwrite res.send

import { RequestHandler, Response, Send } from 'express';
import util from 'util';

const generateConsoleMessage = ({ originalUrl, res, body }: { originalUrl: string; res: Response; body: unknown }) => {
  return `Bad response to request: ${originalUrl} \n\n 
        status code: ${res.statusCode}\n\n
        message: ${res.statusMessage}\n\n
        body: ${util.inspect(body, { depth: null })}`;
};

const handleResponse = ({
  originalResponseCall,
  res,
  originalUrl,
  body,
}: {
  originalResponseCall: Send;
  res: Response;
  originalUrl: string;
  body: unknown;
}) => {
  if (res.statusCode >= 400) {
    console.error(generateConsoleMessage({ originalUrl, res, body }));
  }
  return originalResponseCall.call(this, body);
};

export const badResponseLogging: RequestHandler = (req, res, next) => {
  const { originalUrl } = req;

  const originalSend = res.send;
  res.send = (body: unknown) => {
    return handleResponse({ originalResponseCall: originalSend, res, originalUrl, body });
  };

  const originalJson = res.json;
  res.json = (body: unknown) => {
    return handleResponse({ originalResponseCall: originalJson, res, originalUrl, body });
  };

  const originalSendStatus = res.sendStatus.bind(this);
  res.sendStatus = (statusCode) => {
    if (res.statusCode >= 400) {
      console.error(`Bad response to request: ${originalUrl} \n\n 
        status code: ${res.statusCode}`);
    }
    return originalSendStatus.call(this, statusCode);
  };

  next();
};
