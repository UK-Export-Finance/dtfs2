jest.unmock('@azure/storage-file-share');

const fileshare = require('../../src/drivers/fileshare');

const someXML = '<?xml version="1.0" encoding="UTF-8"?><Deal/>';

describe('fileshare', () => {
  it('can upload a string and get it back', async () => {
    await fileshare.uploadStream({
      folder: 'dantest',
      fieldname: 'dansubfolder',
      originalname: 'out.xml',
      buffer: Buffer.from(someXML, 'utf-8'),
    }).catch((err) => {
      console.log(err);
    });

    const retrievedFileContent = await fileshare.readFile({
      folder: 'dantest',
      fieldname: 'dansubfolder',
      originalname: 'out.xml',
      stringEncoding: 'utf-8',
    });

    expect(retrievedFileContent).toEqual(someXML);
  });
});
