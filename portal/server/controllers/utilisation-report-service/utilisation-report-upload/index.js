const NodeClam = require('clamscan');
const ClamScan = new NodeClam().init({
  removeInfected: false, // If true, removes infected files
  quarantineInfected: false, // False: Don't quarantine, Path: Moves files to this place.
  scanLog: null, // Path to a writeable log file to write scan results into
  debugMode: true, // Whether or not to log info/debug/error msgs to the console
  fileList: null, // path to file containing list of files to scan (for scanFiles method)
  scanRecursively: true, // If true, deep scan folders recursively
  clamdscan: {
    host: 'clamav', // IP of host to connect to TCP interface
    port: 3310, // Port of host to use when connecting via TCP interface
    timeout: 60000, // Timeout for scanning files
    // configFile: null, // Specify config file if it's in an unusual place
    // multiscan: true, // Scan using all available cores! Yay!
    // reloadDb: false, // If true, will re-load the DB on every call (slow)
    // active: true, // If true, this module will consider using the clamdscan binary
    // bypassTest: false, // Check to see if socket is available when applicable
  },
  // preference: 'clamdscan', // If clamdscan is found and active, it will be used by default
});
const { Readable } = require('stream');

const getUtilisationReportUpload = async (req, res) => {
  try {
    return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

const postUtilisationReportUpload = async (req, res) => {
  try {
    console.log(req.file);
    ClamScan.then(async (clamscan) => {
      try {
        // You can re-use the `clamscan` object as many times as you want
        const version = await clamscan.getVersion()
        console.log(`ClamAV Version: ${version}`)
        const stream = Readable.from(req.file.buffer);
        const { isInfected, file, viruses } = await clamscan.scanStream(stream)
        if (isInfected) {
          console.log(`${file} is infected with ${viruses}!`)
        } else {
          console.log(`${file} is safe!`)
        }
      } catch (err) {
        // Handle any errors raised by the code in the try block
        console.error('aahhhh');
        throw err
      }
    }).catch(console.error)
    let validationError;
    let errorSummary;
    if (res?.locals?.fileUploadError) {
      errorSummary = [
        {
          text: res?.locals?.fileUploadError?.text,
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = res?.locals?.fileUploadError;
    } else if (!req?.file) {
      errorSummary = [
        {
          text: 'You must upload a file',
          href: '#utilisation-report-file-upload',
        },
      ];
      validationError = { text: 'You must upload a file' };
    }
    if (validationError || errorSummary) {
      return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
        validationError,
        errorSummary,
        user: req.session.user,
        primaryNav: 'utilisation_report_upload',
      });
    }
    return res.render('utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk', {
      user: req.session.user,
      primaryNav: 'utilisation_report_upload',
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk', { user: req.session.user });
  }
};

module.exports = {
  getUtilisationReportUpload,
  postUtilisationReportUpload,
};
