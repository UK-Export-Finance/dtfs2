const translate = require('./translate');
const xmlReader = require('./k2xml-reader');
const fs = require('fs');

describe('translate', () => {

  it('maps ./example-data/type-a-xml/10002_NEWDEAL.xml -> ./example-data/contract-json/10002_NEWDEAL.json', async () => {
    const xml = await xmlReader('./example-data/type-a-xml/10002_NEWDEAL.xml');
    const expectedJson = fs.readFileSync('./example-data/contract-json/10002_NEWDEAL.json', 'utf-8');
    const prettyExpectedJson = JSON.stringify( JSON.parse(expectedJson),null,2 );

    const actualJson = await translate(xml);
    const prettyActualJson = JSON.stringify(actualJson,null,2);

    expect( prettyActualJson ).toEqual( prettyExpectedJson );
  });

});
