checkSession();

const student = loadStudent();
const semesters = loadSemesters();
let pledges = loadPledges();

const modeWrite = document.getElementById("mode-write");
const modeSigned = document.getElementById("mode-signed");
const modeReview = document.getElementById("mode-review");
const pastPanel = document.getElementById("past-pledges-panel");

const rulesInputs = document.getElementById("rules-inputs");
const whyInput = document.getElementById("why-input");
const errRule = document.getElementById("err-rule");
const pastLinkWrite = document.getElementById("past-link-write");

function getActiveSemester() {
  if (!semesters.length) return null;
  return semesters[semesters.length - 1];
}

function getActivePledge() {
  const sem = getActiveSemester();
  if (!sem) return null;
  const semId = String(sem.id || "");

  return (
    pledges.find((p) => {
      if (!p.isSigned) return false;
      const byId = semId && String(p.semesterId || "") === semId;
      const byLegacyLabel =
        !p.semesterId && p.semesterLabel === sem.semesterLabel;
      return byId || byLegacyLabel;
    }) || null
  );
}

function hideAllModes() {
  modeWrite.classList.add("hidden");
  modeSigned.classList.add("hidden");
  modeReview.classList.add("hidden");
}

function addRuleInput(value = "") {
  const row = document.createElement("div");
  row.className = "rb-row";
  row.style.gap = "8px";
  row.style.marginBottom = "8px";

  row.innerHTML = `
    <input class="pl-inp" type="text" placeholder="e.g. No carryover this semester" value="${value.replace(/"/g, "&quot;")}" />
    <button class="cr-delete" title="Remove rule">×</button>
  `;

  const input = row.querySelector("input");
  input.style.marginBottom = "0";

  row.querySelector("button").addEventListener("click", () => {
    row.remove();
    if (!rulesInputs.children.length) addRuleInput();
  });

  rulesInputs.appendChild(row);
}

function readRulesFromInputs() {
  return Array.from(rulesInputs.querySelectorAll("input"))
    .map((i) => i.value.trim())
    .filter(Boolean);
}

function signPledge() {
  const sem = getActiveSemester();
  if (!sem) {
    alert("Add a semester in Calculator before signing a pledge.");
    return;
  }

  const rules = readRulesFromInputs();
  const declaration = whyInput.value.trim();

  if (!rules.length) {
    errRule.style.display = "block";
    return;
  }

  errRule.style.display = "none";

  const pledge = new Pledge({
    rules,
    declaration,
    semesterLabel: sem.semesterLabel,
    semesterId: sem.id,
    studentName: student.name,
  });
  pledge.signPledge();

  const semId = String(sem.id || "");
  pledges = pledges.filter((p) => {
    const sameById = semId && String(p.semesterId || "") === semId;
    const sameLegacy = !p.semesterId && p.semesterLabel === sem.semesterLabel;
    return !(sameById || sameLegacy);
  });
  pledges.push(pledge);
  savePledges(pledges);

  render();
}

function renderSignedMode(pledge) {
  hideAllModes();
  modeSigned.classList.remove("hidden");

  document.getElementById("stamp-label").textContent =
    pledge.semesterLabel || "Current Semester";
  document.getElementById("stamp-name").textContent =
    pledge.studentName || student.name;
  document.getElementById("stamp-date").textContent = new Pledge(
    pledge,
  ).formattedDate;

  document.getElementById("signed-rules-list").innerHTML = pledge.rules
    .map(
      (rule, idx) => `
      <div class="pledge-rule-row">
        <div class="p-num">${idx + 1}</div>
        <span>${rule}</span>
      </div>
    `,
    )
    .join("");

  document.getElementById("signed-why").textContent =
    pledge.declaration || "No note added.";
}

function renderReviewMode(pledge) {
  hideAllModes();
  modeReview.classList.remove("hidden");

  const kept = pledge.reviewResults.filter((r) => r === "kept").length;
  const total = pledge.rules.length || 1;
  const pct = Math.round((kept / total) * 100);

  document.getElementById("review-score").textContent =
    `${kept}/${pledge.rules.length}`;
  document.getElementById("review-score-sub").textContent =
    "promises kept this semester";
  document.getElementById("review-encouragement").textContent =
    pct >= 80
      ? "Excellent discipline. Keep building."
      : "Progress is still progress. Stay consistent.";

  document.getElementById("review-rules-list").innerHTML = pledge.rules
    .map((rule, idx) => {
      const state = pledge.reviewResults[idx];
      return `
      <div class="pledge-rule-row">
        <div class="p-num ${state === "broken" ? "broken" : ""}">${idx + 1}</div>
        <div style="flex:1">
          <div>${rule}</div>
          <div class="btn-row" style="margin-top:6px">
            <button class="review-btn-g ${state === "kept" ? "active" : ""}" onclick="markRule(${idx}, 'kept')">Kept</button>
            <button class="review-btn-r ${state === "broken" ? "active" : ""}" onclick="markRule(${idx}, 'broken')">Broken</button>
          </div>
        </div>
      </div>`;
    })
    .join("");
}

function markRule(index, value) {
  const active = getActivePledge();
  if (!active) return;

  const p = new Pledge(active);
  p.reviewResults[index] = value;
  const activeSemId = String(p.semesterId || "");

  pledges = pledges.map((item) => {
    const sameById =
      activeSemId && String(item.semesterId || "") === activeSemId;
    const sameLegacy = !activeSemId && item.semesterLabel === p.semesterLabel;
    if (sameById || sameLegacy) {
      return { ...item, reviewResults: p.reviewResults };
    }
    return item;
  });

  savePledges(pledges);
  renderReviewMode(p);
}

function showPastPledges() {
  pastPanel.classList.remove("hidden");

  const sorted = [...pledges].reverse();
  document.getElementById("past-pledges-list").innerHTML = sorted.length
    ? sorted
        .map((p) => {
          const kept = (p.reviewResults || []).filter(
            (r) => r === "kept",
          ).length;
          const score =
            p.reviewResults && p.reviewResults.length
              ? `${kept}/${p.reviewResults.length}`
              : "Not reviewed";
          return `
          <div class="g-card">
            <div class="rb-row">
              <strong>${p.semesterLabel || "Semester"}</strong>
              <span class="badge badge-g">${score}</span>
            </div>
            <p style="font-size:12px; color:var(--g-muted); margin-top:6px; line-height:1.5;">
              ${(p.rules || []).slice(0, 2).join(" • ") || "No rules saved"}
            </p>
          </div>`;
        })
        .join("")
    : '<div class="empty-state"><div class="es-sub">No past pledges yet.</div></div>';
}

function hidePastPledges() {
  pastPanel.classList.add("hidden");
}

function render() {
  const active = getActivePledge();

  pastLinkWrite.classList.toggle("hidden", pledges.length === 0);

  if (!active) {
    hideAllModes();
    modeWrite.classList.remove("hidden");
    errRule.style.display = "none";
    if (!rulesInputs.children.length) addRuleInput();
    return;
  }

  const hasReviewData = (active.reviewResults || []).some((r) => r !== null);
  if (hasReviewData) {
    renderReviewMode(new Pledge(active));
  } else {
    renderSignedMode(new Pledge(active));
  }
}

render();

window.addRuleInput = addRuleInput;
window.signPledge = signPledge;
window.showPastPledges = showPastPledges;
window.hidePastPledges = hidePastPledges;
window.markRule = markRule;
