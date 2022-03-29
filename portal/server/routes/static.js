const express = require('express');

const router = express.Router();

router.get('/security.txt', (req, res) => {
  res.type('text/plain');

  res.write('# DTFS Portal 2.0');
  res.write('\n');
  res.write('Policy: https://www.gov.uk/help/report-vulnerability');
  res.write('\n');
  res.write('Contact: https://hackerone.com/44c348eb-e030-4273-b445-d4a2f6f83ba8/embedded_submissions/new');
  res.write('\n\n');
  res.write('Contact: https://get-a-guarantee-for-export-finance.service.gov.uk/feedback');
  res.write('\n');
  res.write('Contact: https://www.gov.uk/contact/govuk');
  res.write('\n\n');
  res.write('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt');
  res.write('\n');
  res.write('Hiring: https://www.civilservicejobs.service.gov.uk/');
  res.write('\n\n');
  res.write('Last-Updated: 23-03-2022 13:22:00+00:00 GMT');

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
