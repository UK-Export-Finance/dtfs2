/**
 * If `MIN` relevant submission date is returned else standard `Appliction` submision date.
 * Date retuned in EPOCH format.
 * @param {Object} Deal deal object decapsulating `manualInclusionNoticeSubmissionDate` and `submissionDate`
 * @returns {Integer} EPOCH
 */
const getSubmissionDate = ({ manualInclusionNoticeSubmissionDate, submissionDate }) => (
  manualInclusionNoticeSubmissionDate
    ? Number(manualInclusionNoticeSubmissionDate)
    : Number(submissionDate)
);

module.exports = getSubmissionDate;
