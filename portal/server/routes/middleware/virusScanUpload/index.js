const NodeClam = require('clamscan');

const { CLAMAV_HOST, CLAMAV_PORT, CLAMAV_DEBUG_MODE_ENABLED, CLAMAV_SCANNING_ENABLED } = process.env;

const { Readable } = require('stream');

const virusScanUpload = async (req, res, next) => {
  if (CLAMAV_SCANNING_ENABLED && req.file?.buffer) {
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
        .catch((err) => {
          res.locals.virusScanFailed = true;
          console.error('Could not connect to clamav server');
          console.error(err);
          return next();
        });
      const stream = Readable.from(req.file.buffer);
      const { isInfected, viruses } = await ClamScan.scanStream(stream);
      if (isInfected) {
        if (viruses.includes('PUA.Doc.Packed.EncryptedDoc-6563700-0')) {
          res.locals.fileUploadError = {
            text: 'The selected file is password protected',
          };
        } else {
          res.locals.fileUploadError = {
            text: 'The selected file contains a virus',
          };
        }
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
