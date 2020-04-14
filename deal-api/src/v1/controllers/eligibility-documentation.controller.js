const { deleteFile, uploadStream } = require('../../drivers/fileshare');
const { formatFilenameForSharepoint } = require('../../utils');
const { userHasAccessTo } = require('../users/checks');
const { findOneDeal, update: updateDeal } = require('./deal.controller');

const getFileType = (fieldname) => {
  switch (fieldname) {
    case 'exporter-questionnaire':
    case 'corporate_structure':
      return 'general_correspondence';

    default:
      return 'financials';
  }
};

const removeDeletedFiles = (dealFiles, deletedFilesList) => {
  if (!deletedFilesList) return dealFiles;

  const updatedDealFiles = {};
  Object.keys(dealFiles).forEach((fieldname) => {
    updatedDealFiles[fieldname] = dealFiles[fieldname].filter(
      ({ fullPath }) => deletedFilesList.indexOf(fullPath) === -1,
    );
  });
  return updatedDealFiles;
};

exports.update = async (req, res) => {
  await findOneDeal(req.params.id, async (deal) => {
    if (!userHasAccessTo(req.user, deal)) {
      res.status(401).send();
    }

    let deletePromises;
    if (Array.isArray(req.body.deleteFile)) {
      deletePromises = req.body.deleteFile.map(async (filePath) => {
        const deletedFile = await deleteFile(filePath);
        return deletedFile;
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const { fieldname, originalname, buffer } = file;
      const fileInfo = await uploadStream({
        folder: req.params.id,
        subfolder: fieldname,
        filename: formatFilenameForSharepoint(originalname),
        buffer,
      });

      return {
        fieldname,
        type: getFileType(fieldname),
        fullPath: fileInfo.fullPath,
        filename: fileInfo.filename,
      };
    });

    const uploadedDealFiles = await Promise.all(uploadPromises, deletePromises);

    const dealFiles = {
      ...removeDeletedFiles(deal.dealFiles, req.body.deleteFile),
      security: req.body.security,
    };

    Object.values(uploadedDealFiles).forEach(({ fieldname, ...rest }) => {
      if (!(fieldname in dealFiles)) {
        dealFiles[fieldname] = [];
      }
      dealFiles[fieldname].push({ ...rest });
    });


    const updatedDeal = {
      ...deal,
      dealFiles,
    };

    const newReq = {
      params: req.params,
      body: updatedDeal,
      user: req.user,
    };

    updateDeal(newReq, res);
  });
};
