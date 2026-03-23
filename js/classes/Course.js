class Course {
  static GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

  constructor({
    courseName = "",
    courseCode = "",
    creditUnits = 3,
    grade = "A",
  } = {}) {
    this.courseName = courseName;
    this.courseCode = courseCode;
    this.creditUnits = Number(creditUnits);
    this.grade = grade;
  }

  getQualityPoints() {
    return (Course.GRADE_POINTS[this.grade] ?? 0) * this.creditUnits;
  }
}
