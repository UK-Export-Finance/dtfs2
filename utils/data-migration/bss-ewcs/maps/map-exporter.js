const mapExporter = (v1Deal) => {
  const mapped = {
    companyName: v1Deal.Deal_information.Exporter_and_indemnifier.Exporter_name,
  };

  return mapped;
};

module.exports = mapExporter;
