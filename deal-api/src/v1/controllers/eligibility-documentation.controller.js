const stream = require('stream');
const { deleteMultipleFiles, uploadStream, readFile } = require('../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../utils');
const { userHasAccessTo } = require('../users/checks');
const { findOneDeal, updateDeal } = require('./deal.controller');
const { getEligibilityStatus } = require('../validation/eligibility-criteria');
const { getDocumentationErrors } = require('../validation/eligibility-documentation');

const getFileType = (fieldname) => {
  switch (fieldname) {
    case 'exporterQuestionnaire':
    case 'corporateStructure':
      return 'general_correspondence';

    default:
      return 'financials';
  }
};

const removeDeletedFiles = (dealFiles, deletedFilesList) => {
  if (!deletedFilesList) return dealFiles;

  const updatedDealFiles = {};

  Object.keys(dealFiles).forEach((fieldname) => {
    if (Array.isArray(dealFiles[fieldname])) {
      updatedDealFiles[fieldname] = dealFiles[fieldname].filter(
        ({ fullPath }) => deletedFilesList.indexOf(fullPath) === -1,
      );
    } else {
      updatedDealFiles[fieldname] = dealFiles[fieldname];
    }
  });
  return updatedDealFiles;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

exports.update = async (req, res) => {
  const uploadErrors = [];

  await findOneDeal(req.params.id, async (deal) => {
    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
      return;
    }

    const deletePromises = deleteMultipleFiles(req.body.deleteFile);

    const uploadPromises = req.files.map(async (file) => {
      const {
        fieldname, originalname, buffer, size, mimetype,
      } = file;

      if (size <= MAX_FILE_SIZE) {
        const fileInfo = await uploadStream({
          fileshare: 'portal',
          folder: req.params.id,
          filename: formatFilenameForSharepoint(originalname),
          buffer,
        });

        if (fileInfo.error) {
          uploadErrors.push({
            field: fieldname,
            originalname,
            message: fileInfo.error.message,
          });
          return {};
        }

        return {
          fieldname,
          type: getFileType(fieldname),
          fullPath: fileInfo.fullPath,
          filename: fileInfo.filename,
          mimetype,
        };
      }

      uploadErrors.push({
        field: fieldname,
        originalname,
        message: 'could not be saved. The maximum allowed size for upload is 10Mb',
      });

      return {};
    });

    const uploadedDealFiles = await Promise.all(uploadPromises, deletePromises);

    const dealFiles = {
      ...removeDeletedFiles(deal.dealFiles, req.body.deleteFile),
    };

    uploadedDealFiles.forEach(({ fieldname, ...rest }) => {
      if (fieldname) {
        if (!(fieldname in dealFiles)) {
          dealFiles[fieldname] = [];
        }
        if (!dealFiles[fieldname].some((df) => df.filename === rest.filename)) {
          dealFiles[fieldname].push({ ...rest });
        }
      }
    });

    const { validationErrors, validationUploadErrors } = getDocumentationErrors(
      deal.details.submissionType, dealFiles, uploadErrors,
    );

    const status = getEligibilityStatus({
      criteriaComplete: Boolean(deal.details.submissionType),
      ecErrorCount: deal.eligibility.validationErrors && deal.eligibility.validationErrors.count,
      dealFilesErrorCount: validationErrors.count,
    });

    const updatedDealData = {
      eligibility: {
        status,
      },
      dealFiles: {
        ...dealFiles,
        security: req.body.security,
        validationErrors,
      },
    };

    const newReq = {
      params: req.params,
      body: updatedDealData,
      user: req.user,
    };

    const updatedDeal = await updateDeal(newReq);

    // Don't want to save upload errors to db, only display on this request
    Object.entries(validationUploadErrors.errorList).forEach(([key, value]) => {
      if (!value) { delete (validationUploadErrors.errorList[key]); }
    });

    const errorList = {
      ...validationErrors.errorList,
      ...validationUploadErrors.errorList,
    };

    const activeErrors = Object.values(errorList).filter((el) => el.text);

    const validationPlusUploadErrors = {
      validationErrors: {
        count: activeErrors.length,
        uploadErrorCount: validationUploadErrors.count,
        errorList,
      },
    };

    const dealWithUploadErrors = {
      ...updatedDeal,
      dealFiles: {
        ...updatedDeal.dealFiles,
        ...validationPlusUploadErrors,
      },
    };

    res.status(200).json(dealWithUploadErrors);
  });
};

exports.downloadFile = async (req, res) => {
  const { id, fieldname, filename } = req.params;


  findOneDeal(id, async (deal) => {
    if (!deal) {
      return res.status(404).send();
    }

    if (!userHasAccessTo(req.user, deal)) {
      return res.status(401).send();
    }

    const fieldFiles = deal.dealFiles && deal.dealFiles[fieldname];
    if (!fieldFiles) {
      return res.status(404).send();
    }

    const fileInfo = fieldFiles.find((file) => file.filename === filename);
    if (!fileInfo) {
      return res.status(404).send();
    }

    const documentLocation = {
      folder: id,
      subfolder: fieldname,
      filename,
    };

    const bufferedFile = await readFile(documentLocation);

    const readStream = new stream.PassThrough();
    readStream.end(bufferedFile);

    res.set('Content-disposition', `attachment; filename=${filename}`);
    res.set('Content-Type', fileInfo.mimetype);

    return readStream.pipe(res);
  });
};
