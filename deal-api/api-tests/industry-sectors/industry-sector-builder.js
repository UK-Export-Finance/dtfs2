module.exports = overrides => ({
  code: '1015',
  name: 'Education',
  classes: [
    {
      code: '85100',
      name: 'Pre-primary education',
    }, {
      code: '85200',
      name: 'Primary education',
    }, {
      code: '85310',
      name: 'General secondary education',
    }, {
      code: '85320',
      name: 'Technical and vocational secondary education',
    }, {
      code: '85410',
      name: 'Post-secondary non-tertiary education',
    }, {
      code: '85421',
      name: 'First-degree level higher education',
    }, {
      code: '85422',
      name: 'Post-graduate level higher education',
    }, {
      code: '85510',
      name: 'Sports and recreation education',
    }, {
        code: '85520',
        name: 'Cultural education',
      }, {
        code: '85530',
        name: 'Driving school activities',
      }, {
        code: '85590',
        name: 'Other education n.e.c.',
      }, {
        code: '85600',
        name: 'Educational support services',
      },
  ],
  ...overrides,
});
