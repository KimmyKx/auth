const icons = document.querySelector(".sidebar span.icons");
const linkMenu = document.querySelector(".sidebar .dropdown .link-menu");

icons.addEventListener("click", function() {
    
    icons.classList.toggle("active-icons");
    linkMenu.classList.toggle("active-dropdown");

});


// Responsive sidebar

const menuToggle = document.querySelector(".menu-toggle #add");
const sidebar = document.querySelector(".sidebar");
const removeMenuToggle = document.querySelector(".menu-toggle #remove")

menuToggle.addEventListener("click", function() {
    sidebar.classList.toggle("active-sidebar");
});

removeMenuToggle.addEventListener("click", function() {
    sidebar.classList.remove("active-sidebar");
});


// Info Data User 
const checkDataUser = document.querySelector(".navbar a.check-data-user");
const sidebarDataUser = document.getElementById("sidebar-data-user");
const closeButton = document.querySelector(".sidebar-data-user #kembali");

// Tambah Class
checkDataUser.addEventListener("click", function() {
    sidebarDataUser.classList.add("sidebar-data-aktif");
});

// Remove Class
closeButton.addEventListener("click", function() {
    sidebarDataUser.classList.remove("sidebar-data-aktif");
});

