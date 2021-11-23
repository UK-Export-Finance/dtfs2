const uploadFile = (fileName, uploadEndpoint, selector = '.moj-multi-file-upload__dropzone') => {
// start watching the POST requests
  cy.server({ method: 'POST' });
  cy.route({
    method: 'POST',
    url: uploadEndpoint,
  }).as('upload');

  cy.get(selector).attachFile(
    fileName, { subjectType: 'drag-n-drop' },
  );

  cy.wait('@upload', { requestTimeout: 15000 });
  cy.server({ enable: false });
};

export default uploadFile;
