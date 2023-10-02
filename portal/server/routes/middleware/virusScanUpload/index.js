const NodeClam = require('clamscan');
const { CLAMAV_HOST, CLAMAV_PORT, CLAMAV_DEBUG_MODE_ENABLED } = process.env;
const ClamScan = new NodeClam().init({
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
});
const { Readable } = require('stream');

const virusScanUpload = (req, res, next) => {
  ClamScan.then(async (clamscan) => {
    try {
      const stream = Readable.from(req.file.buffer);
      const { isInfected, file, viruses } = await clamscan.scanStream(stream);
      if (isInfected) {
        console.info(`${file} is infected with ${viruses}!`);
        res.locals.fileUploadError = {
          text: `The selected file contains a virus`,
        };
        return next();
      } else {
        return next();
      }
    } catch (err) {
      // redirect to something went wrong?
      res.locals.virusScanFailed = {
        text: `Virus scanning went wrong`,
      };
      console.error(err);
      return next();
    }
  }).catch((err) => {
    // redirect to something went wrong?
    res.locals.fileUploadError = {
      text: `Virus scanning went wrong`,
    };
    console.error(err);
    return next();
  });
};

module.exports = virusScanUpload;
