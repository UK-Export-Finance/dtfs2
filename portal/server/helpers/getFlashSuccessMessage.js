const getFlashSuccessMessage = (req) => req.flash('successMessage')[0];

export default getFlashSuccessMessage;
