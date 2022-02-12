const multer = require('multer');

const fileFilter = (req, file, cb) => {
  const allowedFileExtensions = ['.gif', '.jpg', '.jpeg', '.png', '.bmp', '.tif', '.txt', '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.msg', '.zip'];
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

const fileUpload = multer({ fileFilter });

module.exports = fileUpload;
