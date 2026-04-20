const ALGEBRA_ID = "stem-bridge";
const ALGEBRA_NOTES_KEY = "portal-notes-algebra-ii";
const ALGEBRA_GOALS_KEY = "portal-goals-algebra-ii";
const ALGEBRA_CURRENT_SESSION = 9;
const algebraPage = {
  studentCount: document.getElementById("algebra-student-count"),
  averageProgress: document.getElementById("algebra-average-progress"),
  alertCount: document.getElementById("algebra-alert-count"),
  summary: document.getElementById("algebra-summary"),
  planningNote: document.getElementById("algebra-course-note"),
  studentSelect: document.getElementById("algebra-student-select"),
  planningSave: document.getElementById("algebra-course-note-save"),
  planningStatus: document.getElementById("algebra-course-note-status"),
  reportStudentSelect: document.getElementById("algebra-report-student-select"),
  reportAssignmentUpdate: document.getElementById("algebra-report-assignment-update"),
  reportNextStep: document.getElementById("algebra-report-next-step"),
  reportSave: document.getElementById("algebra-report-save"),
  reportStatus: document.getElementById("algebra-report-status"),
  weeklySummary: document.getElementById("algebra-weekly-summary"),
  reportList: document.getElementById("algebra-report-list"),
  sessionHistory: document.getElementById("algebra-session-history"),
  roster: document.getElementById("algebra-roster"),
  expectations: document.getElementById("algebra-expectations"),
  milestones: document.getElementById("algebra-milestones"),
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
  sessionsPanel: document.getElementById("algebra-sessions-panel"),
  sessionModal: document.getElementById("course-session-modal"),
  sessionModalTitle: document.getElementById("course-session-modal-title"),
  sessionModalSummary: document.getElementById("course-session-modal-summary"),
  sessionModalList: document.getElementById("course-session-modal-list"),
  sessionModalClose: document.getElementById("course-session-modal-close"),
  sessionModalDone: document.getElementById("course-session-modal-done"),
};

let algebraActiveGoalStudent = null;
let algebraActiveNotesStudent = null;
let algebraActiveReportStudent = null;
let algebraSessionEntries = [];

function algebraCourseData() {
  return window.portalStore.getCourse(ALGEBRA_ID);
}

function algebraStudents() {
  return window.portalStore.getStudents().filter((student) => student.courseId === ALGEBRA_ID);
}

