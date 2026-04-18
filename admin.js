let students = window.portalStore.getStudents();
const sharedCourses = window.portalStore.getCourses();
let adminInstructorHoverHideTimeout = null;
let activeAdminInstructorHoverAnchor = null;

const settingsStorageKey = "portal-instructor-settings";
const timeOffStorageKey = "portal-timeoff-requests";
const adminSidebarHiddenStorageKey = "portal-admin-sidebar-hidden";
const hourlyRate = 40;
const instructorPageSize = 18;
const coursePageSize = 20;

const metrics = {
  instructorCount: document.getElementById("admin-instructor-count"),
  studentCount: document.getElementById("admin-student-count"),
  alertCount: document.getElementById("admin-alert-count"),
  pendingCount: document.getElementById("admin-pending-count"),
  locationBreakdown: document.getElementById("admin-location-breakdown"),
  sidebarStudentCount: document.getElementById("admin-sidebar-student-count"),
  sidebarAlertCount: document.getElementById("admin-sidebar-alert-count"),
  sidebarCoverageCount: document.getElementById("admin-sidebar-coverage-count"),
  sidebarPendingCount: document.getElementById("admin-sidebar-pending-count"),
  opsList: document.getElementById("admin-ops-list"),
  timeoffRows: document.getElementById("admin-timeoff-rows"),
  payrollSummary: document.getElementById("admin-payroll-summary"),
  studentRows: document.getElementById("admin-student-rows"),
  studentSearch: document.getElementById("admin-student-search"),
  studentSortName: document.getElementById("admin-student-sort-name"),
  studentSortId: document.getElementById("admin-student-sort-id"),
  studentSortCourse: document.getElementById("admin-student-sort-course"),
  instructorRows: document.getElementById("admin-instructor-rows"),
  instructorSummary: document.getElementById("admin-instructor-summary"),
  instructorSearch: document.getElementById("admin-instructor-search"),
  instructorSortName: document.getElementById("admin-instructor-sort-name"),
  instructorSortLocation: document.getElementById("admin-instructor-sort-location"),
  instructorSortCourseLoad: document.getElementById("admin-instructor-sort-course-load"),
  instructorPrev: document.getElementById("admin-instructor-prev"),
  instructorNext: document.getElementById("admin-instructor-next"),
  instructorPageInfo: document.getElementById("admin-instructor-page-info"),
  courseRows: document.getElementById("admin-course-rows"),
  courseSummary: document.getElementById("admin-course-summary"),
  courseSearch: document.getElementById("admin-course-search"),
  coursePrev: document.getElementById("admin-course-prev"),
  courseNext: document.getElementById("admin-course-next"),
  coursePageInfo: document.getElementById("admin-course-page-info"),
  sidebar: document.getElementById("admin-sidebar"),
  sidebarToggle: document.getElementById("admin-sidebar-toggle"),
  appShell: document.getElementById("admin-app-shell"),
  hiringSummary: document.getElementById("admin-hiring-summary"),
  hiringRows: document.getElementById("admin-hiring-rows"),
  hiringSearch: document.getElementById("admin-hiring-search"),
  hiringStatusFilter: document.getElementById("admin-hiring-status"),
  hiringLocationFilter: document.getElementById("admin-hiring-location"),
  hiringMinDate: document.getElementById("admin-hiring-min-date"),
  hiringMaxDate: document.getElementById("admin-hiring-max-date"),
  hiringPrev: document.getElementById("admin-hiring-prev"),
  hiringNext: document.getElementById("admin-hiring-next"),
  hiringPageInfo: document.getElementById("admin-hiring-page-info"),
  instructorCourseTitle: document.getElementById("admin-instructor-course-title"),
  instructorCourseSubtitle: document.getElementById("admin-instructor-course-subtitle"),
  instructorCourseSummary: document.getElementById("admin-instructor-course-summary"),
  instructorCourseList: document.getElementById("admin-instructor-course-list"),
  courseDetailTitle: document.getElementById("admin-course-detail-title"),
  courseDetailSubtitle: document.getElementById("admin-course-detail-subtitle"),
  courseDetailSummary: document.getElementById("admin-course-detail-summary"),
  courseDetailContent: document.getElementById("admin-course-detail-content"),
  courseReportModal: document.getElementById("admin-course-report-modal"),
  courseReportClose: document.getElementById("admin-course-report-close"),
  courseReportCancel: document.getElementById("admin-course-report-cancel"),
  courseReportTitle: document.getElementById("admin-course-report-title"),
  courseReportMeta: document.getElementById("admin-course-report-meta"),
  courseReportBody: document.getElementById("admin-course-report-body"),
};

const adminState = {
  instructorPage: 1,
  coursePage: 1,
  hiringPage: 1,
  studentQuery: "",
  studentSort: "name",
  instructorQuery: "",
  instructorSort: "name",
  instructorSortDirection: "asc",
  courseQuery: "",
  hiringQuery: "",
  hiringStatus: "",
  hiringLocation: "",
  hiringMinDate: "",
  hiringMaxDate: "",
};

const instructorRecords = buildInstructorRecords(150);
const courseRecords = buildCourseRecords(400, instructorRecords);
const hiringPageSize = 18;
let hiringRecords = buildHiringRecords(420);
let adminSidebarHidden = loadAdminSidebarHidden();
let activeCourseReportId = null;

function loadInstructorSettings() {
  const defaults = {
    name: "Dr. Maya Brooks",
    role: "Senior Advisor, STEM Cohort",
    email: "maya.brooks@northhallacademy.edu",
    phone: "(949) 555-0187",
    pronouns: "She/Her",
    availableLocations: ["Irvine", "Online"],
    teachingLanguages: ["English", "Spanish"],
    alertSoundEnabled: true,
    loggedOut: false,
  };
  const stored = window.localStorage.getItem(settingsStorageKey);

  if (!stored) {
    return defaults;
  }

  try {
    return { ...defaults, ...JSON.parse(stored) };
  } catch (error) {
    return defaults;
  }
}

function loadTimeOffRequests() {
  const stored = window.localStorage.getItem(timeOffStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
}

function loadAdminSidebarHidden() {
  return window.localStorage.getItem(adminSidebarHiddenStorageKey) === "true";
}

function persistAdminSidebarHidden() {
  window.localStorage.setItem(adminSidebarHiddenStorageKey, String(adminSidebarHidden));
}

function renderAdminSidebarVisibility() {
  if (!metrics.sidebar || !metrics.sidebarToggle) {
    return;
  }

  metrics.sidebar.classList.toggle("hidden-sidebar", adminSidebarHidden);
  metrics.appShell?.classList.toggle("sidebar-hidden", adminSidebarHidden);
  metrics.sidebarToggle.setAttribute("aria-expanded", String(!adminSidebarHidden));
  metrics.sidebarToggle.setAttribute("aria-label", adminSidebarHidden ? "Show sidebar" : "Hide sidebar");

  const toggleText = metrics.sidebarToggle.querySelector(".sidebar-toggle-text");
  const toggleIcon = metrics.sidebarToggle.querySelector(".sidebar-toggle-icon");

  if (toggleText) {
    toggleText.textContent = adminSidebarHidden ? "" : "Hide";
  }

  if (toggleIcon) {
    toggleIcon.textContent = adminSidebarHidden ? ">" : "<";
  }
}

function buildInstructorRecords(count) {
  const firstNames = ["Maya", "Jordan", "Taylor", "Avery", "Morgan", "Riley", "Casey", "Skyler", "Dakota", "Quinn", "Harper", "Logan", "Parker", "Jamie", "Cameron"];
  const lastNames = ["Brooks", "Rivera", "Patel", "Kim", "Nguyen", "Lopez", "Chen", "Carter", "Reyes", "Tran", "Morris", "Singh", "Allen", "Flores", "Hughes"];
  const programs = ["Python Foundations", "Web Development", "JavaScript Lab", "Game Development", "Data Science", "AI Builders", "Robotics", "Cybersecurity"];
  const locations = [["Irvine", "Online"], ["Online"], ["Irvine"], ["Factoria", "Online"], ["Bothell"], ["Redmond", "Online"]];
  const languages = [["English"], ["English", "Spanish"], ["English", "Mandarin"], ["English", "Spanish", "Mandarin"]];
  const statuses = ["Active", "Needs Coverage Review", "Pending Compliance"];

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const program = programs[index % programs.length];
    const locationSet = locations[index % locations.length];
    const languageSet = languages[index % languages.length];
    const courseLoad = 2 + (index % 4);
    const alertCount = index % 9 === 0 ? 3 : index % 5 === 0 ? 1 : 0;
    const status = alertCount ? "Needs Coverage Review" : statuses[index % statuses.length];

    return {
      id: `INST-${String(index + 1).padStart(3, "0")}`,
      name: `Dr. ${firstName} ${lastName}`,
      email: `${firstName}.${lastName}${index + 1}@northhallacademy.edu`.toLowerCase(),
      phone: `(949) 555-${String(1000 + index).slice(-4)}`,
      program,
      locations: locationSet,
      languages: languageSet,
      status,
      courseLoad,
      alerts: alertCount,
      studentsSupported: 22 + ((index * 3) % 38),
    };
  });
}

