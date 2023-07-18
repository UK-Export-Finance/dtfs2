const multer = require('multer');

const DEFAULT_ALLOWED_FORMATS = ['.gif', '.jpg', '.jpeg', '.png', '.bmp', '.tif', '.txt', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
const fileFilter = (req, file, cb) => {
  const documentType = file.fieldname;
  console.log(`file-upload`);
  console.log(file);
  const manualInclusionFileSize = 12582912; // == 12mb
  const defaultFileSize = 10485760; // == 10mb
  const maxFileSize = documentType === 'exporterQuestionnaire' ? manualInclusionFileSize : defaultFileSize;
  const fileSize = parseInt(req.headers['content-length'], 10);

  if (new RegExp(`\.(${DEFAULT_ALLOWED_FORMATS.join('|')})$`).test(file.originalname)) {
    // if the document type is manual inclusion, then the max file size is 12mb
    if (fileSize <= maxFileSize) {
      console.log('123123123');
      cb(null, true);
    } else {
      console.log('345345345');
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
    console.log('567567567');

    cb(
      {
        message: `${file.originalname} must be a ${DEFAULT_ALLOWED_FORMATS.join(', ').toUpperCase()}`,
        file,
      },
      false,
    );
  }
};

const fileUpload = multer({ fileFilter });

module.exports = fileUpload;
