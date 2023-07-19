const multer = require('multer');

// TODO: cleanup file upload: https://ukef-dtfs.atlassian.net/browse/DTFS2-4956
const fileFilter = (req, file, cb) => {
  const allowedFileExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.bmp', '.tif', '.txt', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
  const fileExtension = file.originalname.match(/\.[^.]*$/g);

  const allowed = allowedFileExtensions.includes(fileExtension[0]);

  if (!allowed) {
    const fileError = {
      field: file.fieldname,
      originalname: file.originalname,
      message: 'file type is not allowed',
    };

    req.filesNotAllowed = req.filesNotAllowed ? req.filesNotAllowed.push(fileError) : [fileError];
  }

  cb(null, allowed);
};

const fileUpload = multer({ fileFilter, limits: { fileSize: 12 * 1024 * 1024 }, dest: 'temp/' }).any();

module.exports = fileUpload;
