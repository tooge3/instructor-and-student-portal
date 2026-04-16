const ALGEBRA_ID = "stem-bridge";
const ALGEBRA_NOTES_KEY = "portal-notes-algebra-ii";
const ALGEBRA_GOALS_KEY = "portal-goals-algebra-ii";
const algebraPage = {
  studentCount: document.getElementById("algebra-student-count"),
  averageProgress: document.getElementById("algebra-average-progress"),
  alertCount: document.getElementById("algebra-alert-count"),
  summary: document.getElementById("algebra-summary"),
  planningNote: document.getElementById("algebra-course-note"),
  studentSelect: document.getElementById("algebra-student-select"),
  planningSave: document.getElementById("algebra-course-note-save"),
  planningStatus: document.getElementById("algebra-course-note-status"),
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
};

let algebraActiveGoalStudent = null;
let algebraActiveNotesStudent = null;

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

function algebraRosterMarkup(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Algebra II.</div>`;
  }

  const goalOverrides = algebraReadGoalOverrides();
  const studentNotes = algebraReadNotesByStudent();
  const rows = roster.map((student) => {
    const status = algebraStatus(student);
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

function renderAlgebraStudentOptions(roster) {
  if (!algebraPage.studentSelect) {
    return;
  }

  algebraPage.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.name}">${student.name}</option>`)
    .join("");
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
  document.title = `${course.title} | Algebra II Course Page`;
  algebraPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  algebraPage.averageProgress.textContent = `${averageProgress}%`;
  algebraPage.alertCount.textContent = `${activeAlerts}`;
  renderAlgebraStudentOptions(roster);
  algebraPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  algebraPage.roster.innerHTML = algebraRosterMarkup(roster);

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

algebraPage.roster?.addEventListener("click", (event) => {
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

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === ALGEBRA_NOTES_KEY ||
    event.key === ALGEBRA_GOALS_KEY
  ) {
    renderAlgebraRosterPage();
    if (algebraActiveNotesStudent) {
      renderAlgebraNotesModal();
    }
  }
});

renderAlgebraRosterPage();
