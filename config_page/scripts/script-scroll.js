
window.onscroll = function changeClass(){
    var scrollPosY = window.pageYOffset | document.body.scrollTop;
    if(scrollPosY > 20) {
        var element = document.getElementById('govsp-kebab');
        element.classList.add('hide-dropdown');
    } else if(scrollPosY <= 20) {
        var element = document.getElementById('govsp-kebab');
        element.classList.remove("hide-dropdown");
    }

}