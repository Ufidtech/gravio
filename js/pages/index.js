checkSession();

const student = loadStudent();
const semesters = loadSemesters();
const pledges = loadPledges();
const inPages = window.location.pathname.includes("/pages/");
const onboardingPath = inPages ? "onboarding.html" : "pages/onboarding.html";
const pledgePath = inPages ? "pledge.html" : "pages/pledge.html";

if (!student) {
  window.location.replace(onboardingPath);
} else {
  /* Top bar */
  document.getElementById("greeting").textContent =
    `${getTimeGreeting()}, ${student.firstName}`;
  document.getElementById("avatar").textContent = student.initials;

  /* Route to correct state */
  if (semesters.length === 0) {
    document.getElementById("state-empty").classList.remove("hidden");
    document.getElementById("empty-cgpa").textContent =
      student.currentCGPA.toFixed(2);
    document.getElementById("empty-target").textContent =
      student.targetCGPA.toFixed(2);
  } else {
    document.getElementById("state-loaded").classList.remove("hidden");

    const liveCGPA = student.calculateCGPA(semesters);
    const liveTotalUnits = semesters.reduce(
      (s, sem) => s + sem.courses.reduce((a, c) => a + c.creditUnits, 0),
      student.totalUnitsDone,
    );

    document.getElementById("live-cgpa").textContent = liveCGPA.toFixed(2);
    document.getElementById("live-target").textContent =
      student.targetCGPA.toFixed(2);

    /* Orbit summary */
    const recovery = student.getRecoveryPath(liveCGPA, liveTotalUnits);
    const badge = document.getElementById("orbit-badge");
    badge.textContent = recovery.status;
    badge.className = `badge ${recovery.statusClass}`;
    document.getElementById("orbit-need-text").textContent =
      `Need ${recovery.neededGPA.toFixed(2)} per semester · ${student.remainingSemesters} left`;

    /* Progress bar: animate after DOM paint */
    const pct = Math.min(100, (liveCGPA / student.targetCGPA) * 100);
    document.getElementById("pbar-left").textContent = liveCGPA.toFixed(2);
    document.getElementById("pbar-right").textContent =
      liveCGPA >= student.targetCGPA
        ? "Target already passed ✓"
        : student.targetCGPA.toFixed(2);
    requestAnimationFrame(() => {
      document.getElementById("pbar-fill").style.width = pct + "%";
    });

    /* Pledge preview: show first 2 rules of active pledge */
    const activePledge = pledges.find((p) => p.isSigned);
    const pledgeSec = document.getElementById("pledge-section");
    if (activePledge) {
      const rules = activePledge.rules.filter((r) => r.trim()).slice(0, 2);
      pledgeSec.innerHTML = `
        <div class="sec-hd">Active Pledge</div>
        <div class="g-card">
          ${rules
            .map(
              (r, i) => `
            <div class="pledge-rule-row">
              <div class="p-num">${i + 1}</div>
              <span>${r}</span>
            </div>`,
            )
            .join("")}
        </div>`;
    } else {
      pledgeSec.innerHTML = `
        <div class="sec-hd">Active Pledge</div>
        <a href="${pledgePath}" style="display:block; font-size:13px; color:var(--g-accent); padding: var(--sp-2) 0; text-decoration:none;">
          Write your Pledge for this semester →
        </a>`;
    }
  }
}
