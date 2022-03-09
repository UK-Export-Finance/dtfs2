/*
Filenames for the documentation upload  shouldn’t include special characters as this breaks the sharepoint/estore,
valid characters listed below:

1. alphabetic characters A through Z
2. numeric characters 0 through 9
3. -
4. _

see
https://ukef-dtfs.atlassian.net/jira/software/projects/DTFS2/boards/2?assignee=5e42c0d090dfb70c9e60741b&selectedIssue=DTFS2-509 // eslint-disable-line max-len
*/

const formatFilenameForSharepoint = (filenameWithExtension) => {
  const [extension] = filenameWithExtension.match(/\.[^/.]+/g).reverse();
  const filenameWithoutExtension = filenameWithExtension.replace(/\.[^/.]+$/, '');
  const sanitisedFilename = filenameWithoutExtension.replace(/[^0-9a-zA-Z_-\S]|,/g, '_');

  return `${sanitisedFilename}${extension}`;
};

module.exports = formatFilenameForSharepoint;
