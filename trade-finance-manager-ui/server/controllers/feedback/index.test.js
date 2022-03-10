import caseController from '.';
import { mockRes } from '../../test-mocks';

import api from '../../api';

describe('controllers - feedback', () => {
  let res;

  beforeEach(() => {
    res = mockRes();
  });

  describe('getFeedback', () => {
    const mockReq = {
      session: { user: {} },
    };
    it('should render feedback template with data', async () => {
      await caseController.getFeedback(mockReq, res);
      expect(res.render).toHaveBeenCalledWith('feedback/feedback-form.njk');
    });
  });

  describe('postFeedback without errors', () => {
    const mockFeedback = { status: 200 };

    const createFeedbackSpy = jest.fn(() => Promise.resolve(mockFeedback));

    beforeEach(() => {
      createFeedbackSpy.mockClear();
      api.createFeedback = createFeedbackSpy;
    });

    const mockReq = {
      session: { user: { username: 'Tester', email: 'test@test.test' } },
      body: {
        role: 'computers',
        team: 'Test ltd',
        whyUsingService: 'test',
        easyToUse: 'Very good',
        satisfied: 'Very satisfied',
        howCanWeImprove: 'Devs are doing a great job already',
        emailAddress: 'test@testing.com',
        submittedBy: {
          username: 'Tester',
          email: 'test@test.test',
        },
      },
    };

    it('should call api and render template for thank you page on successful creation with a user object', async () => {
      await caseController.postFeedback(mockReq, res);

      expect(createFeedbackSpy).toHaveBeenCalledWith(mockReq.body);

      expect(res.render).toHaveBeenCalledWith('feedback/feedback-thankyou.njk', {
        user: mockReq.session.user,
      });
    });

    it('should call api and render template for thank you page on successful creation without a user object', async () => {
      const mockReqNoUser = {
        session: { user: {} },
        body: {
          role: 'computers',
          team: 'Test ltd',
          whyUsingService: 'test',
          easyToUse: 'Very good',
          satisfied: 'Very satisfied',
          howCanWeImprove: 'Devs are doing a great job already',
          emailAddress: 'test@testing.com',
          submittedBy: {
            username: null,
            email: null,
          },
        },
      };
      await caseController.postFeedback(mockReqNoUser, res);

      expect(createFeedbackSpy).toHaveBeenCalledWith(mockReqNoUser.body);

      expect(res.render).toHaveBeenCalledWith('feedback/feedback-thankyou.njk', {
        user: {},
      });
    });
  });

  describe('postFeedback with errors', () => {
    const mockFeedback = null;

    const createFeedbackSpy = jest.fn(() => Promise.resolve(mockFeedback));

    beforeEach(() => {
      createFeedbackSpy.mockClear();
      api.createFeedback = createFeedbackSpy;
    });

    it('should render feedback-form.njk if feedback body is null', async () => {
      const mockReqErrors = {
        session: { user: {} },
        body: {},
      };

      await caseController.postFeedback(mockReqErrors, res);

      expect(res.render).toHaveBeenCalledWith('feedback/feedback-form.njk', {
        feedback: {
          submittedBy: {
            email: undefined,
            username: undefined,
          },
        },
        user: mockReqErrors.session.user,
      });
    });
  });
});
