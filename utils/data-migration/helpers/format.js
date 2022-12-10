/**
 * Formatting helper functions
 */

/**
    * Strips commas and return UKEF exposure
    * as number.
    * @param {String} string Raw string with commas
    * @param {Boolean} Number Whether output should be a `Number`
    * @returns {Integer} Formatted value
    */
const stripCommas = (string, number = false) => {
  if (string) {
    return number ? Number(string.toString().replace(/,/g, '')) : string.replace(/,/g, '');
  }
  return string;
};

/**
     * Returns deal's total maximum liability in GBP.
     * @param {Array} facilities Array of facilities
     * @returns {Integer} Total of deal's maximum liability in GBP
     */
const getMaximumLiability = (facilities) => {
  if (facilities) {
    return facilities
      .map((f) => stripCommas(f.ukefExposure, true) ?? 0)
      .reduce((p, c) => p + c, 0);
  }

  return 0;
};

/**
   * Returns filtered task as per `taskName`
   * @param {Object} tfm Deal TFM Object
   * @param {String} taskName Interested task name from `Approvals` task group
   * @returns {Array} Filtered task
   */
const filterTask = (tfm, taskName) => {
  if (tfm && taskName) {
    return tfm.tasks
      .filter((t) => t.groupTitle === 'Approvals')
      .map(({ groupTasks }) => groupTasks.filter((t) => t.title === taskName))
      .map((t) => t[0])[0];
  }

  return '';
};

module.exports = {
  stripCommas,
  getMaximumLiability,
  filterTask,
};
