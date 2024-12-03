const NodeClam = require('clamscan');
const { Readable } = require('stream');

const { CLAMAV_HOST, CLAMAV_PORT, CLAMAV_DEBUG_MODE_ENABLED, CLAMAV_SCANNING_ENABLED } = process.env;

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
            timeout: 15000, // Timeout for scanning files
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