function buildCourseRecords(count, instructors) {
  const prefixes = ["Intro to", "Foundations of", "Applied", "Advanced", "Studio", "Lab"];
  const tracks = ["Python", "JavaScript", "HTML & CSS", "React", "Game Design", "Data Science", "Machine Learning", "Cybersecurity", "App Development", "Algorithms"];
  const formats = ["Tutoring", "Workshop", "Lecture Lab", "Studio", "Project Block"];
  const schedules = [
    "Monday and Wednesday, 3:30 PM - 5:00 PM",
    "Tuesday and Thursday, 3:15 PM - 4:45 PM",
    "Monday and Thursday, 4:45 PM - 6:15 PM",
    "Wednesday and Friday, 3:30 PM - 5:00 PM",
    "Saturday, 10:00 AM - 12:00 PM",
  ];
  const locations = ["Irvine", "Online", "Redmond", "Bothell", "Factoria"];

  return Array.from({ length: count }, (_, index) => {
    const instructor = instructors[index % instructors.length];
    const title = `${prefixes[index % prefixes.length]} ${tracks[index % tracks.length]} ${formats[index % formats.length]}`.replace("Intro to ", "");
    const enrollment = 10 + ((index * 7) % 16);
    const hereToday = Math.max(0, enrollment - (index % 4));
    const alerts = index % 11 === 0 ? 4 : index % 6 === 0 ? 2 : index % 4 === 0 ? 1 : 0;
    const avgProgress = 66 + ((index * 5) % 31);
    const attendanceRate = 78 + ((index * 3) % 20);

    return {
      id: `COURSE-${String(index + 1).padStart(4, "0")}`,
      title,
      instructorName: instructor.name,
      instructorId: instructor.id,
      program: instructor.program,
      schedule: schedules[index % schedules.length],
      location: locations[index % locations.length],
      enrollment,
      hereToday,
      alerts,
      avgProgress,
      attendanceRate,
    };
  });
}

function buildHiringRecords(count) {
  const firstNames = [
    "Michael", "Armando", "Mouhamed", "Jane", "Alexander", "Xinwei", "Joshua", "Jay", "Priya", "Noah",
    "Sofia", "Liam", "Ariana", "Mateo", "Grace", "Hannah", "Jordan", "Elena", "Marcus", "Ethan",
  ];
  const lastNames = [
    "Ikebudu", "Sanchez", "Osman", "Higa", "Rothman", "Zhang", "Wallace", "Mehta", "Patel", "Bennett",
    "Nguyen", "Rivera", "Shah", "Alvarez", "Park", "Cho", "Kim", "Brooks", "Lee", "Carter",
  ];
  const statuses = [
    "Applied",
    "Applied (Local)",
    "Bootstrap",
    "Bootstrap Returned",
    "Bootstrap Reviewed",
    "Interview Requested",
    "Interview Complete",
    "Hiring Offer",
    "Hired",
    "Declined & Rejected",
    "Duplicate",
  ];
  const pronouns = ["he/him", "she/her", "she/they", "they/them", "he/they"];
  const locations = ["Irvine", "Redmond", "Bothell", "Factoria", "Online"];
  const languages = ["English", "Spanish", "Mandarin", "English / Spanish", "English / Mandarin"];
  const statusRotation = [2, 2, 5, 8, 9, 5, 7, 8, 10, 0, 6, 4, 2, 8, 9];
  const startDate = new Date("2025-10-16T00:00:00");

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const preferred = index % 4 === 0 ? "N/A" : firstName;
    const status = statuses[statusRotation[index % statusRotation.length]];
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + (index % 183));
    const emailHandle = `${firstName}.${lastName}${index + 1}`.toLowerCase();

    return {
      id: `APP-${String(index + 1).padStart(4, "0")}`,
      date: date.toISOString().slice(0, 10),
      fullName: `${firstName} ${lastName}`,
      preferred,
      email: `${emailHandle}@gmail.com`,
      phone: `${index % 3 === 0 ? "+1" : "+44"}${String(2000000000 + (index * 7919)).slice(0, 10)}`,
      adult: "Y",
      status,
      pronoun: pronouns[index % pronouns.length],
      location: locations[index % locations.length],
      language: languages[index % languages.length],
      historyCount: 1 + (index % 5),
      notesCount: index % 4,
      detail: index % 6 === 0 ? "Portfolio review pending" : index % 5 === 0 ? "Awaiting reference check" : "Ready for next step",
    };
  });
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function adminInstructorCoursesUrl(instructorId) {
  return `admin-instructor-courses.html?instructor=${encodeURIComponent(instructorId)}`;
}

function adminCourseDetailUrl(courseId) {
  return `admin-course-detail.html?course=${encodeURIComponent(courseId)}`;
}

function adminStudentDetailUrl(studentName, course) {
  return `student.html?student=${encodeURIComponent(studentName)}&adminCourse=${encodeURIComponent(course.id)}&adminCourseTitle=${encodeURIComponent(course.title)}&adminInstructor=${encodeURIComponent(course.instructorName)}`;
}

function studentIdForName(name) {
  const value = Array.from(name).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 17)), 0);
  return String((value % 9000) + 1000);
}

function courseScheduleLabel(course) {
  return (course.groupLabel || "")
    .replace(/^Tutoring Hours:\s*/i, "")
    .replace(/^Lecture Hours:\s*/i, "")
    .trim();
}

function studentStatus(student) {
  if (student.alertActive || student.needsHelp) {
    return { label: "Needs Assistance", className: "warning" };
  }

  if (student.attendance < 85 || student.progress < 75) {
    return { label: "Monitor Closely", className: "warning" };
  }

  return { label: "On Track", className: "ok" };
}

function primaryGoalText(student) {
  return student.currentGoals?.[0]?.text || student.goal || "No current goal recorded.";
}

function getInstructorRecord(instructorId) {
  return instructorRecords.find((instructor) => instructor.id === instructorId) || null;
}

function getCoursesForInstructor(instructorId) {
  return courseRecords.filter((course) => course.instructorId === instructorId);
}

function adminCourseRoster(course) {
  if (!students.length) {
    return [];
  }

  const seed = Array.from(course.id).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 11)), 0);
  const desired = Math.min(8, Math.max(4, Math.round(course.enrollment / 3)));

  return Array.from({ length: desired }, (_, index) => {
    const baseStudent = students[(seed + index) % students.length];
    return {
      ...baseStudent,
      rosterCourseTitle: course.title,
    };
  });
}

function studentCourseReportFor(course, student) {
  window.portalStore.ensureStudentCourseReports(
    course.id,
    adminCourseRoster(course).map((entry) => entry.name),
  );
  const savedReport = window.portalStore.getStudentCourseReport(course.id, student.name);

  if (savedReport) {
    return {
      id: `${course.id}:${student.name}`,
      courseId: course.id,
      studentName: student.name,
      submitted: savedReport.completedReports > 0,
      complete: Boolean(savedReport.complete),
      completedReports: savedReport.completedReports || 0,
      expectedReports: savedReport.expectedReports || 3,
      submittedAt: savedReport.submittedAt ? new Date(savedReport.submittedAt) : null,
      summary: savedReport.summary,
      assignmentUpdate: savedReport.assignmentUpdate,
      attendanceUpdate: savedReport.attendanceUpdate,
      nextStep: savedReport.nextStep,
      history: savedReport.history || [],
    };
  }

  return {
    id: `${course.id}:${student.name}`,
    courseId: course.id,
    studentName: student.name,
    submitted: false,
    complete: false,
    completedReports: 0,
    expectedReports: 3,
    submittedAt: null,
    summary: "",
    assignmentUpdate: "",
    attendanceUpdate: "",
    nextStep: "",
    history: [],
  };
}

