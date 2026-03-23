class Pledge {
  constructor({
    rules = [],
    declaration = "",
    semesterId = "",
    semesterLabel = "",
    studentName = "",
    dateSigned = null,
    isSigned = false,
    reviewResults = [],
  } = {}) {
    this.rules = rules;
    this.declaration = declaration;
    this.semesterId = semesterId;
    this.semesterLabel = semesterLabel;
    this.studentName = studentName;
    this.dateSigned = dateSigned;
    this.isSigned = isSigned;
    this.reviewResults =
      reviewResults; /* Array of 'kept' | 'broken' | null per rule index */
  }

  signPledge() {
    if (this.rules.filter((r) => r.trim()).length === 0) {
      throw new Error("Write at least one rule before signing.");
    }
    this.isSigned = true;
    this.dateSigned = new Date().toISOString();
    this.reviewResults = this.rules.map(() => null);
  }

  get keptCount() {
    return this.reviewResults.filter((r) => r === "kept").length;
  }

  get formattedDate() {
    if (!this.dateSigned) return "";
    return new Date(this.dateSigned).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
}
