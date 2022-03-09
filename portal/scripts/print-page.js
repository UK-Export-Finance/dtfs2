const element = document.getElementById('bss-print-button');
if (element) {
  element.addEventListener('click', () => {
    window.print();
  });
}
