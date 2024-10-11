const FORM_ID = 'accept-sso-redirect-form';

const form = document.getElementById(FORM_ID) as HTMLFormElement;

if (form) {
  form.submit();
}
