import { HttpStatusCode } from 'axios';
import { withSendNewOtpApiTests } from './send-otp-access-code-api-tests';

withSendNewOtpApiTests('new-access-code', 1, { status: HttpStatusCode.Found, location: '/dashboard' });
