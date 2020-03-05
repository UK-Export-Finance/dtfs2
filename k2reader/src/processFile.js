const readK2Xml = require('./read-k2-type-a-xml');
const translate = require('./translate');

module.exports = async (file) => {
  const xmlContent = await readK2Xml(file);
  return translate(xmlContent);;
}
