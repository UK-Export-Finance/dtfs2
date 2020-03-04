const getContent = require('./k2xml-reader');
const translate = require('./translate');

module.exports = async (file) => {
  const xmlContent = await getContent(file);
  const internalRepresentation = await translate( xmlContent );

  return internalRepresentation;
}
