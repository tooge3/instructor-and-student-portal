const BIOLOGY_ID = "biology-201";
const BIOLOGY_NOTES_KEY = "portal-notes-biology-201";
const BIOLOGY_GOALS_KEY = "portal-goals-biology-201";
const BIOLOGY_CURRENT_SESSION = 11;
const biologyPage = {
  studentCount: document.getElementById("biology-student-count"),
  averageProgress: document.getElementById("biology-average-progress"),
  alertCount: document.getElementById("biology-alert-count"),
  summary: document.getElementById("biology-summary"),
  planningNote: document.getElementById("biology-course-note"),
  studentSelect: document.getElementById("biology-student-select"),
  planningSave: document.getElementById("biology-course-note-save"),
  planningStatus: document.getElementById("biology-course-note-status"),
  reportStudentSelect: document.getElementById("biology-report-student-select"),
  reportAssignmentUpdate: document.getElementById("biology-report-assignment-update"),
  reportNextStep: document.getElementById("biology-report-next-step"),
  reportSave: document.getElementById("biology-report-save"),
  reportStatus: document.getElementById("biology-report-status"),
  weeklySummary: document.getElementById("biology-weekly-summary"),
  reportList: document.getElementById("biology-report-list"),
  sessionHistory: document.getElementById("biology-session-history"),
  roster: document.getElementById("biology-roster"),
  expectations: document.getElementById("biology-expectations"),
  milestones: document.getElementById("biology-milestones"),
  goalModal: document.getElementById("goal-modal"),
  goalModalInput: document.getElementById("goal-modal-input"),
  goalModalSave: document.getElementById("goal-modal-save"),
  goalModalClose: document.getElementById("goal-modal-close"),
  goalModalCancel: document.getElementById("goal-modal-cancel"),
  notesModal: document.getElementById("notes-modal"),
  notesModalList: document.getElementById("notes-modal-list"),
  notesModalClose: document.getElementById("notes-modal-close"),
  notesModalDone: document.getElementById("notes-modal-done"),
  reportHistoryModal: document.getElementById("report-history-modal"),
  reportHistorySummary: document.getElementById("report-history-modal-summary"),
  reportHistoryList: document.getElementById("report-history-modal-list"),
  reportHistoryClose: document.getElementById("report-history-modal-close"),
  reportHistoryDone: document.getElementById("report-history-modal-done"),
  reportHistoryEdit: document.getElementById("report-history-modal-edit"),
  sessionsPanel: document.getElementById("biology-sessions-panel"),
  sessionModal: document.getElementById("course-session-modal"),
  sessionModalTitle: document.getElementById("course-session-modal-title"),
  sessionModalSummary: document.getElementById("course-session-modal-summary"),
  sessionModalList: document.getElementById("course-session-modal-list"),
  sessionModalClose: document.getElementById("course-session-modal-close"),
  sessionModalDone: document.getElementById("course-session-modal-done"),
};

let biologyActiveGoalStudent = null;
let biologyActiveNotesStudent = null;
let biologyActiveReportStudent = null;
let biologySessionEntries = [];

function biologyCourseData() {
  return window.portalStore.getCourse(BIOLOGY_ID);
}

function biologyStudents() {
  return window.portalStore.getStudents().filter((student) => student.courseId === BIOLOGY_ID);
}

