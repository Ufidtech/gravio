checkSession();

let student = loadStudent();
const semesters = loadSemesters();

const profRead = document.getElementById("prof-read");
const profEdit = document.getElementById("prof-edit");
const historyList = document.getElementById("history-list");

function renderProfile() {
  document.getElementById("prof-av").textContent = student.initials;
  document.getElementById("prof-av-edit").textContent = student.initials;
  document.getElementById("prof-name-display").textContent =
    student.name || "Student";
  document.getElementById("prof-sub-display").textContent =
    `${student.department || "Department"} · ${student.level || ""} Level · ${student.university || ""}`;
  document.getElementById("prof-scale-badge").textContent =
    `${Number(student.gradingSystem || 5).toFixed(1)} Scale`;

  document.getElementById("edit-name").value = student.name || "";
  document.getElementById("edit-level").value = student.level || "100";
  document.getElementById("edit-dept").value = student.department || "";
  document.getElementById("edit-uni").value = student.university || "";
}

function renderHistory() {
  if (!semesters.length) {
    historyList.innerHTML =
      '<div class="empty-state"><div class="es-sub">No semester history yet.</div></div>';
    return;
  }

  historyList.innerHTML = semesters
    .map((sem) => {
      const gpa = sem.getSemesterGPA();
      const gpaClass = gpa >= 4 ? "" : gpa >= 3 ? "am" : "rd";
      return `
      <div class="hist-row">
        <div>
          <div class="hist-name">${sem.semesterLabel || "Semester"}</div>
          <div class="hist-sub">${sem.courses.length} courses · ${sem.totalCreditUnits} units</div>
        </div>
        <div class="hist-gpa ${gpaClass}">${gpa.toFixed(2)}</div>
      </div>`;
    })
    .join("");
}

function enterEditMode() {
  profRead.classList.add("hidden");
  profEdit.classList.remove("hidden");
}

function cancelEdit() {
  profEdit.classList.add("hidden");
  profRead.classList.remove("hidden");
  renderProfile();
}

function saveEdit() {
  const nextName = document.getElementById("edit-name").value.trim();
  if (!nextName) {
    alert("Name cannot be empty.");
    return;
  }

  student.name = nextName;
  student.level = document.getElementById("edit-level").value;
  student.department = document.getElementById("edit-dept").value.trim();
  student.university = document.getElementById("edit-uni").value.trim();

  saveStudent(student);
  cancelEdit();
}

function showResetConfirm() {
  document.getElementById("reset-card").classList.remove("hidden");
  document.getElementById("reset-input").focus();
}

function hideResetConfirm() {
  document.getElementById("reset-card").classList.add("hidden");
  document.getElementById("reset-input").value = "";
  document.getElementById("reset-confirm-btn").disabled = true;
}

function toggleResetBtn() {
  const value = document.getElementById("reset-input").value.trim();
  document.getElementById("reset-confirm-btn").disabled = value !== "RESET";
}

function confirmReset() {
  const value = document.getElementById("reset-input").value.trim();
  if (value !== "RESET") return;

  resetGravio();
  window.location.replace("onboarding.html");
}

renderProfile();
renderHistory();
hideResetConfirm();

window.enterEditMode = enterEditMode;
window.cancelEdit = cancelEdit;
window.saveEdit = saveEdit;
window.showResetConfirm = showResetConfirm;
window.hideResetConfirm = hideResetConfirm;
window.toggleResetBtn = toggleResetBtn;
window.confirmReset = confirmReset;
