const NodeClam = require('clamscan');
const { Readable } = require('stream');
const { TIMEOUT } = require('@ukef/dtfs2-common');

const { CLAMAV_HOST, CLAMAV_PORT, CLAMAV_DEBUG_MODE_ENABLED, CLAMAV_SCANNING_ENABLED } = process.env;

/**
 * Middleware to perform a virus scan on an uploaded file using ClamAV.
 *
 * This middleware checks if ClamAV scanning is enabled and scans the uploaded file
 * (provided in `req.file.buffer`) for viruses. If a virus is detected or the file
 * is password-protected, it sets an appropriate error message in `res.locals.fileUploadError`.
 * If the scan fails due to a connection issue or timeout, it sets `res.locals.virusScanFailed` to `true`.
 *
 * @async
 * @function virusScanUpload
 * @param {Object} req - The Express request object.
 * @param {Object} req.file - The uploaded file object.
 * @param {Buffer} req.file.buffer - The buffer containing the file data.
 * @param {Object} res - The Express response object.
 * @param {Object} res.locals - The local variables for the response.
 * @param {Function} next - The next middleware function in the Express stack.
 *
 * @throws {Error} If an unexpected error occurs during the virus scan process.
 *
 * @example
 * // Usage in an Express route
 * const express = require('express');
 * const app = express();
 * const virusScanUpload = require('./middleware/virusScanUpload');
 *
 * app.post('/upload', virusScanUpload, (req, res) => {
 *   if (res.locals.fileUploadError) {
 *     return res.status(400).send(res.locals.fileUploadError.text);
 *   }
 *   if (res.locals.virusScanFailed) {
 *     return res.status(500).send('Virus scan failed. Please try again later.');
 *   }
 *   res.send('File uploaded successfully.');
 * });
 */
const virusScanUpload = async (req, res, next) => {
  if (CLAMAV_SCANNING_ENABLED === 'true' && req.file?.buffer) {
    try {
      const ClamScan = await new NodeClam()
        .init({
          removeInfected: false, // If true, removes infected files
          quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
          debugMode: CLAMAV_DEBUG_MODE_ENABLED, // Whether or not to log info/debug/error msgs to the console
          scanRecursively: true, // If true, deep scan folders recursively
          clamdscan: {
            host: CLAMAV_HOST, // IP of host to connect to TCP interface
            port: CLAMAV_PORT, // Port of host to use when connecting via TCP interface
            timeout: TIMEOUT.LONG, // Timeout for scanning files
            multiscan: true,
          },
          preference: 'clamdscan', // If clamdscan is found and active, it will be used by default
        })
        .catch((error) => {
          res.locals.virusScanFailed = true;
          console.error('Could not connect to clamav server, %o', error);
          return next();
        });
      // can't do clamscan.scanstream when hitting remote server due to https://github.com/kylefarris/clamscan/issues/101
      // so we use passthrough instead
      const scanResult = await new Promise((resolve, reject) => {
        const inputStream = Readable.from(req.file.buffer);
        const clamAVStream = ClamScan.passthrough();
        inputStream.pipe(clamAVStream);
        clamAVStream
          .on('scan-complete', (result) => {
            const { isInfected, viruses } = result;
            if (isInfected !== null) {
              console.error(`Scan complete; contents infected: ${isInfected} - ${viruses}`);
              resolve({ isInfected, viruses });
            }
          })
          .on('error', (error) => {
            console.error('Clamav virus scan errored with %o', error);
            reject(error);
          })
          .on('timeout', (error) => {
            const timeoutError = error || new Error('Scan timed out');
            console.error('Clamav virus scan timed out');
            reject(timeoutError);
          });
      });

      // Only matching on true here as the library has returned non booleans
      // during testing when erroring
      if (scanResult?.isInfected === true) {
        if (scanResult?.viruses.includes('PUA.Doc.Packed.EncryptedDoc-6563700-0')) {
          res.locals.fileUploadError = {
            text: 'The selected file is password protected',
          };
        } else {
          res.locals.fileUploadError = {
            text: 'The selected file contains a virus',
          };
        }
      } else if (scanResult?.isInfected === null || scanResult?.isInfected === undefined) {
        console.error('Clamav virus scan failed');
        res.locals.virusScanFailed = true;
      }
    } catch (err) {
      res.locals.virusScanFailed = true;
      console.error(err);
      return next();
    }
  }
  return next();
};

module.exports = virusScanUpload;
