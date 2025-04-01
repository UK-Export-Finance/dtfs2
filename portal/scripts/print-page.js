const element = document.getElementById('bss-print-button') || document.getElementById('gef-print-button');
if (element) {
  element.addEventListener('click', () => {
    window.print();
  });
}
