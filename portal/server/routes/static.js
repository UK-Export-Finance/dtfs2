const express = require('express');

const router = express.Router();

router.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain');

  res.write('# DTFS Portal 2.0');
  res.write('\n');
  res.write('Policy: https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system');
  res.write('\n');
  res.write('Contact: https://hackerone.com/7af14fd9-fe4e-4f39-bea1-8f8a364061b8/embedded_submissions/new');
  res.write('\n\n');
  res.write('Contact: https://get-a-guarantee-for-export-finance.service.gov.uk/feedback');
  res.write('\n');
  res.write('Contact: https://www.gov.uk/contact/govuk');
  res.write('\n\n');
  res.write('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt');
  res.write('\n');
  res.write('Hiring: https://www.civilservicejobs.service.gov.uk/');
  res.write('\n\n');
  res.write('Last-Updated: 03-05-2022 10:31:01 UTC');

  res.send();
});

router.get('/thanks.txt', (req, res) => {
  res.type('text/plain');

  res.write('# We would like to thank the following:');
  res.write('\n');
  res.write('# [DD-MM-YYYY] : Name : description');

  res.send();
});

module.exports = router;