function biologyReadGoalOverrides() {
  const stored = window.localStorage.getItem(BIOLOGY_GOALS_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function biologyWriteGoalOverrides(overrides) {
  window.localStorage.setItem(BIOLOGY_GOALS_KEY, JSON.stringify(overrides));
}

function biologyReadNotesByStudent() {
  const stored = window.localStorage.getItem(BIOLOGY_NOTES_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function biologyWriteNotesByStudent(notes) {
  window.localStorage.setItem(BIOLOGY_NOTES_KEY, JSON.stringify(notes));
}

function biologyReportsByStudent() {
  return window.portalStore.ensureStudentCourseReports(
    BIOLOGY_ID,
    biologyStudents().map((student) => student.name),
  );
}

function prefillBiologyReportTarget() {
  const params = new URLSearchParams(window.location.search);
  const reportStudent = params.get("reportStudent");

  if (!reportStudent || !biologyPage.reportStudentSelect) {
    return;
  }

  const optionExists = Array.from(biologyPage.reportStudentSelect.options).some((option) => option.value === reportStudent);

  if (!optionExists) {
    return;
  }

  biologyPage.reportStudentSelect.value = reportStudent;
  biologyPage.reportStatus.textContent = `Ready to submit a report for ${reportStudent}.`;
  const reportPanel = biologyPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  biologyPage.reportAssignmentUpdate?.focus();
}

function biologyStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function biologyList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items.map((item) => `<div class="course-list-item">${item}</div>`).join("");
}

function biologySnapshotLine(label, value) {
  return `<strong>${label}:</strong> ${value}`;
}

function biologyReportStatus(report) {
  return {
    completed: report?.completedReports || 0,
    expected: report?.expectedReports || 3,
    complete: Boolean(report?.complete),
  };
}

function biologyWeekRangeLabel() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function renderBiologyWeeklySummary(roster) {
  if (!biologyPage.weeklySummary) {
    return;
  }

  const course = biologyCourseData();
  const reports = biologyReportsByStudent();
  const totals = roster.reduce((summary, student) => {
    const reportStatus = biologyReportStatus(reports[student.name]);

    return {
      completed: summary.completed + reportStatus.completed,
      expected: summary.expected + reportStatus.expected,
      coveredStudents: summary.coveredStudents + (reportStatus.complete ? 1 : 0),
    };
  }, { completed: 0, expected: 0, coveredStudents: 0 });
  const missingStudents = roster
    .filter((student) => !biologyReportStatus(reports[student.name]).complete)
    .map((student) => student.name);
  const sessionPlan = [
    "Mon · Variables and input/output warm-up",
    "Wed · Functions and loops practice",
    "Fri · Debug check and report follow-up",
  ];
  const pendingLabel = missingStudents.length
    ? missingStudents.slice(0, 3).join(", ")
    : "Everyone is covered for the current cycle.";
  const pendingSuffix = missingStudents.length > 3 ? ` +${missingStudents.length - 3} more` : "";

  biologyPage.weeklySummary.innerHTML = `
    <div class="course-weekly-summary-head">
      <div>
        <p class="eyebrow">This Week</p>
        <h4>Week of ${biologyWeekRangeLabel()}</h4>
      </div>
      <p class="course-weekly-focus">${course.currentObjective}</p>
    </div>
    <div class="course-weekly-grid">
      <article class="course-weekly-card">
        <p class="course-weekly-label">Sessions</p>
        <strong>${sessionPlan.length} scheduled</strong>
        <p class="course-report-preview">${sessionPlan.join(" · ")}</p>
      </article>
      <article class="course-weekly-card">
        <p class="course-weekly-label">Report Coverage</p>
        <strong>${totals.completed}/${totals.expected} submitted</strong>
        <p class="course-report-preview">${totals.coveredStudents}/${roster.length || 0} students fully covered on the current report cycle.</p>
      </article>
      <article class="course-weekly-card ${missingStudents.length ? "attention" : ""}">
        <p class="course-weekly-label">Still Pending</p>
        <strong>${missingStudents.length}</strong>
        <p class="course-report-preview">${pendingLabel}${pendingSuffix}</p>
      </article>
    </div>
  `;
}

function biologyRosterCards(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Biology 201.</div>`;
  }

  const goalOverrides = biologyReadGoalOverrides();
  const studentNotes = biologyReadNotesByStudent();
  const reports = biologyReportsByStudent();
  const rows = roster.map((student) => {
    const status = biologyStatus(student);
    const goal = goalOverrides[student.name] || student.goal || "No goal listed yet.";
    const followUp = Array.isArray(student.tasks) && student.tasks.length
      ? student.tasks.join(", ")
      : "No current follow-up listed.";
    const noteEntries = studentNotes[student.name] || [];
    const hasNotes = noteEntries.length > 0;
    const reportStatus = biologyReportStatus(reports[student.name]);

    return `
      <div class="course-roster-row">
        <div class="course-roster-name-cell">
          <div>
            <strong class="course-roster-name">${student.name}</strong>
            <div class="student-group-meta">Seat ${student.seat}</div>
          </div>
          <div class="status-chip ${status.className}">${status.label}</div>
        </div>
        <div class="course-roster-goal-cell">
          <div class="course-roster-goal-row">
            <div class="course-roster-goal">${goal}</div>
            <button class="course-goal-edit-button" type="button" data-edit-biology-goal="${student.name}" aria-label="Edit goal for ${student.name}">...</button>
          </div>
          <div class="course-roster-followup">${followUp}</div>
        </div>
        <div class="course-roster-meta-cell">
          <span>${student.presentToday ? "Here" : "Absent"}</span>
          <span>${typeof student.progress === "number" ? `${student.progress}% progress` : "Progress not set"}</span>
        </div>
        <div class="course-roster-notes-cell">
          <button class="course-notes-button ${hasNotes ? "filled" : "empty"}" type="button" data-open-biology-notes="${student.name}" aria-label="Open notes for ${student.name}">
            <span class="course-notes-icon" aria-hidden="true"></span>
          </button>
        </div>
        <div class="course-roster-reports-cell">
          <button class="course-report-pill ${reportStatus.complete ? "filled" : "missing"}" type="button" data-focus-biology-report="${student.name}" aria-label="Review reports for ${student.name}">
            <span>${reportStatus.completed}/${reportStatus.expected}</span>
            <span class="course-report-pill-hover">${reportStatus.completed} of ${reportStatus.expected} reports completed</span>
          </button>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="course-roster-table">
      <div class="course-roster-header-row">
        <div>Name</div>
        <div>Goals</div>
        <div>Status</div>
        <div>Notes</div>
        <div>Reports</div>
      </div>
      ${rows}
    </div>
  `;
}

function renderBiologyStudentOptions(roster) {
  if (!biologyPage.studentSelect) {
    return;
  }

  biologyPage.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.name}">${student.name}</option>`)
    .join("");

  if (biologyPage.reportStudentSelect) {
    biologyPage.reportStudentSelect.innerHTML = roster
      .map((student) => `<option value="${student.name}">${student.name}</option>`)
      .join("");
  }
}

function renderBiologyReports(roster) {
  if (!biologyPage.reportList) {
    return;
  }

  const reports = biologyReportsByStudent();
  const cards = roster.map((student) => {
    const report = reports[student.name];
    const reportStatus = biologyReportStatus(report);

    return `
      <article class="course-report-card ${reportStatus.complete ? "submitted" : "missing"}">
        <div class="course-report-card-top">
          <strong>${student.name}</strong>
          <span class="status-chip ${reportStatus.complete ? "ok" : "warning"}">${reportStatus.complete ? "All Submitted" : "Missing"}</span>
        </div>
        <p class="metric-caption">${reportStatus.completed}/${reportStatus.expected} reports completed${report?.submittedAt ? ` · Latest ${new Date(report.submittedAt).toLocaleDateString("en-US")}` : ""}</p>
        ${report?.assignmentUpdate ? `<p class="course-report-preview">${report.assignmentUpdate}</p>` : ""}
      </article>
    `;
  }).join("");

  biologyPage.reportList.innerHTML = cards;
}

function renderBiologySessionHistory(roster) {
  if (!biologyPage.sessionHistory) {
    return;
  }

  const attendanceOne = roster.length ? Math.max(0, roster.length - 1) : 0;
  const attendanceTwo = roster.length ? Math.max(0, roster.length - 2) : 0;
  const entries = [
    {
      date: "Apr 15, 2026",
      focus: "Functions and loops practice",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students reviewed conditional logic, completed guided loop drills, and ended with a short debugging warm-down.",
    },
    {
      date: "Apr 13, 2026",
      focus: "Variables and input/output recap",
      attendance: `${attendanceTwo}/${roster.length || 0} present`,
      recap: "The class revisited variable naming, basic input flow, and small console exercises before independent check-ins.",
    },
    {
      date: "Apr 10, 2026",
      focus: "Intro project work session",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students spent the session on project setup, teacher conferences, and resolving missing starter work from the previous week.",
    },
  ];

  biologyPage.sessionHistory.innerHTML = `
    <div class="course-session-history-head">
      <p class="eyebrow">Weekly History</p>
      <h4>Recent class details</h4>
    </div>
    <div class="course-session-history-grid">
      ${entries.map((entry) => `
        <article class="course-session-card">
          <p class="course-session-date">${entry.date}</p>
          <strong>${entry.focus}</strong>
          <span class="course-session-meta">${entry.attendance}</span>
          <p class="course-report-preview">${entry.recap}</p>
        </article>
      `).join("")}
    </div>
  `;
}

function renderBiologySessionsTab(roster) {
  if (!biologyPage.sessionsPanel || !window.CourseSessionsUI) {
    return;
  }

  biologySessionEntries = window.CourseSessionsUI.buildSessionEntries({
    course: biologyCourseData(),
    roster,
    reportsByStudent: biologyReportsByStudent(),
    currentSession: BIOLOGY_CURRENT_SESSION,
    totalSessions: 16,
    isOpenClass: false,
  });

  biologyPage.sessionsPanel.innerHTML = window.CourseSessionsUI.renderSessionsPanel(biologySessionEntries);
}

function openBiologySessionReports(entryIndex) {
  const entry = biologySessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: biologyPage.sessionModal,
      title: biologyPage.sessionModalTitle,
      summary: biologyPage.sessionModalSummary,
      list: biologyPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} reports`,
      summary: `${entry.dateLabel} · ${entry.timeLabel}`,
      body: window.CourseSessionsUI.renderSessionReportsBody(entry),
    },
  );
}

function openBiologySessionAttendance(entryIndex) {
  const entry = biologySessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: biologyPage.sessionModal,
      title: biologyPage.sessionModalTitle,
      summary: biologyPage.sessionModalSummary,
      list: biologyPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} attendance`,
      summary: `${entry.dateLabel} · ${entry.timeLabel} · ${entry.attendancePillLabel}`,
      body: window.CourseSessionsUI.renderSessionAttendanceBody(entry),
    },
  );
}

