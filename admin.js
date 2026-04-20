let students = window.portalStore.getStudents();
const sharedCourses = window.portalStore.getCourses();
let adminInstructorHoverHideTimeout = null;
let activeAdminInstructorHoverAnchor = null;
const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const settingsStorageKey = "portal-instructor-settings";
const timeOffStorageKey = "portal-timeoff-requests";
const adminSidebarHiddenStorageKey = "portal-admin-sidebar-hidden";
const adminInstructorOverridesKey = "portal-admin-instructor-overrides";
const adminInstructorAccidentsKey = "portal-admin-instructor-accidents";
const hourlyRate = 40;
const instructorPageSize = 18;
const coursePageSize = 20;
const courseCompletionGraceDays = 14;
const connectedCoursePageSize = 6;

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
  accidentModal: document.getElementById("admin-accident-modal"),
  accidentTitle: document.getElementById("admin-accident-title"),
  accidentMeta: document.getElementById("admin-accident-meta"),
  accidentType: document.getElementById("admin-accident-type"),
  accidentDate: document.getElementById("admin-accident-date"),
  accidentNotes: document.getElementById("admin-accident-notes"),
  accidentStatus: document.getElementById("admin-accident-status"),
  accidentClose: document.getElementById("admin-accident-close"),
  accidentCancel: document.getElementById("admin-accident-cancel"),
  accidentSave: document.getElementById("admin-accident-save"),
  editInstructorModal: document.getElementById("admin-edit-instructor-modal"),
  editInstructorTitle: document.getElementById("admin-edit-instructor-title"),
  editInstructorMeta: document.getElementById("admin-edit-instructor-meta"),
  editInstructorRank: document.getElementById("admin-edit-instructor-rank"),
  editInstructorSalary: document.getElementById("admin-edit-instructor-salary"),
  editInstructorStatusField: document.getElementById("admin-edit-instructor-status"),
  editInstructorEmail: document.getElementById("admin-edit-instructor-email"),
  editInstructorUsername: document.getElementById("admin-edit-instructor-username"),
  editInstructorPassword: document.getElementById("admin-edit-instructor-password"),
  editInstructorPhone: document.getElementById("admin-edit-instructor-phone"),
  editInstructorLocations: document.getElementById("admin-edit-instructor-locations"),
  editInstructorLanguages: document.getElementById("admin-edit-instructor-languages"),
  editInstructorTags: document.getElementById("admin-edit-instructor-tags"),
  editInstructorStatusNote: document.getElementById("admin-edit-instructor-status-note"),
  editInstructorClose: document.getElementById("admin-edit-instructor-close"),
  editInstructorCancel: document.getElementById("admin-edit-instructor-cancel"),
  editInstructorSave: document.getElementById("admin-edit-instructor-save"),
  instructorProfileTitle: document.getElementById("admin-instructor-profile-title"),
  instructorProfileSubtitle: document.getElementById("admin-instructor-profile-subtitle"),
  instructorProfileSummary: document.getElementById("admin-instructor-profile-summary"),
  instructorProfileContent: document.getElementById("admin-instructor-profile-content"),
  instructorAvailabilityTitle: document.getElementById("admin-instructor-availability-title"),
  instructorAvailabilitySubtitle: document.getElementById("admin-instructor-availability-subtitle"),
  instructorAvailabilitySummary: document.getElementById("admin-instructor-availability-summary"),
  instructorAvailabilityContent: document.getElementById("admin-instructor-availability-content"),
};

