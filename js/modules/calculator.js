function calcSemesterGPA(courses) {
  const totalUnits = courses.reduce((s, c) => s + c.creditUnits, 0);
  if (totalUnits === 0) return 0;
  const totalQP = courses.reduce((s, c) => s + c.getQualityPoints(), 0);
  return Math.round((totalQP / totalUnits) * 100) / 100;
}

/**
 * Calculates CGPA across all semesters (including the live unsaved one).
 * @param {Student}   student       - For the onboarding baseline values
 * @param {Semester[]} savedSems    - Already persisted semesters
 * @param {Course[]}  liveCourses   - Courses in the calculator not yet saved
 */
function calcCumulativeCGPA(student, savedSems, liveCourses = []) {
  let totalQP = student.currentCGPA * student.totalUnitsDone;
  let totalUnits = student.totalUnitsDone;

  for (const sem of savedSems) {
    for (const c of sem.courses) {
      totalQP += c.getQualityPoints();
      totalUnits += c.creditUnits;
    }
  }

  for (const c of liveCourses) {
    totalQP += c.getQualityPoints();
    totalUnits += c.creditUnits;
  }

  if (totalUnits === 0) return 0;
  return Math.round((totalQP / totalUnits) * 100) / 100;
}