function closeBiologySessionModal() {
  window.CourseSessionsUI?.closeSessionModal({
    modal: biologyPage.sessionModal,
  });
}

function renderBiologyNotesModal() {
  if (!biologyActiveNotesStudent || !biologyPage.notesModalList) {
    return;
  }

  const notes = biologyReadNotesByStudent()[biologyActiveNotesStudent] || [];
  const orderedNotes = [...notes].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  biologyPage.notesModalList.innerHTML = orderedNotes.length
    ? orderedNotes.map((entry) => `
        <article class="notes-entry">
          <div class="notes-entry-head">
            <p class="notes-entry-date">${new Date(entry.createdAt).toLocaleString()}</p>
            <button class="notes-entry-check" type="button" data-dismiss-biology-note="${entry.createdAt}" aria-label="Dismiss note from ${new Date(entry.createdAt).toLocaleString()}">✓</button>
          </div>
          <p class="notes-entry-body">${entry.text}</p>
        </article>
      `).join("")
    : `<p class="notes-empty">No saved notes for ${biologyActiveNotesStudent} yet.</p>`;
}

function closeBiologyNotesModal() {
  biologyActiveNotesStudent = null;
  biologyPage.notesModal.classList.add("hidden");
  biologyPage.notesModal.setAttribute("aria-hidden", "true");
}

