import express from 'express';
import { addYear, getISO8601 } from '@ukef/dtfs2-common';

const router = express.Router();
const oneYearInFutureDate = addYear(1);
const IsoExpiryDate = getISO8601(oneYearInFutureDate);

/**
 * get
 * Handles the GET request to serve the security.txt file.
 *
 * This controller returns a plain text response containing various security-related
 * contact information, acknowledgments, preferred languages, canonical URL, policy,
 * and hiring information.
 * @param {Express.Request} Express request
 * @param {Express.Response} Express response
 * @returns {Express.Response.send} security.txt file
 */

/**
 * @openapi
 * /.well-known/security.txt:
 *   get:
 *     summary: GET request for the security page.
 *     tags: [Portal]
 *     description: GET request for the security page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain');

  res.write('Contact: https://www.gov.uk/contact/govuk\n');
  res.write('Contact: https://hackerone.com/7af14fd9-fe4e-4f39-bea1-8f8a364061b8/embedded_submissions/new\n');
  res.write('Contact: https://get-a-guarantee-for-export-finance.service.gov.uk/feedback\n');
  res.write(`Expires: ${IsoExpiryDate}\n`);
  res.write('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt\n');
  res.write('Preferred-Languages: en\n');
  res.write('Canonical: https://get-a-guarantee-for-export-finance.service.gov.uk/.well-known/security.txt\n');
  res.write('Policy: https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system\n');
  res.write('Hiring: https://www.civilservicejobs.service.gov.uk/\n');

  res.send();
});

/**
 * @openapi
 * /thanks.txt:
 *   get:
 *     summary: GET request for the thank you page.
 *     tags: [Portal]
 *     description: GET request for the thank you page.
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/thanks.txt', (req, res) => {
  res.type('text/plain');

  res.write('# We would like to thank the following:');
  res.write('\n');
  res.write('# [DD-MM-YYYY] : Name : description');

  res.send();
});

export default router;
