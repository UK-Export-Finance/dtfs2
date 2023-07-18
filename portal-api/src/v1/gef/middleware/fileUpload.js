const multer = require('multer');

const DEFAULT_ALLOWED_FORMATS = ['bmp', 'doc', 'docx', 'gif', 'jpeg', 'jpg', 'msg', 'pdf', 'png', 'ppt', 'pptx', 'tif', 'txt', 'xls', 'xlsx', 'zip'];
const fileFilter = (req, file, cb) => {
  const documentType = file.fieldname;
  console.log(`fileUpload ${documentType}`);
  const manualInclusionFileSize = 12582912; // == 12mb
  const defaultFileSize = 10485760; // == 10mb
  const maxFileSize = documentType === 'exporterQuestionnaire' ? manualInclusionFileSize : defaultFileSize;
  const fileSize = parseInt(req.headers['content-length'], 10);

  if (new RegExp(`\.(${DEFAULT_ALLOWED_FORMATS.join('|')})$`).test(file.originalname)) {
    // if the document type is manual inclusion, then the max file size is 12mb
    if (fileSize <= maxFileSize) {
      cb(null, true);
    } else {
      cb(
        {
          message: `${file.originalname} must be smaller than ${formatBytes(maxFileSize)}`,
        },
        false,
      );
    }
  } else {
    const fileError = {
      field: file.fieldname,
      originalname: file.originalname,
      message: 'file type is not allowed',
    };

    req.filesNotAllowed = req.filesNotAllowed ? req.filesNotAllowed.push(fileError) : [fileError];

    cb(
      {
        message: `${file.originalname} must be a ${DEFAULT_ALLOWED_FORMATS.join(', ').toUpperCase()}`,
        file,
      },
      false,
    );
  }
};

const fileUpload = multer({ fileFilter, dest: '/temp' });

module.exports = fileUpload;
