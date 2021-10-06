const { ObjectID } = require('bson');

class File {
  constructor(file, parentId) {
    this.parentId = ObjectID(String(parentId));
    this.filename = file.originalname;
    this.mimetype = file.mimetype;
    this.encoding = file.encoding;
    this.size = file.size;
  }
}

module.exports = File;
