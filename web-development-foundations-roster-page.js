const CHEMISTRY_ID = "chemistry-prep";
const CHEMISTRY_NOTES_KEY = "portal-notes-chemistry-foundations";
const CHEMISTRY_GOALS_KEY = "portal-goals-chemistry-foundations";
const CHEMISTRY_CURRENT_SESSION = 10;
const chemistryPage = {
  studentCount: document.getElementById("chemistry-student-count"),
  averageProgress: document.getElementById("chemistry-average-progress"),
  alertCount: document.getElementById("chemistry-alert-count"),
  summary: document.getElementById("chemistry-summary"),
  planningNote: document.getElementById("chemistry-course-note"),
  studentSelect: document.getElementById("chemistry-student-select"),
  planningSave: document.getElementById("chemistry-course-note-save"),
  planningStatus: document.getElementById("chemistry-course-note-status"),
  reportStudentSelect: document.getElementById("chemistry-report-student-select"),
  reportAssignmentUpdate: document.getElementById("chemistry-report-assignment-update"),
  reportNextStep: document.getElementById("chemistry-report-next-step"),
  reportSave: document.getElementById("chemistry-report-save"),
  reportStatus: document.getElementById("chemistry-report-status"),
  weeklySummary: document.getElementById("chemistry-weekly-summary"),
  reportList: document.getElementById("chemistry-report-list"),
  sessionHistory: document.getElementById("chemistry-session-history"),
  roster: document.getElementById("chemistry-roster"),
  expectations: document.getElementById("chemistry-expectations"),
  milestones: document.getElementById("chemistry-milestones"),
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
  sessionsPanel: document.getElementById("chemistry-sessions-panel"),
  sessionModal: document.getElementById("course-session-modal"),
  sessionModalTitle: document.getElementById("course-session-modal-title"),
  sessionModalSummary: document.getElementById("course-session-modal-summary"),
  sessionModalList: document.getElementById("course-session-modal-list"),
  sessionModalClose: document.getElementById("course-session-modal-close"),
  sessionModalDone: document.getElementById("course-session-modal-done"),
};

let chemistryActiveGoalStudent = null;
let chemistryActiveNotesStudent = null;
let chemistryActiveReportStudent = null;
let chemistrySessionEntries = [];

function chemistryCourseData() {
  return window.portalStore.getCourse(CHEMISTRY_ID);
}

function chemistryStudents() {
  return window.portalStore.getStudents().filter((student) => student.courseId === CHEMISTRY_ID);
}