function algebraReadGoalOverrides() {
  const stored = window.localStorage.getItem(ALGEBRA_GOALS_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function algebraWriteGoalOverrides(overrides) {
  window.localStorage.setItem(ALGEBRA_GOALS_KEY, JSON.stringify(overrides));
}

function algebraReadNotesByStudent() {
  const stored = window.localStorage.getItem(ALGEBRA_NOTES_KEY);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function algebraWriteNotesByStudent(notes) {
  window.localStorage.setItem(ALGEBRA_NOTES_KEY, JSON.stringify(notes));
}

function algebraReportsByStudent() {
  return window.portalStore.ensureStudentCourseReports(
    ALGEBRA_ID,
    algebraStudents().map((student) => student.name),
  );
}

function prefillAlgebraReportTarget() {
  const params = new URLSearchParams(window.location.search);
  const reportStudent = params.get("reportStudent");

  if (!reportStudent || !algebraPage.reportStudentSelect) {
    return;
  }

  const optionExists = Array.from(algebraPage.reportStudentSelect.options).some((option) => option.value === reportStudent);

  if (!optionExists) {
    return;
  }

  algebraPage.reportStudentSelect.value = reportStudent;
  algebraPage.reportStatus.textContent = `Ready to submit a report for ${reportStudent}.`;
  const reportPanel = algebraPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  algebraPage.reportAssignmentUpdate?.focus();
}

function algebraStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function algebraList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items.map((item) => `<div class="course-list-item">${item}</div>`).join("");
}

function algebraSnapshotLine(label, value) {
  return `<strong>${label}:</strong> ${value}`;
}

function algebraReportStatus(report) {
  return {
    completed: report?.completedReports || 0,
    expected: report?.expectedReports || 3,
    complete: Boolean(report?.complete),
  };
}

function algebraWeekRangeLabel() {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function renderAlgebraWeeklySummary(roster) {
  if (!algebraPage.weeklySummary) {
    return;
  }

  const course = algebraCourseData();
  const reports = algebraReportsByStudent();
  const totals = roster.reduce((summary, student) => {
    const reportStatus = algebraReportStatus(reports[student.name]);

    return {
      completed: summary.completed + reportStatus.completed,
      expected: summary.expected + reportStatus.expected,
      coveredStudents: summary.coveredStudents + (reportStatus.complete ? 1 : 0),
    };
  }, { completed: 0, expected: 0, coveredStudents: 0 });
  const missingStudents = roster
    .filter((student) => !algebraReportStatus(reports[student.name]).complete)
    .map((student) => student.name);
  const sessionPlan = [
    "Mon · Functions and parameter flow",
    "Thu · Arrays, iteration, and debug lab",
  ];
  const pendingLabel = missingStudents.length
    ? missingStudents.slice(0, 3).join(", ")
    : "Everyone is covered for the current cycle.";
  const pendingSuffix = missingStudents.length > 3 ? ` +${missingStudents.length - 3} more` : "";

  algebraPage.weeklySummary.innerHTML = `
    <div class="course-weekly-summary-head">
      <div>
        <p class="eyebrow">This Week</p>
        <h4>Week of ${algebraWeekRangeLabel()}</h4>
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

function algebraRosterMarkup(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Algebra II.</div>`;
  }

  const goalOverrides = algebraReadGoalOverrides();
  const studentNotes = algebraReadNotesByStudent();
  const reports = algebraReportsByStudent();
  const rows = roster.map((student) => {
    const status = algebraStatus(student);
    const goal = goalOverrides[student.name] || student.goal || "No goal listed yet.";
    const followUp = Array.isArray(student.tasks) && student.tasks.length
      ? student.tasks.join(", ")
      : "No current follow-up listed.";
    const noteEntries = studentNotes[student.name] || [];
    const hasNotes = noteEntries.length > 0;
    const reportStatus = algebraReportStatus(reports[student.name]);

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
            <button class="course-goal-edit-button" type="button" data-edit-algebra-goal="${student.name}" aria-label="Edit goal for ${student.name}">...</button>
          </div>
          <div class="course-roster-followup">${followUp}</div>
        </div>
        <div class="course-roster-meta-cell">
          <span>${student.presentToday ? "Here" : "Absent"}</span>
          <span>${typeof student.progress === "number" ? `${student.progress}% progress` : "Progress not set"}</span>
        </div>
        <div class="course-roster-notes-cell">
          <button class="course-notes-button ${hasNotes ? "filled" : "empty"}" type="button" data-open-algebra-notes="${student.name}" aria-label="Open notes for ${student.name}">
            <span class="course-notes-icon" aria-hidden="true"></span>
          </button>
        </div>
        <div class="course-roster-reports-cell">
          <button class="course-report-pill ${reportStatus.complete ? "filled" : "missing"}" type="button" data-focus-algebra-report="${student.name}" aria-label="Review reports for ${student.name}">
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

function renderAlgebraStudentOptions(roster) {
  if (!algebraPage.studentSelect) {
    return;
  }

  algebraPage.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.name}">${student.name}</option>`)
    .join("");

  if (algebraPage.reportStudentSelect) {
    algebraPage.reportStudentSelect.innerHTML = roster
      .map((student) => `<option value="${student.name}">${student.name}</option>`)
      .join("");
  }
}

function renderAlgebraReports(roster) {
  if (!algebraPage.reportList) {
    return;
  }

  const reports = algebraReportsByStudent();
  algebraPage.reportList.innerHTML = roster.map((student) => {
    const report = reports[student.name];
    const reportStatus = algebraReportStatus(report);

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

function renderAlgebraSessionHistory(roster) {
  if (!algebraPage.sessionHistory) {
    return;
  }

  const attendanceOne = roster.length ? Math.max(0, roster.length - 1) : 0;
  const attendanceTwo = roster.length ? Math.max(0, roster.length - 2) : 0;
  const entries = [
    {
      date: "Apr 16, 2026",
      focus: "JavaScript arrays and iteration",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students worked through array traversal examples, reviewed loop patterns, and corrected recent iteration mistakes together.",
    },
    {
      date: "Apr 13, 2026",
      focus: "Function practice and parameter flow",
      attendance: `${attendanceTwo}/${roster.length || 0} present`,
      recap: "The class focused on writing reusable functions, tracing parameter values, and discussing where function structure was breaking down.",
    },
    {
      date: "Apr 9, 2026",
      focus: "Debugging lab and code review",
      attendance: `${attendanceOne}/${roster.length || 0} present`,
      recap: "Students spent the session debugging starter programs, documenting errors, and reviewing one another’s fixes before dismissal.",
    },
  ];

  algebraPage.sessionHistory.innerHTML = `
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

function renderAlgebraSessionsTab(roster) {
  if (!algebraPage.sessionsPanel || !window.CourseSessionsUI) {
    return;
  }

  algebraSessionEntries = window.CourseSessionsUI.buildSessionEntries({
    course: algebraCourseData(),
    roster,
    reportsByStudent: algebraReportsByStudent(),
    currentSession: ALGEBRA_CURRENT_SESSION,
    totalSessions: 16,
    isOpenClass: false,
  });

  algebraPage.sessionsPanel.innerHTML = window.CourseSessionsUI.renderSessionsPanel(algebraSessionEntries);
}

function openAlgebraSessionReports(entryIndex) {
  const entry = algebraSessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: algebraPage.sessionModal,
      title: algebraPage.sessionModalTitle,
      summary: algebraPage.sessionModalSummary,
      list: algebraPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} reports`,
      summary: `${entry.dateLabel} · ${entry.timeLabel}`,
      body: window.CourseSessionsUI.renderSessionReportsBody(entry),
    },
  );
}

function openAlgebraSessionAttendance(entryIndex) {
  const entry = algebraSessionEntries[Number(entryIndex)];

  if (!entry) {
    return;
  }

  window.CourseSessionsUI.openSessionModal(
    {
      modal: algebraPage.sessionModal,
      title: algebraPage.sessionModalTitle,
      summary: algebraPage.sessionModalSummary,
      list: algebraPage.sessionModalList,
    },
    {
      title: `Session ${entry.label} attendance`,
      summary: `${entry.dateLabel} · ${entry.timeLabel} · ${entry.attendancePillLabel}`,
      body: window.CourseSessionsUI.renderSessionAttendanceBody(entry),
    },
  );
}

function closeAlgebraSessionModal() {
  window.CourseSessionsUI?.closeSessionModal({
    modal: algebraPage.sessionModal,
  });
}

function renderAlgebraNotesModal() {
  if (!algebraActiveNotesStudent || !algebraPage.notesModalList) {
    return;
  }

  const notes = algebraReadNotesByStudent()[algebraActiveNotesStudent] || [];
  const orderedNotes = [...notes].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  algebraPage.notesModalList.innerHTML = orderedNotes.length
    ? orderedNotes.map((entry) => `
        <article class="notes-entry">
          <div class="notes-entry-head">
            <p class="notes-entry-date">${new Date(entry.createdAt).toLocaleString()}</p>
            <button class="notes-entry-check" type="button" data-dismiss-algebra-note="${entry.createdAt}" aria-label="Dismiss note from ${new Date(entry.createdAt).toLocaleString()}">✓</button>
          </div>
          <p class="notes-entry-body">${entry.text}</p>
        </article>
      `).join("")
    : `<p class="notes-empty">No saved notes for ${algebraActiveNotesStudent} yet.</p>`;
}

function closeAlgebraNotesModal() {
  algebraActiveNotesStudent = null;
  algebraPage.notesModal.classList.add("hidden");
  algebraPage.notesModal.setAttribute("aria-hidden", "true");
}

function renderAlgebraReportHistoryModal() {
  if (!algebraActiveReportStudent || !algebraPage.reportHistoryList) {
    return;
  }

  const report = algebraReportsByStudent()[algebraActiveReportStudent];
  const reportStatus = algebraReportStatus(report);
  const orderedHistory = [...(report?.history || [])]
    .sort((left, right) => new Date(right.submittedAt) - new Date(left.submittedAt));

  if (algebraPage.reportHistorySummary) {
    algebraPage.reportHistorySummary.textContent = `${reportStatus.completed}/${reportStatus.expected} reports completed for ${algebraActiveReportStudent}.`;
  }

  algebraPage.reportHistoryList.innerHTML = orderedHistory.length
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
    : `<p class="notes-empty">No submitted reports for ${algebraActiveReportStudent} yet.</p>`;
}

function closeAlgebraReportHistoryModal() {
  algebraActiveReportStudent = null;
  algebraPage.reportHistoryModal?.classList.add("hidden");
  algebraPage.reportHistoryModal?.setAttribute("aria-hidden", "true");
}

function renderAlgebraRosterPage() {
  const course = algebraCourseData();
  const roster = algebraStudents();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + (typeof student.progress === "number" ? student.progress : 0), 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  const behindStudents = roster
    .filter((student) => student.needsHelp || student.alertActive || student.progress < 75 || student.attendance < 85)
    .map((student) => student.name);
  document.title = `${course.title} | JavaScript Lecture Lab Course Page`;
  algebraPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  algebraPage.averageProgress.textContent = `${averageProgress}%`;
  algebraPage.alertCount.textContent = `${activeAlerts}`;
  renderAlgebraStudentOptions(roster);
  algebraPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  algebraPage.reportStatus.textContent = "Submit concise weekly reports to update the admin view.";
  algebraPage.roster.innerHTML = algebraRosterMarkup(roster);
  renderAlgebraWeeklySummary(roster);
  renderAlgebraReports(roster);
  renderAlgebraSessionHistory(roster);
  renderAlgebraSessionsTab(roster);
  prefillAlgebraReportTarget();

  algebraList(algebraPage.summary, [
    algebraSnapshotLine("Current unit", course.currentUnit),
    algebraSnapshotLine("Curriculum expectation", course.progressBenchmark),
    behindStudents.length
      ? algebraSnapshotLine("Known to be behind", behindStudents.join(", "))
      : algebraSnapshotLine("Known to be behind", "No students currently flagged."),
  ]);
  algebraList(algebraPage.expectations, course.expectations);
  algebraList(algebraPage.milestones, course.milestones);
}

algebraPage.planningSave?.addEventListener("click", () => {
  const studentName = algebraPage.studentSelect?.value;
  const noteText = algebraPage.planningNote.value.trim();

  if (!studentName || !noteText) {
    algebraPage.planningStatus.textContent = "Select a student and enter a note before saving.";
    return;
  }

  const notesByStudent = algebraReadNotesByStudent();
  const existingNotes = notesByStudent[studentName] || [];
  notesByStudent[studentName] = [
    {
      text: noteText,
      createdAt: new Date().toISOString(),
    },
    ...existingNotes,
  ];
  algebraWriteNotesByStudent(notesByStudent);
  algebraPage.planningNote.value = "";
  algebraPage.planningStatus.textContent = `Saved note for ${studentName}.`;
  renderAlgebraRosterPage();
});

algebraPage.reportSave?.addEventListener("click", () => {
  const studentName = algebraPage.reportStudentSelect?.value;
  const assignmentUpdate = algebraPage.reportAssignmentUpdate?.value.trim();
  const nextStep = algebraPage.reportNextStep?.value.trim();

  if (!studentName || !assignmentUpdate || !nextStep) {
    algebraPage.reportStatus.textContent = "Complete both report fields before submitting.";
    return;
  }

  window.portalStore.saveStudentCourseReport(ALGEBRA_ID, studentName, {
    assignmentUpdate,
    nextStep,
  });

  algebraPage.reportAssignmentUpdate.value = "";
  algebraPage.reportNextStep.value = "";
  algebraPage.reportStatus.textContent = `Submitted report for ${studentName}.`;
  renderAlgebraRosterPage();
});

algebraPage.roster?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-focus-algebra-report]");

  if (reportButton && algebraPage.reportStudentSelect) {
    algebraActiveReportStudent = reportButton.dataset.focusAlgebraReport;
    renderAlgebraReportHistoryModal();
    algebraPage.reportHistoryModal?.classList.remove("hidden");
    algebraPage.reportHistoryModal?.setAttribute("aria-hidden", "false");
    return;
  }

  const button = event.target.closest("[data-edit-algebra-goal]");

  if (!button) {
    return;
  }

  const studentName = button.dataset.editAlgebraGoal;
  const student = algebraStudents().find((entry) => entry.name === studentName);
  const overrides = algebraReadGoalOverrides();
  algebraActiveGoalStudent = studentName;
  algebraPage.goalModalInput.value = overrides[studentName] || student?.goal || "";
  algebraPage.goalModal.classList.remove("hidden");
  algebraPage.goalModal.setAttribute("aria-hidden", "false");
  algebraPage.goalModalInput.focus();
});

function closeAlgebraGoalModal() {
  algebraActiveGoalStudent = null;
  algebraPage.goalModal.classList.add("hidden");
  algebraPage.goalModal.setAttribute("aria-hidden", "true");
}

algebraPage.goalModalSave?.addEventListener("click", () => {
  if (!algebraActiveGoalStudent) {
    closeAlgebraGoalModal();
    return;
  }

  const overrides = algebraReadGoalOverrides();
  const trimmedGoal = algebraPage.goalModalInput.value.trim();

  if (trimmedGoal) {
    overrides[algebraActiveGoalStudent] = trimmedGoal;
  } else {
    delete overrides[algebraActiveGoalStudent];
  }

  algebraWriteGoalOverrides(overrides);
  closeAlgebraGoalModal();
  renderAlgebraRosterPage();
});

algebraPage.goalModalClose?.addEventListener("click", closeAlgebraGoalModal);
algebraPage.goalModalCancel?.addEventListener("click", closeAlgebraGoalModal);
algebraPage.goalModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-goal-modal='true']")) {
    closeAlgebraGoalModal();
  }
});

