const { ObjectId } = require('mongodb');

class File {
  constructor(file, parentId) {
    this.parentId = ObjectId(String(parentId));
    this.filename = file.originalname;
    this.mimetype = file.mimetype;
    this.encoding = file.encoding;
    this.size = file.size;
    this.documentPath = file.documentPath;
  }
}

module.exports = File;
