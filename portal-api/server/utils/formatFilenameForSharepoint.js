/*
Filenames for the documentation upload  shouldn’t include special characters as this breaks the sharepoint/estore,
valid characters listed below:

1. alphabetic characters A through Z
2. numeric characters 0 through 9

see
https://ukef-dtfs.atlassian.net/browse/DTFS2-509
*/

const formatFilenameForSharepoint = (filenameWithExtension) => {
  const [extension] = filenameWithExtension.match(/\.[^/.]+/g).reverse();
  const filenameWithoutExtension = filenameWithExtension.replace(/\.[^/.]+$/, '');
  const sanitisedFilename = filenameWithoutExtension.replace(/[\W_]+/g, '_');

  return `${sanitisedFilename}${extension}`;
};

module.exports = formatFilenameForSharepoint;
