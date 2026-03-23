checkSession();

let student = loadStudent();
let semesters = loadSemesters();
let activeSemIndex = -1;
let activeCourses = [];

const semWrap = document.getElementById("sem-selector-wrap");
const semSelector = document.getElementById("sem-selector");
const emptyState = document.getElementById("empty-state");
const courseArea = document.getElementById("course-area");
const courseList = document.getElementById("course-list");
const newSemForm = document.getElementById("new-sem-form");
const newSemLabelInput = document.getElementById("new-sem-label");
const topSub = document.getElementById("top-sub");
const rbSem = document.getElementById("rb-sem");
const rbCum = document.getElementById("rb-cum");

function refreshSemesterSelector() {
  semSelector.innerHTML = semesters
    .map(
      (sem, idx) =>
        `<option value="${idx}">${sem.semesterLabel || `Semester ${idx + 1}`}</option>`,
    )
    .join("");

  if (activeSemIndex >= 0 && activeSemIndex < semesters.length) {
    semSelector.value = String(activeSemIndex);
  }
}

function renderStates() {
  const hasSemesters = semesters.length > 0;
  semWrap.classList.toggle("hidden", !hasSemesters);
  emptyState.classList.toggle("hidden", hasSemesters);
  courseArea.classList.toggle("hidden", !hasSemesters);

  if (!hasSemesters) {
    topSub.textContent = "Add your first semester";
    rbSem.textContent = "0.00";
    rbCum.textContent = (student.currentCGPA || 0).toFixed(2);
    return;
  }

  refreshSemesterSelector();
  if (activeSemIndex < 0 || activeSemIndex >= semesters.length) {
    activeSemIndex = semesters.length - 1;
  }

  semSelector.value = String(activeSemIndex);
  loadActiveSemesterIntoEditor();
}

function loadActiveSemesterIntoEditor() {
  const sem = semesters[activeSemIndex];
  if (!sem) return;

  topSub.textContent = sem.semesterLabel || "Active semester";
  activeCourses = sem.courses.map((c) => ({
    courseCode: c.courseCode || "",
    creditUnits: Number(c.creditUnits || 0),
    grade: c.grade || "A",
  }));

  if (activeCourses.length === 0) {
    addCourseRow();
  } else {
    renderCourseRows();
  }
  refreshResults();
}

function renderCourseRows() {
  courseList.innerHTML = activeCourses
    .map((course, idx) => {
      const selected = (g) => (course.grade === g ? "selected" : "");
      return `
      <div class="g-card" data-course-row="${idx}">
        <label class="field-label">Course code</label>
        <input class="g-inp" type="text" placeholder="e.g. CSC301" value="${course.courseCode}" oninput="updateCourseField(${idx}, 'courseCode', this.value)" />

        <label class="field-label">Credit units</label>
        <input class="g-inp" type="number" min="1" max="12" placeholder="e.g. 3" value="${course.creditUnits || ""}" oninput="updateCourseField(${idx}, 'creditUnits', this.value)" />

        <div class="rb-row" style="margin-top: -2px;">
          <label class="field-label" style="margin-bottom: 0;">Grade</label>
          <button class="cr-delete" onclick="removeCourseRow(${idx})" title="Remove course">×</button>
        </div>
        <select class="g-sel-grade" onchange="updateCourseField(${idx}, 'grade', this.value)">
          <option value="A" ${selected("A")}>A</option>
          <option value="B" ${selected("B")}>B</option>
          <option value="C" ${selected("C")}>C</option>
          <option value="D" ${selected("D")}>D</option>
          <option value="E" ${selected("E")}>E</option>
          <option value="F" ${selected("F")}>F</option>
        </select>
      </div>`;
    })
    .join("");
}

function refreshResults() {
  const validCourses = activeCourses
    .filter((c) => c.courseCode.trim() && Number(c.creditUnits) > 0)
    .map(
      (c) =>
        new Course({
          courseCode: c.courseCode.trim().toUpperCase(),
          creditUnits: Number(c.creditUnits),
          grade: c.grade,
        }),
    );

  const persistedOtherSemesters = semesters.filter(
    (_, idx) => idx !== activeSemIndex,
  );

  rbSem.textContent = calcSemesterGPA(validCourses).toFixed(2);
  rbCum.textContent = calcCumulativeCGPA(
    student,
    persistedOtherSemesters,
    validCourses,
  ).toFixed(2);
}

function showNewSemForm() {
  newSemForm.classList.remove("hidden");
  newSemLabelInput.focus();
}

function cancelNewSem() {
  newSemForm.classList.add("hidden");
  newSemLabelInput.value = "";
}

function createSemester() {
  const label = newSemLabelInput.value.trim();
  if (!label) {
    alert("Enter a semester label first.");
    return;
  }

  const sem = new Semester({
    semesterLabel: label,
    courses: [],
    isCompleted: false,
  });
  semesters.push(sem);
  saveSemesters(semesters);

  activeSemIndex = semesters.length - 1;
  cancelNewSem();
  renderStates();
}

function onSemChange() {
  activeSemIndex = Number(semSelector.value || 0);
  loadActiveSemesterIntoEditor();
}

function addCourseRow() {
  activeCourses.push({ courseCode: "", creditUnits: 3, grade: "A" });
  renderCourseRows();
  refreshResults();
}

function removeCourseRow(index) {
  activeCourses.splice(index, 1);
  if (activeCourses.length === 0) addCourseRow();
  renderCourseRows();
  refreshResults();
}

function updateCourseField(index, field, value) {
  if (!activeCourses[index]) return;
  if (field === "creditUnits") {
    activeCourses[index][field] = Number(value || 0);
  } else {
    activeCourses[index][field] = value;
  }
  refreshResults();
}

function saveSemester() {
  if (activeSemIndex < 0 || !semesters[activeSemIndex]) return;

  const sanitized = activeCourses
    .filter((c) => c.courseCode.trim() && Number(c.creditUnits) > 0)
    .map(
      (c) =>
        new Course({
          courseCode: c.courseCode.trim().toUpperCase(),
          creditUnits: Number(c.creditUnits),
          grade: c.grade,
        }),
    );

  if (sanitized.length === 0) {
    alert("Add at least one valid course before saving.");
    return;
  }

  semesters[activeSemIndex].courses = sanitized;
  semesters[activeSemIndex].isCompleted = true;
  saveSemesters(semesters);

  const btn = document.getElementById("save-btn");
  const oldText = btn.textContent;
  btn.textContent = "Saved ✓";
  btn.classList.add("saved-state");
  setTimeout(() => {
    btn.textContent = oldText;
    btn.classList.remove("saved-state");
  }, 1100);

  refreshResults();
}

renderStates();

window.showNewSemForm = showNewSemForm;
window.cancelNewSem = cancelNewSem;
window.createSemester = createSemester;
window.onSemChange = onSemChange;
window.addCourseRow = addCourseRow;
window.removeCourseRow = removeCourseRow;
window.updateCourseField = updateCourseField;
window.saveSemester = saveSemester;
