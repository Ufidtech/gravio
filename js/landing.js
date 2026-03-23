/* Nav scroll effect */
window.addEventListener("scroll", () => {
  document
    .getElementById("navbar")
    .classList.toggle("scrolled", window.scrollY > 40);
});

/* Scroll reveal with IntersectionObserver */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

/* Smart "Launch App" link — if student exists, go to dashboard, else onboarding */
function getAppLink() {
  const hasStudent = localStorage.getItem("gravio_student");
  return hasStudent ? "pages/home.html" : "pages/onboarding.html";
}

document
  .querySelectorAll('a[href$="pages/onboarding.html"]')
  .forEach((link) => {
    link.href = getAppLink();
  });
