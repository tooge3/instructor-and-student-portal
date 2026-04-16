const CHEMISTRY_COURSE_ID = "chemistry-prep";
const CHEMISTRY_COURSE_NOTE_KEY = "portal-note-chemistry-foundations";
const CHEMISTRY_STUDENT_NOTE_KEY = "portal-note-chemistry-foundations-students";

const chemistryElements = {
  studentCount: document.getElementById("chemistry-student-count"),
  averageProgress: document.getElementById("chemistry-average-progress"),
  alertCount: document.getElementById("chemistry-alert-count"),
  summary: document.getElementById("chemistry-summary"),
  rosterPreview: document.getElementById("chemistry-roster-preview"),
  snapshot: document.getElementById("chemistry-snapshot"),
  glance: document.getElementById("chemistry-glance"),
  planningNote: document.getElementById("chemistry-course-note"),
  planningSave: document.getElementById("chemistry-course-note-save"),
  planningStatus: document.getElementById("chemistry-course-note-status"),
  roster: document.getElementById("chemistry-roster"),
  materials: document.getElementById("chemistry-materials"),
  expectations: document.getElementById("chemistry-expectations"),
  milestones: document.getElementById("chemistry-milestones"),
  interventions: document.getElementById("chemistry-interventions"),
  pageNotes: document.getElementById("chemistry-page-notes"),
};

function chemistryLoadObject(key) {
  const stored = window.localStorage.getItem(key);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function chemistrySaveObject(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function chemistryCourse() {
  return window.portalStore?.getCourse(CHEMISTRY_COURSE_ID);
}

function chemistryRoster() {
  return (window.portalStore?.getStudents() || []).filter((student) => student.courseId === CHEMISTRY_COURSE_ID);
}

function chemistryStudentStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function chemistryCourseNote() {
  return window.localStorage.getItem(CHEMISTRY_COURSE_NOTE_KEY) || "";
}

function chemistrySetCourseNote(note) {
  window.localStorage.setItem(CHEMISTRY_COURSE_NOTE_KEY, note);
}

function chemistryStudentNotes() {
  return chemistryLoadObject(CHEMISTRY_STUDENT_NOTE_KEY);
}

function chemistryStudentNote(studentName) {
  return chemistryStudentNotes()[studentName] || "";
}

function chemistrySetStudentNote(studentName, note) {
  const notes = chemistryStudentNotes();
  notes[studentName] = note;
  chemistrySaveObject(CHEMISTRY_STUDENT_NOTE_KEY, notes);
}

function chemistryRenderList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items
    .map((item) => `<div class="course-list-item">${item}</div>`)
    .join("");
}

function chemistrySummaryItems(course, roster) {
  const presentCount = roster.filter((student) => student.presentToday).length;
  const absentCount = roster.length - presentCount;
  const alertCount = roster.filter((student) => student.alertActive).length;
  const avgProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
    : 0;

  return [
    `Course: ${course.title}`,
    `Overview: ${course.overview}`,
    `Schedule: ${course.groupLabel}`,
    `Current unit: ${course.currentUnit}`,
    `Delivery mode: ${course.deliveryMode}`,
    `Roster today: ${presentCount} here, ${absentCount} absent, ${alertCount} active alerts`,
    `Average progress: ${avgProgress}% across this course roster`,
    `Lead focus: ${course.leadFocus}`,
  ];
}

function chemistryPreviewItems(roster) {
  return roster.length
    ? roster.map((student) => {
      const attendanceLabel = student.presentToday ? "Here today" : "Absent today";
      const alertLabel = student.alertActive ? "Alert active" : "No active alert";
      return `${student.name} - Seat ${student.seat} - ${attendanceLabel} - ${student.progress}% progress - ${alertLabel}`;
    })
    : ["No students are currently assigned to this Chemistry Foundations roster."];
}

function chemistrySnapshotItems(course, roster) {
  const supportCount = roster.filter((student) => student.needsHelp).length;
  const avgAttendance = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.attendance, 0) / roster.length)
    : 0;

  return [
    `Instruction model: ${course.deliveryMode}`,
    `Current objective: ${course.currentObjective}`,
    `Session flow: ${course.sessionFormat}`,
    `Average attendance: ${avgAttendance}%`,
    `Students needing direct support: ${supportCount}`,
  ];
}

function chemistryGlanceItems(course, roster) {
  const lateWorkCount = roster.reduce((sum, student) => sum + student.assignmentsLate, 0);
  const absentNames = roster.filter((student) => !student.presentToday).map((student) => student.name);

  return [
    `Session summary: ${course.scheduleSummary}`,
    `Primary focus: ${course.focus}`,
    `Progress benchmark: ${course.progressBenchmark}`,
    `Open late items: ${lateWorkCount}`,
    absentNames.length ? `Absent today: ${absentNames.join(", ")}` : "Absent today: none",
  ];
}