function renderBiologyReportHistoryModal() {
  if (!biologyActiveReportStudent || !biologyPage.reportHistoryList) {
    return;
  }

  const report = biologyReportsByStudent()[biologyActiveReportStudent];
  const reportStatus = biologyReportStatus(report);
  const orderedHistory = [...(report?.history || [])]
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));

  if (biologyPage.reportHistorySummary) {
    biologyPage.reportHistorySummary.textContent = `${reportStatus.completed}/${reportStatus.expected} reports completed for ${biologyActiveReportStudent}.`;
  }

  biologyPage.reportHistoryList.innerHTML = orderedHistory.length
    ? orderedHistory.map((entry, index) => `
        <article class="notes-entry">
          <div class="notes-entry-head">
            <p class="notes-entry-date">Report ${orderedHistory.length - index} · ${new Date(entry.submittedAt).toLocaleString()}</p>
          </div>
          <div class="report-history-sections">
            <p class="notes-entry-body"><strong>Assignment Update:</strong> ${entry.assignmentUpdate}</p>
            <p class="notes-entry-body"><strong>Next Steps:</strong> ${entry.nextStep}</p>
          </div>
        </article>
      `).join("")
    : `<p class="notes-empty">No submitted reports for ${biologyActiveReportStudent} yet.</p>`;
}

function closeBiologyReportHistoryModal() {
  biologyActiveReportStudent = null;
  biologyPage.reportHistoryModal?.classList.add("hidden");
  biologyPage.reportHistoryModal?.setAttribute("aria-hidden", "true");
}

