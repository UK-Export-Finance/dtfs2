async function makeGetRequest(targetHref, selectedFeeRecordIds) {  const baseUrl = window.location.origin;
  const url = new URL(targetHref, baseUrl);

  const urlWithParams = new URL(url);
  urlWithParams.search = new URLSearchParams({
    selectedFeeRecordIds,
  }).toString();

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    console.log('Redirecting with selected fee record IDs:', urlWithParams.toString());
    window.location.href = urlWithParams.toString();
  } catch (error) {
    console.error('Error:', error);
    console.error('Redirecting without selected fee record IDs:', url.toString());
    window.location.href = url.toString();
  }  }

function setupRedirect() {
  const targetHref = document.currentScript.getAttribute('data-target-href');
  const selectedFeeRecordIds = JSON.parse(document.currentScript.getAttribute('data-fee-records'));

  if (!targetHref || !selectedFeeRecordIds || selectedFeeRecordIds.length === 0) {
    return;
  }

  const backLink = document.getElementById('back-link');
  const cancelButton = document.getElementById('cancel-button');

  const handleRedirect = async () => await makeGetRequest(targetHref, selectedFeeRecordIds);

  // TODO FN-3293: Pull out these two into a separate generic function.

  backLink.setAttribute('href', '#');
  backLink.addEventListener('click', handleRedirect);
  
  cancelButton.setAttribute('href', '#');
  cancelButton.addEventListener('click', handleRedirect);
}

setupRedirect();
