class Semester {
  constructor({
    id = "",
    semesterLabel = "",
    sessionYear = "",
    courses = [],
    isCompleted = false,
  } = {}) {
    this.semesterLabel = semesterLabel;
    this.sessionYear = sessionYear;
    this.courses = courses.map((c) => new Course(c));
    this.isCompleted = isCompleted;
    this.id = id || Date.now().toString();
  }

  addCourse(courseData) {
    this.courses.push(new Course(courseData));
  }

  get totalCreditUnits() {
    return this.courses.reduce((sum, c) => sum + c.creditUnits, 0);
  }

  getSemesterGPA() {
    const totalUnits = this.totalCreditUnits;
    if (totalUnits === 0) return 0;
    const totalQP = this.courses.reduce(
      (sum, c) => sum + c.getQualityPoints(),
      0,
    );
    return Math.round((totalQP / totalUnits) * 100) / 100;
  }

  toJSON() {
    return {
      id: this.id,
      semesterLabel: this.semesterLabel,
      sessionYear: this.sessionYear,
      isCompleted: this.isCompleted,
      courses: this.courses.map((c) => ({
        courseName: c.courseName,
        courseCode: c.courseCode,
        creditUnits: c.creditUnits,
        grade: c.grade,
      })),
    };
  }
}
