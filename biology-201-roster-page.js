const BIOLOGY_ID = "biology-201";
const BIOLOGY_NOTES_KEY = "portal-notes-biology-201";
const BIOLOGY_GOALS_KEY = "portal-goals-biology-201";
const biologyPage = {
  studentCount: document.getElementById("biology-student-count"),
  averageProgress: document.getElementById("biology-average-progress"),
  alertCount: document.getElementById("biology-alert-count"),
  summary: document.getElementById("biology-summary"),
  planningNote: document.getElementById("biology-course-note"),
  studentSelect: document.getElementById("biology-student-select"),
  planningSave: document.getElementById("biology-course-note-save"),
  planningStatus: document.getElementById("biology-course-note-status"),
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
};

let biologyActiveGoalStudent = null;
let biologyActiveNotesStudent = null;

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

function biologyRosterCards(roster) {
  if (!roster.length) {
    return `<div class="course-roster-empty">No students loaded for Biology 201.</div>`;
  }

  const goalOverrides = biologyReadGoalOverrides();
  const studentNotes = biologyReadNotesByStudent();
  const rows = roster.map((student) => {
    const status = biologyStatus(student);
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

function renderBiologyStudentOptions(roster) {
  if (!biologyPage.studentSelect) {
    return;
  }

  biologyPage.studentSelect.innerHTML = roster
    .map((student) => `<option value="${student.name}">${student.name}</option>`)
    .join("");
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

function renderBiologyRosterPage() {
  const course = biologyCourseData();
  const roster = biologyStudents();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + (typeof student.progress === "number" ? student.progress : 0), 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  document.title = `${course.title} | Biology 201 Course Page`;
  biologyPage.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  biologyPage.averageProgress.textContent = `${averageProgress}%`;
  biologyPage.alertCount.textContent = `${activeAlerts}`;
  renderBiologyStudentOptions(roster);
  biologyPage.planningStatus.textContent = "Save a note to attach it to the selected student.";
  biologyPage.roster.innerHTML = biologyRosterCards(roster);
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

biologyPage.roster?.addEventListener("click", (event) => {
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

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === BIOLOGY_NOTES_KEY ||
    event.key === BIOLOGY_GOALS_KEY
  ) {
    renderBiologyRosterPage();
    if (biologyActiveNotesStudent) {
      renderBiologyNotesModal();
    }
  }
});

renderBiologyRosterPage();
