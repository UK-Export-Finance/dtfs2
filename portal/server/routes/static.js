const express = require('express');

const router = express.Router();

router.get('/.well-known/security.txt', (req, res) => {
  res.type('text/plain');

  res.write('Contact: https://www.gov.uk/contact/govuk\n');
  res.write('Expires: 2022-12-09T00:00:00.000Z\n');
  res.write('Acknowledgments: https://get-a-guarantee-for-export-finance.service.gov.uk/thanks.txt\n');
  res.write('Preferred-Languages: en\n');
  res.write('Canonical: https://get-a-guarantee-for-export-finance.service.gov.uk/.well-known/security.txt\n');
  res.write('Policy: https://www.gov.uk/guidance/report-a-vulnerability-on-a-ukef-system\n');
  res.write('Hiring: https://www.civilservicejobs.service.gov.uk/\n');

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
