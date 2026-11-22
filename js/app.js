// LuponResolve - frontend entry point

// Confirm that the browser has loaded and connected this JavaScript file.
console.log("LuponResolve frontend is running.");

// Display the current year in the footer.
const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* ==========================================
   MOBILE NAVIGATION — HAMBURGER MENU
========================================== */

(() => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNavigation = document.getElementById("mainNavigation");

    if (!menuToggle || !mainNavigation) {
        return;
    }

    function closeMenu() {
        menuToggle.classList.remove("active");
        mainNavigation.classList.remove("is-open");

        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }

    function toggleMenu() {
        const isOpen = mainNavigation.classList.toggle("is-open");

        menuToggle.classList.toggle("active", isOpen);

        menuToggle.setAttribute("aria-expanded", String(isOpen));

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    }

    // Open and close using hamburger button
    menuToggle.addEventListener("click", toggleMenu);

    // Close after selecting a navigation link
    mainNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    // Close when pressing Escape
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    // Close menu if the screen returns to desktop size
    window.addEventListener("resize", () => {
        if (window.innerWidth > 800) {
            closeMenu();
        }
    });
})();
