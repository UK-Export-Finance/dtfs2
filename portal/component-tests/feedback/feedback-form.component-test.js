const pageRenderer = require('../pageRenderer');

const page = 'feedback/feedback-form.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  beforeEach(() => {
    wrapper = render();
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="heading"]').toRead('Feedback');
  });

  it('should render `What is your role` text input', () => {
    wrapper.expectElement('[data-cy="what-is-your-role"]').toExist();
  });

  it('should render `Which organisation` text input', () => {
    wrapper.expectElement('[data-cy="which-organisation"]').toExist();
  });

  it('should render `Reason for visiting` radios inputs', () => {
    wrapper.expectElement('[data-cy="reason-for-visiting-automatic-inclusion-notice"]').toExist();
    wrapper.expectElement('[data-cy="reason-for-visiting-manual-inclusion-application"]').toExist();
    wrapper.expectElement('[data-cy="reason-for-visiting-manual-inclusion-notice"]').toExist();
    wrapper.expectElement('[data-cy="reason-for-visiting-other"]').toExist();
  });

  it('should render `Ease of use` radios inputs', () => {
    wrapper.expectElement('[data-cy="ease-of-use-very-good"]').toExist();
    wrapper.expectElement('[data-cy="ease-of-use-good"]').toExist();
    wrapper.expectElement('[data-cy="ease-of-use-neither-good-nor-poor"]').toExist();
    wrapper.expectElement('[data-cy="ease-of-use-poor"]').toExist();
    wrapper.expectElement('[data-cy="ease-of-use-very-poor"]').toExist();
    wrapper.expectElement('[data-cy="ease-of-use-dont-know"]').toExist();
  });

  it('should render `Information required is clearly explained` radios inputs', () => {
    wrapper.expectElement('[data-cy="clearly-explained-very-good"]').toExist();
    wrapper.expectElement('[data-cy="clearly-explained-good"]').toExist();
    wrapper.expectElement('[data-cy="clearly-explained-neither-good-nor-poor"]').toExist();
    wrapper.expectElement('[data-cy="clearly-explained-poor"]').toExist();
    wrapper.expectElement('[data-cy="clearly-explained-very-poor"]').toExist();
    wrapper.expectElement('[data-cy="clearly-explained-dont-know"]').toExist();
  });

  it('should render `Easy to understand` radios inputs', () => {
    wrapper.expectElement('[data-cy="easy-to-understand-very-good"]').toExist();
    wrapper.expectElement('[data-cy="easy-to-understand-good"]').toExist();
    wrapper.expectElement('[data-cy="easy-to-understand-neither-good-nor-poor"]').toExist();
    wrapper.expectElement('[data-cy="easy-to-understand-poor"]').toExist();
    wrapper.expectElement('[data-cy="easy-to-understand-very-poor"]').toExist();
    wrapper.expectElement('[data-cy="easy-to-understand-dont-know"]').toExist();
  });


  it('should render `Were you satisfied` radios inputs', () => {
    wrapper.expectElement('[data-cy="were-you-satisfied-very-satisfied"]').toExist();
    wrapper.expectElement('[data-cy="were-you-satisfied-satisfied"]').toExist();
    wrapper.expectElement('[data-cy="were-you-satisfied-neither-satisfied-not-dissatisfied"]').toExist();
    wrapper.expectElement('[data-cy="were-you-satisfied-dissatisfied"]').toExist();
    wrapper.expectElement('[data-cy="were-you-satisfied-very-dissatisfied"]').toExist();
    wrapper.expectElement('[data-cy="were-you-satisfied-dont-know"]').toExist();
  });

  it('should render `How can we improve` text input', () => {
    wrapper.expectElement('[data-cy="how-can-we-improve"]').toExist();
  });


  it('should render Email address text input', () => {
    wrapper.expectElement('[data-cy="email"]').toExist();
  });

  it('should render submit button', () => {
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectText('[data-cy="submit-button"]').toRead('Submit');
  });
});
