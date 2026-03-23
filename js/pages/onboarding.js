let selectedScale = 5.0;
let selectedTarget = 4.5;

const levelToRemainingSemesters = {
  100: 8,
  200: 6,
  300: 4,
  400: 2,
  500: 2,
};

function showStep(step) {
  [1, 2, 3].forEach((n) => {
    document.getElementById(`step-${n}`).classList.toggle("hidden", n !== step);
  });
}

function setError(id, visible) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = visible ? "block" : "none";
}

function selectScale(el) {
  document.querySelectorAll("#scale-grid .scale-opt").forEach((opt) => {
    opt.classList.remove("on");
  });
  el.classList.add("on");
  selectedScale = Number(el.dataset.scale || 5.0);
}

function selectTarget(el) {
  document.querySelectorAll("#tg-grid .tg-opt").forEach((opt) => {
    opt.classList.remove("on");
  });
  el.classList.add("on");
  selectedTarget = Number(el.dataset.target || 4.5);
}

function goStep(step) {
  if (step === 2) {
    const name = document.getElementById("s1-name").value.trim();
    const isValid = name.length > 0;
    setError("err-name", !isValid);
    if (!isValid) return;
  }

  if (step === 3) {
    const cgpa = Number(document.getElementById("s2-cgpa").value || 0);
    const validCgpa =
      Number.isFinite(cgpa) && cgpa >= 0 && cgpa <= selectedScale;
    setError("err-cgpa", !validCgpa);
    if (!validCgpa) return;
  }

  showStep(step);
}

function finish() {
  const remaining = Number(document.getElementById("s3-remaining").value || 0);
  const validRemaining = Number.isFinite(remaining) && remaining >= 1;
  setError("err-remaining", !validRemaining);
  if (!validRemaining) return;

  const level = document.getElementById("s1-level").value;
  const semestersCompleted = Number(
    document.getElementById("s2-sems").value || 0,
  );
  const totalUnitsDone = Number(document.getElementById("s2-units").value || 0);
  const currentCGPA = Number(document.getElementById("s2-cgpa").value || 0);

  const estimatedRemainingUnits = Math.max(remaining * 24, 0);

  const student = new Student({
    name: document.getElementById("s1-name").value.trim(),
    level,
    department: document.getElementById("s1-dept").value.trim(),
    university: document.getElementById("s1-uni").value.trim(),
    gradingSystem: selectedScale.toFixed(1),
    currentCGPA,
    semestersCompleted,
    totalUnitsDone,
    targetCGPA: selectedTarget,
    remainingUnits: estimatedRemainingUnits,
    remainingSemesters: remaining,
  });

  saveStudent(student);
  if (!localStorage.getItem("gravio_semesters")) {
    saveSemesters([]);
  }
  if (!localStorage.getItem("gravio_pledges")) {
    savePledges([]);
  }

  window.location.replace("home.html");
}

function prefillFromExistingStudent() {
  const existing = loadStudent();
  if (!existing) return;

  document.getElementById("s1-name").value = existing.name || "";
  document.getElementById("s1-level").value = existing.level || "";
  document.getElementById("s1-dept").value = existing.department || "";
  document.getElementById("s1-uni").value = existing.university || "";
  document.getElementById("s2-cgpa").value = Number(
    existing.currentCGPA || 0,
  ).toFixed(2);
  document.getElementById("s2-sems").value = existing.semestersCompleted || 0;
  document.getElementById("s2-units").value = existing.totalUnitsDone || 0;
  document.getElementById("s3-remaining").value =
    existing.remainingSemesters || 4;

  selectedScale = Number(existing.gradingSystem || 5.0);
  document.querySelectorAll("#scale-grid .scale-opt").forEach((opt) => {
    opt.classList.toggle("on", Number(opt.dataset.scale) === selectedScale);
  });

  selectedTarget = Number(existing.targetCGPA || 4.5);
  document.querySelectorAll("#tg-grid .tg-opt").forEach((opt) => {
    opt.classList.toggle("on", Number(opt.dataset.target) === selectedTarget);
  });
}

function handleLevelAutoFill() {
  const levelSel = document.getElementById("s1-level");
  if (!levelSel) return;

  levelSel.addEventListener("change", () => {
    const level = Number(levelSel.value || 0);
    const suggested = levelToRemainingSemesters[level];
    if (suggested) {
      document.getElementById("s3-remaining").value = suggested;
    }
  });
}

showStep(1);
setError("err-name", false);
setError("err-cgpa", false);
setError("err-remaining", false);
prefillFromExistingStudent();
handleLevelAutoFill();

window.selectScale = selectScale;
window.selectTarget = selectTarget;
window.goStep = goStep;
window.finish = finish;
