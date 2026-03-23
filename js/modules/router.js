function checkSession() {
  if (!loadStudent()) {
    const inPages = window.location.pathname.includes("/pages/");
    window.location.replace(
      inPages ? "onboarding.html" : "pages/onboarding.html",
    );
  }
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
