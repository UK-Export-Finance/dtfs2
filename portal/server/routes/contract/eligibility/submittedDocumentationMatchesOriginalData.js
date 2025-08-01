/**
 * Checks if the security field in a form data object matches the security field in an original data object,
 * and if any files have been submitted.
 * @param {object} formData - The form data object that contains the security field.
 * @param {Array} formFiles - An array of file objects that have been submitted.
 * @param {object} savedDeal - Deal fetched form the database
 * @returns {boolean} - Returns true if the security field in the form data matches the security field in the original data
 * and no files have been submitted. Returns false otherwise.
 */
const submittedDocumentationMatchesOriginalData = (formData, formFiles, savedDeal) => {
  if (!formFiles) {
    return false;
  }

  const originalSecurityField = savedDeal?.securityDetails?.exporter;
  const filesSubmitted = formFiles.length > 0;

  return originalSecurityField === formData?.security && !filesSubmitted;
};

module.exports = submittedDocumentationMatchesOriginalData;