algebraPage.roster?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-algebra-notes]");

  if (!button) {
    return;
  }

  algebraActiveNotesStudent = button.dataset.openAlgebraNotes;
  renderAlgebraNotesModal();
  algebraPage.notesModal.classList.remove("hidden");
  algebraPage.notesModal.setAttribute("aria-hidden", "false");
});

algebraPage.notesModalClose?.addEventListener("click", closeAlgebraNotesModal);
algebraPage.notesModalDone?.addEventListener("click", closeAlgebraNotesModal);
algebraPage.notesModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-notes-modal='true']")) {
    closeAlgebraNotesModal();
    return;
  }

  const dismissButton = event.target.closest("[data-dismiss-algebra-note]");

  if (!dismissButton || !algebraActiveNotesStudent) {
    return;
  }

  const targetCreatedAt = dismissButton.dataset.dismissAlgebraNote;
  const notesByStudent = algebraReadNotesByStudent();
  const existingNotes = notesByStudent[algebraActiveNotesStudent] || [];
  const filteredNotes = existingNotes.filter((entry) => entry.createdAt !== targetCreatedAt);

  if (filteredNotes.length) {
    notesByStudent[algebraActiveNotesStudent] = filteredNotes;
  } else {
    delete notesByStudent[algebraActiveNotesStudent];
  }

  algebraWriteNotesByStudent(notesByStudent);
  renderAlgebraRosterPage();
  renderAlgebraNotesModal();
});

