/**
 * If `MIN` relevant submission date is returned, otherwise standard deal submission date.
 * Date retuned in EPOCH format.
 * @param {object} Deal deal object decapsulating `manualInclusionNoticeSubmissionDate` and `submissionDate`
 * @returns {number} EPOCH
 */
const getSubmissionDate = ({ manualInclusionNoticeSubmissionDate, submissionDate }) =>
  manualInclusionNoticeSubmissionDate ? Number(manualInclusionNoticeSubmissionDate) : Number(submissionDate);

module.exports = getSubmissionDate;
