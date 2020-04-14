const formatFilenameForSharepoint = (filenameWithExtension) => {
  const [extension] = filenameWithExtension.match(/\.[^/.]+/g).reverse();
  const filenameWithoutExtension = filenameWithExtension.replace(/\.[^/.]+$/, '');

  const sanitisedFilename = filenameWithoutExtension.replace(/[^0-9a-zA-Z_-\s]/g, '_');

  return `${sanitisedFilename}${extension}`;
};

module.exports = formatFilenameForSharepoint;
