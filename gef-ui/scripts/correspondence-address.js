function CorrespondenceAddress() {
  const yesCorrespondenceRadio = document.getElementById('correspondence');
  const conditionalCorrespondence = document.getElementById('conditional-correspondence');

  const toggle = (bool) => {
    if (bool) {
      conditionalCorrespondence.className = 'govuk-visually-hidden';
    } else {
      conditionalCorrespondence.className = '';
    }
  };

  if (yesCorrespondenceRadio.checked) {
    toggle(false);
  } else {
    toggle(true);
  }

  return { toggle };
}

const correspondenceAddress = new CorrespondenceAddress();

document.querySelector('[data-cy="correspondence-yes"]').addEventListener('click', () => {
  correspondenceAddress.toggle(false);
});

document.querySelector('[data-cy="correspondence-no"]').addEventListener('click', () => {
  correspondenceAddress.toggle(true);
});
