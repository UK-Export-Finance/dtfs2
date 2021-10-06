const findMissingMandatory = (data, mandatoryFields) => mandatoryFields.map((mf) => (data[mf] !== undefined ? '' : mf)).filter((mf) => mf !== '');

module.exports = {
  findMissingMandatory,
};
