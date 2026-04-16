const CHEMISTRY_ID = "chemistry-prep";
const CHEMISTRY_NOTES_KEY = "portal-notes-chemistry-foundations";
const CHEMISTRY_GOALS_KEY = "portal-goals-chemistry-foundations";
const chemistryPage = {
  studentCount: document.getElementById("chemistry-student-count"),
  averageProgress: document.getElementById("chemistry-average-progress"),
  alertCount: document.getElementById("chemistry-alert-count"),
  summary: document.getElementById("chemistry-summary"),
  planningNote: document.getElementById("chemistry-course-note"),
  studentSelect: document.getElementById("chemistry-student-select"),
  planningSave: document.getElementById("chemistry-course-note-save"),
  planningStatus: document.getElementById("chemistry-course-note-status"),
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
};

let chemistryActiveGoalStudent = null;
let chemistryActiveNotesStudent = null;

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

function chemistryRosterCards(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Chemistry Foundations.</div>`;
  }

  const goalOverrides = chemistryReadGoalOverrides();
  const studentNotes = chemistryReadNotesByStudent();
  const rows = roster.map((student) => {
    const status = chemistryStatus(student);
    const goal = goalOverrides[student.name] || student.goal || "No goal listed yet.";
    const followUp = Array.isArray(student.tasks) && student.tasks.length
      ? student.tasks.join(", ")
      : "No current follow-up listed.";
    const noteEntries = studentNotes[student.name] || [];
    const hasNotes = noteEntries.length > 0;

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

function renderChemistryRosterPage() {
  const course = chemistryCourseData();
  const roster = chemistryStudents();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + (typeof student.progress === "number" ? student.progress : 0), 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  document.title = `${course.title} | Chemistry Foundations Course Page`;
  chemistryPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  chemistryPage.averageProgress.textContent = `${averageProgress}%`;
  chemistryPage.alertCount.textContent = `${activeAlerts}`;
  renderChemistryStudentOptions(roster);
  chemistryPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  chemistryPage.roster.innerHTML = chemistryRosterCards(roster);
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

chemistryPage.roster?.addEventListener("click", (event) => {
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

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === CHEMISTRY_NOTES_KEY ||
    event.key === CHEMISTRY_GOALS_KEY
  ) {
    renderChemistryRosterPage();
    if (chemistryActiveNotesStudent) {
      renderChemistryNotesModal();
    }
  }
});

renderChemistryRosterPage();
