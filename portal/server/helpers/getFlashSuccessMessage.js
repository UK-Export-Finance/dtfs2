/**
 * Retrieves the first success message from flash storage
 * @param {Request} req the request object
 * @return {string} the first success message in flash storage
 */
const getFlashSuccessMessage = (req) => req.flash('successMessage')[0];

module.exports = getFlashSuccessMessage;
