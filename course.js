let students = window.portalStore.getStudents();
const courseLookup = Object.fromEntries(window.portalStore.getCourses().map((course) => [course.id, course]));
const params = new URLSearchParams(window.location.search);
const selectedCourseId = document.body.dataset.courseId || params.get("course");
const courseNotesStorageKey = "portal-course-notes";
const studentNotesStorageKey = "portal-course-student-notes";

const elements = {
  eyebrow: document.getElementById("course-eyebrow"),
  title: document.getElementById("course-title"),
  groupLabel: document.getElementById("course-group-label"),
  overview: document.getElementById("course-overview"),
  studentCount: document.getElementById("course-student-count"),
  averageProgress: document.getElementById("course-average-progress"),
  alertCount: document.getElementById("course-alert-count"),
  curriculumLink: document.getElementById("course-curriculum-link"),
  rewardsLink: document.getElementById("course-rewards-link"),
  roster: document.getElementById("course-roster"),
  expectations: document.getElementById("course-expectations"),
  milestones: document.getElementById("course-milestones"),
  pageNotes: document.getElementById("course-page-notes"),
  materials: document.getElementById("course-materials"),
  interventions: document.getElementById("course-interventions"),
  snapshot: document.getElementById("course-snapshot"),
  atAGlance: document.getElementById("course-at-a-glance"),
  transferSummary: document.getElementById("course-transfer-summary"),
  rosterPreview: document.getElementById("course-roster-preview"),
  planningNote: document.getElementById("course-planning-note"),
  noteSave: document.getElementById("course-note-save"),
  noteStatus: document.getElementById("course-note-status"),
};

function getCourse() {
  return courseLookup[selectedCourseId] || window.portalStore.getCourses()[0];
}

function rosterForCourse(courseId) {
  const directRoster = window.portalStore.getRosterByCourse(courseId);

  if (directRoster.length) {
    return directRoster;
  }

  const course = courseLookup[courseId];

  return students.filter((student) => (
    student.courseId === courseId ||
    student.cohort === course?.title
  ));
}

