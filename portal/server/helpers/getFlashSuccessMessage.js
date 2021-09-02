const getFlashSuccessMessage = (req) => req.flash('successMessage')[0];

module.exports = getFlashSuccessMessage;