function renderBiologyRosterPage() {
  const course = biologyCourseData();
  const roster = biologyStudents();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + (typeof student.progress === "number" ? student.progress : 0), 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  document.title = `${course.title} | Python Foundations Course Page`;
  biologyPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  biologyPage.averageProgress.textContent = `${averageProgress}%`;
  biologyPage.alertCount.textContent = `${activeAlerts}`;
  renderBiologyStudentOptions(roster);
  biologyPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  biologyPage.reportStatus.textContent = "Submit concise weekly reports to update the admin view.";
  biologyPage.roster.innerHTML = biologyRosterCards(roster);
  renderBiologyWeeklySummary(roster);
  renderBiologyReports(roster);
  renderBiologySessionHistory(roster);
  renderBiologySessionsTab(roster);
  prefillBiologyReportTarget();
  const behindStudents = roster
    .filter((student) => student.needsHelp || student.alertActive || student.progress < 75 || student.attendance < 85)
    .map((student) => student.name);

  biologyList(biologyPage.summary, [
    biologySnapshotLine("Current unit", course.currentUnit),
    biologySnapshotLine("Curriculum expectation", course.progressBenchmark),
    behindStudents.length
      ? biologySnapshotLine("Known to be behind", behindStudents.join(", "))
      : biologySnapshotLine("Known to be behind", "No students currently flagged."),
  ]);
  biologyList(biologyPage.expectations, course.expectations);
  biologyList(biologyPage.milestones, course.milestones);
}

biologyPage.planningSave?.addEventListener("click", () => {
  const studentName = biologyPage.studentSelect?.value;
  const noteText = biologyPage.planningNote.value.trim();

  if (!studentName || !noteText) {
    biologyPage.planningStatus.textContent = "Select a student and enter a note before saving.";
    return;
  }

  const notesByStudent = biologyReadNotesByStudent();
  const existingNotes = notesByStudent[studentName] || [];
  notesByStudent[studentName] = [
    {
      text: noteText,
      createdAt: new Date().toISOString(),
    },
    ...existingNotes,
  ];
  biologyWriteNotesByStudent(notesByStudent);
  biologyPage.planningNote.value = "";
  biologyPage.planningStatus.textContent = `Saved note for ${studentName}.`;
  renderBiologyRosterPage();
});

biologyPage.reportSave?.addEventListener("click", () => {
  const studentName = biologyPage.reportStudentSelect?.value;
  const assignmentUpdate = biologyPage.reportAssignmentUpdate?.value.trim();
  const nextStep = biologyPage.reportNextStep?.value.trim();

  if (!studentName || !assignmentUpdate || !nextStep) {
    biologyPage.reportStatus.textContent = "Complete both report fields before submitting.";
    return;
  }

  window.portalStore.saveStudentCourseReport(BIOLOGY_ID, studentName, {
    assignmentUpdate,
    nextStep,
  });

  biologyPage.reportAssignmentUpdate.value = "";
  biologyPage.reportNextStep.value = "";
  biologyPage.reportStatus.textContent = `Submitted report for ${studentName}.`;
  renderBiologyRosterPage();
});

biologyPage.roster?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-focus-biology-report]");

  if (reportButton && biologyPage.reportStudentSelect) {
    biologyActiveReportStudent = reportButton.dataset.focusBiologyReport;
    renderBiologyReportHistoryModal();
    biologyPage.reportHistoryModal?.classList.remove("hidden");
    biologyPage.reportHistoryModal?.setAttribute("aria-hidden", "false");
    return;
  }

  const button = event.target.closest("[data-edit-biology-goal]");

  if (!button) {
    return;
  }

  const studentName = button.dataset.editBiologyGoal;
  const student = biologyStudents().find((entry) => entry.name === studentName);
  const overrides = biologyReadGoalOverrides();
  biologyActiveGoalStudent = studentName;
  biologyPage.goalModalInput.value = overrides[studentName] || student?.goal || "";
  biologyPage.goalModal.classList.remove("hidden");
  biologyPage.goalModal.setAttribute("aria-hidden", "false");
  biologyPage.goalModalInput.focus();
});

function closeBiologyGoalModal() {
  biologyActiveGoalStudent = null;
  biologyPage.goalModal.classList.add("hidden");
  biologyPage.goalModal.setAttribute("aria-hidden", "true");
}

biologyPage.goalModalSave?.addEventListener("click", () => {
  if (!biologyActiveGoalStudent) {
    closeBiologyGoalModal();
    return;
  }

  const overrides = biologyReadGoalOverrides();
  const trimmedGoal = biologyPage.goalModalInput.value.trim();

  if (trimmedGoal) {
    overrides[biologyActiveGoalStudent] = trimmedGoal;
  } else {
    delete overrides[biologyActiveGoalStudent];
  }

  biologyWriteGoalOverrides(overrides);
  closeBiologyGoalModal();
  renderBiologyRosterPage();
});