function studentStatus(entry) {
  if (entry.needsHelp) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (entry.attendance < 85 || entry.progress < 75) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function loadStoredNotes(storageKey) {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function saveStoredNotes(storageKey, value) {
  window.localStorage.setItem(storageKey, JSON.stringify(value));
}

function courseNote() {
  const notes = loadStoredNotes(courseNotesStorageKey);
  return notes[getCourse().id] || "";
}

function setCourseNote(note) {
  const notes = loadStoredNotes(courseNotesStorageKey);
  notes[getCourse().id] = note;
  saveStoredNotes(courseNotesStorageKey, notes);
}

function noteKey(courseId, studentName) {
  return `${courseId}::${studentName}`;
}

function studentNote(courseId, studentName) {
  const notes = loadStoredNotes(studentNotesStorageKey);
  return notes[noteKey(courseId, studentName)] || "";
}

function setStudentNote(courseId, studentName, note) {
  const notes = loadStoredNotes(studentNotesStorageKey);
  notes[noteKey(courseId, studentName)] = note;
  saveStoredNotes(studentNotesStorageKey, notes);
}

function renderList(container, items) {
  container.innerHTML = items
    .map((item) => `<div class="course-list-item">${item}</div>`)
    .join("");
}

function rosterSummary(roster) {
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  const atRiskCount = roster.filter((student) => student.needsHelp || student.progress < 75).length;

  return [
    `Schedule: ${getCourse().groupLabel}`,
    `Delivery Mode: ${getCourse().deliveryMode}`,
    `Roster Mix: ${presentCount} here today, ${absentCount} absent, ${atRiskCount} needing follow-up`,
    `Instructional Lead: ${getCourse().leadFocus}`,
  ];
}

function courseAtAGlance(course, roster) {
  const supportCount = roster.filter((student) => student.needsHelp).length;
  const lateWorkCount = roster.reduce((sum, student) => sum + student.assignmentsLate, 0);
  const absentStudents = roster.filter((student) => !student.presentToday).map((student) => student.name);

  return [
    `Session Summary: ${course.scheduleSummary}`,
    `Main Focus: ${course.focus}`,
    `Active Support Load: ${supportCount} student${supportCount === 1 ? "" : "s"} currently flagged`,
    `Late Work Snapshot: ${lateWorkCount} outstanding item${lateWorkCount === 1 ? "" : "s"} across this roster`,
    absentStudents.length
      ? `Absences Today: ${absentStudents.join(", ")}`
      : "Absences Today: none",
  ];
}

function courseTransferSummary(course, roster) {
  return [
    `${course.title} is the class loaded into this full-page shell.`,
    `${course.groupLabel}`,
    `${course.deliveryMode}`,
    `${roster.length} student${roster.length === 1 ? "" : "s"} transferred into the roster view for this class.`,
    `This page carries the same materials, expectations, interventions, and student notes from the Courses tab into a dedicated standalone view.`,
  ];
}

function rosterPreviewItems(roster) {
  return roster.map((student) => (
    `${student.name} — Seat ${student.seat}, ${student.presentToday ? "Here today" : "Absent today"}, ${student.progress}% progress`
  ));
}

function renderCourse() {
  const course = getCourse();
  const roster = rosterForCourse(course.id);
  const progressAverage = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;

  document.title = `${course.title} | Class Workspace`;
  elements.eyebrow.textContent = course.title;
  elements.title.textContent = course.title;
  elements.groupLabel.textContent = course.groupLabel;
  elements.overview.textContent = course.overview;
  elements.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  elements.averageProgress.textContent = `${progressAverage}%`;
  elements.alertCount.textContent = `${activeAlerts}`;
  elements.curriculumLink.href = course.curriculumUrl;
  elements.rewardsLink.href = course.rewardsUrl;
  elements.planningNote.value = courseNote();
  elements.noteStatus.textContent = elements.planningNote.value
    ? "Saved course note ready."
    : "No saved course note yet.";

  elements.roster.innerHTML = roster
    .map((student) => {
      const status = studentStatus(student);
      const savedNote = studentNote(course.id, student.name);

      return `
        <article class="course-roster-card">
          <div class="course-roster-head">
            <div>
              <h4>${student.name}</h4>
              <p class="student-group-meta">Seat ${student.seat}</p>
            </div>
            <div class="status-chip ${status.className}">${status.label}</div>
          </div>
          <div class="course-roster-stats">
            <span>${student.presentToday ? "Here today" : "Absent today"}</span>
            <span>${student.progress}% progress</span>
            <span>${student.assignmentsLate} late</span>
          </div>
          <p class="course-roster-note">${student.note}</p>
          <div class="course-roster-detail">
            <div class="course-roster-detail-line"><strong>Goal:</strong> ${student.goal}</div>
            <div class="course-roster-detail-line"><strong>Current tasks:</strong> ${student.tasks.join(", ")}</div>
          </div>
          <label class="course-student-note-label" for="note-${encodeURIComponent(student.name)}">Instructor note</label>
          <textarea id="note-${encodeURIComponent(student.name)}" class="course-student-note-input" data-student-note="${student.name}" placeholder="Add a note about attendance, family outreach, reteaching needs, or follow-up...">${savedNote}</textarea>
          <div class="course-student-note-actions">
            <span class="course-student-note-status">${savedNote ? "Saved" : "Not saved yet"}</span>
            <button class="schedule-button schedule-button-secondary" type="button" data-save-student-note="${student.name}">Save student note</button>
          </div>
          <a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">Open student profile</a>
        </article>
      `;
    })
    .join("") || `
      <article class="student-card">
        <h4>No students loaded for this course</h4>
        <p class="student-meta">The roster is empty for <strong>${course.title}</strong>. Refresh once to reload the current shared course roster.</p>
      </article>
    `;

  renderList(elements.snapshot, rosterSummary(roster));
  renderList(elements.atAGlance, courseAtAGlance(course, roster));
  renderList(elements.transferSummary, courseTransferSummary(course, roster));
  renderList(elements.rosterPreview, rosterPreviewItems(roster));
  renderList(elements.materials, [
    `Session Summary: ${course.scheduleSummary}`,
    `Main Focus: ${course.focus}`,
    ...course.materials,
  ]);
  renderList(elements.expectations, course.expectations);
  renderList(elements.milestones, course.milestones);
  renderList(elements.interventions, course.interventionPriorities);
  renderList(elements.pageNotes, [
    "Keep the roster current so absences, alerts, and progress shifts are visible before class starts.",
    "Use this page to prepare sub plans, quick interventions, and family follow-up notes.",
    "Record student-specific follow-up in the saved note fields so the next instructor can pick up context quickly.",
    ...course.pageNotes,
  ]);
}

elements.noteSave.addEventListener("click", () => {
  setCourseNote(elements.planningNote.value.trim());
  elements.noteStatus.textContent = elements.planningNote.value.trim()
    ? "Course note saved."
    : "Course note cleared.";
});

elements.roster.addEventListener("click", (event) => {
  const button = event.target.closest("[data-save-student-note]");

  if (!button) {
    return;
  }

  const course = getCourse();
  const studentName = button.dataset.saveStudentNote;
  const input = elements.roster.querySelector(`[data-student-note="${studentName}"]`);
  const status = button.parentElement?.querySelector(".course-student-note-status");

  if (!input) {
    return;
  }

  setStudentNote(course.id, studentName, input.value.trim());

  if (status) {
    status.textContent = input.value.trim() ? "Saved" : "Cleared";
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === "portal-students") {
    students = window.portalStore.getStudents();
    renderCourse();
  }

  if (event.key === courseNotesStorageKey || event.key === studentNotesStorageKey) {
    renderCourse();
  }
});

renderCourse();
