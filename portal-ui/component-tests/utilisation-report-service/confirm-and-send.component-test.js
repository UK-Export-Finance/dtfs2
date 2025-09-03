const pageRenderer = require('../pageRenderer');

const page = 'utilisation-report-service/utilisation-report-upload/confirm-and-send.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const filename = 'june-2023.csv';

  beforeEach(() => {
    wrapper = render({ filename });
  });

  it('should render back link', () => {
    wrapper.expectElement('[data-cy="back-link"]').toExist();
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="main-heading"]').toRead('File successfully validated');
  });

  it('should render paragraph', () => {
    wrapper.expectText('[data-cy="paragraph"]').toRead("Check it's the correct file before sending.");
  });

  it('should render description with filename', () => {
    wrapper.expectElement('[data-cy="file-name"]').toExist();
    wrapper.expectText('[data-cy="file-name"]').toRead(filename);
  });

  it('should render change link', () => {
    wrapper.expectElement('[data-cy="change-link"]').toExist();
  });

  it('should render confirm and send button', () => {
    wrapper.expectElement('[data-cy="confirm-and-send-button"]').toExist();
    wrapper.expectText('[data-cy="confirm-and-send-button"]').toRead('Confirm and send');
  });
});
