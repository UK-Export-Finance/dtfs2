import { getCheckYourEmailAccessCodePage } from './check-your-email-access-code';

describe('getCheckYourEmailAccessCodePage', () => {
	let res: any;

	beforeEach(() => {
		res = {
			render: jest.fn(),
		};
	});

	it('should render the check your email access code template with attemptsLeft from the session', () => {
		const req: any = {
			session: {
				numberOfSendSignInOtpAttemptsRemaining: 2,
			},
		};

		getCheckYourEmailAccessCodePage(req, res);

		expect(res.render).toHaveBeenCalledWith('login/check-your-email-access-code.njk', {
			attemptsLeft: 2,
			requestNewCodeUrl: '/login/request-new-access-code',
		});
	});

	it('should render problem with service template when attemptsLeft is not present in the session', () => {
		const req: any = {
			session: {},
		};

		getCheckYourEmailAccessCodePage(req, res);

		expect(res.render).toHaveBeenCalledWith('partials/problem-with-service.njk');
	});

	it('should render problem with service template when an error occurs while rendering', () => {
		const req: any = {
			session: {
				numberOfSendSignInOtpAttemptsRemaining: 1,
			},
		};

		res.render = jest.fn().mockImplementationOnce(() => {
			throw new Error('Render error');
		});

		getCheckYourEmailAccessCodePage(req, res);

		expect(res.render).toHaveBeenNthCalledWith(2,'partials/problem-with-service.njk');
	});
});

