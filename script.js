function toggleMenu(){
    document.getElementById("nav-item").classList.toggle("show")
}

document.addEventListener("DOMContentLoaded", function () {
  new Typed('#typed-text', {
    strings: ["Hey I'm", "Welcome!", "Glad you're here!"],
    typeSpeed: 50,
    backSpeed: 25,
    backDelay: 1000,
    loop: true
  });
});