biologyPage.goalModalClose?.addEventListener("click", closeBiologyGoalModal);
biologyPage.goalModalCancel?.addEventListener("click", closeBiologyGoalModal);
biologyPage.goalModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-goal-modal='true']")) {
    closeBiologyGoalModal();
  }
});

biologyPage.roster?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-biology-notes]");

  if (!button) {
    return;
  }

  biologyActiveNotesStudent = button.dataset.openBiologyNotes;
  renderBiologyNotesModal();
  biologyPage.notesModal.classList.remove("hidden");
  biologyPage.notesModal.setAttribute("aria-hidden", "false");
});

biologyPage.notesModalClose?.addEventListener("click", closeBiologyNotesModal);
biologyPage.notesModalDone?.addEventListener("click", closeBiologyNotesModal);
biologyPage.notesModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-notes-modal='true']")) {
    closeBiologyNotesModal();
    return;
  }

  const dismissButton = event.target.closest("[data-dismiss-biology-note]");

  if (!dismissButton || !biologyActiveNotesStudent) {
    return;
  }

  const targetCreatedAt = dismissButton.dataset.dismissBiologyNote;
  const notesByStudent = biologyReadNotesByStudent();
  const existingNotes = notesByStudent[biologyActiveNotesStudent] || [];
  const filteredNotes = existingNotes.filter((entry) => entry.createdAt !== targetCreatedAt);

  if (filteredNotes.length) {
    notesByStudent[biologyActiveNotesStudent] = filteredNotes;
  } else {
    delete notesByStudent[biologyActiveNotesStudent];
  }

  biologyWriteNotesByStudent(notesByStudent);
  renderBiologyRosterPage();
  renderBiologyNotesModal();
});

biologyPage.reportHistoryClose?.addEventListener("click", closeBiologyReportHistoryModal);
biologyPage.reportHistoryDone?.addEventListener("click", closeBiologyReportHistoryModal);
biologyPage.reportHistoryEdit?.addEventListener("click", () => {
  if (!biologyActiveReportStudent || !biologyPage.reportStudentSelect) {
    closeBiologyReportHistoryModal();
    return;
  }

  biologyPage.reportStudentSelect.value = biologyActiveReportStudent;
  biologyPage.reportStatus.textContent = `Ready to update the report history for ${biologyActiveReportStudent}.`;
  closeBiologyReportHistoryModal();
  const reportPanel = biologyPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  biologyPage.reportAssignmentUpdate?.focus();
});
biologyPage.reportHistoryModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-report-history-modal='true']")) {
    closeBiologyReportHistoryModal();
  }
});

document.addEventListener("click", (event) => {
  const tabButton = event.target.closest("[data-course-tab-target]");

  if (!tabButton) {
    return;
  }

  const target = tabButton.dataset.courseTabTarget;
  document.querySelectorAll("[data-course-tab-target]").forEach((button) => {
    button.classList.toggle("active", button === tabButton);
  });
  document.querySelectorAll("[data-course-tab-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.courseTabPanel !== target);
  });
});

biologyPage.sessionsPanel?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-open-course-session-reports]");
  const attendanceButton = event.target.closest("[data-open-course-session-attendance]");

  if (reportButton) {
    openBiologySessionReports(reportButton.dataset.openCourseSessionReports);
    return;
  }

  if (attendanceButton) {
    openBiologySessionAttendance(attendanceButton.dataset.openCourseSessionAttendance);
  }
});

biologyPage.sessionModalClose?.addEventListener("click", closeBiologySessionModal);
biologyPage.sessionModalDone?.addEventListener("click", closeBiologySessionModal);
biologyPage.sessionModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-course-session-modal='true']")) {
    closeBiologySessionModal();
  }
});

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === "portal-student-course-reports" ||
    event.key === BIOLOGY_NOTES_KEY ||
    event.key === BIOLOGY_GOALS_KEY
  ) {
    renderBiologyRosterPage();
    if (biologyActiveNotesStudent) {
      renderBiologyNotesModal();
    }
    if (biologyActiveReportStudent) {
      renderBiologyReportHistoryModal();
    }
  }
});

renderBiologyRosterPage();
