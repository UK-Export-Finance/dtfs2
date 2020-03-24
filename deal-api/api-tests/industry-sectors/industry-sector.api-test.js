const wipeDB = require('../wipeDB');
const anIndustrySector = require('./industry-sector-builder');

const app = require('../../src/createApp');

const {
  get,
  post,
  put,
  remove,
} = require('../api')(app);

describe('an industry sector', () => {
  const mockClasses = [
    { code: 'b', name: 'b' },
    { code: 'c', name: 'c' },
    { code: 'a', name: 'a' },
  ];

  const mockIndustrySectors = {
    100: {
      code: '100',
      name: 'AAAA',
      classes: mockClasses,
    },
    200: {
      code: '200',
      name: 'PPPP',
      classes: mockClasses,
    },
    300: {
      code: '300',
      name: 'MMMM',
      classes: mockClasses,
    },
  };

  const newSector = anIndustrySector({ code: mockIndustrySectors['100'].code });
  const updatedSector = anIndustrySector({
    code: mockIndustrySectors['100'].code,
    name: mockIndustrySectors['100'].name,
  });

  beforeEach(async () => {
    await wipeDB();
  });

  it('a newly added industry sector is returned when we list all industry sectors', async () => {
    await post(newSector).to('/api/industry-sectors');

    const { status, body } = await get('/api/industry-sectors');

    const addedIndustrySector = body.industrySectors.find((i) => i.code === mockIndustrySectors['100'].code);

    expect(status).toEqual(200);

    const expectedNewSector = {
      ...mockIndustrySectors['100'],
      classes: [
        { code: 'a' },
        { code: 'b' },
        { code: 'c' },
      ],
    };
    expect(addedIndustrySector).toMatchObject(expectedNewSector);
  });

  it('an industry sector can be updated', async () => {
    await post(newSector).to('/api/industry-sectors');
    await put(updatedSector).to('/api/industry-sectors/100');

    const { status, body } = await get('/api/industry-sectors/100');

    expect(status).toEqual(200);
    expect(body).toMatchObject(updatedSector);
  });

  it('an industry sector can be deleted', async () => {
    await post(newSector).to('/api/industry-sectors');
    await remove('/api/industry-sectors/100');

    const { status, body } = await get('/api/industry-sectors/100');

    expect(status).toEqual(200);
    expect(body).toMatchObject({});
  });

  it('lists industry sectors and their child classes in alphabetical order', async () => {
    await post(mockIndustrySectors['200']).to('/api/industry-sectors');
    await post(mockIndustrySectors['300']).to('/api/industry-sectors');
    await post(mockIndustrySectors['100']).to('/api/industry-sectors');

    const { status, body } = await get('/api/industry-sectors');

    const expectedClasses = [
      { code: 'a' },
      { code: 'b' },
      { code: 'c' },
    ];

    const expected = [
      { ...mockIndustrySectors['100'], classes: expectedClasses },
      { ...mockIndustrySectors['300'], classes: expectedClasses },
      { ...mockIndustrySectors['200'], classes: expectedClasses },
    ];

    expect(status).toEqual(200);
    expect(body.industrySectors).toMatchObject(expected);
  });
});
