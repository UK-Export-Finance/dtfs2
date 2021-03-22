module.exports = {
  findACBSIndustrySector: (industryId) => ({
    status: 200,
    data: [{ acbsIndustryId: industryId }],
  }),
};
