const BIOLOGY_COURSE_ID = "biology-201";
const BIOLOGY_COURSE_NOTE_KEY = "portal-note-biology-201";
const BIOLOGY_STUDENT_NOTE_KEY = "portal-note-biology-201-students";

const biologyElements = {
  studentCount: document.getElementById("biology-student-count"),
  averageProgress: document.getElementById("biology-average-progress"),
  alertCount: document.getElementById("biology-alert-count"),
  summary: document.getElementById("biology-summary"),
  rosterPreview: document.getElementById("biology-roster-preview"),
  snapshot: document.getElementById("biology-snapshot"),
  glance: document.getElementById("biology-glance"),
  planningNote: document.getElementById("biology-course-note"),
  planningSave: document.getElementById("biology-course-note-save"),
  planningStatus: document.getElementById("biology-course-note-status"),
  roster: document.getElementById("biology-roster"),
  materials: document.getElementById("biology-materials"),
  expectations: document.getElementById("biology-expectations"),
  milestones: document.getElementById("biology-milestones"),
  interventions: document.getElementById("biology-interventions"),
  pageNotes: document.getElementById("biology-page-notes"),
};

function biologyLoadObject(key) {
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

function biologySaveObject(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function biologyCourse() {
  return window.portalStore?.getCourse(BIOLOGY_COURSE_ID);
}

function biologyRoster() {
  return (window.portalStore?.getStudents() || []).filter((student) => student.courseId === BIOLOGY_COURSE_ID);
}

function biologyStudentStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function biologyCourseNote() {
  return window.localStorage.getItem(BIOLOGY_COURSE_NOTE_KEY) || "";
}

function biologySetCourseNote(note) {
  window.localStorage.setItem(BIOLOGY_COURSE_NOTE_KEY, note);
}

function biologyStudentNotes() {
  return biologyLoadObject(BIOLOGY_STUDENT_NOTE_KEY);
}

function biologyStudentNote(studentName) {
  return biologyStudentNotes()[studentName] || "";
}

function biologySetStudentNote(studentName, note) {
  const notes = biologyStudentNotes();
  notes[studentName] = note;
  biologySaveObject(BIOLOGY_STUDENT_NOTE_KEY, notes);
}

function biologyRenderList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items
    .map((item) => `<div class="course-list-item">${item}</div>`)
    .join("");
}

function biologySummaryItems(course, roster) {
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

function biologyPreviewItems(roster) {
  return roster.length
    ? roster.map((student) => {
      const attendanceLabel = student.presentToday ? "Here today" : "Absent today";
      const alertLabel = student.alertActive ? "Alert active" : "No active alert";
      return `${student.name} - Seat ${student.seat} - ${attendanceLabel} - ${student.progress}% progress - ${alertLabel}`;
    })
    : ["No students are currently assigned to this Biology 201 roster."];
}

function biologySnapshotItems(course, roster) {
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

function biologyGlanceItems(course, roster) {
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

function biologyRosterMarkup(roster) {
  if (!roster.length) {
    return `
      <article class="student-card">
        <h4>No students loaded for Biology 201</h4>
        <p class="student-meta">This page is tied directly to the Biology 201 roster, but no students are currently assigned.</p>
      </article>
    `;
  }

  return roster.map((student) => {
    const status = biologyStudentStatus(student);
    const savedNote = biologyStudentNote(student.name);
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
        <label class="course-student-note-label" for="biology-note-${studentId}">Instructor note</label>
        <textarea id="biology-note-${studentId}" class="course-student-note-input" data-biology-student="${student.name}" placeholder="Add Biology 201 follow-up, lab recovery notes, or family outreach...">${savedNote}</textarea>
        <div class="course-student-note-actions">
          <span class="course-student-note-status">${savedNote ? "Saved" : "Not saved yet"}</span>
          <button class="schedule-button schedule-button-secondary" type="button" data-save-biology-student="${student.name}">Save student note</button>
        </div>
        <a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">Open student profile</a>
      </article>
    `;
  }).join("");
}

function renderBiologyPage() {
  const course = biologyCourse();

  if (!course) {
    return;
  }

  const roster = biologyRoster();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const noteValue = biologyCourseNote();

  document.title = `${course.title} | Biology 201 Course Page`;

  if (biologyElements.studentCount) {
    biologyElements.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  }

  if (biologyElements.averageProgress) {
    biologyElements.averageProgress.textContent = `${averageProgress}%`;
  }

  if (biologyElements.alertCount) {
    biologyElements.alertCount.textContent = `${activeAlerts}`;
  }

  if (biologyElements.planningNote) {
    biologyElements.planningNote.value = noteValue;
  }

  if (biologyElements.planningStatus) {
    biologyElements.planningStatus.textContent = noteValue ? "Saved course note ready." : "No saved course note yet.";
  }

  if (biologyElements.roster) {
    biologyElements.roster.innerHTML = biologyRosterMarkup(roster);
  }

  biologyRenderList(biologyElements.summary, biologySummaryItems(course, roster));
  biologyRenderList(biologyElements.snapshot, biologySnapshotItems(course, roster));
  biologyRenderList(biologyElements.glance, biologyGlanceItems(course, roster));
  biologyRenderList(biologyElements.materials, [
    `Current unit: ${course.currentUnit}`,
    `Prep before class:`,
    ...course.prepChecklist,
    `Core materials:`,
    ...course.materials,
  ]);
  biologyRenderList(biologyElements.expectations, course.expectations);
  biologyRenderList(biologyElements.milestones, course.milestones);
  biologyRenderList(biologyElements.interventions, [
    ...course.interventionPriorities,
    ...course.instructorLookFors,
    ...course.familyFollowUp,
  ]);
  biologyRenderList(biologyElements.pageNotes, [
    "This page should stay Biology 201 specific at all times.",
    "Use it for tutoring prep, lab make-up planning, and student-specific follow-up for this course only.",
    "Keep roster notes updated so another instructor can pick up the class without losing context.",
    ...course.pageNotes,
  ]);
}

if (biologyElements.planningSave) {
  biologyElements.planningSave.addEventListener("click", () => {
    const note = biologyElements.planningNote ? biologyElements.planningNote.value.trim() : "";
    biologySetCourseNote(note);

    if (biologyElements.planningStatus) {
      biologyElements.planningStatus.textContent = note ? "Course note saved." : "Course note cleared.";
    }
  });
}

if (biologyElements.roster) {
  biologyElements.roster.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save-biology-student]");

    if (!button) {
      return;
    }

    const studentName = button.dataset.saveBiologyStudent;
    const input = biologyElements.roster.querySelector(`[data-biology-student="${studentName}"]`);
    const status = button.parentElement?.querySelector(".course-student-note-status");

    if (!input) {
      return;
    }

    biologySetStudentNote(studentName, input.value.trim());

    if (status) {
      status.textContent = input.value.trim() ? "Saved" : "Cleared";
    }
  });
}

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === BIOLOGY_COURSE_NOTE_KEY ||
    event.key === BIOLOGY_STUDENT_NOTE_KEY
  ) {
    renderBiologyPage();
  }
});

renderBiologyPage();
