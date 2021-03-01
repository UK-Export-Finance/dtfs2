class Application {
  constructor(req, exporterId) {
    if (exporterId) {
      // New Application
      this.userId = req.userID ? String(req.userID) : null;
      this.exporterId = exporterId;
      this.bankInternalRefName = req.bankInternalRefName ? String(req.bankInternalRefName) : null;
      this.facilityIds = null;
      this.createdAt = Date.now();
      this.updatedAt = null;
    } else {
      // Update
      this.facilityIds = req.facilityIds ? String(req.facilityIds) : null;
      this.updatedAt = Date.now();
    }
    this.additionalRefName = req.additionalRefName ? String(req.additionalRefName) : null;
  }
}

module.exports = {
  Application,
};
