const icons = document.querySelector(".sidebar span.icons");
const linkMenu = document.querySelector(".sidebar .dropdown .link-menu");

icons.addEventListener("click", function () {
  icons.classList.toggle("active-icons");
  linkMenu.classList.toggle("active-dropdown");
});