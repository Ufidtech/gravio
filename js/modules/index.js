const courseListContainer = document.getElementById("course-list-container");
const btnAddCourse = document.getElementById("add-course-btn");
const inputCode = document.getElementById("course-code");
const inputUnits = document.getElementById("course-units");
const selectGrade = document.getElementById("course-grade");

if (
  !courseListContainer ||
  !btnAddCourse ||
  !inputCode ||
  !inputUnits ||
  !selectGrade
) {
  // Skip setup when this module is loaded on another page.
} else {
  btnAddCourse.addEventListener("click", () => {
    const codeValue = inputCode.value.trim().toUpperCase();
    const unitsValue = inputUnits.value.trim();
    const gradeValue = selectGrade.value;

    if (codeValue === "" || unitsValue === "") {
      alert("Please enter both a course code and credit units.");
      return;
    }

    const gradeClass = gradeValue === "B" ? "cr-grade b" : "cr-grade";

    const newRowHTML = `
    <div class="cr-row">
      <div class="cr-info">
        <div class="cr-name">${codeValue}</div>
        <div class="cr-unit">${unitsValue} credit units</div>
      </div>
      <div class="${gradeClass}">${gradeValue}</div>
    </div>
  `;

    courseListContainer.insertAdjacentHTML("beforeend", newRowHTML);

    inputCode.value = "";
    inputUnits.value = "";
    selectGrade.value = "A";
    inputCode.focus();
  });
}

checkSession();

const student = loadStudent();
const semesters = loadSemesters();
const pledges = loadPledges();

/* ── Top bar ── */
const hour = new Date().getHours();
document.getElementById("greeting").textContent =
  `${getTimeGreeting()}, ${student.firstName}`;
document.getElementById("avatar").textContent = student.initials;

/* ── Route to correct state ── */
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

  /* Progress bar — animate after DOM paint */
  const pct = Math.min(100, (liveCGPA / student.targetCGPA) * 100);
  document.getElementById("pbar-left").textContent = liveCGPA.toFixed(2);
  document.getElementById("pbar-right").textContent =
    liveCGPA >= student.targetCGPA
      ? "Target already passed ✓"
      : student.targetCGPA.toFixed(2);
  requestAnimationFrame(() => {
    document.getElementById("pbar-fill").style.width = pct + "%";
  });

  /* Pledge preview — show first 2 rules of active pledge */
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
        <a href="pages/pledge.html" style="display:block; font-size:13px; color:var(--g-accent); padding: var(--sp-2) 0; text-decoration:none;">
          Write your Pledge for this semester →
        </a>`;
  }
}
