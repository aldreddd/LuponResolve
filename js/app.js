// LuponResolve - frontend entry point

// Confirm that the browser has loaded and connected this JavaScript file.
console.log("LuponResolve frontend is running.");

// Display the current year in the footer.
const currentYear = document.getElementById("currentYear");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}