function chemistryReadGoalOverrides() {
  const stored = window.localStorage.getItem(CHEMISTRY_GOALS_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function chemistryWriteGoalOverrides(overrides) {
  window.localStorage.setItem(CHEMISTRY_GOALS_KEY, JSON.stringify(overrides));
}

function chemistryReadNotesByStudent() {
  const stored = window.localStorage.getItem(CHEMISTRY_NOTES_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function chemistryWriteNotesByStudent(notes) {
  window.localStorage.setItem(CHEMISTRY_NOTES_KEY, JSON.stringify(notes));
}

function chemistryReportsByStudent() {
  return window.portalStore.ensureStudentCourseReports(
    CHEMISTRY_ID,
    chemistryStudents().map((student) => student.name),
  );
}

function prefillChemistryReportTarget() {
  const params = new URLSearchParams(window.location.search);
  const reportStudent = params.get("reportStudent");

  if (!reportStudent || !chemistryPage.reportStudentSelect) {
    return;
  }

  const optionExists = Array.from(chemistryPage.reportStudentSelect.options).some((option) => option.value === reportStudent);

  if (!optionExists) {
    return;
  }

  chemistryPage.reportStudentSelect.value = reportStudent;
  chemistryPage.reportStatus.textContent = `Ready to submit a report for ${reportStudent}.`;
  const reportPanel = chemistryPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  chemistryPage.reportAssignmentUpdate?.focus();
}

function chemistryStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function chemistryList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items.map((item) => `<div class="course-list-item">${item}</div>`).join("");
}

function chemistrySnapshotLine(label, value) {
  return `<strong>${label}:</strong> ${value}`;
}

function chemistryReportStatus(report) {
  return {
    completed: report?.completedReports || 0,
    expected: report?.expectedReports || 3,
    complete: Boolean(report?.complete),
  };
}

function chemistryWeekRangeLabel() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function renderChemistryWeeklySummary(roster) {
  if (!chemistryPage.weeklySummary) {
    return;
  }

  const course = chemistryCourseData();
  const reports = chemistryReportsByStudent();
  const totals = roster.reduce((summary, student) => {
    const reportStatus = chemistryReportStatus(reports[student.name]);

    return {
      completed: summary.completed + reportStatus.completed,
      expected: summary.expected + reportStatus.expected,
      coveredStudents: summary.coveredStudents + (reportStatus.complete ? 1 : 0),
    };
  }, { completed: 0, expected: 0, coveredStudents: 0 });
  const missingStudents = roster
    .filter((student) => !chemistryReportStatus(reports[student.name]).complete)
    .map((student) => student.name);
  const sessionPlan = [
    "Tue · HTML structure and semantic tags",
    "Thu · CSS selectors and spacing review",
  ];
  const pendingLabel = missingStudents.length
    ? missingStudents.slice(0, 3).join(", ")
    : "Everyone is covered for the current cycle.";
  const pendingSuffix = missingStudents.length > 3 ? ` +${missingStudents.length - 3} more` : "";

  chemistryPage.weeklySummary.innerHTML = `
    <div class="course-weekly-summary-head">
      <div>
        <p class="eyebrow">This Week</p>
        <h4>Week of ${chemistryWeekRangeLabel()}</h4>
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

function chemistryRosterCards(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Chemistry Foundations.</div>`;
  }

  const goalOverrides = chemistryReadGoalOverrides();
  const studentNotes = chemistryReadNotesByStudent();
  const reports = chemistryReportsByStudent();
  const rows = roster.map((student) => {
    const status = chemistryStatus(student);
    const goal = goalOverrides[student.name] || student.goal || "No goal listed yet.";
    const followUp = Array.isArray(student.tasks) && student.tasks.length
      ? student.tasks.join(", ")
      : "No current follow-up listed.";
    const noteEntries = studentNotes[student.name] || [];
    const hasNotes = noteEntries.length > 0;
    const reportStatus = chemistryReportStatus(reports[student.name]);

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
            <button class="course-goal-edit-button" type="button" data-edit-chemistry-goal="${student.name}" aria-label="Edit goal for ${student.name}">...</button>
          </div>
          <div class="course-roster-followup">${followUp}</div>
        </div>
        <div class="course-roster-meta-cell">
          <span>${student.presentToday ? "Here" : "Absent"}</span>
          <span>${typeof student.progress === "number" ? `${student.progress}% progress` : "Progress not set"}</span>
        </div>
        <div class="course-roster-notes-cell">
          <button class="course-notes-button ${hasNotes ? "filled" : "empty"}" type="button" data-open-chemistry-notes="${student.name}" aria-label="Open notes for ${student.name}">
            <span class="course-notes-icon" aria-hidden="true"></span>
          </button>
        </div>
        <div class="course-roster-reports-cell">
          <button class="course-report-pill ${reportStatus.complete ? "filled" : "missing"}" type="button" data-focus-chemistry-report="${student.name}" aria-label="Review reports for ${student.name}">
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

function renderChemistryStudentOptions(roster) {
  if (!chemistryPage.studentSelect) {
    return;
  }

  chemistryPage.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.name}">${student.name}</option>`)
    .join("");

  if (chemistryPage.reportStudentSelect) {
    chemistryPage.reportStudentSelect.innerHTML = roster
      .map((student) => `<option value="${student.name}">${student.name}</option>`)
      .join("");
  }
}

function renderChemistryReports(roster) {
  if (!chemistryPage.reportList) {
    return;
  }

  const reports = chemistryReportsByStudent();
  chemistryPage.reportList.innerHTML = roster.map((student) => {
    const report = reports[student.name];
    const reportStatus = chemistryReportStatus(report);

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
}

function renderChemistrySessionHistory(roster) {
  if (!chemistryPage.sessionHistory) {
    return;
  }

  const attendanceOne = roster.length ? Math.max(0, roster.length - 1) : 0;
  const attendanceTwo = roster.length ? Math.max(0, roster.length - 2) : 0;
  const entries = [
    {
      date: "Apr 16, 2026",
      focus: "HTML structure and semantic tags",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students practiced semantic page structure, reviewed common tag misuse, and corrected starter layouts in pairs.",
    },
    {
      date: "Apr 14, 2026",
      focus: "CSS selectors and spacing systems",
      attendance: `${attendanceTwo}/${roster.length || 0} present`,
      recap: "The class worked through selector targeting, box model cleanup, and layout spacing fixes before a quick exit check.",
    },
    {
      date: "Apr 9, 2026",
      focus: "Landing page build check-in",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students used the block for landing page revisions, recovery on missing styling tasks, and one-to-one feedback conferences.",
    },
  ];

  chemistryPage.sessionHistory.innerHTML = `
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

function renderChemistrySessionsTab(roster) {
  if (!chemistryPage.sessionsPanel || !window.CourseSessionsUI) {
    return;
  }

  chemistrySessionEntries = window.CourseSessionsUI.buildSessionEntries({
    course: chemistryCourseData(),
    roster,
    reportsByStudent: chemistryReportsByStudent(),
    currentSession: CHEMISTRY_CURRENT_SESSION,
    totalSessions: 16,
    isOpenClass: false,
  });

  chemistryPage.sessionsPanel.innerHTML = window.CourseSessionsUI.renderSessionsPanel(chemistrySessionEntries);
}

function openChemistrySessionReports(entryIndex) {
  const entry = chemistrySessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: chemistryPage.sessionModal,
      title: chemistryPage.sessionModalTitle,
      summary: chemistryPage.sessionModalSummary,
      list: chemistryPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} reports`,
      summary: `${entry.dateLabel} · ${entry.timeLabel}`,
      body: window.CourseSessionsUI.renderSessionReportsBody(entry),
    },
  );
}

function openChemistrySessionAttendance(entryIndex) {
  const entry = chemistrySessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: chemistryPage.sessionModal,
      title: chemistryPage.sessionModalTitle,
      summary: chemistryPage.sessionModalSummary,
      list: chemistryPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} attendance`,
      summary: `${entry.dateLabel} · ${entry.timeLabel} · ${entry.attendancePillLabel}`,
      body: window.CourseSessionsUI.renderSessionAttendanceBody(entry),
    },
  );
}

function closeChemistrySessionModal() {
  window.CourseSessionsUI?.closeSessionModal({
    modal: chemistryPage.sessionModal,
  });
}

function renderChemistryNotesModal() {
  if (!chemistryActiveNotesStudent || !chemistryPage.notesModalList) {
    return;
  }

  const notes = chemistryReadNotesByStudent()[chemistryActiveNotesStudent] || [];
  const orderedNotes = [...notes].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  chemistryPage.notesModalList.innerHTML = orderedNotes.length
    ? orderedNotes.map((entry) => `
        <article class="notes-entry">
          <div class="notes-entry-head">
            <p class="notes-entry-date">${new Date(entry.createdAt).toLocaleString()}</p>
            <button class="notes-entry-check" type="button" data-dismiss-chemistry-note="${entry.createdAt}" aria-label="Dismiss note from ${new Date(entry.createdAt).toLocaleString()}">✓</button>
          </div>
          <p class="notes-entry-body">${entry.text}</p>
        </article>
      `).join("")
    : `<p class="notes-empty">No saved notes for ${chemistryActiveNotesStudent} yet.</p>`;
}

function closeChemistryNotesModal() {
  chemistryActiveNotesStudent = null;
  chemistryPage.notesModal.classList.add("hidden");
  chemistryPage.notesModal.setAttribute("aria-hidden", "true");
}

function renderChemistryReportHistoryModal() {
  if (!chemistryActiveReportStudent || !chemistryPage.reportHistoryList) {
    return;
  }

  const report = chemistryReportsByStudent()[chemistryActiveReportStudent];
  const reportStatus = chemistryReportStatus(report);
  const orderedHistory = [...(report?.history || [])]
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));

  if (chemistryPage.reportHistorySummary) {
    chemistryPage.reportHistorySummary.textContent = `${reportStatus.completed}/${reportStatus.expected} reports completed for ${chemistryActiveReportStudent}.`;
  }

  chemistryPage.reportHistoryList.innerHTML = orderedHistory.length
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
    : `<p class="notes-empty">No submitted reports for ${chemistryActiveReportStudent} yet.</p>`;
}

function closeChemistryReportHistoryModal() {
  chemistryActiveReportStudent = null;
  chemistryPage.reportHistoryModal?.classList.add("hidden");
  chemistryPage.reportHistoryModal?.setAttribute("aria-hidden", "true");
}

function renderChemistryRosterPage() {
  const course = chemistryCourseData();
  const roster = chemistryStudents();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + (typeof student.progress === "number" ? student.progress : 0), 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  document.title = `${course.title} | Web Development Foundations Course Page`;
  chemistryPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  chemistryPage.averageProgress.textContent = `${averageProgress}%`;
  chemistryPage.alertCount.textContent = `${activeAlerts}`;
  renderChemistryStudentOptions(roster);
  chemistryPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  chemistryPage.reportStatus.textContent = "Submit concise weekly reports to update the admin view.";
  chemistryPage.roster.innerHTML = chemistryRosterCards(roster);
  renderChemistryWeeklySummary(roster);
  renderChemistryReports(roster);
  renderChemistrySessionHistory(roster);
  renderChemistrySessionsTab(roster);
  prefillChemistryReportTarget();
  const behindStudents = roster
    .filter((student) => student.needsHelp || student.alertActive || student.progress < 75 || student.attendance < 85)
    .map((student) => student.name);

  chemistryList(chemistryPage.summary, [
    chemistrySnapshotLine("Current unit", course.currentUnit),
    chemistrySnapshotLine("Curriculum expectation", course.progressBenchmark),
    behindStudents.length
      ? chemistrySnapshotLine("Known to be behind", behindStudents.join(", "))
      : chemistrySnapshotLine("Known to be behind", "No students currently flagged."),
  ]);
  chemistryList(chemistryPage.expectations, course.expectations);
  chemistryList(chemistryPage.milestones, course.milestones);
}

chemistryPage.planningSave?.addEventListener("click", () => {
  const studentName = chemistryPage.studentSelect?.value;
  const noteText = chemistryPage.planningNote.value.trim();

  if (!studentName || !noteText) {
    chemistryPage.planningStatus.textContent = "Select a student and enter a note before saving.";
    return;
  }

  const notesByStudent = chemistryReadNotesByStudent();
  const existingNotes = notesByStudent[studentName] || [];
  notesByStudent[studentName] = [
    {
      text: noteText,
      createdAt: new Date().toISOString(),
    },
    ...existingNotes,
  ];
  chemistryWriteNotesByStudent(notesByStudent);
  chemistryPage.planningNote.value = "";
  chemistryPage.planningStatus.textContent = `Saved note for ${studentName}.`;
  renderChemistryRosterPage();
});

chemistryPage.reportSave?.addEventListener("click", () => {
  const studentName = chemistryPage.reportStudentSelect?.value;
  const assignmentUpdate = chemistryPage.reportAssignmentUpdate?.value.trim();
  const nextStep = chemistryPage.reportNextStep?.value.trim();

  if (!studentName || !assignmentUpdate || !nextStep) {
    chemistryPage.reportStatus.textContent = "Complete both report fields before submitting.";
    return;
  }

  window.portalStore.saveStudentCourseReport(CHEMISTRY_ID, studentName, {
    assignmentUpdate,
    nextStep,
  });

  chemistryPage.reportAssignmentUpdate.value = "";
  chemistryPage.reportNextStep.value = "";
  chemistryPage.reportStatus.textContent = `Submitted report for ${studentName}.`;
  renderChemistryRosterPage();
});

chemistryPage.roster?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-focus-chemistry-report]");

  if (reportButton && chemistryPage.reportStudentSelect) {
    chemistryActiveReportStudent = reportButton.dataset.focusChemistryReport;
    renderChemistryReportHistoryModal();
    chemistryPage.reportHistoryModal?.classList.remove("hidden");
    chemistryPage.reportHistoryModal?.setAttribute("aria-hidden", "false");
    return;
  }

  const button = event.target.closest("[data-edit-chemistry-goal]");

  if (!button) {
    return;
  }

  const studentName = button.dataset.editChemistryGoal;
  const student = chemistryStudents().find((entry) => entry.name === studentName);
  const overrides = chemistryReadGoalOverrides();
  chemistryActiveGoalStudent = studentName;
  chemistryPage.goalModalInput.value = overrides[studentName] || student?.goal || "";
  chemistryPage.goalModal.classList.remove("hidden");
  chemistryPage.goalModal.setAttribute("aria-hidden", "false");
  chemistryPage.goalModalInput.focus();
});

function closeChemistryGoalModal() {
  chemistryActiveGoalStudent = null;
  chemistryPage.goalModal.classList.add("hidden");
  chemistryPage.goalModal.setAttribute("aria-hidden", "true");
}

chemistryPage.goalModalSave?.addEventListener("click", () => {
  if (!chemistryActiveGoalStudent) {
    closeChemistryGoalModal();
    return;
  }

  const overrides = chemistryReadGoalOverrides();
  const trimmedGoal = chemistryPage.goalModalInput.value.trim();

  if (trimmedGoal) {
    overrides[chemistryActiveGoalStudent] = trimmedGoal;
  } else {
    delete overrides[chemistryActiveGoalStudent];
  }

  chemistryWriteGoalOverrides(overrides);
  closeChemistryGoalModal();
  renderChemistryRosterPage();
});

chemistryPage.goalModalClose?.addEventListener("click", closeChemistryGoalModal);
chemistryPage.goalModalCancel?.addEventListener("click", closeChemistryGoalModal);
chemistryPage.goalModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-goal-modal='true']")) {
    closeChemistryGoalModal();
  }
});

chemistryPage.roster?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-chemistry-notes]");

  if (!button) {
    return;
  }

  chemistryActiveNotesStudent = button.dataset.openChemistryNotes;
  renderChemistryNotesModal();
  chemistryPage.notesModal.classList.remove("hidden");
  chemistryPage.notesModal.setAttribute("aria-hidden", "false");
});

chemistryPage.notesModalClose?.addEventListener("click", closeChemistryNotesModal);
chemistryPage.notesModalDone?.addEventListener("click", closeChemistryNotesModal);
chemistryPage.notesModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-notes-modal='true']")) {
    closeChemistryNotesModal();
    return;
  }

  const dismissButton = event.target.closest("[data-dismiss-chemistry-note]");

  if (!dismissButton || !chemistryActiveNotesStudent) {
    return;
  }

  const targetCreatedAt = dismissButton.dataset.dismissChemistryNote;
  const notesByStudent = chemistryReadNotesByStudent();
  const existingNotes = notesByStudent[chemistryActiveNotesStudent] || [];
  const filteredNotes = existingNotes.filter((entry) => entry.createdAt !== targetCreatedAt);

  if (filteredNotes.length) {
    notesByStudent[chemistryActiveNotesStudent] = filteredNotes;
  } else {
    delete notesByStudent[chemistryActiveNotesStudent];
  }

  chemistryWriteNotesByStudent(notesByStudent);
  renderChemistryRosterPage();
  renderChemistryNotesModal();
});

chemistryPage.reportHistoryClose?.addEventListener("click", closeChemistryReportHistoryModal);
chemistryPage.reportHistoryDone?.addEventListener("click", closeChemistryReportHistoryModal);
chemistryPage.reportHistoryEdit?.addEventListener("click", () => {
  if (!chemistryActiveReportStudent || !chemistryPage.reportStudentSelect) {
    closeChemistryReportHistoryModal();
    return;
  }

  chemistryPage.reportStudentSelect.value = chemistryActiveReportStudent;
  chemistryPage.reportStatus.textContent = `Ready to update the report history for ${chemistryActiveReportStudent}.`;
  closeChemistryReportHistoryModal();
  const reportPanel = chemistryPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  chemistryPage.reportAssignmentUpdate?.focus();
});
chemistryPage.reportHistoryModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-report-history-modal='true']")) {
    closeChemistryReportHistoryModal();
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

chemistryPage.sessionsPanel?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-open-course-session-reports]");
  const attendanceButton = event.target.closest("[data-open-course-session-attendance]");

  if (reportButton) {
    openChemistrySessionReports(reportButton.dataset.openCourseSessionReports);
    return;
  }

  if (attendanceButton) {
    openChemistrySessionAttendance(attendanceButton.dataset.openCourseSessionAttendance);
  }
});

chemistryPage.sessionModalClose?.addEventListener("click", closeChemistrySessionModal);
chemistryPage.sessionModalDone?.addEventListener("click", closeChemistrySessionModal);
chemistryPage.sessionModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-course-session-modal='true']")) {
    closeChemistrySessionModal();
  }
});

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === "portal-student-course-reports" ||
    event.key === CHEMISTRY_NOTES_KEY ||
    event.key === CHEMISTRY_GOALS_KEY
  ) {
    renderChemistryRosterPage();
    if (chemistryActiveNotesStudent) {
      renderChemistryNotesModal();
    }
    if (chemistryActiveReportStudent) {
      renderChemistryReportHistoryModal();
    }
  }
});

renderChemistryRosterPage();
