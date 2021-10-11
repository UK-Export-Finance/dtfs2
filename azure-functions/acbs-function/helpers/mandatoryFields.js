const findMissingMandatory = (data, mandatoryFields) => mandatoryFields.map((mf) => (data[mf] ? '' : mf)).filter((mf) => mf !== '');

module.exports = {
  findMissingMandatory,
};