algebraPage.reportHistoryClose?.addEventListener("click", closeAlgebraReportHistoryModal);
algebraPage.reportHistoryDone?.addEventListener("click", closeAlgebraReportHistoryModal);
algebraPage.reportHistoryEdit?.addEventListener("click", () => {
  if (!algebraActiveReportStudent || !algebraPage.reportStudentSelect) {
    closeAlgebraReportHistoryModal();
    return;
  }

  algebraPage.reportStudentSelect.value = algebraActiveReportStudent;
  algebraPage.reportStatus.textContent = `Ready to update the report history for ${algebraActiveReportStudent}.`;
  closeAlgebraReportHistoryModal();
  const reportPanel = algebraPage.reportStudentSelect.closest(".panel");
  reportPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
  algebraPage.reportAssignmentUpdate?.focus();
});
algebraPage.reportHistoryModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-report-history-modal='true']")) {
    closeAlgebraReportHistoryModal();
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

algebraPage.sessionsPanel?.addEventListener("click", (event) => {
  const reportButton = event.target.closest("[data-open-course-session-reports]");
  const attendanceButton = event.target.closest("[data-open-course-session-attendance]");

  if (reportButton) {
    openAlgebraSessionReports(reportButton.dataset.openCourseSessionReports);
    return;
  }

  if (attendanceButton) {
    openAlgebraSessionAttendance(attendanceButton.dataset.openCourseSessionAttendance);
  }
});

algebraPage.sessionModalClose?.addEventListener("click", closeAlgebraSessionModal);
algebraPage.sessionModalDone?.addEventListener("click", closeAlgebraSessionModal);
algebraPage.sessionModal?.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-course-session-modal='true']")) {
    closeAlgebraSessionModal();
  }
});

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === "portal-student-course-reports" ||
    event.key === ALGEBRA_NOTES_KEY ||
    event.key === ALGEBRA_GOALS_KEY
  ) {
    renderAlgebraRosterPage();
    if (algebraActiveNotesStudent) {
      renderAlgebraNotesModal();
    }
    if (algebraActiveReportStudent) {
      renderAlgebraReportHistoryModal();
    }
  }
});

renderAlgebraRosterPage();