const adminState = {
  instructorPage: 1,
  coursePage: 1,
  hiringPage: 1,
  studentQuery: "",
  studentSort: "name",
  studentSortDirection: "asc",
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

const hiringPageSize = 18;
const adminInstructorCount = 50;
const adminCourseCount = 100;
let instructorRecords = null;
let courseRecords = null;
let hiringRecords = null;
const adminCourseRosterCache = new Map();
const adminCourseReportSummaryCache = new Map();
const adminCourseReportStoreCache = new Map();
let adminSidebarHidden = loadAdminSidebarHidden();
let activeCourseReportId = null;
let activeAccidentInstructorId = null;
let activeEditInstructorId = null;

function loadAdminInstructorOverrides() {
  const stored = window.localStorage.getItem(adminInstructorOverridesKey);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function saveAdminInstructorOverrides(overrides) {
  window.localStorage.setItem(adminInstructorOverridesKey, JSON.stringify(overrides));
}

function loadAdminInstructorAccidents() {
  const stored = window.localStorage.getItem(adminInstructorAccidentsKey);

  if (!stored) {
    return {};
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return {};
  }
}

function saveAdminInstructorAccidents(records) {
  window.localStorage.setItem(adminInstructorAccidentsKey, JSON.stringify(records));
}

function getInstructorRecords() {
  if (!instructorRecords) {
    instructorRecords = buildInstructorRecords(adminInstructorCount);
  }

  const overrides = loadAdminInstructorOverrides();
  return instructorRecords.map((instructor) => {
    const override = overrides[instructor.id];

    if (!override) {
      return instructor;
    }

    return {
      ...instructor,
      ...override,
      locations: Array.isArray(override.locations) ? override.locations : instructor.locations,
      languages: Array.isArray(override.languages) ? override.languages : instructor.languages,
      tags: Array.isArray(override.tags) ? override.tags : instructor.tags,
    };
  });
}

function getCourseRecords() {
  if (!courseRecords) {
    courseRecords = buildCourseRecords(adminCourseCount, getInstructorRecords());
  }

  return courseRecords;
}

function getHiringRecords() {
  if (!hiringRecords) {
    hiringRecords = buildHiringRecords(420);
  }

  return hiringRecords;
}

function clearAdminDerivedCaches() {
  adminCourseRosterCache.clear();
  adminCourseReportSummaryCache.clear();
  adminCourseReportStoreCache.clear();
}

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
  const ranks = ["Lead Instructor", "Senior Instructor", "Instructor", "Associate Instructor"];
  const tagSets = [
    ["Good comms", "HS age"],
    ["Low work load"],
    ["Lower level only"],
    ["Good comms"],
    ["HS age", "Lower level only"],
    ["Risky", "weak comms"],
    [],
  ];
  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const program = programs[index % programs.length];
    const locationSet = locations[index % locations.length];
    const languageSet = languages[index % languages.length];
    const courseLoad = 2 + (index % 4);
    const alertCount = index % 9 === 0 ? 3 : index % 5 === 0 ? 1 : 0;
    const status = index % 6 === 0 ? "Waitlist" : "Active";
    const salaryRate = 34 + ((index % 7) * 3);

    return {
      id: `INST-${String(index + 1).padStart(3, "0")}`,
      name: `Dr. ${firstName} ${lastName}`,
      email: `${firstName}.${lastName}${index + 1}@northhallacademy.edu`.toLowerCase(),
      username: `${firstName}.${lastName}${index + 1}`.toLowerCase(),
      password: `NHA!${String(2400 + index)}`,
      phone: `(949) 555-${String(1000 + index).slice(-4)}`,
      program,
      rank: ranks[index % ranks.length],
      salaryRate: `$${salaryRate}/hr`,
      locations: locationSet,
      languages: languageSet,
      status,
      tags: tagSets[index % tagSets.length],
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
  const openClassTraits = [
    "Continuous enrollment",
    "Drop-in support",
    "Progress-update reporting",
    "Flexible pacing",
  ];

  return Array.from({ length: count }, (_, index) => {
    const instructor = instructors[index % instructors.length];
    const title = `${prefixes[index % prefixes.length]} ${tracks[index % tracks.length]} ${formats[index % formats.length]}`.replace("Intro to ", "");
    const enrollment = 10 + ((index * 7) % 16);
    const hereToday = Math.max(0, enrollment - (index % 4));
    const alerts = index % 11 === 0 ? 4 : index % 6 === 0 ? 2 : index % 4 === 0 ? 1 : 0;
    const avgProgress = 66 + ((index * 5) % 31);
    const attendanceRate = 78 + ((index * 3) % 20);
    const isOpenClass = index % 12 === 0;
    const totalSessions = isOpenClass ? null : 16;
    const currentSession = isOpenClass ? null : ((index % 16) + 1);
    const startDate = new Date("2026-01-12T00:00:00");
    startDate.setDate(startDate.getDate() + (index % 21));
    const endDate = isOpenClass
      ? null
      : new Date(startDate.getTime() + ((totalSessions - 1) * 7 * 24 * 60 * 60 * 1000));

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
      courseFormat: isOpenClass ? "Open Class" : "Structured Term",
      courseFormatNote: isOpenClass
        ? `${openClassTraits[index % openClassTraits.length]} · Continuous class with no designated end date.`
        : "16-session structured course with required weekly reporting.",
      openClassTrait: isOpenClass ? openClassTraits[index % openClassTraits.length] : "16-session sequence",
      isOpenClass,
      currentSession,
      totalSessions,
      sessionProgressLabel: isOpenClass ? "Open class" : `${currentSession}/${totalSessions}`,
      reportStyle: isOpenClass ? "Progress updates" : "Structured reports",
      startDateIso: startDate.toISOString(),
      startDateLabel: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      endDateIso: endDate ? endDate.toISOString() : "",
      endDateLabel: endDate ? endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No designated end",
    };
  });
}

function courseSessionEntries(course, roster) {
  const reportSummary = courseReportSummary(course);
  const reportCoverage = `${reportSummary.submitted}/${reportSummary.total || roster.length || 0}`;
  const attendanceBase = Math.max(0, Math.min(roster.length || course.enrollment, course.hereToday || 0));
  const sessionCount = course.isOpenClass ? 6 : Math.min(course.currentSession || 0, 6);
  const totalEntries = Math.max(sessionCount, 3);
  const labels = course.isOpenClass
    ? ["Lab support and check-ins", "Project progress review", "Debugging and coaching", "Concept recovery", "Build refinement", "Progress conference"]
    : ["Launch and setup", "Core concept build", "Guided practice", "Project application", "Recovery and revisions", "Checkpoint prep"];

  return Array.from({ length: totalEntries }, (_, index) => {
    const reverseIndex = totalEntries - index - 1;
    const submittedCount = Math.max(0, reportSummary.submitted - reverseIndex);
    const sessionNumber = course.isOpenClass ? null : Math.max(1, (course.currentSession || totalEntries) - reverseIndex);
    const date = new Date();
    date.setDate(date.getDate() - (reverseIndex * 7));
    const attendance = Math.max(0, attendanceBase - (reverseIndex % 2));
    const attachedStudents = roster
      .slice(0, Math.min(2, roster.length))
      .map((student) => student.name)
      .join(", ");

    return {
      label: course.isOpenClass ? `Weekly update ${totalEntries - index}` : `Session ${sessionNumber}`,
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      focus: labels[index % labels.length],
      attendanceLabel: `${attendance}/${roster.length || course.enrollment} present`,
      reportLabel: course.isOpenClass
        ? `${submittedCount}/${reportSummary.total || roster.length || 0} progress updates attached`
        : `${submittedCount}/${reportSummary.total || roster.length || 0} student reports attached`,
      reportDetail: attachedStudents
        ? `Latest attached records include ${attachedStudents}.`
        : "No attached student records yet.",
    };
  });
}

function courseScheduleParts(schedule) {
  const [dayPart, ...timeParts] = schedule.split(",");
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const days = weekdayNames.filter((day) => dayPart.includes(day));

  return {
    days,
    timeLabel: timeParts.join(",").trim() || "Time varies",
  };
}

function buildStructuredSessionDates(course) {
  const startDate = new Date(course.startDateIso || course.startDateLabel);
  const { days } = courseScheduleParts(course.schedule);
  const activeDays = days.length ? days : ["Monday"];
  const weekdayIndexes = new Set(activeDays.map((day) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day)));
  const dates = [];
  const cursor = new Date(startDate);

  while (dates.length < (course.totalSessions || 16)) {
    if (weekdayIndexes.has(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function structuredCourseFinalDate(course) {
  const dates = buildStructuredSessionDates(course);
  return dates.length ? dates[dates.length - 1] : null;
}

function courseLifecycleMeta(course) {
  if (course.isOpenClass) {
    return {
      state: "open",
      label: "Open Class",
      detail: "Continuous progress updates",
      countsAsActive: true,
    };
  }

  const finalDate = structuredCourseFinalDate(course);
  const completedBySession = (course.currentSession || 0) >= (course.totalSessions || 16);

  if (!finalDate || !completedBySession) {
    return {
      state: "active",
      label: "Active",
      detail: `Session ${course.currentSession} of ${course.totalSessions}`,
      countsAsActive: true,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedFinalDate = new Date(finalDate);
  normalizedFinalDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - normalizedFinalDate) / (24 * 60 * 60 * 1000));

  if (diffDays <= courseCompletionGraceDays) {
    return {
      state: "completed",
      label: "Completed",
      detail: `Wrap-up window · ended ${normalizedFinalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      countsAsActive: false,
    };
  }

  return {
    state: "archived",
    label: "Archived",
    detail: `Finished ${normalizedFinalDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
    countsAsActive: false,
  };
}

function buildOpenClassSessionDates(course) {
  const today = new Date();
  const { days } = courseScheduleParts(course.schedule);
  const activeDays = days.length ? days : ["Monday"];
  const weekdayIndexes = new Set(activeDays.map((day) => ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(day)));
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - 28);
  const dates = [];

  while (dates.length < 10 && cursor <= today) {
    if (weekdayIndexes.has(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function courseSectionEntries(course, roster) {
  const reportSummary = courseReportSummary(course);
  const { timeLabel } = courseScheduleParts(course.schedule);
  const allDates = course.isOpenClass ? buildOpenClassSessionDates(course) : buildStructuredSessionDates(course);
  const relevantCount = course.isOpenClass ? allDates.length : (course.totalSessions || allDates.length);
  const completedSessions = course.isOpenClass
    ? allDates.filter((date) => date <= new Date()).length
    : Math.min(course.currentSession || 0, relevantCount);
  const reportCoveredSessions = Math.max(0, Math.min(completedSessions, Math.round((reportSummary.submitted / Math.max(reportSummary.total, 1)) * completedSessions)));
  const presentBase = Math.max(0, Math.min(roster.length || course.enrollment, course.hereToday || 0));

  return allDates.map((date, index) => {
    const isFuture = !course.isOpenClass && date > new Date();
    const isCurrent = !course.isOpenClass && (index + 1) === course.currentSession;
    const entryLabel = `${index + 1}`;
    const status = course.isOpenClass ? (index === allDates.length - 1 ? "Current" : "Previous") : isFuture ? "Future" : isCurrent ? "Current" : "Previous";
    const attendanceValue = isFuture ? "Scheduled" : `${Math.max(0, presentBase - (index % 3))}/${roster.length || course.enrollment} present`;
    const hasReports = !isFuture && index < reportCoveredSessions;
    const attendanceCount = isFuture ? null : Math.max(0, presentBase - (index % 3));
    const absentCount = isFuture ? Math.max(0, (roster.length || course.enrollment) - 0) : Math.max(0, (roster.length || course.enrollment) - attendanceCount);
    const presentStudents = isFuture
      ? []
      : roster
        .filter((student, rosterIndex) => rosterIndex < attendanceCount)
        .map((student) => student.name);
    const absentStudents = isFuture
      ? []
      : roster
        .filter((student, rosterIndex) => rosterIndex >= attendanceCount)
        .map((student) => student.name);
    const attachedReports = hasReports
      ? roster
        .map((student) => ({
          student,
          report: studentCourseReportFor(course, student),
        }))
        .filter((entry) => entry.report.submitted)
        .slice(index % 2, Math.min(roster.length, (index % 2) + 3))
        .map((entry) => ({
          studentName: entry.student.name,
          assignmentUpdate: entry.report.assignmentUpdate,
          nextStep: entry.report.nextStep,
          submittedAt: entry.report.submittedAt,
          completedReports: entry.report.completedReports,
          expectedReports: entry.report.expectedReports,
        }))
      : [];

    return {
      index,
      label: entryLabel,
      status,
      dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeLabel,
      attendanceLabel: attendanceValue,
      attendancePillLabel: isFuture ? "Scheduled" : `${attendanceCount}/${roster.length || course.enrollment}`,
      attendanceState: isFuture ? "neutral" : absentCount ? "warning" : "ok",
      presentStudents,
      absentStudents,
      reportLabel: isFuture ? "Not due yet" : hasReports ? "Contains reports" : "Missing reports",
      reportState: isFuture ? "upcoming" : hasReports ? "complete" : "missing",
      attachedReports,
    };
  });
}

function renderAdminCourseSectionsTab(course) {
  const roster = adminCourseRoster(course);
  const entries = courseSectionEntries(course, roster);

  return `
    <section class="panel admin-panel admin-course-sections-panel">
      <div class="panel-heading admin-sections-head">
        <div>
          <p class="eyebrow">Sessions</p>
          <h4>${course.isOpenClass ? "Rolling class meeting log" : "All scheduled sessions"}</h4>
          <p class="metric-caption">${course.isOpenClass ? `${course.openClassTrait} · Continuous class with no designated end date.` : `Tracks all ${course.totalSessions} scheduled sessions for this course.`}</p>
        </div>
      </div>
      <div class="admin-table-wrap">
        <table class="admin-table admin-sections-table">
          <thead>
            <tr>
              <th>Session</th>
              <th>Date</th>
              <th>Time</th>
              <th>Attendance</th>
              <th>Reports</th>
              <th>Menu</th>
            </tr>
          </thead>
          <tbody>
            ${entries.map((entry) => `
              <tr>
                <td><strong>${entry.label}</strong></td>
                <td>${entry.dateLabel}</td>
                <td>${entry.timeLabel}</td>
                <td>
                  <button class="status-chip ${entry.attendanceState} admin-status-chip admin-session-attendance-pill" type="button" data-open-session-attendance="${course.id}" data-session-index="${entry.index}">
                    ${entry.attendancePillLabel}
                  </button>
                </td>
                <td>
                  <button class="status-chip ${entry.reportState === "complete" ? "ok" : entry.reportState === "missing" ? "warning" : "neutral"} admin-status-chip admin-session-report-pill" type="button" data-open-session-reports="${course.id}" data-session-index="${entry.index}">
                    ${entry.reportLabel}
                  </button>
                </td>
                <td>
                  <details class="admin-session-menu">
                    <summary class="admin-menu-button" aria-label="Session entry actions">…</summary>
                    <div class="admin-session-menu-list">
                      <button class="schedule-slot-menu-button" type="button">Change entry details</button>
                      <button class="schedule-slot-menu-button" type="button">Cancel &amp; push</button>
                      <button class="schedule-slot-menu-button" type="button">Copy Zoom credentials</button>
                      <button class="schedule-slot-menu-button danger" type="button">Delete class entry</button>
                    </div>
                  </details>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function openSessionReportsModal(courseId, sessionIndex) {
  const course = getCourseRecords().find((entry) => entry.id === courseId);
  const roster = course ? adminCourseRoster(course) : [];
  const entries = course ? courseSectionEntries(course, roster) : [];
  const entry = entries[Number(sessionIndex)];

  if (!course || !entry || !metrics.courseReportModal) {
    return;
  }

  metrics.courseReportTitle.textContent = `${course.title} · ${entry.label}`;
  metrics.courseReportMeta.textContent = `${entry.dateLabel} · ${entry.timeLabel} · ${entry.attendanceLabel}`;
  metrics.courseReportBody.innerHTML = entry.attachedReports.length ? `
    <section class="admin-report-section">
      <h4>Submitted Reports</h4>
      <div class="admin-session-report-list">
        ${entry.attachedReports.map((report) => `
          <article class="admin-session-report-item">
            <div class="admin-session-report-head">
              <strong>${report.studentName}</strong>
              <span class="metric-caption">${report.submittedAt ? report.submittedAt.toLocaleDateString("en-US") : "Submitted"}</span>
            </div>
            <p><strong>Assignment Update:</strong> ${report.assignmentUpdate}</p>
            <p><strong>Next Steps:</strong> ${report.nextStep}</p>
            <p class="metric-caption">${report.completedReports}/${report.expectedReports} reports completed for this student.</p>
          </article>
        `).join("")}
      </div>
    </section>
  ` : `
    <section class="admin-report-section">
      <h4>${entry.reportState === "upcoming" ? "Not Due Yet" : "No Submitted Reports"}</h4>
      <p>${entry.reportState === "upcoming" ? "This session has not happened yet, so reports are not due yet." : "There are currently no submitted reports attached to this session."}</p>
    </section>
  `;
  metrics.courseReportModal.classList.remove("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "false");
}

function openSessionAttendanceModal(courseId, sessionIndex) {
  const course = getCourseRecords().find((entry) => entry.id === courseId);
  const roster = course ? adminCourseRoster(course) : [];
  const entries = course ? courseSectionEntries(course, roster) : [];
  const entry = entries[Number(sessionIndex)];

  if (!course || !entry || !metrics.courseReportModal) {
    return;
  }

  metrics.courseReportTitle.textContent = `${course.title} · Session ${entry.label} attendance`;
  metrics.courseReportMeta.textContent = `${entry.dateLabel} · ${entry.timeLabel} · ${entry.attendancePillLabel}`;
  metrics.courseReportBody.innerHTML = entry.attendanceState === "neutral" ? `
    <section class="admin-report-section">
      <h4>Attendance Not Due Yet</h4>
      <p>This session has not happened yet, so there is no attendance roster to review yet.</p>
    </section>
  ` : `
    <section class="admin-report-section">
      <h4>Present</h4>
      <div class="admin-session-name-list">
        ${entry.presentStudents.length
          ? entry.presentStudents.map((name) => `<span class="admin-session-name-pill">${name}</span>`).join("")
          : `<p>No students marked present.</p>`}
      </div>
    </section>
    <section class="admin-report-section">
      <h4>Absent</h4>
      <div class="admin-session-name-list">
        ${entry.absentStudents.length
          ? entry.absentStudents.map((name) => `<span class="admin-session-name-pill absent">${name}</span>`).join("")
          : `<p>No students marked absent.</p>`}
      </div>
    </section>
  `;
  metrics.courseReportModal.classList.remove("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "false");
}

function renderAdminCourseDetailTabs(course) {
  return `
    <section class="admin-course-tab-shell">
      <div class="admin-course-tab-row">
        <button class="admin-course-tab active" type="button" data-course-tab-target="overview">Overview</button>
        <button class="admin-course-tab" type="button" data-course-tab-target="sessions">Sessions</button>
      </div>
      <div class="admin-course-tab-panel" data-course-tab-panel="overview">
        ${renderAdminCourseDetailCardV2(course)}
      </div>
      <div class="admin-course-tab-panel hidden" data-course-tab-panel="sessions">
        ${renderAdminCourseSectionsTab(course)}
      </div>
    </section>
  `;
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

function adminInstructorProfileUrl(instructorId) {
  return `admin-instructor-profile.html?instructor=${encodeURIComponent(instructorId)}`;
}

function adminInstructorAvailabilityUrl(instructorId) {
  return `admin-instructor-availability.html?instructor=${encodeURIComponent(instructorId)}`;
}

function adminCourseDetailUrl(courseId, instructorId = "") {
  const params = new URLSearchParams({ course: courseId });

  if (instructorId) {
    params.set("instructor", instructorId);
  }

  return `admin-course-detail.html?${params.toString()}`;
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
  return getInstructorRecords().find((instructor) => instructor.id === instructorId) || null;
}

function getCoursesForInstructor(instructorId) {
  return getCourseRecords().filter((course) => course.instructorId === instructorId);
}

function buildInstructorCourseLoadMap() {
  const counts = new Map();

  getCourseRecords().forEach((course) => {
    if (courseLifecycleMeta(course).countsAsActive) {
      counts.set(course.instructorId, (counts.get(course.instructorId) || 0) + 1);
    }
  });

  return counts;
}

function pagedItems(items, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), pageCount);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageCount,
  };
}

function currentPageNumber(paramName) {
  const value = Number(new URLSearchParams(window.location.search).get(paramName) || "1");
  return Number.isFinite(value) && value > 0 ? value : 1;
}

function pageLinkFor(paramName, pageNumber) {
  const params = new URLSearchParams(window.location.search);
  params.set(paramName, String(pageNumber));
  return `${window.location.pathname.split(/[\\/]/).pop()}?${params.toString()}`;
}

function renderSimplePagination(paramName, page, pageCount) {
  if (pageCount <= 1) {
    return "";
  }

  return `
    <div class="admin-pagination">
      ${page > 1 ? `<a class="schedule-button schedule-button-secondary" href="${pageLinkFor(paramName, page - 1)}">Previous</a>` : `<span></span>`}
      <span class="metric-caption">Page ${page} of ${pageCount}</span>
      ${page < pageCount ? `<a class="schedule-button schedule-button-secondary" href="${pageLinkFor(paramName, page + 1)}">Next</a>` : `<span></span>`}
    </div>
  `;
}

function getCompletedCoursesForInstructor(instructor) {
  if (!instructor) {
    return [];
  }

  if (instructor.name !== "Dr. Avery Rivera") {
    return [];
  }

  const titles = [
    "Python Foundations Tutoring",
    "Web Development Foundations Tutoring",
    "JavaScript Lecture Lab",
    "Game Development Studio",
    "Intro to HTML & CSS Workshop",
    "React Project Block",
    "Cybersecurity Foundations Workshop",
    "Data Science Studio",
    "AI Builders Lecture Lab",
    "App Development Tutoring",
    "Algorithms Project Block",
    "Machine Learning Studio",
  ];

  return titles.map((title, index) => {
    const endDate = new Date("2025-03-14T00:00:00");
    endDate.setDate(endDate.getDate() + (index * 14));

    return {
      id: `COMP-${String(index + 1).padStart(3, "0")}`,
      title,
      schedule: ["Monday and Wednesday, 3:30 PM - 5:00 PM", "Tuesday and Thursday, 3:15 PM - 4:45 PM", "Saturday, 10:00 AM - 12:00 PM"][index % 3],
      location: ["Irvine", "Online", "Factoria"][index % 3],
      enrollment: 10 + (index % 7),
      completedReports: 16,
      totalSessions: 16,
      endDateIso: endDate.toISOString(),
      endDateLabel: endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      note: ["Strong completion rates", "Ended with project showcase", "Closed after final progress update"][index % 3],
    };
  }).sort((left, right) => new Date(right.endDateIso) - new Date(left.endDateIso));
}

function getCompletedCourseRecord(instructorId, courseId) {
  const instructor = getInstructorRecord(instructorId);

  if (!instructor) {
    return null;
  }

  return getCompletedCoursesForInstructor(instructor).find((course) => course.id === courseId) || null;
}

function adminCourseRoster(course) {
  if (adminCourseRosterCache.has(course.id)) {
    return adminCourseRosterCache.get(course.id);
  }

  if (!students.length) {
    return [];
  }

  const seed = Array.from(course.id).reduce((sum, char, index) => sum + (char.charCodeAt(0) * (index + 11)), 0);
  const desired = Math.min(8, Math.max(4, Math.round(course.enrollment / 3)));

  const roster = Array.from({ length: desired }, (_, index) => {
    const baseStudent = students[(seed + index) % students.length];
    return {
      ...baseStudent,
      rosterCourseTitle: course.title,
    };
  });

  adminCourseRosterCache.set(course.id, roster);
  return roster;
}

function studentCourseReportFor(course, student) {
  if (!adminCourseReportStoreCache.has(course.id)) {
    adminCourseReportStoreCache.set(
      course.id,
      window.portalStore.ensureStudentCourseReports(
        course.id,
        adminCourseRoster(course).map((entry) => entry.name),
      ),
    );
  }

  const savedReport = adminCourseReportStoreCache.get(course.id)?.[student.name];

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
  if (adminCourseReportSummaryCache.has(course.id)) {
    return adminCourseReportSummaryCache.get(course.id);
  }

  const roster = adminCourseRoster(course);
  const submitted = roster.filter((student) => studentCourseReportFor(course, student).complete).length;
  const missing = roster.length - submitted;

  const summary = {
    total: roster.length,
    submitted,
    missing,
  };

  adminCourseReportSummaryCache.set(course.id, summary);
  return summary;
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

function instructorStatusClass(status) {
  if (status === "Active") {
    return "ok";
  }

  if (status === "Waitlist" || status === "Transitioning") {
    return "warning";
  }

  return "neutral";
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
                    <span>ID ${studentIdForName(student.name)}</span>
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
                    <span>ID ${studentIdForName(student.name)}</span>
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

function renderAdminCourseDetailCardV2(course) {
  const roster = adminCourseRoster(course);
  const reportSummary = courseReportSummary(course);
  const sessions = courseSessionEntries(course, roster);
  const lifecycle = courseLifecycleMeta(course);

  return `
    <section class="panel admin-panel admin-course-detail-card">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">${course.id}</p>
          <h3><a class="student-link" href="${adminCourseDetailUrl(course.id)}">${course.title}</a></h3>
          <p class="metric-caption">${course.schedule} · ${course.location} · ${course.courseFormat}</p>
        </div>
        <div class="admin-course-detail-metrics">
          <span>${course.sessionProgressLabel}</span>
          <span>${lifecycle.label}</span>
          <span>${course.isOpenClass ? "No end date" : `Ends ${course.endDateLabel}`}</span>
          <span>Enrollment ${course.enrollment}</span>
          <span>Here ${course.hereToday}</span>
          <span>Alerts ${course.alerts}</span>
          <span>Progress ${course.avgProgress}%</span>
        </div>
      </div>
      <div class="admin-course-detail-grid">
        <div class="admin-course-detail-section">
          <div class="admin-course-format-card ${course.isOpenClass ? "open-class" : ""}">
            <p class="eyebrow">${course.courseFormat}</p>
            <h4>${course.isOpenClass ? "Continuous with lighter updates" : "Structured with a designated end"}</h4>
            <p class="admin-report-copy">${course.courseFormatNote}</p>
            <p class="metric-caption">${lifecycle.detail}</p>
          </div>
          <p class="eyebrow">Connected Students</p>
          <div class="admin-course-student-list">
            ${roster.map((student) => {
              const status = studentStatus(student);
              return `
                <a class="admin-course-student-item" href="${adminStudentDetailUrl(student.name, course)}">
                  <div>
                    <strong>${student.name}</strong>
                    <span>ID ${studentIdForName(student.name)}</span>
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
              ${course.isOpenClass
                ? "Open classes stay continuous, so instructors submit lighter progress updates instead of a rigid end-of-term reporting cycle."
                : "Each student in this course should have an individual report on file. Missing submissions stay highlighted for quick follow-up."}
            </p>
          </div>
          <div class="admin-session-history">
            <div class="admin-session-history-head">
              <p class="eyebrow">${course.isOpenClass ? "Progress Updates" : "Previous Sessions"}</p>
              <h4>${course.isOpenClass ? "Continuous weekly record" : "Session-by-session detail"}</h4>
            </div>
            <div class="admin-session-history-list">
              ${sessions.map((session) => `
                <article class="admin-session-card">
                  <div class="admin-session-card-head">
                    <strong>${session.label}</strong>
                    <span>${session.dateLabel}</span>
                  </div>
                  <p class="admin-session-focus">${session.focus}</p>
                  <p class="admin-session-meta"><strong>Attendance:</strong> ${session.attendanceLabel}</p>
                  <p class="admin-session-meta"><strong>Reports:</strong> ${session.reportLabel}</p>
                  <p class="admin-report-copy">${session.reportDetail}</p>
                </article>
              `).join("")}
            </div>
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
                  <p class="metric-caption">${report.completedReports}/${report.expectedReports} ${course.isOpenClass ? "updates" : "reports"} completed${report.submittedAt ? ` · Latest ${report.submittedAt.toLocaleDateString("en-US")}` : ""}</p>
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
  layer.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-copy-contact]");

    if (!button) {
      return;
    }

    const value = button.dataset.copyValue || "";

    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      const label = button.dataset.copyContact === "email" ? "Email copied" : "Phone copied";
      const feedback = layer.querySelector("[data-contact-feedback]");

      if (feedback) {
        feedback.textContent = label;
      }
    } catch (error) {
      const feedback = layer.querySelector("[data-contact-feedback]");

      if (feedback) {
        feedback.textContent = "Copy unavailable";
      }
    }
  });

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
        <span>Contact Information</span>
        <strong class="admin-hover-contact-row">
          <button class="admin-contact-icon" type="button" data-copy-contact="phone" data-copy-value="${instructorPayload.phone}" aria-label="Copy phone number">
            ☎
            <span class="admin-contact-preview">${instructorPayload.phone}</span>
          </button>
          <button class="admin-contact-icon" type="button" data-copy-contact="email" data-copy-value="${instructorPayload.email}" aria-label="Copy email address">
            ✉
            <span class="admin-contact-preview">${instructorPayload.email}</span>
          </button>
        </strong>
        <p class="metric-caption admin-contact-feedback" data-contact-feedback></p>
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
  const courseLoadMap = buildInstructorCourseLoadMap();

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
      result = ((courseLoadMap.get(left.id) || 0) - (courseLoadMap.get(right.id) || 0)) || compareText(left.name, right.name);
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

    let result = 0;

    if (adminState.studentSort === "id") {
      result = compareText(leftId, rightId);
    } else if (adminState.studentSort === "courseLoad") {
      result = compareText(leftCourse, rightCourse) || compareText(left.name, right.name);
    } else {
      result = compareText(left.name, right.name);
    }

    return adminState.studentSortDirection === "desc" ? -result : result;
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
  metrics.studentSortName?.classList.toggle("is-desc", adminState.studentSort === "name" && adminState.studentSortDirection === "desc");
  metrics.studentSortId?.classList.toggle("is-desc", adminState.studentSort === "id" && adminState.studentSortDirection === "desc");
  metrics.studentSortCourse?.classList.toggle("is-desc", adminState.studentSort === "courseLoad" && adminState.studentSortDirection === "desc");
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

function toggleStudentSort(nextSort) {
  if (adminState.studentSort === nextSort) {
    adminState.studentSortDirection = adminState.studentSortDirection === "asc" ? "desc" : "asc";
  } else {
    adminState.studentSort = nextSort;
    adminState.studentSortDirection = "asc";
  }

  syncSortChips();
  renderStudents();
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
  const totalHours = getCourseRecords().reduce((sum, course) => {
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
  const instructors = getInstructorRecords();
  const alertCount = students.filter((student) => student.alertActive).length + instructors.reduce((sum, instructor) => sum + instructor.alerts, 0);
  const missingSubplans = timeOffRequests.filter((request) => !request.subPlanLink).length;
  const pendingCoverage = timeOffRequests.filter((request) => !request.approved).length;
  const pendingTotal = alertCount + missingSubplans + pendingCoverage;

  if (metrics.instructorCount) {
    metrics.instructorCount.textContent = String(instructors.length);
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

  const instructors = getInstructorRecords();
  const locations = ["Irvine", "Redmond", "Bothell", "Factoria", "Online"];

  metrics.locationBreakdown.innerHTML = locations.map((location) => {
    const instructorCount = instructors.filter((instructor) => instructor.locations.includes(location)).length;
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

  const instructors = getInstructorRecords();
  const courses = getCourseRecords();
  const pendingRequests = timeOffRequests.filter((request) => !request.approved).length;
  const missingSubplans = timeOffRequests.filter((request) => !request.subPlanLink).length;
  const interventionCount = students.filter((student) => student.alertActive).length + courses.filter((course) => course.alerts > 0).length;
  const attendanceFlags = students.filter((student) => student.attendance < 80).length;
  const payrollSnapshot = buildMonthlyAdminSnapshot();
  const complianceFlags = instructors.filter((instructor) => instructor.status !== "Active").length;
  const missingReports = courses.reduce((sum, course) => sum + courseReportSummary(course).missing, 0);

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

  const instructors = getInstructorRecords();
  const courseLoadMap = buildInstructorCourseLoadMap();
  const filtered = sortInstructorRecords(instructors.filter((instructor) => {
    const haystack = [
      instructor.id,
      instructor.name,
      instructor.email,
      instructor.username,
      instructor.program,
      instructor.rank,
      instructor.locations.join(" "),
      instructor.languages.join(" "),
      (instructor.tags || []).join(" "),
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
              data-email="${instructor.email}"
              data-locations="${instructor.locations.join(", ")}"
              data-languages="${instructor.languages.join(", ")}"
              data-course-load="${courseLoadMap.get(instructor.id) || 0} courses"
              data-students="${instructor.studentsSupported}"
              data-alerts="${instructor.alerts}"
            ><strong class="admin-hover-name">${instructor.name}</strong></div><br>
            <span class="student-meta">${instructor.id} · ${instructor.email}</span>
          </div>
        </td>
        <td>${instructor.program}</td>
        <td>${instructor.locations.join(", ")}</td>
        <td>${instructor.languages.join(", ")}</td>
        <td>${courseLoadMap.get(instructor.id) || 0} courses<br><span class="student-meta">${instructor.studentsSupported} students</span></td>
        <td><span class="status-chip ${instructorStatusClass(instructor.status)} admin-status-chip">${instructor.status}</span></td>
        <td>
          <details class="admin-session-menu">
            <summary class="admin-menu-button" aria-label="Instructor actions">…</summary>
            <div class="admin-session-menu-list">
              <button class="schedule-slot-menu-button" type="button" data-report-accident="${instructor.id}">Report Accident</button>
              <button class="schedule-slot-menu-button" type="button" data-edit-instructor="${instructor.id}">Edit Instructor</button>
              <a class="schedule-slot-menu-button" href="${adminInstructorProfileUrl(instructor.id)}">View whole profile</a>
              <a class="schedule-slot-menu-button" href="${adminInstructorAvailabilityUrl(instructor.id)}">View weekly availability</a>
            </div>
          </details>
        </td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="7" class="admin-empty-state">No instructors matched this search.</td>
      </tr>
    `;

  if (metrics.instructorSummary) {
    const activeCount = instructors.filter((instructor) => instructor.status === "Active").length;
    const onlineCount = instructors.filter((instructor) => instructor.locations.includes("Online")).length;
    const multilingualCount = instructors.filter((instructor) => instructor.languages.length > 1).length;

    const avgCourseLoad = (instructors.reduce((sum, instructor) => sum + (courseLoadMap.get(instructor.id) || 0), 0) / instructors.length).toFixed(1);

    metrics.instructorSummary.innerHTML = `
      <article class="metric-card"><p class="metric-label">Total Instructors</p><h3>${instructors.length}</h3><p class="metric-caption">Directory records currently available.</p></article>
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

function openAccidentModal(instructorId) {
  const instructor = getInstructorRecord(instructorId);

  if (!instructor || !metrics.accidentModal) {
    return;
  }

  activeAccidentInstructorId = instructorId;
  metrics.accidentTitle.textContent = `${instructor.name} incident report`;
  metrics.accidentMeta.textContent = `${instructor.id} · ${instructor.program}`;
  metrics.accidentType.value = "Classroom injury";
  metrics.accidentDate.value = new Date().toISOString().slice(0, 10);
  metrics.accidentNotes.value = "";
  metrics.accidentStatus.textContent = "";
  metrics.accidentModal.classList.remove("hidden");
  metrics.accidentModal.setAttribute("aria-hidden", "false");
}

function closeAccidentModal() {
  activeAccidentInstructorId = null;
  metrics.accidentModal?.classList.add("hidden");
  metrics.accidentModal?.setAttribute("aria-hidden", "true");
}

function saveAccidentModal() {
  if (!activeAccidentInstructorId) {
    closeAccidentModal();
    return;
  }

  const notes = metrics.accidentNotes?.value.trim();

  if (!notes) {
    metrics.accidentStatus.textContent = "Add notes before saving the accident report.";
    return;
  }

  const reports = loadAdminInstructorAccidents();
  const existing = reports[activeAccidentInstructorId] || [];
  reports[activeAccidentInstructorId] = [
    {
      type: metrics.accidentType?.value || "Other",
      date: metrics.accidentDate?.value || new Date().toISOString().slice(0, 10),
      notes,
      createdAt: new Date().toISOString(),
    },
    ...existing,
  ];
  saveAdminInstructorAccidents(reports);
  metrics.accidentStatus.textContent = "Incident report saved.";
  renderAdminPortal();
  closeAccidentModal();
}

function openEditInstructorModal(instructorId) {
  const instructor = getInstructorRecord(instructorId);

  if (!instructor || !metrics.editInstructorModal) {
    return;
  }

  activeEditInstructorId = instructorId;
  metrics.editInstructorTitle.textContent = `${instructor.name} record`;
  metrics.editInstructorMeta.textContent = `${instructor.id} · ${instructor.program}`;
  metrics.editInstructorRank.value = instructor.rank || "";
  metrics.editInstructorSalary.value = instructor.salaryRate || "";
  metrics.editInstructorStatusField.value = instructor.status;
  metrics.editInstructorEmail.value = instructor.email;
  metrics.editInstructorUsername.value = instructor.username || "";
  metrics.editInstructorPassword.value = instructor.password || "";
  metrics.editInstructorPhone.value = instructor.phone;
  metrics.editInstructorLocations.value = instructor.locations.join(", ");
  metrics.editInstructorLanguages.value = instructor.languages.join(", ");
  metrics.editInstructorTags?.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.checked = (instructor.tags || []).includes(input.value);
  });
  metrics.editInstructorStatusNote.textContent = "";
  metrics.editInstructorModal.classList.remove("hidden");
  metrics.editInstructorModal.setAttribute("aria-hidden", "false");
}

function closeEditInstructorModal() {
  activeEditInstructorId = null;
  metrics.editInstructorModal?.classList.add("hidden");
  metrics.editInstructorModal?.setAttribute("aria-hidden", "true");
}

function saveEditInstructorModal() {
  if (!activeEditInstructorId) {
    closeEditInstructorModal();
    return;
  }

  const overrides = loadAdminInstructorOverrides();
  const selectedTags = Array.from(metrics.editInstructorTags?.querySelectorAll("input[type='checkbox']:checked") || []).map((input) => input.value);
  overrides[activeEditInstructorId] = {
    ...(overrides[activeEditInstructorId] || {}),
    rank: metrics.editInstructorRank?.value.trim(),
    salaryRate: metrics.editInstructorSalary?.value.trim(),
    status: metrics.editInstructorStatusField?.value || "Active",
    email: metrics.editInstructorEmail?.value.trim(),
    username: metrics.editInstructorUsername?.value.trim(),
    password: metrics.editInstructorPassword?.value.trim(),
    phone: metrics.editInstructorPhone?.value.trim(),
    locations: (metrics.editInstructorLocations?.value || "").split(",").map((item) => item.trim()).filter(Boolean),
    languages: (metrics.editInstructorLanguages?.value || "").split(",").map((item) => item.trim()).filter(Boolean),
    tags: selectedTags,
  };
  saveAdminInstructorOverrides(overrides);
  metrics.editInstructorStatusNote.textContent = "Instructor record saved.";
  renderAdminPortal();
  closeEditInstructorModal();
}

function buildInstructorWeeklyAvailability(instructor, courses) {
  const slots = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  courses.forEach((course) => {
    weekdayNames.forEach((day) => {
      if (course.schedule.includes(day)) {
        slots[day].push(`${course.title} · ${course.schedule}`);
      }
    });
  });

  return Object.entries(slots).map(([day, entries]) => ({
    day,
    entries: entries.length ? entries : ["Available for waitlist or coverage placement"],
  }));
}

function renderAdminInstructorProfilePage() {
  if (!metrics.instructorProfileContent || !metrics.instructorProfileTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const instructorId = params.get("instructor");
  const instructor = getInstructorRecord(instructorId);

  if (!instructor) {
    metrics.instructorProfileTitle.textContent = "Instructor not found";
    metrics.instructorProfileSubtitle.textContent = "This instructor record could not be loaded.";
    metrics.instructorProfileSummary.innerHTML = "";
    metrics.instructorProfileContent.innerHTML = `<section class="panel admin-panel"><p class="admin-empty-state">We could not find an instructor for this link.</p></section>`;
    return;
  }

  const courses = getCoursesForInstructor(instructor.id);
  const activeCourses = courses.filter((course) => courseLifecycleMeta(course).countsAsActive);
  const completedCourses = getCompletedCoursesForInstructor(instructor);
  const connectedCourseEntries = [
    ...courses.map((course) => ({
      kind: "active",
      title: course.title,
      subtitle: course.schedule,
      tertiary: course.location,
      badge: course.sessionProgressLabel,
      badgeClass: "ok",
      href: adminCourseDetailUrl(course.id),
    })),
    ...completedCourses.map((course) => ({
      kind: "completed",
      title: course.title,
      subtitle: `${course.schedule} · ${course.location}`,
      tertiary: course.note,
      badge: `16/16 · ${course.endDateLabel}`,
      badgeClass: "neutral",
      href: adminCourseDetailUrl(course.id, instructor.id),
    })),
  ];
  const connectedCoursePage = pagedItems(connectedCourseEntries, currentPageNumber("connectedPage"), connectedCoursePageSize);
  const accidentReports = loadAdminInstructorAccidents()[instructor.id] || [];
  const connectedStudents = courses.reduce((sum, course) => sum + adminCourseRoster(course).length, 0);

  document.title = `${instructor.name} | Instructor Profile`;
  metrics.instructorProfileTitle.textContent = instructor.name;
  metrics.instructorProfileSubtitle.textContent = `${instructor.id} · ${instructor.program} · ${instructor.status}`;
  metrics.instructorProfileSummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Course Load</p><h3>${activeCourses.length}</h3><p class="metric-caption">Currently active and open classes assigned.</p></article>
    <article class="metric-card"><p class="metric-label">Students Supported</p><h3>${connectedStudents}</h3><p class="metric-caption">Across connected course rosters.</p></article>
    <article class="metric-card"><p class="metric-label">Rank</p><h3>${instructor.rank || "Instructor"}</h3><p class="metric-caption">${instructor.salaryRate || "Rate not listed"}</p></article>
    <article class="metric-card"><p class="metric-label">Completed Courses</p><h3>${completedCourses.length}</h3><p class="metric-caption">Historical classes already wrapped.</p></article>
    <article class="metric-card"><p class="metric-label">Incident Reports</p><h3>${accidentReports.length}</h3><p class="metric-caption">Saved administrative reports on file.</p></article>
  `;
  metrics.instructorProfileContent.innerHTML = `
    <section class="admin-course-detail-grid">
      <article class="panel admin-panel admin-course-detail-section">
        <p class="eyebrow">Instructor Record</p>
        <div class="course-list">
          <div class="course-list-item"><strong>Rank:</strong> ${instructor.rank || "Instructor"}</div>
          <div class="course-list-item"><strong>Salary Rate:</strong> ${instructor.salaryRate || "Rate not listed"}</div>
          <div class="course-list-item"><strong>Email:</strong> ${instructor.email}</div>
          <div class="course-list-item"><strong>Username:</strong> ${instructor.username || "Not listed"}</div>
          <div class="course-list-item"><strong>Password:</strong> ${instructor.password || "Not listed"}</div>
          <div class="course-list-item"><strong>Phone:</strong> ${instructor.phone}</div>
          <div class="course-list-item"><strong>Status:</strong> ${instructor.status}</div>
          <div class="course-list-item"><strong>Locations:</strong> ${instructor.locations.join(", ")}</div>
          <div class="course-list-item"><strong>Languages:</strong> ${instructor.languages.join(", ")}</div>
          <div class="course-list-item"><strong>Notes Tags:</strong> ${(instructor.tags || []).length ? instructor.tags.map((tag) => `<span class="admin-tag-chip">${tag}</span>`).join("") : "None added"}</div>
        </div>
      </article>
      <article class="panel admin-panel admin-course-detail-section">
        <p class="eyebrow">Connected Courses</p>
        <div class="admin-course-student-list">
          ${connectedCoursePage.items.length
            ? connectedCoursePage.items.map((course) => `<a class="admin-course-student-item ${course.kind === "completed" ? "admin-course-history-item" : ""}" href="${course.href}"><div><strong>${course.title}</strong><span>${course.subtitle}</span><span>${course.tertiary}</span></div><span class="status-chip ${course.badgeClass} admin-status-chip">${course.badge}</span></a>`).join("")
            : `<p class="notes-empty">No connected course history is loaded for this instructor.</p>`}
        </div>
        ${renderSimplePagination("connectedPage", connectedCoursePage.page, connectedCoursePage.pageCount)}
      </article>
      <article class="panel admin-panel admin-course-detail-section">
        <p class="eyebrow">Accident Reports</p>
        <div class="notes-modal-list">
          ${accidentReports.length ? accidentReports.map((entry) => `<article class="notes-entry"><div class="notes-entry-head"><p class="notes-entry-date">${entry.date} · ${entry.type}</p></div><p class="notes-entry-body">${entry.notes}</p></article>`).join("") : `<p class="notes-empty">No accident reports saved for this instructor.</p>`}
        </div>
      </article>
    </section>
  `;
}

function renderAdminInstructorAvailabilityPage() {
  if (!metrics.instructorAvailabilityContent || !metrics.instructorAvailabilityTitle) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const instructorId = params.get("instructor");
  const instructor = getInstructorRecord(instructorId);

  if (!instructor) {
    metrics.instructorAvailabilityTitle.textContent = "Instructor not found";
    metrics.instructorAvailabilitySubtitle.textContent = "This instructor record could not be loaded.";
    metrics.instructorAvailabilitySummary.innerHTML = "";
    metrics.instructorAvailabilityContent.innerHTML = `<section class="panel admin-panel"><p class="admin-empty-state">We could not find an instructor for this link.</p></section>`;
    return;
  }

  const courses = getCoursesForInstructor(instructor.id);
  const weeklyAvailability = buildInstructorWeeklyAvailability(instructor, courses);

  document.title = `${instructor.name} | Weekly Availability`;
  metrics.instructorAvailabilityTitle.textContent = `${instructor.name} weekly availability`;
  metrics.instructorAvailabilitySubtitle.textContent = `${instructor.id} · ${instructor.locations.join(", ")} · ${instructor.languages.join(", ")}`;
  metrics.instructorAvailabilitySummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Status</p><h3>${instructor.status}</h3><p class="metric-caption">Current scheduling state.</p></article>
    <article class="metric-card"><p class="metric-label">Course Load</p><h3>${courses.length}</h3><p class="metric-caption">Scheduled courses this week.</p></article>
    <article class="metric-card"><p class="metric-label">Online Support</p><h3>${instructor.locations.includes("Online") ? "Yes" : "No"}</h3><p class="metric-caption">Virtual support eligibility.</p></article>
  `;
  metrics.instructorAvailabilityContent.innerHTML = `
    <section class="admin-quick-grid">
      ${weeklyAvailability.map((entry) => `
        <article class="admin-quick-card">
          <strong>${entry.day}</strong>
          <span>${entry.entries.join(" · ")}</span>
        </article>
      `).join("")}
    </section>
  `;
}

function renderCourseDirectory() {
  if (!metrics.courseRows) {
    return;
  }

  const courses = getCourseRecords();
  const filtered = courses.filter((course) => {
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
        <td>${course.program}<br><span class="student-meta">${course.courseFormat}</span></td>
        <td>${course.sessionProgressLabel}<br><span class="student-meta">${courseLifecycleMeta(course).detail}</span></td>
        <td>${course.isOpenClass ? "No designated end" : course.endDateLabel}<br><span class="student-meta">${courseLifecycleMeta(course).label} · ${course.openClassTrait}</span></td>
        <td>${course.enrollment}<br><span class="student-meta">${course.hereToday} here today</span></td>
        <td>${course.attendanceRate}%</td>
        <td>${course.alerts}</td>
        <td>${reportStatusMarkup(courseReportSummary(course))}</td>
      </tr>
    `).join("")
    : `
      <tr>
        <td colspan="9" class="admin-empty-state">No courses matched this search.</td>
      </tr>
    `;

  if (metrics.courseSummary) {
    const highAlert = courses.filter((course) => course.alerts >= 3).length;
    const openClassCount = courses.filter((course) => course.isOpenClass).length;
    const structuredCount = courses.length - openClassCount;
    const completedGraceCount = courses.filter((course) => courseLifecycleMeta(course).state === "completed").length;
    const archivedCount = courses.filter((course) => courseLifecycleMeta(course).state === "archived").length;
    const missingReportCourses = courses.filter((course) => courseReportSummary(course).missing).length;
    const avgEnrollment = Math.round(courses.reduce((sum, course) => sum + course.enrollment, 0) / courses.length);
    const avgAttendance = Math.round(courses.reduce((sum, course) => sum + course.attendanceRate, 0) / courses.length);

    metrics.courseSummary.innerHTML = `
      <article class="metric-card"><p class="metric-label">Total Courses</p><h3>${courses.length}</h3><p class="metric-caption">Courses currently tracked in oversight.</p></article>
      <article class="metric-card"><p class="metric-label">Structured Terms</p><h3>${structuredCount}</h3><p class="metric-caption">Courses moving through a 16-session sequence.</p></article>
      <article class="metric-card"><p class="metric-label">Open Classes</p><h3>${openClassCount}</h3><p class="metric-caption">Continuous classes with lighter progress updates.</p></article>
      <article class="metric-card"><p class="metric-label">Completed Wrap-up</p><h3>${completedGraceCount}</h3><p class="metric-caption">Finished courses still counted in active load during wrap-up.</p></article>
      <article class="metric-card"><p class="metric-label">Missing Reports</p><h3>${missingReportCourses}</h3><p class="metric-caption">Courses still missing student report coverage.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Enrollment</p><h3>${avgEnrollment}</h3><p class="metric-caption">Average students per course.</p></article>
      <article class="metric-card"><p class="metric-label">Avg Attendance</p><h3>${avgAttendance}%</h3><p class="metric-caption">Current attendance benchmark.</p></article>
      <article class="metric-card"><p class="metric-label">High Alert Courses</p><h3>${highAlert}</h3><p class="metric-caption">Courses with three or more active alerts.</p></article>
      <article class="metric-card"><p class="metric-label">Archived Courses</p><h3>${archivedCount}</h3><p class="metric-caption">Courses that have moved beyond the wrap-up period.</p></article>
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
          <td><a class="student-link" href="student.html?student=${encodeURIComponent(student.name)}">${student.name}</a></td>
          <td>ID ${studentIdForName(student.name)}</td>
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

  const candidates = getHiringRecords();
  const filtered = candidates.filter((candidate) => {
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
        count: candidates.filter((candidate) => candidate.status === status).length,
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
  const activeCourses = courses.filter((course) => courseLifecycleMeta(course).countsAsActive);
  const completedCourses = getCompletedCoursesForInstructor(instructor);
  const completedCoursePage = pagedItems(completedCourses, currentPageNumber("completedPage"), connectedCoursePageSize);
  const totalEnrollment = courses.reduce((sum, course) => sum + course.enrollment, 0);
  const totalAlerts = courses.reduce((sum, course) => sum + course.alerts, 0);
  const avgProgress = courses.length ? Math.round(courses.reduce((sum, course) => sum + course.avgProgress, 0) / courses.length) : 0;

  metrics.instructorCourseTitle.textContent = `${instructor.name} course assignment`;
  metrics.instructorCourseSubtitle.textContent = `${instructor.program} · ${instructor.locations.join(", ")} · ${instructor.languages.join(", ")}`;
  metrics.instructorCourseSummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Assigned Courses</p><h3>${activeCourses.length}</h3><p class="metric-caption">Current active/open course load for this instructor.</p></article>
    <article class="metric-card"><p class="metric-label">Projected Enrollment</p><h3>${totalEnrollment}</h3><p class="metric-caption">Combined enrollment across assigned courses.</p></article>
    <article class="metric-card"><p class="metric-label">Active Alerts</p><h3>${totalAlerts}</h3><p class="metric-caption">Alerts currently attached to these courses.</p></article>
    <article class="metric-card"><p class="metric-label">Avg Progress</p><h3>${avgProgress}%</h3><p class="metric-caption">Average progress across assigned courses.</p></article>
    <article class="metric-card"><p class="metric-label">Completed History</p><h3>${completedCourses.length}</h3><p class="metric-caption">Past courses already completed by this instructor.</p></article>
  `;

  const activeMarkup = activeCourses.length
    ? activeCourses.map((course) => renderAdminCourseDetailCardV2(course)).join("")
    : `<section class="panel admin-panel"><p class="admin-empty-state">No currently active courses are assigned to this instructor.</p></section>`;
  const historyMarkup = completedCourses.length
    ? `
      <section class="panel admin-panel">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Connected Courses</p>
            <h3>Completed course history</h3>
          </div>
        </div>
        <div class="admin-course-student-list">
          ${completedCoursePage.items.map((course) => `<a class="admin-course-student-item admin-course-history-item" href="${adminCourseDetailUrl(course.id, instructor.id)}"><div><strong>${course.title}</strong><span>${course.schedule} · ${course.location}</span><span>${course.note}</span></div><span class="status-chip neutral admin-status-chip">16/16 · ${course.endDateLabel}</span></a>`).join("")}
        </div>
        ${renderSimplePagination("completedPage", completedCoursePage.page, completedCoursePage.pageCount)}
      </section>
    `
    : "";

  metrics.instructorCourseList.innerHTML = `${activeMarkup}${historyMarkup}`;
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
                      <span>ID ${studentIdForName(student.name)}</span>
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
  const instructorId = params.get("instructor");
  const course = getCourseRecords().find((entry) => entry.id === courseId);
  const completedCourse = !course && instructorId ? getCompletedCourseRecord(instructorId, courseId) : null;

  if (!course && !completedCourse) {
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

  if (completedCourse) {
    const instructor = getInstructorRecord(instructorId);

    document.title = `${completedCourse.title} | Admin Course Detail`;
    metrics.courseDetailTitle.textContent = completedCourse.title;
    metrics.courseDetailSubtitle.textContent = `${completedCourse.id} · ${instructor?.name || "Instructor"} · ${completedCourse.schedule} · ${completedCourse.location} · Completed course`;
    metrics.courseDetailSummary.innerHTML = `
      <article class="metric-card"><p class="metric-label">Sessions</p><h3>16/16</h3><p class="metric-caption">This course finished its full structured term.</p></article>
      <article class="metric-card"><p class="metric-label">Reports</p><h3>Complete</h3><p class="metric-caption">Final report coverage is fully on file.</p></article>
      <article class="metric-card"><p class="metric-label">Enrollment</p><h3>${completedCourse.enrollment}</h3><p class="metric-caption">Historical enrollment snapshot.</p></article>
      <article class="metric-card"><p class="metric-label">Completed</p><h3>${completedCourse.endDateLabel}</h3><p class="metric-caption">Recorded course completion date.</p></article>
    `;
    metrics.courseDetailContent.innerHTML = `
      <section class="panel admin-panel admin-course-detail-card">
        <div class="admin-course-detail-grid">
          <div class="admin-course-detail-section">
            <div class="admin-course-format-card">
              <p class="eyebrow">Completed Course</p>
              <h4>Historical class record</h4>
              <p class="admin-report-copy">${completedCourse.note}</p>
              <p class="metric-caption">This class has already completed its 16-session sequence and is part of the instructor's course history.</p>
            </div>
          </div>
          <div class="admin-course-detail-section">
            <div class="admin-report-summary-card">
              <div class="admin-report-head">
                <div>
                  <p class="eyebrow">Course Record</p>
                  <h4>Archived instructional detail</h4>
                </div>
                <span class="status-chip neutral admin-status-chip">Completed</span>
              </div>
              <p class="admin-report-copy">Schedule: ${completedCourse.schedule}</p>
              <p class="admin-report-copy">Location: ${completedCourse.location}</p>
              <p class="admin-report-copy">Report Coverage: ${completedCourse.completedReports}/${completedCourse.totalSessions}</p>
            </div>
          </div>
        </div>
      </section>
    `;
    return;
  }

  const roster = adminCourseRoster(course);
  const reportSummary = courseReportSummary(course);
  const activeAlerts = roster.filter((student) => student.alertActive || student.needsHelp).length;

  document.title = `${course.title} | Admin Course Detail`;
  metrics.courseDetailTitle.textContent = course.title;
  metrics.courseDetailSubtitle.textContent = `${course.id} · ${course.instructorName} · ${course.schedule} · ${course.location} · ${course.courseFormat}`;
  metrics.courseDetailSummary.innerHTML = `
    <article class="metric-card"><p class="metric-label">Enrollment</p><h3>${course.enrollment}</h3><p class="metric-caption">Students assigned to this class.</p></article>
    <article class="metric-card"><p class="metric-label">Here Today</p><h3>${course.hereToday}</h3><p class="metric-caption">Current in-session attendance snapshot.</p></article>
    <article class="metric-card"><p class="metric-label">Session Progress</p><h3>${course.sessionProgressLabel}</h3><p class="metric-caption">${course.isOpenClass ? "Open class with no designated end date." : `Tracks the current session out of ${course.totalSessions}.`}</p></article>
    <article class="metric-card"><p class="metric-label">Course Format</p><h3>${course.courseFormat}</h3><p class="metric-caption">${course.openClassTrait}</p></article>
    <article class="metric-card"><p class="metric-label">Student Reports</p><h3>${reportSummary.submitted}/${reportSummary.total}</h3><p class="metric-caption">Submitted student reports for this class.</p></article>
    <article class="metric-card"><p class="metric-label">Roster Alerts</p><h3>${activeAlerts}</h3><p class="metric-caption">Students currently needing follow-up.</p></article>
  `;
  metrics.courseDetailContent.innerHTML = renderAdminCourseDetailTabs(course);
}

function openCourseReportModal(courseId, studentName) {
  const course = getCourseRecords().find((entry) => entry.id === courseId);
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
  const course = getCourseRecords().find((entry) => entry.id === courseId);
  const roster = course ? adminCourseRoster(course) : [];
  const student = roster.find((entry) => entry.name === studentName);

  if (!course || !student || !metrics.courseReportModal) {
    return;
  }

  const report = studentCourseReportFor(course, student);
  activeCourseReportId = report.id;
  metrics.courseReportTitle.textContent = `${student.name} report`;
  metrics.courseReportMeta.textContent = report.submitted
    ? `${course.title} · ${report.completedReports}/${report.expectedReports} ${course.isOpenClass ? "updates" : "reports"} completed${report.submittedAt ? ` · Latest ${report.submittedAt.toLocaleDateString("en-US")}` : ""}`
    : `${course.title} · 0/${report.expectedReports} ${course.isOpenClass ? "updates" : "reports"} completed`;
  metrics.courseReportBody.innerHTML = report.submitted ? `
    <section class="admin-report-section">
      <h4>${course.isOpenClass ? "Progress Update" : "Assignment Update"}</h4>
      <p>${report.assignmentUpdate}</p>
    </section>
    <section class="admin-report-section">
      <h4>Next Steps</h4>
      <p>${report.nextStep}</p>
    </section>
    <section class="admin-report-section">
      <h4>${course.isOpenClass ? "Update Coverage" : "Report Completion"}</h4>
      <p>${report.completedReports} of ${report.expectedReports} expected ${course.isOpenClass ? "progress updates" : "student reports"} have been submitted for ${student.name}.</p>
    </section>
  ` : `
    <section class="admin-report-section">
      <h4>Missing Submission</h4>
      <p>No ${course.isOpenClass ? "progress update" : "report"} has been submitted yet for ${student.name} in ${course.title}. This student should remain flagged until the expected ${course.isOpenClass ? "updates" : "reports"} start coming in.</p>
    </section>
  `;
  metrics.courseReportModal.classList.remove("hidden");
  metrics.courseReportModal.setAttribute("aria-hidden", "false");
}

function verifyActiveCourseReport() {}

function renderAdminPortal() {
  students = window.portalStore.getStudents();
  clearAdminDerivedCaches();
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
 
  if (metrics.instructorProfileContent) {
    renderAdminInstructorProfilePage();
  }

  if (metrics.instructorAvailabilityContent) {
    renderAdminInstructorAvailabilityPage();
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

metrics.instructorRows?.addEventListener("click", (event) => {
  const accidentButton = event.target.closest("[data-report-accident]");
  const editButton = event.target.closest("[data-edit-instructor]");

  if (accidentButton) {
    openAccidentModal(accidentButton.dataset.reportAccident);
    return;
  }

  if (editButton) {
    openEditInstructorModal(editButton.dataset.editInstructor);
  }
});

metrics.studentSearch?.addEventListener("input", (event) => {
  adminState.studentQuery = event.target.value || "";
  renderStudents();
});

metrics.studentSortName?.addEventListener("click", () => {
  toggleStudentSort("name");
});

metrics.studentSortId?.addEventListener("click", () => {
  toggleStudentSort("id");
});

metrics.studentSortCourse?.addEventListener("click", () => {
  toggleStudentSort("courseLoad");
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

  hiringRecords = getHiringRecords().map((candidate) => (
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
      email: anchor.dataset.email,
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
  const tabButton = event.target.closest("[data-course-tab-target]");
  const openButton = event.target.closest("[data-open-course-report]");
  const openSessionButton = event.target.closest("[data-open-session-reports]");
  const openAttendanceButton = event.target.closest("[data-open-session-attendance]");

  if (tabButton) {
    const target = tabButton.dataset.courseTabTarget;
    metrics.courseDetailContent.querySelectorAll("[data-course-tab-target]").forEach((button) => {
      button.classList.toggle("active", button === tabButton);
    });
    metrics.courseDetailContent.querySelectorAll("[data-course-tab-panel]").forEach((panel) => {
      panel.classList.toggle("hidden", panel.dataset.courseTabPanel !== target);
    });
    return;
  }

  if (openSessionButton) {
    openSessionReportsModal(openSessionButton.dataset.openSessionReports, openSessionButton.dataset.sessionIndex);
    return;
  }

  if (openAttendanceButton) {
    openSessionAttendanceModal(openAttendanceButton.dataset.openSessionAttendance, openAttendanceButton.dataset.sessionIndex);
    return;
  }

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

metrics.accidentClose?.addEventListener("click", closeAccidentModal);
metrics.accidentCancel?.addEventListener("click", closeAccidentModal);
metrics.accidentSave?.addEventListener("click", saveAccidentModal);
metrics.accidentModal?.addEventListener("click", (event) => {
  if (event.target === metrics.accidentModal) {
    closeAccidentModal();
  }
});

metrics.editInstructorClose?.addEventListener("click", closeEditInstructorModal);
metrics.editInstructorCancel?.addEventListener("click", closeEditInstructorModal);
metrics.editInstructorSave?.addEventListener("click", saveEditInstructorModal);
metrics.editInstructorModal?.addEventListener("click", (event) => {
  if (event.target === metrics.editInstructorModal) {
    closeEditInstructorModal();
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
