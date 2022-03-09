/*
      calculate Guarantee fee from a Margin Fee Input value.
      For a Bond, uses Risk Margin Fee.
      For a Loan, uses Interest Margin Fee.
    */

const riskMarginFeeInput = document.getElementById('riskMarginFee');
const interestMarginFeeInput = document.getElementById('interestMarginFee');
const guaranteeFeeInput = document.getElementById('guaranteeFeePayableByBank');

const marginFeeInput = riskMarginFeeInput || interestMarginFeeInput;

function calculateGuaranteeFee() {
  const result = marginFeeInput.value * 0.9;
  const formattedResult = result.toLocaleString('en', { minimumFractionDigits: 4 });

  guaranteeFeeInput.value = formattedResult;
}

if (marginFeeInput) {
  marginFeeInput.addEventListener('blur', () => {
    calculateGuaranteeFee();
  });
}
