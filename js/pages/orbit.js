checkSession();

let student = loadStudent();
const semesters = loadSemesters();

const emptyState = document.getElementById("state-empty");
const loadedState = document.getElementById("state-loaded");
const topSub = document.getElementById("top-sub");

const orbitGpaNum = document.getElementById("orbit-gpa-num");
const orbitBadge = document.getElementById("orbit-badge");
const orbitMsg = document.getElementById("orbit-msg");
const orCgpa = document.getElementById("or-cgpa");
const targetDisplay = document.getElementById("target-display");
const semsDisplay = document.getElementById("sems-display");
const pbarFill = document.getElementById("pbar-fill");
const pbarLeft = document.getElementById("pbar-left");
const pbarRight = document.getElementById("pbar-right");

const droppedOverlay = document.getElementById("dropped-overlay");
const droppedInput = document.getElementById("dropped-input");
const droppedResult = document.getElementById("dropped-result");

const scenarioPanel = document.getElementById("scenario-panel");
const scenarioResults = document.getElementById("scenario-results");

function getLiveTotalUnits() {
  return semesters.reduce(
    (sum, sem) =>
      sum + sem.courses.reduce((acc, c) => acc + Number(c.creditUnits || 0), 0),
    Number(student.totalUnitsDone || 0),
  );
}

function render() {
  if (!semesters.length) {
    emptyState.classList.remove("hidden");
    loadedState.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  loadedState.classList.remove("hidden");

  const liveCGPA = student.calculateCGPA(semesters);
  const liveUnits = getLiveTotalUnits();
  const recovery = student.getRecoveryPath(liveCGPA, liveUnits);

  topSub.textContent = `${getTimeGreeting()}, ${student.firstName}`;

  orbitGpaNum.textContent = recovery.neededGPA.toFixed(2);
  orbitGpaNum.classList.toggle("am", recovery.gpaClass === "am");
  orbitGpaNum.classList.toggle("rd", recovery.gpaClass === "rd");

  orbitBadge.textContent = recovery.status;
  orbitBadge.className = `badge ${recovery.statusClass}`;
  orbitMsg.textContent = recovery.message;

  orCgpa.textContent = liveCGPA.toFixed(2);
  targetDisplay.textContent = student.targetCGPA.toFixed(2);
  semsDisplay.textContent = String(student.remainingSemesters);

  const pct = Math.max(0, Math.min(100, (liveCGPA / student.targetCGPA) * 100));
  pbarLeft.textContent = liveCGPA.toFixed(2);
  pbarRight.textContent = student.targetCGPA.toFixed(2);
  requestAnimationFrame(() => {
    pbarFill.style.width = `${pct}%`;
  });
}

function showDropped() {
  droppedOverlay.classList.remove("hidden");
  droppedInput.focus();
}

function closeDropped() {
  droppedOverlay.classList.add("hidden");
  droppedResult.style.display = "none";
  droppedResult.textContent = "";
  droppedInput.value = "";
}

function confirmDropped() {
  const actual = Number(droppedInput.value || 0);
  const scale = Number(student.gradingSystem || 5);
  if (!Number.isFinite(actual) || actual < 0 || actual > scale) {
    alert(`Enter a GPA between 0 and ${scale.toFixed(1)}.`);
    return;
  }

  const liveCGPA = student.calculateCGPA(semesters);
  const liveUnits = getLiveTotalUnits();
  const avgUnits = Math.max(
    1,
    Math.round(
      liveUnits / Math.max(1, semesters.length + student.semestersCompleted),
    ),
  );

  const adjustedQP =
    liveCGPA * liveUnits - liveCGPA * avgUnits + actual * avgUnits;
  const adjustedCGPA = adjustedQP / Math.max(1, liveUnits);
  const recovery = student.getRecoveryPath(adjustedCGPA, liveUnits);

  droppedResult.style.display = "block";
  droppedResult.textContent = `If last semester GPA was ${actual.toFixed(2)}, your adjusted CGPA is ${adjustedCGPA.toFixed(2)} and you now need about ${recovery.neededGPA.toFixed(2)} per semester.`;
}

function startEditTarget() {
  const input = document.createElement("input");
  input.className = "edit-inline-input";
  input.type = "number";
  input.step = "0.01";
  input.min = "1.0";
  input.max = student.gradingSystem || "5.0";
  input.value = student.targetCGPA.toFixed(2);

  targetDisplay.replaceWith(input);
  input.focus();

  const commit = () => {
    const next = Number(input.value || student.targetCGPA);
    const max = Number(student.gradingSystem || 5);
    student.targetCGPA = Math.max(1, Math.min(max, next));
    saveStudent(student);

    input.replaceWith(targetDisplay);
    render();
  };

  input.addEventListener("blur", commit, { once: true });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
}

function startEditSems() {
  const input = document.createElement("input");
  input.className = "edit-inline-input";
  input.type = "number";
  input.step = "1";
  input.min = "1";
  input.max = "12";
  input.value = String(student.remainingSemesters || 4);

  semsDisplay.replaceWith(input);
  input.focus();

  const commit = () => {
    const next = Number(input.value || student.remainingSemesters || 4);
    student.remainingSemesters = Math.max(1, Math.min(12, Math.round(next)));

    const liveUnits = getLiveTotalUnits();
    const avgUnitsPerSem = Math.max(
      18,
      Math.round(liveUnits / Math.max(1, student.semestersCompleted || 1)),
    );
    student.remainingUnits = student.remainingSemesters * avgUnitsPerSem;

    saveStudent(student);
    input.replaceWith(semsDisplay);
    render();
  };

  input.addEventListener("blur", commit, { once: true });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
}

function runScenario() {
  if (scenarioPanel.classList.contains("hidden")) {
    scenarioPanel.classList.remove("hidden");
  }

  const liveCGPA = student.calculateCGPA(semesters);
  const liveUnits = getLiveTotalUnits();
  const targets = [4.5, 3.5, 2.4, 1.5].filter(
    (t) => t <= Number(student.gradingSystem || 5),
  );

  scenarioResults.innerHTML = targets
    .map((t) => {
      const rec = student.getRecoveryPath(
        liveCGPA,
        liveUnits,
        t,
        student.remainingUnits,
      );
      return `
      <div class="orbit-row">
        <span class="or-lbl">Target ${t.toFixed(2)}</span>
        <span class="or-val ${rec.gpaClass || ""}">${rec.neededGPA.toFixed(2)} · ${rec.status}</span>
      </div>`;
    })
    .join("");
}

render();

window.showDropped = showDropped;
window.closeDropped = closeDropped;
window.confirmDropped = confirmDropped;
window.startEditTarget = startEditTarget;
window.startEditSems = startEditSems;
window.runScenario = runScenario;
