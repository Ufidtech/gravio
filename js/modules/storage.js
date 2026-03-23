const KEYS = {
  student: "gravio_student",
  semesters: "gravio_semesters",
  pledges: "gravio_pledges",
};

/* ── Student ── */
function saveStudent(student) {
  localStorage.setItem(KEYS.student, JSON.stringify(student));
}

function loadStudent() {
  const raw = localStorage.getItem(KEYS.student);
  if (!raw) return null;
  return new Student(JSON.parse(raw));
}

/* ── Semesters ── */
function saveSemesters(semesters) {
  localStorage.setItem(
    KEYS.semesters,
    JSON.stringify(semesters.map((s) => s.toJSON())),
  );
}

function loadSemesters() {
  const raw = localStorage.getItem(KEYS.semesters);
  if (!raw) return [];
  return JSON.parse(raw).map((d) => new Semester(d));
}

/* ── Pledges ── */
function savePledges(pledges) {
  localStorage.setItem(KEYS.pledges, JSON.stringify(pledges));
}

function loadPledges() {
  const raw = localStorage.getItem(KEYS.pledges);
  if (!raw) return [];
  return JSON.parse(raw).map((d) => new Pledge(d));
}

/* ── Reset ── */
function resetGravio() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("gravio_"))
    .forEach((k) => localStorage.removeItem(k));
}

/* ── Export ── */
function exportAllData() {
  const blob = new Blob(
    [
      JSON.stringify(
        {
          gravio_student: JSON.parse(
            localStorage.getItem(KEYS.student) || "null",
          ),
          gravio_semesters: JSON.parse(
            localStorage.getItem(KEYS.semesters) || "[]",
          ),
          gravio_pledges: JSON.parse(
            localStorage.getItem(KEYS.pledges) || "[]",
          ),
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );

  const today = new Date().toISOString().split("T")[0];
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `gravio-export-${today}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
