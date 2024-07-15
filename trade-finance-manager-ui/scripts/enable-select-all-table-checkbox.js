const selectAllTableCellCheckboxSelector = 'input[type="checkbox"]#select-all-checkbox';
const allTablesWithSelectAllCheckbox = document.querySelectorAll(`table.govuk-table:has(${selectAllTableCellCheckboxSelector}`);

allTablesWithSelectAllCheckbox.forEach(($table) => {
  const selectAllTableCellCheckbox = $table.querySelector(selectAllTableCellCheckboxSelector);

  const allOtherTableCellCheckboxesSelector = 'input[type="checkbox"]:not(#select-all-checkbox)';
  const allOtherTableCellCheckboxes = $table.querySelectorAll(allOtherTableCellCheckboxesSelector);

  const checkAllTableCheckboxes = () => {
    allOtherTableCellCheckboxes.forEach((checkbox) => {
      // eslint-disable-next-line no-param-reassign
      checkbox.checked = true;
    });
  };

  const uncheckAllTableCheckboxes = () => {
    allOtherTableCellCheckboxes.forEach((checkbox) => {
      // eslint-disable-next-line no-param-reassign
      checkbox.checked = false;
    });
  };

  const areAllOtherTableCellCheckboxesChecked = () => Array.prototype.every.call(allOtherTableCellCheckboxes, (checkbox) => checkbox.checked);

  const isAnyOtherTableCellCheckboxNotChecked = () => Array.prototype.some.call(allOtherTableCellCheckboxes, (checkbox) => !checkbox.checked);

  const updateSelectAllTableCellCheckboxOnTableChange = () => {
    if (areAllOtherTableCellCheckboxesChecked()) {
      selectAllTableCellCheckbox.checked = true;
      return;
    }
    if (isAnyOtherTableCellCheckboxNotChecked()) {
      selectAllTableCellCheckbox.checked = false;
    }
  };

  const enableSelectAllTableCheckboxIfPresent = () => {
    if (!selectAllTableCellCheckbox) {
      return;
    }

    selectAllTableCellCheckbox.addEventListener('change', (event) => {
      if (event.target.checked) {
        checkAllTableCheckboxes();
      } else {
        uncheckAllTableCheckboxes();
      }
    });

    if (allOtherTableCellCheckboxes.length !== 0 && areAllOtherTableCellCheckboxesChecked()) {
      selectAllTableCellCheckbox.checked = true;
    }

    allOtherTableCellCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        updateSelectAllTableCellCheckboxOnTableChange();
      });
    });
  };

  enableSelectAllTableCheckboxIfPresent();
});
