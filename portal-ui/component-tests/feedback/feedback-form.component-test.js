const pageRenderer = require('../pageRenderer');

const page = 'feedback/feedback-form.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const feedback = {
    role: 'computers',
    organisation: 'Test ltd',
    reasonForVisiting: 'Submit an automatic inclusion notice',
    easyToUse: 'Very good',
    clearlyExplained: 'Good',
    satisfied: 'Very satisfied',
    howCanWeImprove: 'Devs are doing a great job already',
    emailAddress: 'test@testing.com',
  };

  const validationErrors = {
    errorList: {
      role: { text: 'Role error message' },
      organisation: { text: 'Organisation error message' },
      reasonForVisiting: { text: 'Reason for visiting error message' },
      easyToUse: { text: 'Easy to use error message' },
      clearlyExplained: { text: 'Clearly explained error message' },
      satisfied: { text: 'Satisfied error message' },
      emailAddress: { text: 'Email address error message' },
    },
  };

  beforeEach(() => {
    wrapper = render({ feedback, validationErrors });
  });

  it('should render page heading', () => {
    wrapper.expectText('[data-cy="heading"]').toRead('Feedback');
  });

  it('should render `What is your role` text input with value and error provided from params', () => {
    wrapper.expectElement('[data-cy="role"]').toExist();
    wrapper.expectInput('[data-cy="role"]').toHaveValue(feedback.role);
    wrapper.expectText('[data-cy="role-error-message"]').toRead(`Error: ${validationErrors.errorList.role.text}`);
  });

  it('should render `Which organisation` text input with value and error provided from params', () => {
    wrapper.expectElement('[data-cy="organisation"]').toExist();
    wrapper.expectInput('[data-cy="organisation"]').toHaveValue(feedback.organisation);
    wrapper.expectText('[data-cy="organisation-error-message"]').toRead(`Error: ${validationErrors.errorList.organisation.text}`);
  });

  describe('`Reason for visiting` radio inputs', () => {
    it('should render', () => {
      wrapper.expectElement('[data-cy="reason-for-visiting-automatic-inclusion-notice"]').toExist();
      wrapper.expectElement('[data-cy="reason-for-visiting-manual-inclusion-application"]').toExist();
      wrapper.expectElement('[data-cy="reason-for-visiting-manual-inclusion-notice"]').toExist();
      wrapper.expectElement('[data-cy="reason-for-visiting-other"]').toExist();
    });

    it('should have one radio checked with value from params', () => {
      wrapper.expectInput('[data-cy="reason-for-visiting-automatic-inclusion-notice"]').toBeChecked();
    });

    it('should render error from params', () => {
      wrapper.expectText('[data-cy="reason-for-visiting-error-message"]').toRead(`Error: ${validationErrors.errorList.reasonForVisiting.text}`);
    });
  });

  it('should render a rating heading', () => {
    wrapper.expectText('[data-cy="rating-heading"]').toRead('How would you rate this service?');
  });

  describe('`Easy to use` radio inputs', () => {
    it('should render', () => {
      wrapper.expectElement('[data-cy="easy-to-use-very-good"]').toExist();
      wrapper.expectElement('[data-cy="easy-to-use-good"]').toExist();
      wrapper.expectElement('[data-cy="easy-to-use-neither-good-nor-poor"]').toExist();
      wrapper.expectElement('[data-cy="easy-to-use-poor"]').toExist();
      wrapper.expectElement('[data-cy="easy-to-use-very-poor"]').toExist();
      wrapper.expectElement('[data-cy="easy-to-use-do-not-know"]').toExist();
    });

    it('should have one radio checked with value from params', () => {
      wrapper.expectInput('[data-cy="easy-to-use-very-good"]').toBeChecked();
    });

    it('should render error from params', () => {
      wrapper.expectText('[data-cy="easy-to-use-error-message"]').toRead(`Error: ${validationErrors.errorList.easyToUse.text}`);
    });
  });

  describe('`Information required is clearly explained` radio inputs', () => {
    it('should render', () => {
      wrapper.expectElement('[data-cy="clearly-explained-very-good"]').toExist();
      wrapper.expectElement('[data-cy="clearly-explained-good"]').toExist();
      wrapper.expectElement('[data-cy="clearly-explained-neither-good-nor-poor"]').toExist();
      wrapper.expectElement('[data-cy="clearly-explained-poor"]').toExist();
      wrapper.expectElement('[data-cy="clearly-explained-very-poor"]').toExist();
      wrapper.expectElement('[data-cy="clearly-explained-do-not-know"]').toExist();
    });

    it('should have one radio checked with value from params', () => {
      wrapper.expectInput('[data-cy="clearly-explained-good"]').toBeChecked();
    });

    it('should render error from params', () => {
      wrapper.expectText('[data-cy="clearly-explained-error-message"]').toRead(`Error: ${validationErrors.errorList.clearlyExplained.text}`);
    });
  });

  describe('`Were you satisfied` radio inputs', () => {
    it('should render', () => {
      wrapper.expectElement('[data-cy="were-you-satisfied-very-satisfied"]').toExist();
      wrapper.expectElement('[data-cy="were-you-satisfied-satisfied"]').toExist();
      wrapper.expectElement('[data-cy="were-you-satisfied-neither-satisfied-not-dissatisfied"]').toExist();
      wrapper.expectElement('[data-cy="were-you-satisfied-dissatisfied"]').toExist();
      wrapper.expectElement('[data-cy="were-you-satisfied-very-dissatisfied"]').toExist();
      wrapper.expectElement('[data-cy="were-you-satisfied-do-not-know"]').toExist();
    });

    it('should have one radio checked with value from params', () => {
      wrapper.expectInput('[data-cy="were-you-satisfied-very-satisfied"]').toBeChecked();
    });

    it('should render error from params', () => {
      wrapper.expectText('[data-cy="satisfied-error-message"]').toRead(`Error: ${validationErrors.errorList.satisfied.text}`);
    });
  });

  it('should render `How can we improve` text input with value provided from params', () => {
    wrapper.expectElement('[data-cy="how-can-we-improve"]').toExist();
    wrapper.expectTextArea('[data-cy="how-can-we-improve"]').toHaveValue(feedback.howCanWeImprove);
  });

  it('should render Email address text input with value and error provided from params', () => {
    wrapper.expectElement('[data-cy="email-address"]').toExist();
    wrapper.expectInput('[data-cy="email-address"]').toHaveValue(feedback.emailAddress);
    wrapper.expectText('[data-cy="email-address-error-message"]').toRead(`Error: ${validationErrors.errorList.emailAddress.text}`);
  });

  it('should render submit button', () => {
    wrapper.expectElement('[data-cy="submit-button"]').toExist();
    wrapper.expectText('[data-cy="submit-button"]').toRead('Submit');
  });
});
