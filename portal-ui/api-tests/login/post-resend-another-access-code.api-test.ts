import { HttpStatusCode } from 'axios';
import { withSendNewOtpApiTests } from './send-otp-access-code-api-tests';

withSendNewOtpApiTests('resend-another-access-code', 0, { status: HttpStatusCode.Found, location: '/dashboard' });
