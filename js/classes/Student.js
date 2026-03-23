class Student {
  constructor({
    name = "",
    level = "",
    department = "",
    university = "",
    gradingSystem = "5.0",
    currentCGPA = 0,
    semestersCompleted = 0,
    totalUnitsDone = 0,
    targetCGPA = 4.5,
    remainingUnits = 72,
    remainingSemesters = 4,
  } = {}) {
    this.name = name;
    this.level = level;
    this.department = department;
    this.university = university;
    this.gradingSystem = gradingSystem;
    this.currentCGPA = Number(currentCGPA);
    this.semestersCompleted = Number(semestersCompleted);
    this.totalUnitsDone = Number(totalUnitsDone);
    this.targetCGPA = Number(targetCGPA);
    this.remainingUnits = Number(remainingUnits);
    this.remainingSemesters = Number(remainingSemesters);
  }

  get initials() {
    const parts = this.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get firstName() {
    return this.name.split(" ")[0];
  }

  /**
   * Calculates the cumulative CGPA by merging the student's seed data
   * (entered during onboarding) with all subsequently saved semesters.
   * @param {Semester[]} semesters - Array of saved Semester instances
   * @returns {number}
   */
  calculateCGPA(semesters = []) {
    /* Seed quality points from the onboarding baseline */
    let totalQP = this.currentCGPA * this.totalUnitsDone;
    let totalUnits = this.totalUnitsDone;

    for (const sem of semesters) {
      for (const course of sem.courses) {
        totalQP += course.getQualityPoints();
        totalUnits += course.creditUnits;
      }
    }

    if (totalUnits === 0) return 0;
    return Math.round((totalQP / totalUnits) * 100) / 100;
  }

  /**
   * The Orbit formula — answers: "What GPA must I average per remaining
   * semester to hit my target CGPA by graduation?"
   *
   * totalQPDone      = currentCGPA × totalUnitsDone
   * totalUnitsAtGrad = totalUnitsDone + remainingUnits
   * totalQPNeeded    = targetCGPA × totalUnitsAtGrad
   * qpStillNeeded    = totalQPNeeded − totalQPDone
   * neededGPA        = qpStillNeeded ÷ remainingUnits
   *
   * @param {number} liveCurrentCGPA  - Pass the calculated value from calculateCGPA()
   * @param {number} liveTotalUnits   - Total units done including saved semesters
   * @param {number} [overrideTarget] - Optional override for "what if" simulations
   * @param {number} [overrideRemaining] - Optional override for remaining units
   * @returns {{ neededGPA: number, status: string, statusClass: string, message: string }}
   */
  getRecoveryPath(
    liveCurrentCGPA,
    liveTotalUnits,
    overrideTarget,
    overrideRemaining,
  ) {
    const targetCGPA = overrideTarget ?? this.targetCGPA;
    const remainingUnits = overrideRemaining ?? this.remainingUnits;

    if (liveCurrentCGPA >= targetCGPA) {
      return {
        neededGPA: liveCurrentCGPA,
        status: "Target Reached 🎉",
        statusClass: "badge-g",
        gpaClass: "",
        message: "You are on a great path. Consider raising your target.",
      };
    }

    if (remainingUnits <= 0) {
      return {
        neededGPA: 0,
        status: "Not Possible",
        statusClass: "badge-rd",
        gpaClass: "rd",
        message: "No remaining units recorded. Update your profile.",
      };
    }

    const totalQPDone = liveCurrentCGPA * liveTotalUnits;
    const totalUnitsAtGrad = liveTotalUnits + remainingUnits;
    const totalQPNeeded = targetCGPA * totalUnitsAtGrad;
    const qpStillNeeded = totalQPNeeded - totalQPDone;
    const neededGPA = Math.round((qpStillNeeded / remainingUnits) * 100) / 100;

    const maxScale = parseFloat(this.gradingSystem);

    let status, statusClass, gpaClass, message;

    if (neededGPA <= 4.0) {
      status = "On Track";
      statusClass = "badge-g";
      gpaClass = "";
      message = "You are on a great path. Keep this pace and you'll get there.";
    } else if (neededGPA <= 4.5) {
      status = "Achievable";
      statusClass = "badge-g";
      gpaClass = "";
      message =
        "Achievable with consistent effort. Protect every course this semester.";
    } else if (neededGPA <= maxScale) {
      status = "Difficult";
      statusClass = "badge-am";
      gpaClass = "am";
      message =
        "Every course must be B or above. Zero dropped courses allowed.";
    } else {
      status = "Not Possible";
      statusClass = "badge-rd";
      gpaClass = "rd";
      message =
        "Target is out of reach at this scale. Consider revising your target.";
    }

    return { neededGPA, status, statusClass, gpaClass, message };
  }
}
