const {
  getUploadManualInclusion, postUploadManualInclusion, uploadManualInclusion, deleteManualInclusion,
} = require('./manual-inclusion-questionnaire');
const { getSecurityDetails, postSecurityDetails } = require('./security-details');

module.exports = {
  getUploadManualInclusion,
  postUploadManualInclusion,
  uploadManualInclusion,
  deleteManualInclusion,
  getSecurityDetails,
  postSecurityDetails,
};