function chemistryRosterMarkup(roster) {
  if (!roster.length) {
    return `
      <article class="student-card">
        <h4>No students loaded for Chemistry Foundations</h4>
        <p class="student-meta">This page is tied directly to the Chemistry Foundations roster, but no students are currently assigned.</p>
      </article>
    `;
  }

  return roster.map((student) => {
    const status = chemistryStudentStatus(student);
    const savedNote = chemistryStudentNote(student.name);
    const studentId = encodeURIComponent(student.name);
    const attendanceLabel = student.presentToday ? "Here today" : "Absent today";
    const alertLabel = student.alertActive ? "Alert active" : "No active alert";

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
          <span>${attendanceLabel}</span>
          <span>${student.progress}% progress</span>
          <span>${student.assignmentsLate} late</span>
          <span>${alertLabel}</span>
        </div>
        <p class="course-roster-note">${student.note}</p>
        <div class="course-roster-detail">
          <div class="course-roster-detail-line"><strong>Goal:</strong> ${student.goal}</div>
          <div class="course-roster-detail-line"><strong>Current tasks:</strong> ${student.tasks.join(", ")}</div>
          <div class="course-roster-detail-line"><strong>Attendance rate:</strong> ${student.attendance}%</div>
        </div>
        <label class="course-student-note-label" for="chemistry-note-${studentId}">Instructor note</label>
        <textarea id="chemistry-note-${studentId}" class="course-student-note-input" data-chemistry-student="${student.name}" placeholder="Add Chemistry Foundations follow-up, packet review notes, or family outreach...">${savedNote}</textarea>
        <div class="course-student-note-actions">
          <span class="course-student-note-status">${savedNote ? "Saved" : "Not saved yet"}</span>
          <button class="schedule-button schedule-button-secondary" type="button" data-save-chemistry-student="${student.name}">Save student note</button>
        </div>
        <a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">Open student profile</a>
      </article>
    `;
  }).join("");
}

function renderChemistryPage() {
  const course = chemistryCourse();

  if (!course) {
    return;
  }

  const roster = chemistryRoster();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const noteValue = chemistryCourseNote();

  document.title = `${course.title} | Chemistry Foundations Course Page`;

  if (chemistryElements.studentCount) {
    chemistryElements.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  }

  if (chemistryElements.averageProgress) {
    chemistryElements.averageProgress.textContent = `${averageProgress}%`;
  }

  if (chemistryElements.alertCount) {
    chemistryElements.alertCount.textContent = `${activeAlerts}`;
  }

  if (chemistryElements.planningNote) {
    chemistryElements.planningNote.value = noteValue;
  }

  if (chemistryElements.planningStatus) {
    chemistryElements.planningStatus.textContent = noteValue ? "Saved course note ready." : "No saved course note yet.";
  }

  if (chemistryElements.roster) {
    chemistryElements.roster.innerHTML = chemistryRosterMarkup(roster);
  }

  chemistryRenderList(chemistryElements.summary, chemistrySummaryItems(course, roster));
  chemistryRenderList(chemistryElements.snapshot, chemistrySnapshotItems(course, roster));
  chemistryRenderList(chemistryElements.glance, chemistryGlanceItems(course, roster));
  chemistryRenderList(chemistryElements.materials, [
    `Current unit: ${course.currentUnit}`,
    `Prep before class:`,
    ...course.prepChecklist,
    `Core materials:`,
    ...course.materials,
  ]);
  chemistryRenderList(chemistryElements.expectations, course.expectations);
  chemistryRenderList(chemistryElements.milestones, course.milestones);
  chemistryRenderList(chemistryElements.interventions, [
    ...course.interventionPriorities,
    ...course.instructorLookFors,
    ...course.familyFollowUp,
  ]);
  chemistryRenderList(chemistryElements.pageNotes, [
    "This page should stay Chemistry Foundations specific at all times.",
    "Use it for tutoring prep, correction packet planning, and student-specific follow-up for this course only.",
    "Keep roster notes updated so another instructor can pick up the class without losing context.",
    ...course.pageNotes,
  ]);
}

if (chemistryElements.planningSave) {
  chemistryElements.planningSave.addEventListener("click", () => {
    const note = chemistryElements.planningNote ? chemistryElements.planningNote.value.trim() : "";
    chemistrySetCourseNote(note);

    if (chemistryElements.planningStatus) {
      chemistryElements.planningStatus.textContent = note ? "Course note saved." : "Course note cleared.";
    }
  });
}

if (chemistryElements.roster) {
  chemistryElements.roster.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save-chemistry-student]");

    if (!button) {
      return;
    }

    const studentName = button.dataset.saveChemistryStudent;
    const input = chemistryElements.roster.querySelector(`[data-chemistry-student="${studentName}"]`);
    const status = button.parentElement?.querySelector(".course-student-note-status");

    if (!input) {
      return;
    }

    chemistrySetStudentNote(studentName, input.value.trim());

    if (status) {
      status.textContent = input.value.trim() ? "Saved" : "Cleared";
    }
  });
}

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === CHEMISTRY_COURSE_NOTE_KEY ||
    event.key === CHEMISTRY_STUDENT_NOTE_KEY
  ) {
    renderChemistryPage();
  }
});

renderChemistryPage();
