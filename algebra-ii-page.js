const ALGEBRA_COURSE_ID = "stem-bridge";
const ALGEBRA_COURSE_NOTE_KEY = "portal-note-algebra-ii";
const ALGEBRA_STUDENT_NOTE_KEY = "portal-note-algebra-ii-students";

const algebraElements = {
  studentCount: document.getElementById("algebra-student-count"),
  averageProgress: document.getElementById("algebra-average-progress"),
  alertCount: document.getElementById("algebra-alert-count"),
  summary: document.getElementById("algebra-summary"),
  rosterPreview: document.getElementById("algebra-roster-preview"),
  snapshot: document.getElementById("algebra-snapshot"),
  glance: document.getElementById("algebra-glance"),
  planningNote: document.getElementById("algebra-course-note"),
  planningSave: document.getElementById("algebra-course-note-save"),
  planningStatus: document.getElementById("algebra-course-note-status"),
  roster: document.getElementById("algebra-roster"),
  materials: document.getElementById("algebra-materials"),
  expectations: document.getElementById("algebra-expectations"),
  milestones: document.getElementById("algebra-milestones"),
  interventions: document.getElementById("algebra-interventions"),
  pageNotes: document.getElementById("algebra-page-notes"),
};

function algebraLoadObject(key) {
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

function algebraSaveObject(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function algebraCourse() {
  return window.portalStore?.getCourse(ALGEBRA_COURSE_ID);
}

function algebraRoster() {
  return (window.portalStore?.getStudents() || []).filter((student) => student.courseId === ALGEBRA_COURSE_ID);
}

function algebraStudentStatus(student) {
  if (student.needsHelp || student.alertActive) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (!student.presentToday || student.progress < 75 || student.attendance < 85) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function algebraCourseNote() {
  return window.localStorage.getItem(ALGEBRA_COURSE_NOTE_KEY) || "";
}

function algebraSetCourseNote(note) {
  window.localStorage.setItem(ALGEBRA_COURSE_NOTE_KEY, note);
}

function algebraStudentNotes() {
  return algebraLoadObject(ALGEBRA_STUDENT_NOTE_KEY);
}

function algebraStudentNote(studentName) {
  return algebraStudentNotes()[studentName] || "";
}

function algebraSetStudentNote(studentName, note) {
  const notes = algebraStudentNotes();
  notes[studentName] = note;
  algebraSaveObject(ALGEBRA_STUDENT_NOTE_KEY, notes);
}

function algebraRenderList(container, items) {
  if (!container) {
    return;
  }

  container.innerHTML = items
    .map((item) => `<div class="course-list-item">${item}</div>`)
    .join("");
}

function algebraSummaryItems(course, roster) {
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

function algebraPreviewItems(roster) {
  return roster.length
    ? roster.map((student) => {
      const attendanceLabel = student.presentToday ? "Here today" : "Absent today";
      const alertLabel = student.alertActive ? "Alert active" : "No active alert";
      return `${student.name} - Seat ${student.seat} - ${attendanceLabel} - ${student.progress}% progress - ${alertLabel}`;
    })
    : ["No students are currently assigned to this Algebra II roster."];
}

function algebraSnapshotItems(course, roster) {
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

function algebraGlanceItems(course, roster) {
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

function algebraRosterMarkup(roster) {
  if (!roster.length) {
    return `
      <article class="student-card">
        <h4>No students loaded for Algebra II</h4>
        <p class="student-meta">This page is tied directly to the Algebra II roster, but no students are currently assigned.</p>
      </article>
    `;
  }

  return roster.map((student) => {
    const status = algebraStudentStatus(student);
    const savedNote = algebraStudentNote(student.name);
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
        <label class="course-student-note-label" for="algebra-note-${studentId}">Instructor note</label>
        <textarea id="algebra-note-${studentId}" class="course-student-note-input" data-algebra-student="${student.name}" placeholder="Add Algebra II follow-up, reteaching needs, or family outreach notes...">${savedNote}</textarea>
        <div class="course-student-note-actions">
          <span class="course-student-note-status">${savedNote ? "Saved" : "Not saved yet"}</span>
          <button class="schedule-button schedule-button-secondary" type="button" data-save-algebra-student="${student.name}">Save student note</button>
        </div>
        <a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">Open student profile</a>
      </article>
    `;
  }).join("");
}

function renderAlgebraPage() {
  const course = algebraCourse();

  if (!course) {
    return;
  }

  const roster = algebraRoster();
  const averageProgress = roster.length
    ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
    : 0;
  const activeAlerts = roster.filter((student) => student.alertActive).length;
  const noteValue = algebraCourseNote();

  document.title = `${course.title} | Algebra II Course Page`;

  if (algebraElements.studentCount) {
    algebraElements.studentCount.textContent = `${roster.length} student${roster.length === 1 ? "" : "s"}`;
  }

  if (algebraElements.averageProgress) {
    algebraElements.averageProgress.textContent = `${averageProgress}%`;
  }

  if (algebraElements.alertCount) {
    algebraElements.alertCount.textContent = `${activeAlerts}`;
  }

  if (algebraElements.planningNote) {
    algebraElements.planningNote.value = noteValue;
  }

  if (algebraElements.planningStatus) {
    algebraElements.planningStatus.textContent = noteValue ? "Saved course note ready." : "No saved course note yet.";
  }

  if (algebraElements.roster) {
    algebraElements.roster.innerHTML = algebraRosterMarkup(roster);
  }

  algebraRenderList(algebraElements.summary, algebraSummaryItems(course, roster));
  algebraRenderList(algebraElements.snapshot, algebraSnapshotItems(course, roster));
  algebraRenderList(algebraElements.glance, algebraGlanceItems(course, roster));
  algebraRenderList(algebraElements.materials, [
    `Current unit: ${course.currentUnit}`,
    `Prep before class:`,
    ...course.prepChecklist,
    `Core materials:`,
    ...course.materials,
  ]);
  algebraRenderList(algebraElements.expectations, course.expectations);
  algebraRenderList(algebraElements.milestones, course.milestones);
  algebraRenderList(algebraElements.interventions, [
    ...course.interventionPriorities,
    ...course.instructorLookFors,
    ...course.familyFollowUp,
  ]);
  algebraRenderList(algebraElements.pageNotes, [
    "This page should stay Algebra II specific at all times.",
    "Use it for lesson prep, sub guidance, and student-specific follow-up for this course only.",
    "Keep roster notes updated so another instructor can pick up the class without losing context.",
    ...course.pageNotes,
  ]);
}

if (algebraElements.planningSave) {
  algebraElements.planningSave.addEventListener("click", () => {
    const note = algebraElements.planningNote ? algebraElements.planningNote.value.trim() : "";
    algebraSetCourseNote(note);

    if (algebraElements.planningStatus) {
      algebraElements.planningStatus.textContent = note ? "Course note saved." : "Course note cleared.";
    }
  });
}

if (algebraElements.roster) {
  algebraElements.roster.addEventListener("click", (event) => {
    const button = event.target.closest("[data-save-algebra-student]");

    if (!button) {
      return;
    }

    const studentName = button.dataset.saveAlgebraStudent;
    const input = algebraElements.roster.querySelector(`[data-algebra-student="${studentName}"]`);
    const status = button.parentElement?.querySelector(".course-student-note-status");

    if (!input) {
      return;
    }

    algebraSetStudentNote(studentName, input.value.trim());

    if (status) {
      status.textContent = input.value.trim() ? "Saved" : "Cleared";
    }
  });
}

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === ALGEBRA_COURSE_NOTE_KEY ||
    event.key === ALGEBRA_STUDENT_NOTE_KEY
  ) {
    renderAlgebraPage();
  }
});

renderAlgebraPage();