function courseReportSummary(course) {
  const roster = adminCourseRoster(course);
  const submitted = roster.filter((student) => studentCourseReportFor(course, student).complete).length;
  const missing = roster.length - submitted;

  return {
    total: roster.length,
    submitted,
    missing,
  };
}

function reportStatusMarkup(summary) {
  if (!summary.total) {
    return '<span class="status-chip admin-status-chip">No roster</span>';
  }

  if (!summary.missing) {
    return `<span class="status-chip ok admin-status-chip">All Submitted · ${summary.submitted}/${summary.total}</span>`;
  }

  return `<span class="status-chip warning admin-status-chip">Missing ${summary.missing} · ${summary.submitted}/${summary.total}</span>`;
}

function renderAdminCourseDetailCard(course) {
  const roster = adminCourseRoster(course);
  const reportSummary = courseReportSummary(course);

  return `
    <section class="panel admin-panel admin-course-detail-card">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${course.id}</p>
          <h3><a class="student-link" href="${adminCourseDetailUrl(course.id)}">${course.title}</a></h3>
          <p class="metric-caption">${course.schedule} · ${course.location}</p>
        </div>
        <div class="admin-course-detail-metrics">
          <span>Enrollment ${course.enrollment}</span>
          <span>Here ${course.hereToday}</span>
          <span>Alerts ${course.alerts}</span>
          <span>Progress ${course.avgProgress}%</span>
        </div>
      </div>
      <div class="admin-course-detail-grid">
        <div class="admin-course-detail-section">
          <p class="eyebrow">Connected Students</p>
          <div class="admin-course-student-list">
            ${roster.map((student) => {
              const status = studentStatus(student);
              return `
                <a class="admin-course-student-item" href="${adminStudentDetailUrl(student.name, course)}">
                  <div>
                    <strong>${student.name}</strong>
                    <span>${primaryGoalText(student)}</span>
                  </div>
                  <span class="status-chip ${status.className} admin-status-chip">${status.label}</span>
                </a>
              `;
            }).join("")}
          </div>
        </div>
        <div class="admin-course-detail-section">
          <div class="admin-report-summary-card ${reportSummary.missing ? "missing" : ""}">
            <div class="admin-report-head">
              <div>
                <p class="eyebrow">Student Reports</p>
                <h4>${reportSummary.submitted}/${reportSummary.total} submitted</h4>
              </div>
              ${reportStatusMarkup(reportSummary)}
            </div>
            <p class="admin-report-copy">
              Each student in this course should have an individual report on file. Missing submissions stay highlighted for quick follow-up.
            </p>
          </div>
          <div class="admin-report-widget-grid">
            ${roster.map((student) => {
              const report = studentCourseReportFor(course, student);

              return `
                <article class="admin-student-report-widget ${report.submitted ? "submitted" : "missing"}">
                  <div class="admin-student-report-top">
                    <strong>${student.name}</strong>
                    <span class="status-chip ${report.complete ? "ok" : "warning"} admin-status-chip">${report.complete ? "All Submitted" : "Missing"}</span>
                  </div>
                  <p class="metric-caption">${report.completedReports}/${report.expectedReports} reports completed${report.submittedAt ? ` · Latest ${report.submittedAt.toLocaleDateString("en-US")}` : ""}</p>
                  <button class="schedule-button schedule-button-secondary" type="button" data-open-course-report="${course.id}" data-report-student="${student.name}">
                    ${report.completedReports ? "View Report" : "View Status"}
                  </button>
                </article>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAdminCourseDetailCardLegacy(course) {
  const roster = adminCourseRoster(course);
  const reportSummary = courseReportSummary(course);

  return `
    <section class="panel admin-panel admin-course-detail-card">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${course.id}</p>
          <h3>${course.title}</h3>
          <p class="metric-caption">${course.schedule} · ${course.location}</p>
        </div>
        <div class="admin-course-detail-metrics">
          <span>Enrollment ${course.enrollment}</span>
          <span>Here ${course.hereToday}</span>
          <span>Alerts ${course.alerts}</span>
          <span>Progress ${course.avgProgress}%</span>
        </div>
      </div>
      <div class="admin-course-detail-grid">
        <div class="admin-course-detail-section">
          <p class="eyebrow">Connected Students</p>
          <div class="admin-course-student-list">
            ${roster.map((student) => {
              const status = studentStatus(student);
              return `
                <a class="admin-course-student-item" href="${adminStudentDetailUrl(student.name, course)}">
                  <div>
                    <strong>${student.name}</strong>
                    <span>${primaryGoalText(student)}</span>
                  </div>
                  <span class="status-chip ${status.className} admin-status-chip">${status.label}</span>
                </a>
              `;
            }).join("")}
          </div>
        </div>
        <div class="admin-course-detail-section">
          <div class="admin-report-summary-card ${reportSummary.missing ? "missing" : ""}">
            <div class="admin-report-head">
              <div>
                <p class="eyebrow">Student Reports</p>
                <h4>${reportSummary.submitted}/${reportSummary.total} submitted</h4>
              </div>
              ${reportStatusMarkup(reportSummary)}
            </div>
            <p class="admin-report-copy">
              Each student in this course should have an individual report on file. Missing submissions stay highlighted for quick follow-up.
            </p>
          </div>
          <div class="admin-report-widget-grid">
            ${roster.map((student) => {
              const report = studentCourseReportFor(course, student);

              return `
                <article class="admin-student-report-widget ${report.submitted ? "submitted" : "missing"}">
                  <div class="admin-student-report-top">
                    <strong>${student.name}</strong>
                    <span class="status-chip ${report.submitted ? "ok" : "warning"} admin-status-chip">${report.submitted ? "Submitted" : "Missing"}</span>
                  </div>
                  <p class="metric-caption">${report.submittedAt ? `Submitted ${report.submittedAt.toLocaleDateString("en-US")}` : "Not submitted yet"}</p>
                  <button class="schedule-button schedule-button-secondary" type="button" data-open-course-report="${course.id}" data-report-student="${student.name}">
                    ${report.submitted ? "View Report" : "View Status"}
                  </button>
                </article>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    </section>
  `;
}

function ensureAdminInstructorHoverLayer() {
  let layer = document.getElementById("admin-instructor-hover-layer");

  if (layer) {
    return layer;
  }

  layer = document.createElement("div");
  layer.id = "admin-instructor-hover-layer";
  layer.className = "admin-global-hover-card hidden";
  document.body.appendChild(layer);

  layer.addEventListener("mouseenter", () => {
    window.clearTimeout(adminInstructorHoverHideTimeout);
  });

  layer.addEventListener("mouseleave", scheduleAdminInstructorHoverHide);

  return layer;
}

function scheduleAdminInstructorHoverHide() {
  const layer = document.getElementById("admin-instructor-hover-layer");

  if (!layer) {
    return;
  }

  window.clearTimeout(adminInstructorHoverHideTimeout);
  adminInstructorHoverHideTimeout = window.setTimeout(() => {
    layer.classList.add("hidden");
    activeAdminInstructorHoverAnchor = null;
  }, 120);
}

function positionAdminInstructorHover(anchor) {
  const layer = ensureAdminInstructorHoverLayer();

  if (!anchor || layer.classList.contains("hidden")) {
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const desiredLeft = Math.min(window.innerWidth - 380, rect.right + 10);
  const desiredTop = Math.max(16, rect.top - 12);

  layer.style.left = `${desiredLeft}px`;
  layer.style.top = `${desiredTop}px`;
}

function showAdminInstructorHover(event, instructorPayload) {
  const layer = ensureAdminInstructorHoverLayer();
  const anchor = event.currentTarget;

  window.clearTimeout(adminInstructorHoverHideTimeout);
  activeAdminInstructorHoverAnchor = anchor;

  layer.innerHTML = `
    <p class="eyebrow">Instructor Snapshot</p>
    <h4>${instructorPayload.name}</h4>
    <div class="admin-hover-grid">
      <div>
        <span>Status</span>
        <strong>${instructorPayload.status}</strong>
      </div>
      <div>
        <span>Phone</span>
        <strong>${instructorPayload.phone}</strong>
      </div>
      <div>
        <span>Locations</span>
        <strong>${instructorPayload.locations}</strong>
      </div>
      <div>
        <span>Languages</span>
        <strong>${instructorPayload.languages}</strong>
      </div>
      <div>
        <span>Course Load</span>
        <strong><a class="student-link" href="${adminInstructorCoursesUrl(instructorPayload.id)}">${instructorPayload.courseLoad}</a></strong>
      </div>
      <div>
        <span>Students</span>
        <strong>${instructorPayload.students}</strong>
      </div>
      <div>
        <span>Alerts</span>
        <strong>${instructorPayload.alerts}</strong>
      </div>
    </div>
  `;

  layer.classList.remove("hidden");
  positionAdminInstructorHover(anchor);
}

function compareText(a, b) {
  return a.localeCompare(b, undefined, { sensitivity: "base" });
}

function sortInstructorRecords(records) {
  const sorted = [...records];

  sorted.sort((left, right) => {
    let result;

    if (adminState.instructorSort === "location") {
      const leftLocation = left.locations.join(", ");
      const rightLocation = right.locations.join(", ");
      const leftOnlineOnly = left.locations.length === 1 && left.locations[0] === "Online";
      const rightOnlineOnly = right.locations.length === 1 && right.locations[0] === "Online";

      if (leftOnlineOnly !== rightOnlineOnly) {
        return leftOnlineOnly ? 1 : -1;
      }

      result = compareText(leftLocation, rightLocation) || compareText(left.name, right.name);
    } else if (adminState.instructorSort === "courseLoad") {
      result = (left.courseLoad - right.courseLoad) || compareText(left.name, right.name);
    } else {
      result = compareText(left.name, right.name);
    }

    return adminState.instructorSortDirection === "desc" ? -result : result;
  });

  return sorted;
}

function sortStudentRecords(records) {
  const sorted = [...records];

  sorted.sort((left, right) => {
    const leftId = studentIdForName(left.name);
    const rightId = studentIdForName(right.name);
    const leftCourse = sharedCourses.find((entry) => entry.id === left.courseId)?.title || left.cohort || "";
    const rightCourse = sharedCourses.find((entry) => entry.id === right.courseId)?.title || right.cohort || "";

    if (adminState.studentSort === "id") {
      return compareText(leftId, rightId);
    }

    if (adminState.studentSort === "courseLoad") {
      const courseCompare = compareText(leftCourse, rightCourse);
      return courseCompare || compareText(left.name, right.name);
    }

    return compareText(left.name, right.name);
  });

  return sorted;
}

function syncSortChips() {
  metrics.instructorSortName?.classList.toggle("is-active", adminState.instructorSort === "name");
  metrics.instructorSortLocation?.classList.toggle("is-active", adminState.instructorSort === "location");
  metrics.instructorSortCourseLoad?.classList.toggle("is-active", adminState.instructorSort === "courseLoad");
  metrics.instructorSortName?.classList.toggle("is-desc", adminState.instructorSort === "name" && adminState.instructorSortDirection === "desc");
  metrics.instructorSortLocation?.classList.toggle("is-desc", adminState.instructorSort === "location" && adminState.instructorSortDirection === "desc");
  metrics.instructorSortCourseLoad?.classList.toggle("is-desc", adminState.instructorSort === "courseLoad" && adminState.instructorSortDirection === "desc");

  metrics.studentSortName?.classList.toggle("is-active", adminState.studentSort === "name");
  metrics.studentSortId?.classList.toggle("is-active", adminState.studentSort === "id");
  metrics.studentSortCourse?.classList.toggle("is-active", adminState.studentSort === "courseLoad");
}

function toggleInstructorSort(nextSort) {
  if (adminState.instructorSort === nextSort) {
    adminState.instructorSortDirection = adminState.instructorSortDirection === "asc" ? "desc" : "asc";
  } else {
    adminState.instructorSort = nextSort;
    adminState.instructorSortDirection = "asc";
  }

  adminState.instructorPage = 1;
  syncSortChips();
  renderInstructorDirectory();
}

function operationalStudentLocation(student) {
  const courseLocationMap = {
    "biology-201": "Irvine",
    "chemistry-prep": "Online",
    "stem-bridge": "Redmond",
  };

  return courseLocationMap[student.courseId] || "Irvine";
}

function buildMonthlyAdminSnapshot() {
  const totalHours = courseRecords.reduce((sum, course) => {
    const matches = course.schedule.match(/(\d{1,2}:\d{2}\s[AP]M)\s-\s(\d{1,2}:\d{2}\s[AP]M)/i);

    if (!matches) {
      return sum;
    }

    const parse = (value) => {
      const [time, meridiem] = value.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (hours === 12) {
        hours = 0;
      }

      if (meridiem.toUpperCase() === "PM") {
        hours += 12;
      }

      return (hours * 60) + minutes;
    };
    const perSession = (parse(matches[2]) - parse(matches[1])) / 60;
    const sessionsPerWeek = (course.schedule.match(/and/g)?.length || 0) + 1;
    return sum + (perSession * sessionsPerWeek * 4);
  }, 0);

  return {
    estimatedHours: Math.round(totalHours * 10) / 10,
    estimatedPayroll: Math.round(totalHours * hourlyRate),
  };
}

function renderSummary(instructorSettings, timeOffRequests) {
  const alertCount = students.filter((student) => student.alertActive).length + instructorRecords.reduce((sum, instructor) => sum + instructor.alerts, 0);
  const missingSubplans = timeOffRequests.filter((request) => !request.subPlanLink).length;
  const pendingCoverage = timeOffRequests.filter((request) => !request.approved).length;
  const pendingTotal = alertCount + missingSubplans + pendingCoverage;

  if (metrics.instructorCount) {
    metrics.instructorCount.textContent = String(instructorRecords.length);
  }
  if (metrics.studentCount) {
    metrics.studentCount.textContent = String(students.length);
  }
  if (metrics.alertCount) {
    metrics.alertCount.textContent = String(alertCount);
  }
  if (metrics.pendingCount) {
    metrics.pendingCount.textContent = String(pendingTotal);
  }
  if (metrics.sidebarStudentCount) {
    metrics.sidebarStudentCount.textContent = String(students.length);
  }
  if (metrics.sidebarAlertCount) {
    metrics.sidebarAlertCount.textContent = String(alertCount);
  }
  if (metrics.sidebarCoverageCount) {
    metrics.sidebarCoverageCount.textContent = String(pendingCoverage);
  }
  if (metrics.sidebarPendingCount) {
    metrics.sidebarPendingCount.textContent = String(pendingTotal);
  }
}

function renderLocationBreakdown() {
  if (!metrics.locationBreakdown) {
    return;
  }

  const locations = ["Irvine", "Redmond", "Bothell", "Factoria", "Online"];

  metrics.locationBreakdown.innerHTML = locations.map((location) => {
    const instructorCount = instructorRecords.filter((instructor) => instructor.locations.includes(location)).length;
    const studentCount = students.filter((student) => operationalStudentLocation(student) === location).length;

    return `
      <article class="admin-location-card">
        <p class="metric-label">${location}</p>
        <div class="admin-location-metrics">
          <div>
            <span>Instructors</span>
            <strong>${instructorCount}</strong>
          </div>
          <div>
            <span>Students</span>
            <strong>${studentCount}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function renderOperations(instructorSettings, timeOffRequests) {
  if (!metrics.opsList) {
    return;
  }

  const pendingRequests = timeOffRequests.filter((request) => !request.approved).length;
  const missingSubplans = timeOffRequests.filter((request) => !request.subPlanLink).length;
  const interventionCount = students.filter((student) => student.alertActive).length + courseRecords.filter((course) => course.alerts > 0).length;
  const attendanceFlags = students.filter((student) => student.attendance < 80).length;
  const payrollSnapshot = buildMonthlyAdminSnapshot();
  const complianceFlags = instructorRecords.filter((instructor) => instructor.status !== "Active").length;
  const missingReports = courseRecords.reduce((sum, course) => sum + courseReportSummary(course).missing, 0);

  const items = [
    {
      title: "Coverage review",
      detail: `${pendingRequests} time-off request${pendingRequests === 1 ? "" : "s"} waiting for approval and coverage confirmation.`,
      tone: pendingRequests ? "warning" : "ok",
    },
    {
      title: "Substitute plans",
      detail: `${missingSubplans} request${missingSubplans === 1 ? "" : "s"} still missing a substitute lesson plan link.`,
      tone: missingSubplans ? "warning" : "ok",
    },
    {
      title: "Intervention follow-up",
      detail: `${interventionCount} student${interventionCount === 1 ? "" : "s"} currently flagged and needing family or tutor follow-up.`,
      tone: interventionCount ? "warning" : "ok",
    },
    {
      title: "Attendance watchlist",
      detail: `${attendanceFlags} student${attendanceFlags === 1 ? "" : "s"} under the 80% attendance threshold.`,
      tone: attendanceFlags ? "warning" : "ok",
    },
    {
      title: "Payroll readiness",
      detail: `Estimated monthly payroll is ${currency(payrollSnapshot.estimatedPayroll)} across ${payrollSnapshot.estimatedHours} scheduled hours.`,
      tone: "ok",
    },
    {
      title: "Account compliance",
      detail: `${complianceFlags} instructor record${complianceFlags === 1 ? "" : "s"} currently need compliance or staffing review.`,
      tone: complianceFlags ? "warning" : "ok",
    },
    {
      title: "Course reports",
      detail: `${missingReports} student report${missingReports === 1 ? "" : "s"} still missing across current courses.`,
      tone: missingReports ? "warning" : "ok",
    },
  ];

  metrics.opsList.innerHTML = items.map((item) => `
    <article class="admin-op-item ${item.tone}">
      <div>
        <h4>${item.title}</h4>
        <p>${item.detail}</p>
      </div>
    </article>
  `).join("");
}

function renderInstructorDirectory() {
  if (!metrics.instructorRows) {
    return;
  }

  const filtered = sortInstructorRecords(instructorRecords.filter((instructor) => {
    const haystack = [
      instructor.id,
      instructor.name,
      instructor.email,
      instructor.program,
      instructor.locations.join(" "),
      instructor.languages.join(" "),
      instructor.status,
    ].join(" ").toLowerCase();

    return haystack.includes(adminState.instructorQuery.toLowerCase());
  }));
  const pageCount = Math.max(1, Math.ceil(filtered.length / instructorPageSize));
  adminState.instructorPage = Math.min(adminState.instructorPage, pageCount);
  const start = (adminState.instructorPage - 1) * instructorPageSize;
  const pageItems = filtered.slice(start, start + instructorPageSize);

  metrics.instructorRows.innerHTML = pageItems.length
    ? pageItems.map((instructor) => `
      <tr>
        <td>
          <div class="admin-hover-cell">
            <div
              class="admin-hover-anchor"
              data-instructor-hover="true"
              data-id="${instructor.id}"
              data-name="${instructor.name}"
              data-status="${instructor.status}"
              data-phone="${instructor.phone}"
              data-locations="${instructor.locations.join(", ")}"
              data-languages="${instructor.languages.join(", ")}"
              data-course-load="${instructor.courseLoad} courses"
              data-students="${instructor.studentsSupported}"
              data-alerts="${instructor.alerts}"
            ><strong class="admin-hover-name">${instructor.name}</strong></div><br>
            <span class="student-meta">${instructor.id} · ${instructor.email}</span>
          </div>
        </td>
        <td>${instructor.program}</td>
        <td>${instructor.locations.join(", ")}</td>
        <td>${instructor.languages.join(", ")}</td>
        <td>${instructor.courseLoad} courses<br><span class="student-meta">${instructor.studentsSupported} students</span></td>
        <td><span class="status-chip ${instructor.status === "Active" ? "ok" : "warning"} admin-status-chip">${instructor.status}</span></td>
        <td>${instructor.alerts}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="7" class="admin-empty-state">No instructors matched this search.</td>
      </tr>
    `;

  if (metrics.instructorSummary) {
    const activeCount = instructorRecords.filter((instructor) => instructor.status === "Active").length;
    const onlineCount = instructorRecords.filter((instructor) => instructor.locations.includes("Online")).length;
    const multilingualCount = instructorRecords.filter((instructor) => instructor.languages.length > 1).length;

    const avgCourseLoad = (instructorRecords.reduce((sum, instructor) => sum + instructor.courseLoad, 0) / instructorRecords.length).toFixed(1);

    metrics.instructorSummary.innerHTML = `
      <article class="metric-card"><p class="metric-label">Total Instructors</p><h3>${instructorRecords.length}</h3><p class="metric-caption">Directory records currently available.</p></article>
      <article class="metric-card"><p class="metric-label">Active</p><h3>${activeCount}</h3><p class="metric-caption">Ready for current scheduling rotation.</p></article>
      <article class="metric-card"><p class="metric-label">Online Approved</p><h3>${onlineCount}</h3><p class="metric-caption">Able to support virtual sessions.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Course Load</p><h3>${avgCourseLoad}</h3><p class="metric-caption">Average number of active courses per instructor.</p></article>
      <article class="metric-card"><p class="metric-label">Multilingual</p><h3>${multilingualCount}</h3><p class="metric-caption">Support more than one teaching language.</p></article>
    `;
  }

  if (metrics.instructorPageInfo) {
    metrics.instructorPageInfo.textContent = `${filtered.length} results · Page ${adminState.instructorPage} of ${pageCount}`;
  }
  if (metrics.instructorPrev) {
    metrics.instructorPrev.disabled = adminState.instructorPage === 1;
  }
  if (metrics.instructorNext) {
    metrics.instructorNext.disabled = adminState.instructorPage === pageCount;
  }
}

function renderCourseDirectory() {
  if (!metrics.courseRows) {
    return;
  }

  const filtered = courseRecords.filter((course) => {
    const haystack = [
      course.id,
      course.title,
      course.program,
      course.instructorName,
      course.location,
      course.schedule,
    ].join(" ").toLowerCase();

    return haystack.includes(adminState.courseQuery.toLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / coursePageSize));
  adminState.coursePage = Math.min(adminState.coursePage, pageCount);
  const start = (adminState.coursePage - 1) * coursePageSize;
  const pageItems = filtered.slice(start, start + coursePageSize);

  metrics.courseRows.innerHTML = pageItems.length
    ? pageItems.map((course) => `
      <tr>
        <td>
          <a class="student-link" href="${adminCourseDetailUrl(course.id)}"><strong>${course.title}</strong></a><br>
          <span class="student-meta">${course.id} · ${course.location}</span>
        </td>
        <td>${course.instructorName}</td>
        <td>${course.program}</td>
        <td>${course.schedule}</td>
        <td>${course.enrollment}<br><span class="student-meta">${course.hereToday} here today</span></td>
        <td>${course.attendanceRate}%</td>
        <td>${course.alerts}</td>
        <td>${course.avgProgress}%</td>
        <td>${reportStatusMarkup(courseReportSummary(course))}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="9" class="admin-empty-state">No courses matched this search.</td>
      </tr>
    `;

  if (metrics.courseSummary) {
    const highAlert = courseRecords.filter((course) => course.alerts >= 3).length;
    const onlineCount = courseRecords.filter((course) => course.location === "Online").length;
    const avgEnrollment = Math.round(courseRecords.reduce((sum, course) => sum + course.enrollment, 0) / courseRecords.length);

    const avgProgress = Math.round(courseRecords.reduce((sum, course) => sum + course.avgProgress, 0) / courseRecords.length);
    const avgAttendance = Math.round(courseRecords.reduce((sum, course) => sum + course.attendanceRate, 0) / courseRecords.length);

    metrics.courseSummary.innerHTML = `
      <article class="metric-card"><p class="metric-label">Total Courses</p><h3>${courseRecords.length}</h3><p class="metric-caption">Courses currently tracked in oversight.</p></article>
      <article class="metric-card"><p class="metric-label">High Alert Courses</p><h3>${highAlert}</h3><p class="metric-caption">Courses with three or more active alerts.</p></article>
      <article class="metric-card"><p class="metric-label">Online Courses</p><h3>${onlineCount}</h3><p class="metric-caption">Running fully online this term.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Enrollment</p><h3>${avgEnrollment}</h3><p class="metric-caption">Average students per course.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Attendance</p><h3>${avgAttendance}%</h3><p class="metric-caption">Current attendance benchmark.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Progress</p><h3>${avgProgress}%</h3><p class="metric-caption">Current course progress benchmark.</p></article>
    `;
  }

  if (metrics.coursePageInfo) {
    metrics.coursePageInfo.textContent = `${filtered.length} results · Page ${adminState.coursePage} of ${pageCount}`;
  }
  if (metrics.coursePrev) {
    metrics.coursePrev.disabled = adminState.coursePage === 1;
  }
  if (metrics.courseNext) {
    metrics.courseNext.disabled = adminState.coursePage === pageCount;
  }
}

function renderTimeOff(timeOffRequests, instructorSettings) {
  if (!metrics.timeoffRows) {
    return;
  }

  metrics.timeoffRows.innerHTML = timeOffRequests.length
    ? timeOffRequests.map((request) => `
      <tr>
        <td>${request.dateLabel}</td>
        <td>${instructorSettings.name}</td>
        <td>${request.intersections?.length ? request.intersections.join(", ") : "No class intersections"}</td>
        <td>${request.approved ? "Approved" : "Pending"}</td>
        <td>${request.subPlanLink ? '<a class="student-link" href="' + request.subPlanLink + '" target="_blank" rel="noreferrer">View doc</a>' : '<span class="admin-missing">Missing</span>'}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="5">No time-off requests submitted yet.</td>
      </tr>
    `;
}

function renderPayroll() {
  if (!metrics.payrollSummary) {
    return;
  }

  const snapshot = buildMonthlyAdminSnapshot();
  const pendingReimbursements = 2;
  const paymentMethod = "Direct Deposit";

  metrics.payrollSummary.innerHTML = `
    <div class="admin-payroll-card">
      <span>Estimated Monthly Hours</span>
      <strong>${snapshot.estimatedHours}</strong>
    </div>
    <div class="admin-payroll-card">
      <span>Estimated Payroll</span>
      <strong>${currency(snapshot.estimatedPayroll)}</strong>
    </div>
    <div class="admin-payroll-card">
      <span>Reimbursements Waiting</span>
      <strong>${pendingReimbursements}</strong>
    </div>
    <div class="admin-payroll-card">
      <span>Payment Method</span>
      <strong>${paymentMethod}</strong>
    </div>
  `;
}

function renderStudents() {
  if (!metrics.studentRows) {
    return;
  }

  const filtered = sortStudentRecords(students.filter((student) => {
    const course = sharedCourses.find((entry) => entry.id === student.courseId);
    const status = studentStatus(student);
    const haystack = [
      studentIdForName(student.name),
      student.name,
      course?.title || student.cohort,
      status.label,
      primaryGoalText(student),
    ].join(" ").toLowerCase();

    return haystack.includes(adminState.studentQuery.toLowerCase());
  }));

  metrics.studentRows.innerHTML = filtered.length
    ? filtered.map((student) => {
      const course = sharedCourses.find((entry) => entry.id === student.courseId);
      const status = studentStatus(student);

      return `
        <tr>
          <td>ID ${studentIdForName(student.name)}</td>
          <td><a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">${student.name}</a></td>
          <td>${course?.title || student.cohort}</td>
          <td><span class="status-chip ${status.className} admin-status-chip">${status.label}</span></td>
          <td>${student.attendance}%</td>
          <td>${student.progress}%</td>
          <td>${student.assignmentsLate}</td>
          <td>${primaryGoalText(student)}</td>
        </tr>
      `;
    }).join("")
    : `
      <tr>
        <td colspan="8" class="admin-empty-state">No students matched this search.</td>
      </tr>
    `;
}

function formatHiringDate(value) {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function hiringStatusClass(status) {
  if (status === "Hired") {
    return "ok";
  }

  if (status === "Declined & Rejected" || status === "Duplicate") {
    return "muted";
  }

  if (status === "Interview Requested" || status === "Interview Complete" || status === "Hiring Offer") {
    return "warning";
  }

  return "info";
}

function renderHiring() {
  if (!metrics.hiringRows) {
    return;
  }

  const filtered = hiringRecords.filter((candidate) => {
    const matchesQuery = !adminState.hiringQuery || [
      candidate.id,
      candidate.fullName,
      candidate.email,
      candidate.phone,
      candidate.location,
      candidate.language,
      candidate.status,
    ].join(" ").toLowerCase().includes(adminState.hiringQuery.toLowerCase());
    const matchesStatus = !adminState.hiringStatus || candidate.status === adminState.hiringStatus;
    const matchesLocation = !adminState.hiringLocation || candidate.location === adminState.hiringLocation;
    const matchesMin = !adminState.hiringMinDate || candidate.date >= adminState.hiringMinDate;
    const matchesMax = !adminState.hiringMaxDate || candidate.date <= adminState.hiringMaxDate;

    return matchesQuery && matchesStatus && matchesLocation && matchesMin && matchesMax;
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / hiringPageSize));
  adminState.hiringPage = Math.min(adminState.hiringPage, pageCount);
  const start = (adminState.hiringPage - 1) * hiringPageSize;
  const pageItems = filtered.slice(start, start + hiringPageSize);

  metrics.hiringRows.innerHTML = pageItems.length
    ? pageItems.map((candidate) => `
      <tr>
        <td>${formatHiringDate(candidate.date)}</td>
        <td>
          <strong>${candidate.fullName}</strong><br>
          <span class="student-meta">${candidate.id}</span>
        </td>
        <td>${candidate.preferred}</td>
        <td>${candidate.email}</td>
        <td>${candidate.phone}</td>
        <td>${candidate.adult}</td>
        <td>
          <select class="admin-inline-select" data-hiring-id="${candidate.id}">
            ${["Applied", "Applied (Local)", "Bootstrap", "Bootstrap Returned", "Bootstrap Reviewed", "Interview Requested", "Interview Complete", "Hiring Offer", "Hired", "Declined & Rejected", "Duplicate"].map((status) => `
              <option value="${status}" ${status === candidate.status ? "selected" : ""}>${status}</option>
            `).join("")}
          </select>
        </td>
        <td>${candidate.pronoun}</td>
        <td>${candidate.location}</td>
        <td>${candidate.language}</td>
        <td><span class="admin-link-pill">History ${candidate.historyCount}</span></td>
        <td><span class="admin-link-pill">${candidate.detail}</span></td>
        <td><span class="admin-link-pill">${candidate.notesCount ? `Notes ${candidate.notesCount}` : "Add note"}</span></td>
        <td><button class="admin-menu-button" type="button" aria-label="Candidate actions">≡</button></td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="13" class="admin-empty-state">No candidates matched the current filters.</td>
      </tr>
    `;

  if (metrics.hiringSummary) {
    const statusCounts = ["Applied", "Applied (Local)", "Bootstrap", "Bootstrap Returned", "Bootstrap Reviewed", "Interview Requested", "Interview Complete", "Hiring Offer", "Hired", "Declined & Rejected", "Duplicate"]
      .map((status) => ({
        label: status,
        count: hiringRecords.filter((candidate) => candidate.status === status).length,
        className: hiringStatusClass(status),
      }));

    metrics.hiringSummary.innerHTML = statusCounts.map((item) => `
      <article class="admin-status-metric ${item.className}">
        <span>${item.label}</span>
        <strong>${item.count}</strong>
      </article>
    `).join("");
  }

  if (metrics.hiringPageInfo) {
    metrics.hiringPageInfo.textContent = `${filtered.length} candidates · Page ${adminState.hiringPage} of ${pageCount}`;
  }
  if (metrics.hiringPrev) {
    metrics.hiringPrev.disabled = adminState.hiringPage === 1;
  }
  if (metrics.hiringNext) {
    metrics.hiringNext.disabled = adminState.hiringPage === pageCount;
  }
}

function renderInstructorCourseDetailPage() {
  if (!metrics.instructorCourseList || !metrics.instructorCourseTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const instructorId = params.get("instructor");
  const instructor = getInstructorRecord(instructorId);

  if (!instructor) {
    metrics.instructorCourseTitle.textContent = "Instructor not found";
    metrics.instructorCourseSubtitle.textContent = "This instructor record could not be loaded.";
    metrics.instructorCourseSummary.innerHTML = "";
    metrics.instructorCourseList.innerHTML = `
      <section class="panel admin-panel">
        <p class="admin-empty-state">We could not find an instructor for this link.</p>
      </section>
    `;
    return;
  }

  const courses = getCoursesForInstructor(instructor.id);
  const totalEnrollment = courses.reduce((sum, course) => sum + course.enrollment, 0);
  const totalAlerts = courses.reduce((sum, course) => sum + course.alerts, 0);
  const avgProgress = courses.length ? Math.round(courses.reduce((sum, course) => sum + course.avgProgress, 0) / courses.length) : 0;

  metrics.instructorCourseTitle.textContent = `${instructor.name} course assignment`;
  metrics.instructorCourseSubtitle.textContent = `${instructor.program} · ${instructor.locations.join(", ")} · ${instructor.languages.join(", ")}`;
  metrics.instructorCourseSummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Assigned Courses</p><h3>${courses.length}</h3><p class="metric-caption">Current course load for this instructor.</p></article>
    <article class="metric-card"><p class="metric-label">Projected Enrollment</p><h3>${totalEnrollment}</h3><p class="metric-caption">Combined enrollment across assigned courses.</p></article>
    <article class="metric-card"><p class="metric-label">Active Alerts</p><h3>${totalAlerts}</h3><p class="metric-caption">Alerts currently attached to these courses.</p></article>
    <article class="metric-card"><p class="metric-label">Avg Progress</p><h3>${avgProgress}%</h3><p class="metric-caption">Average progress across assigned courses.</p></article>
  `;

  metrics.instructorCourseList.innerHTML = courses.map((course) => renderAdminCourseDetailCard(course)).join("");
  return;

  metrics.instructorCourseList.innerHTML = courses.map((course) => {
    const roster = adminCourseRoster(course);
    const reportSummary = courseReportSummary(course);

    return `
      <section class="panel admin-panel admin-course-detail-card">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">${course.id}</p>
            <h3>${course.title}</h3>
            <p class="metric-caption">${course.schedule} · ${course.location}</p>
          </div>
          <div class="admin-course-detail-metrics">
            <span>Enrollment ${course.enrollment}</span>
            <span>Here ${course.hereToday}</span>
            <span>Alerts ${course.alerts}</span>
            <span>Progress ${course.avgProgress}%</span>
          </div>
        </div>
        <div class="admin-course-detail-grid">
          <div class="admin-course-detail-section">
            <p class="eyebrow">Connected Students</p>
            <div class="admin-course-student-list">
              ${roster.map((student) => {
                const status = studentStatus(student);
                return `
                  <a class="admin-course-student-item" href="${adminStudentDetailUrl(student.name, course)}">
                    <div>
                      <strong>${student.name}</strong>
                      <span>${primaryGoalText(student)}</span>
                    </div>
                    <span class="status-chip ${status.className} admin-status-chip">${status.label}</span>
                  </a>
                `;
              }).join("")}
            </div>
          </div>
          <div class="admin-course-detail-section">
            <div class="admin-report-summary-card ${reportSummary.missing ? "missing" : ""}">
              <div class="admin-report-head">
                <div>
                  <p class="eyebrow">Student Reports</p>
                  <h4>${reportSummary.submitted}/${reportSummary.total} submitted</h4>
                </div>
                ${reportStatusMarkup(reportSummary)}
              </div>
              <p class="admin-report-copy">
                Each student in this course should have an individual report on file. Missing submissions stay highlighted for quick follow-up.
              </p>
            </div>
            <div class="admin-report-widget-grid">
              ${roster.map((student) => {
                const report = studentCourseReportFor(course, student);

                return `
                  <article class="admin-student-report-widget ${report.submitted ? "submitted" : "missing"}">
                    <div class="admin-student-report-top">
                      <strong>${student.name}</strong>
                      <span class="status-chip ${report.submitted ? "ok" : "warning"} admin-status-chip">${report.submitted ? "Submitted" : "Missing"}</span>
                    </div>
                    <p class="metric-caption">${report.submittedAt ? `Submitted ${report.submittedAt.toLocaleDateString("en-US")}` : "Not submitted yet"}</p>
                    <button class="schedule-button schedule-button-secondary" type="button" data-open-course-report="${course.id}" data-report-student="${student.name}">
                      ${report.submitted ? "View Report" : "View Status"}
                    </button>
                  </article>
                `;
              }).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }).join("");
}

function renderAdminCourseDetailPage() {
  if (!metrics.courseDetailContent || !metrics.courseDetailTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course");
  const course = courseRecords.find((entry) => entry.id === courseId);

  if (!course) {
    document.title = "Admin Course Detail";
    metrics.courseDetailTitle.textContent = "Course not found";
    metrics.courseDetailSubtitle.textContent = "This class record could not be loaded.";
    metrics.courseDetailSummary.innerHTML = "";
    metrics.courseDetailContent.innerHTML = `
      <section class="panel admin-panel">
        <p class="admin-empty-state">We could not find a generated course for this link.</p>
      </section>
    `;
    return;
  }

  const roster = adminCourseRoster(course);
  const reportSummary = courseReportSummary(course);
  const activeAlerts = roster.filter((student) => student.alertActive || student.needsHelp).length;

  document.title = `${course.title} | Admin Course Detail`;
  metrics.courseDetailTitle.textContent = course.title;
  metrics.courseDetailSubtitle.textContent = `${course.id} · ${course.instructorName} · ${course.schedule} · ${course.location}`;
  metrics.courseDetailSummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Enrollment</p><h3>${course.enrollment}</h3><p class="metric-caption">Students assigned to this class.</p></article>
    <article class="metric-card"><p class="metric-label">Here Today</p><h3>${course.hereToday}</h3><p class="metric-caption">Current in-session attendance snapshot.</p></article>
    <article class="metric-card"><p class="metric-label">Student Reports</p><h3>${reportSummary.submitted}/${reportSummary.total}</h3><p class="metric-caption">Submitted student reports for this class.</p></article>
    <article class="metric-card"><p class="metric-label">Roster Alerts</p><h3>${activeAlerts}</h3><p class="metric-caption">Students currently needing follow-up.</p></article>
  `;
  metrics.courseDetailContent.innerHTML = renderAdminCourseDetailCard(course);
}

function openCourseReportModal(courseId, studentName) {
  const course = courseRecords.find((entry) => entry.id === courseId);
  const roster = course ? adminCourseRoster(course) : [];
  const student = roster.find((entry) => entry.name === studentName);

  if (!course || !student || !metrics.courseReportModal) {
    return;
  }

  const report = studentCourseReportFor(course, student);
  activeCourseReportId = report.id;
  metrics.courseReportTitle.textContent = `${student.name} report`;
  metrics.courseReportMeta.textContent = report.submitted
    ? `Submitted ${report.submittedAt.toLocaleDateString("en-US")} · ${report.verified ? "Verified" : "Awaiting verification"}`
    : "Mandatory report is still missing for this course.";
  metrics.courseReportBody.innerHTML = report.submitted ? `
    <section class="admin-report-section">
      <h4>Session Summary</h4>
      <p>${report.summary}</p>
    </section>
    <section class="admin-report-section">
      <h4>Attendance Notes</h4>
      <p>${report.attendanceNotes}</p>
    </section>
    <section class="admin-report-section">
      <h4>Intervention Notes</h4>
      <p>${report.interventionNotes}</p>
    </section>
    <section class="admin-report-section">
      <h4>Next Steps</h4>
      <p>${report.nextSteps}</p>
    </section>
  ` : `
    <section class="admin-report-section">
      <h4>Missing Submission</h4>
      <p>This course has not submitted the mandatory instructor report yet. Admin review remains open until the report is received.</p>
    </section>
  `;
  metrics.courseReportVerify.textContent = report.verified ? "Verified" : "Verify Report";
  metrics.courseReportVerify.disabled = !report.submitted || report.verified;
  metrics.courseReportModal.classList.remove("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "false");
}

function closeCourseReportModal() {
  if (!metrics.courseReportModal) {
    return;
  }

  metrics.courseReportModal.classList.add("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "true");
  activeCourseReportId = null;
}

function verifyActiveCourseReport() {
  if (!activeCourseReportId) {
    return;
  }

  courseReportReviews[activeCourseReportId] = true;
  persistCourseReportReviews();
  openCourseReportModal(activeCourseReportId);
  renderCourseDirectory();
  renderInstructorCourseDetailPage();
}

function openCourseReportModal(courseId, studentName) {
  const course = courseRecords.find((entry) => entry.id === courseId);
  const roster = course ? adminCourseRoster(course) : [];
  const student = roster.find((entry) => entry.name === studentName);

  if (!course || !student || !metrics.courseReportModal) {
    return;
  }

  const report = studentCourseReportFor(course, student);
  activeCourseReportId = report.id;
  metrics.courseReportTitle.textContent = `${student.name} report`;
  metrics.courseReportMeta.textContent = report.submitted
    ? `${course.title} | ${report.completedReports}/${report.expectedReports} reports completed${report.submittedAt ? ` | Latest ${report.submittedAt.toLocaleDateString("en-US")}` : ""}`
    : `${course.title} | 0/${report.expectedReports} reports completed`;
  metrics.courseReportBody.innerHTML = report.submitted ? `
    <section class="admin-report-section">
      <h4>Assignment Update</h4>
      <p>${report.assignmentUpdate}</p>
    </section>
    <section class="admin-report-section">
      <h4>Next Steps</h4>
      <p>${report.nextStep}</p>
    </section>
    <section class="admin-report-section">
      <h4>Report Completion</h4>
      <p>${report.completedReports} of ${report.expectedReports} expected reports have been submitted for ${student.name}.</p>
    </section>
  ` : `
    <section class="admin-report-section">
      <h4>Missing Submission</h4>
      <p>No report has been submitted yet for ${student.name} in ${course.title}. This student should remain flagged until the expected reports start coming in.</p>
    </section>
  `;
  metrics.courseReportModal.classList.remove("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "false");
}

function verifyActiveCourseReport() {}

function renderAdminPortal() {
  students = window.portalStore.getStudents();
  const instructorSettings = loadInstructorSettings();
  const timeOffRequests = loadTimeOffRequests();

  renderAdminSidebarVisibility();
  syncSortChips();
  if (metrics.instructorCount || metrics.studentCount || metrics.alertCount || metrics.pendingCount) {
    renderSummary(instructorSettings, timeOffRequests);
  }

  if (metrics.locationBreakdown) {
    renderLocationBreakdown();
  }

  if (metrics.opsList) {
    renderOperations(instructorSettings, timeOffRequests);
  }

  if (metrics.instructorRows || metrics.instructorSummary) {
    renderInstructorDirectory();
  }

  if (metrics.courseRows || metrics.courseSummary) {
    renderCourseDirectory();
  }

  if (metrics.timeoffRows) {
    renderTimeOff(timeOffRequests, instructorSettings);
  }

  if (metrics.payrollSummary) {
    renderPayroll();
  }

  if (metrics.studentRows) {
    renderStudents();
  }

  if (metrics.hiringRows || metrics.hiringSummary) {
    renderHiring();
  }

  if (metrics.instructorCourseList) {
    renderInstructorCourseDetailPage();
  }

  if (metrics.courseDetailContent) {
    renderAdminCourseDetailPage();
  }
}

renderAdminPortal();

metrics.sidebarToggle?.addEventListener("click", () => {
  adminSidebarHidden = !adminSidebarHidden;
  persistAdminSidebarHidden();
  renderAdminSidebarVisibility();
});

metrics.instructorSearch?.addEventListener("input", (event) => {
  adminState.instructorQuery = event.target.value || "";
  adminState.instructorPage = 1;
  renderInstructorDirectory();
});

metrics.instructorSortName?.addEventListener("click", () => {
  toggleInstructorSort("name");
});

metrics.instructorSortLocation?.addEventListener("click", () => {
  toggleInstructorSort("location");
});

metrics.instructorSortCourseLoad?.addEventListener("click", () => {
  toggleInstructorSort("courseLoad");
});

metrics.studentSearch?.addEventListener("input", (event) => {
  adminState.studentQuery = event.target.value || "";
  renderStudents();
});

metrics.studentSortName?.addEventListener("click", () => {
  adminState.studentSort = "name";
  syncSortChips();
  renderStudents();
});

metrics.studentSortId?.addEventListener("click", () => {
  adminState.studentSort = "id";
  syncSortChips();
  renderStudents();
});

metrics.studentSortCourse?.addEventListener("click", () => {
  adminState.studentSort = "courseLoad";
  syncSortChips();
  renderStudents();
});

metrics.instructorPrev?.addEventListener("click", () => {
  adminState.instructorPage = Math.max(1, adminState.instructorPage - 1);
  renderInstructorDirectory();
});

metrics.instructorNext?.addEventListener("click", () => {
  adminState.instructorPage += 1;
  renderInstructorDirectory();
});

metrics.courseSearch?.addEventListener("input", (event) => {
  adminState.courseQuery = event.target.value || "";
  adminState.coursePage = 1;
  renderCourseDirectory();
});

metrics.coursePrev?.addEventListener("click", () => {
  adminState.coursePage = Math.max(1, adminState.coursePage - 1);
  renderCourseDirectory();
});

metrics.courseNext?.addEventListener("click", () => {
  adminState.coursePage += 1;
  renderCourseDirectory();
});

metrics.hiringSearch?.addEventListener("input", (event) => {
  adminState.hiringQuery = event.target.value || "";
  adminState.hiringPage = 1;
  renderHiring();
});

metrics.hiringStatusFilter?.addEventListener("change", (event) => {
  adminState.hiringStatus = event.target.value || "";
  adminState.hiringPage = 1;
  renderHiring();
});

metrics.hiringLocationFilter?.addEventListener("change", (event) => {
  adminState.hiringLocation = event.target.value || "";
  adminState.hiringPage = 1;
  renderHiring();
});

metrics.hiringMinDate?.addEventListener("change", (event) => {
  adminState.hiringMinDate = event.target.value || "";
  adminState.hiringPage = 1;
  renderHiring();
});

metrics.hiringMaxDate?.addEventListener("change", (event) => {
  adminState.hiringMaxDate = event.target.value || "";
  adminState.hiringPage = 1;
  renderHiring();
});

metrics.hiringPrev?.addEventListener("click", () => {
  adminState.hiringPage = Math.max(1, adminState.hiringPage - 1);
  renderHiring();
});

metrics.hiringNext?.addEventListener("click", () => {
  adminState.hiringPage += 1;
  renderHiring();
});

metrics.hiringRows?.addEventListener("change", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLSelectElement)) {
    return;
  }

  const candidateId = target.dataset.hiringId;

  if (!candidateId) {
    return;
  }

  hiringRecords = hiringRecords.map((candidate) => (
    candidate.id === candidateId
      ? { ...candidate, status: target.value }
      : candidate
  ));

  renderHiring();
});

metrics.instructorRows?.addEventListener("mouseenter", (event) => {
  const anchor = event.target.closest("[data-instructor-hover='true']");

  if (!anchor) {
    return;
  }

  showAdminInstructorHover(
    { currentTarget: anchor },
    {
      id: anchor.dataset.id,
      name: anchor.dataset.name,
      status: anchor.dataset.status,
      phone: anchor.dataset.phone,
      locations: anchor.dataset.locations,
      languages: anchor.dataset.languages,
      courseLoad: anchor.dataset.courseLoad,
      students: anchor.dataset.students,
      alerts: anchor.dataset.alerts,
    },
  );
}, true);

metrics.instructorRows?.addEventListener("mouseleave", (event) => {
  const anchor = event.target.closest("[data-instructor-hover='true']");

  if (!anchor) {
    return;
  }

  scheduleAdminInstructorHoverHide();
}, true);

metrics.instructorCourseList?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-course-report]");
  const verifyButton = event.target.closest("[data-verify-course-report]");

  if (openButton) {
    openCourseReportModal(openButton.dataset.openCourseReport, openButton.dataset.reportStudent);
    return;
  }

  if (verifyButton) {
    openCourseReportModal(verifyButton.dataset.verifyCourseReport, verifyButton.dataset.reportStudent);
  }
});

metrics.courseDetailContent?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-course-report]");

  if (openButton) {
    openCourseReportModal(openButton.dataset.openCourseReport, openButton.dataset.reportStudent);
  }
});

metrics.courseReportClose?.addEventListener("click", closeCourseReportModal);
metrics.courseReportCancel?.addEventListener("click", closeCourseReportModal);
metrics.courseReportModal?.addEventListener("click", (event) => {
  if (event.target === metrics.courseReportModal) {
    closeCourseReportModal();
  }
});

window.addEventListener("scroll", () => {
  if (activeAdminInstructorHoverAnchor) {
    positionAdminInstructorHover(activeAdminInstructorHoverAnchor);
  }
}, true);

window.addEventListener("resize", () => {
  if (activeAdminInstructorHoverAnchor) {
    positionAdminInstructorHover(activeAdminInstructorHoverAnchor);
  }
});

window.addEventListener("storage", (event) => {
  if (
    event.key === "portal-students" ||
    event.key === "portal-student-course-reports" ||
    event.key === settingsStorageKey ||
    event.key === timeOffStorageKey ||
    event.key === adminSidebarHiddenStorageKey
  ) {
    if (event.key === adminSidebarHiddenStorageKey) {
      adminSidebarHidden = loadAdminSidebarHidden();
    }
    renderAdminPortal();
  }
});
