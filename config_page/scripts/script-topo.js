const topoGlobal = document.querySelector('#topbarGlobal');
const BtnDigital = document.querySelectorAll('.govsp-link.digital');

if (BtnDigital) {
  for (var i = 0; i < BtnDigital.length; i++) {
    var elemento = BtnDigital[i];
      if (elemento) {
        elemento.remove();
      } 
  }
}

let kebabGov = document.querySelector('.govsp-kebab'),
  middleGov = document.querySelector('.govsp-middle'),
  crossGov = document.querySelector('.govsp-cross'),
  dropdownGov = document.querySelector('.govsp-dropdown');


if(kebabGov){
  kebabGov.addEventListener('click', function () {
    middleGov.classList.toggle('govsp-active');
    crossGov.classList.toggle('govsp-active');
    dropdownGov.classList.toggle('govsp-active');
    kebabGov.classList.toggle('govsp-active');
 
    if(topoGlobal) {
      topoGlobal.classList.toggle('govsp-active');
    }
})
}
