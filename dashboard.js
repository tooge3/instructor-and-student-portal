let students = window.portalStore.getStudents();
const courses = window.portalStore.getCourses();
const courseMap = Object.fromEntries(courses.map((course) => [course.id, course]));
let draggedStudentName = null;
const scheduleStorageKey = "portal-schedule-blocks";
const timeOffStorageKey = "portal-timeoff-requests";
const settingsStorageKey = "portal-instructor-settings";
const sidebarHiddenStorageKey = "portal-sidebar-hidden";
let openScheduleMenuId = null;
let lastAlertCount = students.filter((student) => student.alertActive).length;
let audioUnlocked = false;
let currentScheduleTab = "calendar";
let currentWeekStart = getWeekStart(new Date());
const scheduleStartMinutes = 5 * 60;
const scheduleEndMinutes = 23 * 60;
const scheduleHourMarkers = Array.from({ length: 19 }, (_, index) => {
  const totalHours = 5 + index;
  const hour = totalHours % 12 || 12;
  const meridiem = totalHours >= 12 ? "PM" : "AM";
  return `${hour}:00 ${meridiem}`;
});
const baseSchedule = [
  {
    day: "Monday",
    slots: [
      { time: "3:30 PM - 5:00 PM", label: "Biology 201 Tutoring", type: "session" },
      {
        time: "4:45 PM - 6:15 PM",
        label: "Algebra II Lecture Lab",
        type: "session",
        locationLabel: "Online",
        locationUrl: "https://zoom.us/j/94512033421",
      },
    ],
  },
  {
    day: "Tuesday",
    slots: [
      { time: "3:15 PM - 4:45 PM", label: "Chemistry Foundations Tutoring", type: "session" },
      { time: "5:00 PM - 6:00 PM", label: "Parent Progress Calls", type: "session" },
    ],
  },
  {
    day: "Wednesday",
    slots: [
      { time: "3:30 PM - 5:00 PM", label: "Biology 201 Tutoring", type: "session" },
    ],
  },
  {
    day: "Thursday",
    slots: [
      { time: "3:15 PM - 4:45 PM", label: "Chemistry Foundations Tutoring", type: "session" },
      { time: "4:45 PM - 6:15 PM", label: "Algebra II Lecture Lab", type: "session" },
    ],
  },
  {
    day: "Friday",
    slots: [
      { time: "3:30 PM - 4:30 PM", label: "Biology 201 Tutoring", type: "session" },
    ],
  },
];
let unavailableBlocks = loadUnavailableBlocks();
let timeOffRequests = loadTimeOffRequests();
let instructorSettings = loadInstructorSettings();

const filters = {
  all: () => true,
  atRisk: (student) => student.needsHelp,
  attendance: (student) => !student.presentToday,
};
const hourlyRate = 40;

const metrics = {
  assistanceCard: document.getElementById("assistance-card"),
  assistanceCount: document.getElementById("assistance-count"),
  assistanceCaption: document.getElementById("assistance-caption"),
  activeStudentCount: document.getElementById("active-student-count"),
  urgentAlertCount: document.getElementById("urgent-alert-count"),
  advisorName: document.getElementById("advisor-name"),
  advisorRole: document.getElementById("advisor-role"),
  advisorMenuButton: document.getElementById("advisor-menu-button"),
  advisorMenu: document.getElementById("advisor-menu"),
  settingsModal: document.getElementById("settings-modal"),
  settingsForm: document.getElementById("settings-form"),
  settingsEmail: document.getElementById("settings-email"),
  settingsPhone: document.getElementById("settings-phone"),
  settingsPronouns: document.getElementById("settings-pronouns"),
  settingsLocationsButton: document.getElementById("settings-locations-button"),
  settingsLocationsMenu: document.getElementById("settings-locations-menu"),
  settingsLocationsSummary: document.getElementById("settings-locations-summary"),
  settingsLanguagesButton: document.getElementById("settings-languages-button"),
  settingsLanguagesMenu: document.getElementById("settings-languages-menu"),
  settingsLanguagesSummary: document.getElementById("settings-languages-summary"),
  settingsClose: document.getElementById("settings-close"),
  settingsCancel: document.getElementById("settings-cancel"),
  logoutModal: document.getElementById("logout-modal"),
  logoutCancel: document.getElementById("logout-cancel"),
  logoutConfirm: document.getElementById("logout-confirm"),
  loggedOutState: document.getElementById("logged-out-state"),
  signInAgain: document.getElementById("sign-in-again"),
  workloadCount: document.getElementById("workload-count"),
  workloadList: document.getElementById("workload-list"),
  weeklyHoursLabel: document.getElementById("weekly-hours-label"),
  adjustHoursButton: document.getElementById("adjust-hours-button"),
  previousWeekButton: document.getElementById("previous-week-button"),
  nextWeekButton: document.getElementById("next-week-button"),
  scheduleWeekLabel: document.getElementById("schedule-week-label"),
  scheduleGrid: document.getElementById("schedule-grid"),
  unavailabilityList: document.getElementById("unavailability-list"),
  timeoffStartDate: document.getElementById("timeoff-start-date"),
  timeoffEndDate: document.getElementById("timeoff-end-date"),
  timeoffReason: document.getElementById("timeoff-reason"),
  submitTimeoffButton: document.getElementById("submit-timeoff-button"),
  timeoffRows: document.getElementById("timeoff-rows"),
  unavailableDay: document.getElementById("unavailable-day"),
  unavailableTime: document.getElementById("unavailable-time"),
  blockTimeButton: document.getElementById("block-time-button"),
  scheduleWarning: document.getElementById("schedule-warning"),
  studentGrid: document.getElementById("student-grid"),
  coursesGrid: document.getElementById("courses-grid"),
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebar-toggle"),
  sidebarShowButton: document.getElementById("sidebar-show-button"),
  appShell: document.getElementById("app-shell"),
  classNavButton: document.querySelector(".nav-link[data-view='class']"),
  faqToggle: document.getElementById("faq-toggle"),
  faqPanel: document.getElementById("faq-panel"),
  faqClose: document.getElementById("faq-close"),
  faqMessages: document.getElementById("faq-messages"),
  faqForm: document.getElementById("faq-form"),
  faqInput: document.getElementById("faq-input"),
};

let currentFilter = "all";
let currentView = "home";
let sidebarHidden = loadSidebarHidden();
let faqOpen = false;
let currentClassPreviewActive = false;

function documentSections() {
  const selectedLocations = instructorSettings.availableLocations || [];
  const locationSpecificItems = selectedLocations
    .filter((location) => location !== "Online")
    .flatMap((location) => ([
      {
        title: `${location} Office Rules`,
        href: "#",
        summary: `${location} office rules, site expectations, and in-person conduct guidance for that location.`,
        keywords: [location.toLowerCase(), "office rules", "rules", "site expectations", "office"],
      },
      {
        title: `${location} Office Access`,
        href: "#",
        summary: `${location} office access instructions, entry support, and arrival logistics for that site.`,
        keywords: [location.toLowerCase(), "office access", "access", "entry", "office"],
      },
    ]));

  return [
    {
      title: "Daily Inquiries",
      iconClass: "documents-section-icon-inquiries",
      items: [
        {
          title: "Time Off Requests",
          href: "#",
          summary: "Use this resource for submitting time-off requests, reviewing dates, and checking which classes are affected.",
          keywords: ["time off", "request", "leave", "absence", "days off"],
        },
        {
          title: "Zoom Login",
          href: "#",
          summary: "Contains Zoom login help and online meeting access guidance for instructors.",
          keywords: ["zoom", "login", "meeting", "online", "virtual"],
        },
        {
          title: "Payment Guide",
          href: "#",
          summary: "Use this guide for payroll questions, payment timing, statements, and reimbursement support.",
          keywords: ["payment", "payroll", "guide", "statement", "deposit", "reimbursement"],
        },
        {
          title: "Do's and Don'ts",
          href: "#",
          summary: "Covers classroom professionalism, conduct expectations, and instructor do's and don'ts.",
          keywords: ["do's and don'ts", "conduct", "guidelines", "expectations"],
        },
        {
          title: "Who to Contact",
          href: "#",
          summary: "Lists who to contact for scheduling, team support, location help, and internal escalation.",
          keywords: ["contact", "who to contact", "team", "support", "internal"],
        },
        {
          title: "Lesson Plans for Substitutes Template",
          href: "#",
          summary: "Template for substitute plans and class coverage notes.",
          keywords: ["substitute", "sub plans", "lesson plans", "coverage", "template"],
        },
        {
          title: "CM Rewards",
          href: "#",
          summary: "Reference for student rewards, incentive structures, and recognition support.",
          keywords: ["cm rewards", "rewards", "incentives", "recognition"],
        },
        ...locationSpecificItems,
      ],
    },
    {
      title: "System",
      iconClass: "documents-section-icon-system",
      items: [
        {
          title: "Class Scheduling Chatbot Setup",
          href: "#",
          summary: "Setup guidance for scheduling support and chatbot-related scheduling workflows.",
          keywords: ["scheduling", "chatbot", "setup", "class scheduling"],
        },
        {
          title: "SMW Curriculum Access",
          href: "#",
          summary: "Reference for curriculum access, lesson materials, and teaching resource entry points.",
          keywords: ["curriculum", "access", "smw", "materials"],
        },
        {
          title: "Basecamp Introduction Guide",
          href: "#",
          summary: "Introductory Basecamp reference for internal communication and team coordination.",
          keywords: ["basecamp", "communication", "team", "guide"],
        },
        {
          title: "What is Coding Mind?",
          href: "#",
          summary: "Overview of the Coding Mind program and its instructional model.",
          keywords: ["coding mind", "program", "overview"],
        },
        {
          title: "Zoom Basics",
          href: "#",
          summary: "Quick-reference Zoom teaching basics and online classroom support.",
          keywords: ["zoom basics", "zoom", "online", "virtual"],
        },
        {
          title: "Melio Payment Setup",
          href: "#",
          summary: "Payment account setup support for Melio and payment method onboarding.",
          keywords: ["melio", "payment setup", "setup", "payment method"],
        },
        {
          title: "Class Scheduling Guide",
          href: "#",
          summary: "Reference for calendar structure, schedule timing, and scheduling expectations.",
          keywords: ["class scheduling", "schedule", "calendar", "timing"],
        },
        {
          title: "SMW for Students",
          href: "#",
          summary: "Student-facing SMW support and access guidance instructors may need.",
          keywords: ["smw for students", "students", "student access"],
        },
        {
          title: "CM Penalty",
          href: "#",
          summary: "Policy guidance for penalties, accountability, and follow-up expectations.",
          keywords: ["penalty", "policy", "accountability"],
        },
      ],
    },
    {
      title: "CM Class & Teaching",
      iconClass: "documents-section-icon-teaching",
      subsections: [
        {
          title: "Daily",
          iconClass: "documents-section-icon-daily",
          items: [
            {
              title: "Homework",
              href: "#",
              summary: "Homework expectations, tracking, and student-facing daily work guidance.",
              keywords: ["homework", "assignments", "daily work"],
            },
            {
              title: "Feedback Guidelines",
              href: "#",
              summary: "Reference for instructor feedback quality and comment expectations.",
              keywords: ["feedback", "guidelines", "comments"],
            },
            {
              title: "Zoom Login",
              href: "#",
              summary: "Daily Zoom login support for online teaching sessions.",
              keywords: ["zoom", "login", "meeting", "online"],
            },
            {
              title: "Instructor Assessments",
              href: "#",
              summary: "Assessment procedures, instructor scoring, and evaluation support.",
              keywords: ["assessments", "assessment", "evaluation", "scoring"],
            },
            {
              title: "Do's and Don'ts",
              href: "#",
              summary: "Daily classroom conduct reminders and instruction expectations.",
              keywords: ["do's and don'ts", "conduct", "classroom expectations"],
            },
            {
              title: "CM Rewards",
              href: "#",
              summary: "Daily student motivation and recognition reference.",
              keywords: ["cm rewards", "rewards", "motivation"],
            },
          ],
        },
        {
          title: "Last Class Prep",
          iconClass: "documents-section-icon-prep",
          items: [
            {
              title: "Presentations",
              href: "#",
              summary: "Presentation materials and slide prep from the latest class cycle.",
              keywords: ["presentations", "slides", "deck", "prep"],
            },
            {
              title: "Final Feedback Guidelines",
              href: "#",
              summary: "Guidance for final feedback, wrap-up comments, and progress summaries.",
              keywords: ["final feedback", "guidelines", "wrap up", "comments"],
            },
          ],
        },
      ],
    },
  ];
}

function flattenedDocumentEntries() {
  return documentSections().flatMap((section) => {
    const directItems = (section.items || []).map((item) => ({
      ...item,
      section: section.title,
      subsection: "",
    }));
    const nestedItems = (section.subsections || []).flatMap((subsection) =>
      subsection.items.map((item) => ({
        ...item,
        section: section.title,
        subsection: subsection.title,
      })),
    );

    return [...directItems, ...nestedItems];
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderFaqMessage(role, content) {
  if (!metrics.faqMessages) {
    return;
  }

  metrics.faqMessages.insertAdjacentHTML(
    "beforeend",
    `<article class="faq-message ${role}">${escapeHtml(content)}</article>`,
  );
  metrics.faqMessages.scrollTop = metrics.faqMessages.scrollHeight;
}

function faqAnswer(question) {
  const normalized = question.trim().toLowerCase();

  if (!normalized) {
    return "Ask about time-off requests, payment guidance, Zoom, office rules, office access, curriculum access, or substitute plans.";
  }

  const matches = flattenedDocumentEntries()
    .map((entry) => {
      const keywordScore = (entry.keywords || []).reduce(
        (score, keyword) => score + (normalized.includes(keyword) ? 3 : 0),
        0,
      );
      const titleScore = normalized.includes(entry.title.toLowerCase()) ? 5 : 0;
      const sectionScore = normalized.includes(entry.section.toLowerCase()) ? 1 : 0;

      return {
        ...entry,
        score: keywordScore + titleScore + sectionScore,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (!matches.length) {
    return "I couldn’t match that to the current provided documents. Try asking about time-off requests, payment, Zoom, office access, substitute plans, curriculum access, or CM Rewards.";
  }

  const topMatch = matches[0];
  const related = matches
    .slice(1, 3)
    .map((entry) => entry.title)
    .filter((title) => title !== topMatch.title);
  const sectionLabel = topMatch.subsection
    ? `${topMatch.section} > ${topMatch.subsection}`
    : topMatch.section;

  return `${topMatch.title} is under ${sectionLabel}. ${topMatch.summary}${related.length ? ` Related documents: ${related.join(", ")}.` : ""}`;
}

function setFaqOpen(nextOpen) {
  faqOpen = nextOpen;
  metrics.faqPanel?.classList.toggle("hidden", !faqOpen);
  metrics.faqPanel?.setAttribute("aria-hidden", String(!faqOpen));
  metrics.faqToggle?.setAttribute("aria-expanded", String(faqOpen));

  if (faqOpen) {
    metrics.faqInput?.focus();
  }
}

function submitFaqQuestion(question) {
  const trimmed = question.trim();

  if (!trimmed) {
    return;
  }

  renderFaqMessage("user", trimmed);
  renderFaqMessage("bot", faqAnswer(trimmed));

  if (metrics.faqInput) {
    metrics.faqInput.value = "";
  }
}

function loadSidebarHidden() {
  return window.localStorage.getItem(sidebarHiddenStorageKey) === "true";
}

function persistSidebarHidden() {
  window.localStorage.setItem(sidebarHiddenStorageKey, String(sidebarHidden));
}

function renderSidebarVisibility() {
  if (!metrics.sidebar || !metrics.sidebarToggle) {
    return;
  }

  metrics.sidebar.classList.toggle("hidden-sidebar", sidebarHidden);
  metrics.appShell?.classList.toggle("sidebar-hidden", sidebarHidden);
  metrics.sidebarToggle.setAttribute("aria-expanded", String(!sidebarHidden));
  metrics.sidebarToggle.setAttribute("aria-label", sidebarHidden ? "Show sidebar" : "Hide sidebar");
  const toggleText = metrics.sidebarToggle.querySelector(".sidebar-toggle-text");
  const toggleIcon = metrics.sidebarToggle.querySelector(".sidebar-toggle-icon");

  if (toggleText) {
    toggleText.textContent = sidebarHidden ? "Show" : "Hide";
  }

  if (toggleIcon) {
    toggleIcon.textContent = sidebarHidden ? ">" : "<";
  }

  metrics.sidebarShowButton?.classList.toggle("hidden", !sidebarHidden);
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

function getWeekStart(date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const distanceFromMonday = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + distanceFromMonday);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function weekDates(startDate) {
  return baseSchedule.map((entry, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return {
      day: entry.day,
      date,
      isoDate: date.toISOString().slice(0, 10),
    };
  });
}

function formatWeekRangeLabel(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4);
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${monthDay.format(startDate)} - ${monthDay.format(endDate)}`;
}

function formatCalendarDateLabel(date) {
  const monthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return monthDay.format(date);
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

function persistStudents() {
  window.portalStore.saveStudents(students);
}

function courseForStudent(student) {
  return courseMap[student.courseId] || {
    id: student.courseId || "custom-course",
    title: student.cohort,
    groupLabel: "Current Class Group",
    focus: "Course details are being prepared for this class.",
  };
}

function courseDetailsUrl(courseId) {
  return courseMap[courseId]?.curriculumUrl || "#";
}

function courseWorkspaceUrl(courseId) {
  return window.portalStore.courseWorkspaceUrl(courseId);
}

function rosterForCourse(courseId) {
  return students.filter((student) => student.courseId === courseId);
}

function courseForScheduleLabel(label) {
  const normalized = label.toLowerCase();

  return courses.find((course) => normalized.includes(course.title.toLowerCase())) || null;
}

function scheduleLabelMarkup(label, className = "schedule-meta") {
  const course = courseForScheduleLabel(label);

  if (!course) {
    return `<p class="${className}">${label}</p>`;
  }

  return `<a class="${className} schedule-course-link" href="${courseWorkspaceUrl(course.id)}">${label}</a>`;
}

function todaysScheduledCourseIds() {
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const todaysSlots = baseSchedule.find((entry) => entry.day === today)?.slots || [];

  return [...new Set(
    todaysSlots
      .map((slot) => courseForScheduleLabel(slot.label)?.id)
      .filter(Boolean),
  )];
}

function currentClassCourseIds() {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(now);
  const todaysSlots = baseSchedule.find((entry) => entry.day === today)?.slots || [];
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  return [...new Set(
    todaysSlots
      .filter((slot) => slot.type === "session")
      .filter((slot) => {
        const range = parseRange(slot.time);

        if (!range) {
          return false;
        }

        return currentMinutes >= (range.start - 10) && currentMinutes <= (range.end + 10);
      })
      .map((slot) => courseForScheduleLabel(slot.label)?.id)
      .filter(Boolean),
  )];
}

function nextScheduledClassPreview() {
  const now = new Date();
  const currentDayIndex = now.getDay();
  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  for (let dayOffset = 0; dayOffset < 7; dayOffset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + dayOffset);
    const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
    const daySchedule = baseSchedule.find((entry) => entry.day === dayName);

    if (!daySchedule) {
      continue;
    }

    const upcomingSlots = daySchedule.slots
      .filter((slot) => slot.type === "session")
      .map((slot) => {
        const range = parseRange(slot.time);
        return range ? { slot, range } : null;
      })
      .filter(Boolean)
      .filter(({ range }) => dayOffset > 0 || range.start > currentMinutes)
      .sort((left, right) => left.range.start - right.range.start);

    if (!upcomingSlots.length) {
      continue;
    }

    const firstSlot = upcomingSlots[0].slot;
    const course = courseForScheduleLabel(firstSlot.label);

    if (!course) {
      continue;
    }

    return {
      day: dayName,
      time: firstSlot.time,
      courseIds: [course.id],
      label: firstSlot.label,
    };
  }

  return null;
}

function renderCurrentClassAvailability() {
  const activeCourseIds = currentClassCourseIds();

  if (!metrics.classNavButton) {
    return;
  }

  metrics.classNavButton.classList.remove("hidden");

  if (activeCourseIds.length) {
    currentClassPreviewActive = false;
  }
}

function persistTimeOffRequests() {
  window.localStorage.setItem(timeOffStorageKey, JSON.stringify(timeOffRequests));
}

function persistInstructorSettings() {
  window.localStorage.setItem(settingsStorageKey, JSON.stringify(instructorSettings));
}

function locationText() {
  const [firstLocation] = instructorSettings.availableLocations || [];

  if (!firstLocation || firstLocation === "Online") {
    return "Online";
  }

  return `Office: ${firstLocation}`;
}

function renderInstructorAccount() {
  metrics.advisorName.textContent = instructorSettings.name;
  metrics.advisorRole.textContent = instructorSettings.role;
}

function minutesToLabel(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const meridiem = hours24 >= 12 ? "PM" : "AM";
  const hour12 = hours24 % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${meridiem}`;
}

function computeWeeklyHoursLabel() {
  const ranges = baseSchedule.flatMap((entry) => entry.slots.map((slot) => parseRange(slot.time)).filter(Boolean));

  if (!ranges.length) {
    return "Weekly Hours: Not Set - Not Set";
  }

  const earliest = Math.min(...ranges.map((range) => range.start));
  const latest = Math.max(...ranges.map((range) => range.end));
  return `Weekly Hours: ${minutesToLabel(earliest)} - ${minutesToLabel(latest)}`;
}

function setScheduleTab(nextTab) {
  currentScheduleTab = nextTab;

  document.querySelectorAll(".schedule-subtab").forEach((button) => {
    button.classList.toggle("active", button.dataset.scheduleTab === nextTab);
  });

  document.querySelectorAll("[data-schedule-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.schedulePanel === nextTab);
  });
}

function currency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function monthEndLabel(date) {
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(monthEnd);
}

function sessionHours(timeText) {
  const range = parseRange(timeText);
  return range ? (range.end - range.start) / 60 : 0;
}

function weekdayIndex(dayName) {
  const lookup = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  return lookup[dayName];
}

function sessionsForMonth(year, monthIndex) {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  const sessions = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const daySchedule = baseSchedule.find((entry) => weekdayIndex(entry.day) === cursor.getDay());

    if (!daySchedule) {
      continue;
    }

    daySchedule.slots.forEach((slot) => {
      sessions.push({
        dateLabel: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(cursor),
        time: slot.time,
        label: slot.label,
        hours: sessionHours(slot.time),
      });
    });
  }

  return sessions;
}

function buildMonthlyStatements(numberOfMonths = 2) {
  const anchor = new Date();
  anchor.setDate(1);
  anchor.setHours(0, 0, 0, 0);

  return Array.from({ length: numberOfMonths }, (_, index) => {
    const date = new Date(anchor.getFullYear(), anchor.getMonth() - index, 1);
    const sessions = sessionsForMonth(date.getFullYear(), date.getMonth());
    const totalHours = sessions.reduce((sum, session) => sum + session.hours, 0);

    return {
      key: monthKey(date),
      label: monthLabel(date),
      depositLabel: monthEndLabel(date),
      sessions,
      totalHours,
      totalAmount: totalHours * hourlyRate,
    };
  });
}

function statementMarkup() {
  return `
    <section class="statement-history">
      ${buildMonthlyStatements()
        .map((statement) => {
          const totalHours = Number.isInteger(statement.totalHours) ? statement.totalHours : statement.totalHours.toFixed(1);

          return `
            <article class="statement-month">
              <div class="statement-month-header">
                <div>
                  <p class="metric-label">${statement.label}</p>
                  <h4>Monthly Statement</h4>
                </div>
                <div class="statement-month-total">${currency(statement.totalAmount)}</div>
              </div>
              <div class="statement-list">
                <article class="statement-row">
                  <div class="statement-date">
                    <strong>${statement.depositLabel}</strong>
                    <span>Monthly Deposit</span>
                  </div>
                  <div class="statement-detail">
                    <div class="statement-detail-head">
                      <p>Instructional payroll</p>
                      <button class="statement-toggle" type="button" data-statement-toggle="${statement.key}" aria-expanded="false">View Details</button>
                    </div>
                    <span>${totalHours} hours across ${statement.sessions.length} sessions</span>
                    <div class="statement-session-lines hidden" data-statement-details="${statement.key}">
                      ${statement.sessions
                        .map(
                          (session) => `
                            <div class="statement-session-line">
                              <strong>${session.dateLabel}</strong>
                              <span>${session.time} ${session.label}</span>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>
                  </div>
                  <div class="statement-amount credit">+${currency(statement.totalAmount)}</div>
                </article>
              </div>
            </article>
          `;
        })
        .join("")}
    </section>
  `;
}

function ensureSidebarViews() {
  const documentsHeading = document.querySelector("[data-view-panel='documents'] .panel-heading h3");
  const documentsPanel = document.querySelector("[data-view-panel='documents'] .tips-list");
  const sections = documentSections();

  if (documentsHeading) {
    documentsHeading.textContent = "Instruction resources and daily reference links";
  }

  if (documentsPanel) {
    documentsPanel.className = "documents-hub";
    documentsPanel.innerHTML = sections
      .map((section) => {
        if (section.subsections?.length) {
          return `
            <section class="documents-card documents-card-wide">
              <h4><span class="documents-section-icon ${section.iconClass}" aria-hidden="true"></span>${section.title}</h4>
              <div class="documents-subgrid">
                ${section.subsections
                  .map((subsection) => `
                    <section class="documents-subcard">
                      <h5><span class="documents-section-icon ${subsection.iconClass}" aria-hidden="true"></span>${subsection.title}</h5>
                      <div class="documents-links">
                        ${subsection.items.map((item) => `<a href="${item.href}">${item.title}</a>`).join("")}
                      </div>
                    </section>
                  `)
                  .join("")}
              </div>
            </section>
          `;
        }

        return `
          <section class="documents-card">
            <h4><span class="documents-section-icon ${section.iconClass}" aria-hidden="true"></span>${section.title}</h4>
            <div class="documents-links">
              ${section.items.map((item) => `<a href="${item.href}">${item.title}</a>`).join("")}
            </div>
          </section>
        `;
      })
      .join("");
  }

  const paymentMarkup = statementMarkup();

  if (!document.querySelector("[data-view-panel='payment']")) {
    const paymentView = document.createElement("section");
    paymentView.className = "dashboard-view";
    paymentView.dataset.viewPanel = "payment";
    paymentView.innerHTML = `
      <section class="panel tips-panel" id="payment">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Payment</p>
            <h3>Monthly payment statement</h3>
          </div>
        </div>
        ${paymentMarkup}
      </section>
    `;

    const classView = document.querySelector("[data-view-panel='class']");
    classView?.before(paymentView);
    return;
  }

  const paymentList = document.querySelector("[data-view-panel='payment'] .tips-list");
  const paymentPanel = document.querySelector("[data-view-panel='payment'] #payment");

  if (paymentList) {
    paymentList.remove();
  }

  if (paymentPanel) {
    const existingHistory = paymentPanel.querySelector(".statement-history");

    if (existingHistory) {
      existingHistory.outerHTML = paymentMarkup;
    } else {
      paymentPanel.insertAdjacentHTML("beforeend", paymentMarkup);
    }
  }
}

function getSettingsSelections(groupName) {
  return Array.from(document.querySelectorAll(`[data-settings-group='${groupName}']:checked`)).map((input) => input.value);
}

function setSettingsSelections(groupName, values) {
  document.querySelectorAll(`[data-settings-group='${groupName}']`).forEach((input) => {
    input.checked = values.includes(input.value);
  });
}

function updateSettingsMultiSummary(groupName) {
  const values = getSettingsSelections(groupName);
  const button = groupName === "locations" ? metrics.settingsLocationsButton : metrics.settingsLanguagesButton;
  const summary = groupName === "locations" ? metrics.settingsLocationsSummary : metrics.settingsLanguagesSummary;
  const emptyLabel = groupName === "locations" ? "No locations selected" : "No languages selected";
  const buttonLabel = groupName === "locations" ? "Select locations" : "Select teaching languages";

  summary.textContent = values.length ? values.join(", ") : emptyLabel;
  button.textContent = values.length ? `${values.length} selected` : buttonLabel;
}

function toggleSettingsMulti(groupName, forceOpen) {
  const button = groupName === "locations" ? metrics.settingsLocationsButton : metrics.settingsLanguagesButton;
  const menu = groupName === "locations" ? metrics.settingsLocationsMenu : metrics.settingsLanguagesMenu;
  const nextState = typeof forceOpen === "boolean" ? forceOpen : menu.classList.contains("hidden");

  menu.classList.toggle("hidden", !nextState);
  button.setAttribute("aria-expanded", String(nextState));
}

function playAlertSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return;
  }

  const context = new AudioContextClass();
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(660, context.currentTime + 0.18);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.05, context.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.24);
  oscillator.addEventListener("ended", () => {
    context.close();
  });
}

function unlockAlertAudio() {
  audioUnlocked = true;
}

function loadUnavailableBlocks() {
  const stored = window.localStorage.getItem(scheduleStorageKey);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored).map((entry, index) => ({
      id: entry.id || `block-${Date.now()}-${index}`,
      ...entry,
    }));
  } catch (error) {
    return [];
  }
}

function persistUnavailableBlocks() {
  window.localStorage.setItem(scheduleStorageKey, JSON.stringify(unavailableBlocks));
}

function reseatStudents() {
  students.forEach((student, index) => {
    const row = String.fromCharCode(65 + Math.floor(index / 3));
    const column = (index % 3) + 1;
    student.seat = `${row}${column}`;
  });
}

function createStudent() {
  const name = window.prompt("Student name:");

  if (!name) {
    return;
  }

  const courseLabel = courses.map((course) => course.title).join(", ");
  const selectedTitle = window.prompt(`Course title (${courseLabel}):`, courses[0].title) || courses[0].title;
  const matchedCourse = courses.find((course) => course.title.toLowerCase() === selectedTitle.trim().toLowerCase()) || courses[0];

  students.push({
    name: name.trim(),
    courseId: matchedCourse.id,
    seat: "",
    attendance: 100,
    presentToday: true,
    progress: 0,
    assignmentsLate: 0,
    needsHelp: false,
    alertActive: false,
    note: "New student added to the classroom dashboard.",
    goal: "Complete your first coursework check-in.",
    tasks: [
      "Review the course overview.",
      "Submit your first introductory assignment.",
    ],
  });

  reseatStudents();
  persistStudents();
  renderSummary();
  renderStudents();
}

function renderSummary() {
  const helpCount = students.filter((student) => student.alertActive).length;
  const today = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
  const todaySessions = (baseSchedule.find((entry) => entry.day === today)?.slots || []);
  const todayConflicts = conflictingSlotsForDay(today);
  const conflictingCount = todaySessions.filter((slot) => todayConflicts.has(`${slot.time}|${slot.label}`)).length;
  const workloadCaption = todaySessions.length
    ? `${today}${conflictingCount ? `, with ${conflictingCount} conflict${conflictingCount === 1 ? "" : "s"} to resolve.` : ", with no schedule conflicts."}`
    : `No after-school sessions scheduled for ${today}.`;

  metrics.assistanceCount.textContent = `${helpCount}`;
  metrics.assistanceCaption.textContent = helpCount
    ? "Students currently flagged for intervention."
    : "No active alerts.";
  metrics.assistanceCard.classList.toggle("hidden", helpCount === 0);
  metrics.activeStudentCount.textContent = students.length;
  metrics.urgentAlertCount.textContent = helpCount;
  metrics.workloadCount.textContent = `${todaySessions.length} ${todaySessions.length === 1 ? "session" : "sessions"}`;
  metrics.workloadList.innerHTML = todaySessions.length
    ? `
      <p class="metric-caption">${workloadCaption}</p>
      ${todaySessions
        .map((slot) => {
          const isConflict = todayConflicts.has(`${slot.time}|${slot.label}`);

          return `
            <p class="home-list-item ${isConflict ? "conflict" : ""}">
              <strong>${slot.time}</strong><br>
              <span class="home-course-row">
                <span>${slot.label}</span>
                ${
                  slot.locationUrl
                    ? `
                      <a class="home-location-inline link" href="${slot.locationUrl}" target="_blank" rel="noreferrer" aria-label="Open online meeting for ${slot.label}">
                        <span class="location-icon small" aria-hidden="true"></span>
                        <span>${slot.locationLabel}</span>
                      </a>
                    `
                    : `
                      <span class="home-location-inline" aria-label="Location status">
                        <span class="location-icon small" aria-hidden="true"></span>
                        <span>${slot.locationLabel || locationText()}</span>
                      </span>
                    `
                }
              </span>
              ${isConflict ? '<span class="home-list-note">Unavailable time overlaps this session. Notify internal team members.</span>' : ""}
            </p>
          `;
        })
        .join("")}
    `
    : `<p class="metric-caption">${workloadCaption}</p>`;

  if (audioUnlocked && instructorSettings.alertSoundEnabled && helpCount > lastAlertCount) {
    playAlertSound();
  }

  lastAlertCount = helpCount;
}

function toggleAdvisorMenu(forceOpen) {
  const nextState = typeof forceOpen === "boolean" ? forceOpen : metrics.advisorMenu.classList.contains("hidden");
  metrics.advisorMenu.classList.toggle("hidden", !nextState);
  metrics.advisorMenuButton.setAttribute("aria-expanded", String(nextState));
}

function openSettingsModal() {
  metrics.settingsEmail.value = instructorSettings.email;
  metrics.settingsPhone.value = instructorSettings.phone;
  metrics.settingsPronouns.value = instructorSettings.pronouns;
  setSettingsSelections("locations", instructorSettings.availableLocations);
  setSettingsSelections("languages", instructorSettings.teachingLanguages);
  updateSettingsMultiSummary("locations");
  updateSettingsMultiSummary("languages");
  toggleSettingsMulti("locations", false);
  toggleSettingsMulti("languages", false);
  metrics.settingsModal.classList.remove("hidden");
  metrics.settingsModal.setAttribute("aria-hidden", "false");
  toggleAdvisorMenu(false);
}

function closeSettingsModal() {
  metrics.settingsModal.classList.add("hidden");
  metrics.settingsModal.setAttribute("aria-hidden", "true");
}

function openLogoutModal() {
  metrics.logoutModal.classList.remove("hidden");
  metrics.logoutModal.setAttribute("aria-hidden", "false");
  toggleAdvisorMenu(false);
}

function closeLogoutModal() {
  metrics.logoutModal.classList.add("hidden");
  metrics.logoutModal.setAttribute("aria-hidden", "true");
}

function setLoggedOut(loggedOut) {
  instructorSettings.loggedOut = loggedOut;
  persistInstructorSettings();
  metrics.loggedOutState.classList.toggle("hidden", !loggedOut);
  metrics.loggedOutState.setAttribute("aria-hidden", String(!loggedOut));
}

function toMinutes(timeText) {
  const match = timeText.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);

  if (!match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();

  if (hours === 12) {
    hours = 0;
  }

  if (meridiem === "PM") {
    hours += 12;
  }

  return hours * 60 + minutes;
}

function parseRange(rangeText) {
  const parts = rangeText.split("-");

  if (parts.length !== 2) {
    return null;
  }

  const start = toMinutes(parts[0]);
  const end = toMinutes(parts[1]);

  if (start === null || end === null || end <= start) {
    return null;
  }

  return { start, end };
}

function rangesOverlap(firstRange, secondRange) {
  return firstRange.start < secondRange.end && secondRange.start < firstRange.end;
}

function scheduleForDay(day) {
  const baseDay = baseSchedule.find((entry) => entry.day === day);
  const blocked = unavailableBlocks.filter((entry) => entry.day === day);
  return [...(baseDay?.slots || []), ...blocked].sort((left, right) => {
    const leftRange = parseRange(left.time);
    const rightRange = parseRange(right.time);
    return (leftRange?.start || 0) - (rightRange?.start || 0);
  });
}

function sessionsForDate(dateText) {
  const requestDate = new Date(`${dateText}T12:00:00`);

  if (Number.isNaN(requestDate.getTime())) {
    return [];
  }

  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(requestDate);
  return baseSchedule.find((entry) => entry.day === weekday)?.slots || [];
}

function dateRangeLabels(startDate, endDate) {
  return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
}

function sessionsForDateRange(startDate, endDate) {
  const results = [];
  const cursor = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);

  if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime()) || cursor > end) {
    return [];
  }

  while (cursor <= end) {
    const isoDate = cursor.toISOString().slice(0, 10);
    const daySessions = sessionsForDate(isoDate).map((slot) => `${isoDate}: ${slot.time} ${slot.label}`);
    results.push(...daySessions);
    cursor.setDate(cursor.getDate() + 1);
  }

  return results;
}

function renderTimeOffRequests() {
  metrics.timeoffRows.innerHTML = timeOffRequests.length
    ? timeOffRequests
        .map(
          (request, index) => `
            <tr>
              <td>${request.dateLabel}</td>
              <td>${request.intersections.length ? request.intersections.join(", ") : "No class intersections"}</td>
              <td>${request.approved ? "Approved" : "Pending"}</td>
              <td>
                <button
                  class="subplan-icon-button ${request.subPlanLink ? "ready" : "missing"}"
                  type="button"
                  data-subplan-index="${index}"
                  aria-label="${request.subPlanLink ? "Open or update substitute plan document" : "Add substitute plan document"}"
                  title="${request.subPlanLink ? "Open or update substitute plan document" : "Add substitute plan document"}"
                >
                  <span class="subplan-icon" aria-hidden="true"></span>
                </button>
              </td>
            </tr>
          `,
        )
        .join("")
    : `
      <tr>
        <td colspan="4">No time-off requests submitted yet.</td>
      </tr>
    `;
}

function renderUnavailabilityList() {
  metrics.unavailabilityList.innerHTML = unavailableBlocks.length
    ? unavailableBlocks
        .slice()
        .sort((left, right) => {
          const dayOrder = baseSchedule.map((entry) => entry.day);
          const dayDiff = dayOrder.indexOf(left.day) - dayOrder.indexOf(right.day);

          if (dayDiff !== 0) {
            return dayDiff;
          }

          const leftRange = parseRange(left.time);
          const rightRange = parseRange(right.time);
          return (leftRange?.start || 0) - (rightRange?.start || 0);
        })
        .map(
          (block) => `
            <div class="unavailability-item">
              <div>
                <p class="unavailability-day">${block.day}</p>
                <p class="unavailability-time">${block.time}</p>
              </div>
              <button class="unavailability-delete" type="button" data-delete-unavailability="${block.id}">Delete</button>
            </div>
          `,
        )
        .join("")
    : `<p class="metric-caption">No blocked slots added yet.</p>`;
}

function submitTimeOffRequest() {
  const startDate = metrics.timeoffStartDate.value;
  const endDate = metrics.timeoffEndDate.value || startDate;
  const reason = metrics.timeoffReason.value.trim();

  if (!startDate || !endDate) {
    return;
  }

  const intersections = sessionsForDateRange(startDate, endDate);

  timeOffRequests.unshift({
    startDate,
    endDate,
    dateLabel: dateRangeLabels(startDate, endDate),
    reason,
    intersections,
    approved: false,
    subPlanLink: "",
  });

  persistTimeOffRequests();
  renderTimeOffRequests();
  metrics.timeoffStartDate.value = "";
  metrics.timeoffEndDate.value = "";
  metrics.timeoffReason.value = "Family appointment";
  setScheduleTab("timeoff");
}

function handleSubPlanAction(requestIndex) {
  const request = timeOffRequests[requestIndex];

  if (!request) {
    return;
  }

  if (request.subPlanLink) {
    const nextAction = window.prompt(
      "Paste a new substitute plan link to replace the current one, or leave this as-is and press Cancel to open the existing document.",
      request.subPlanLink,
    );

    if (nextAction === null) {
      window.open(request.subPlanLink, "_blank", "noreferrer");
      return;
    }

    request.subPlanLink = nextAction.trim();
  } else {
    const newLink = window.prompt("Paste the substitute plan document link:");

    if (newLink === null) {
      return;
    }

    request.subPlanLink = newLink.trim();
  }

  persistTimeOffRequests();
  renderTimeOffRequests();
}

function conflictingSlotsForDay(day) {
  const blocked = unavailableBlocks
    .filter((entry) => entry.day === day)
    .map((entry) => ({
      ...entry,
      range: parseRange(entry.time),
    }))
    .filter((entry) => entry.range);

  return new Set(
    (baseSchedule.find((entry) => entry.day === day)?.slots || [])
      .filter((slot) => {
        const slotRange = parseRange(slot.time);

        if (!slotRange) {
          return false;
        }

        return blocked.some((block) => rangesOverlap(block.range, slotRange));
      })
      .map((slot) => `${slot.time}|${slot.label}`),
  );
}

function clampScheduleMinutes(minutes) {
  return Math.min(scheduleEndMinutes, Math.max(scheduleStartMinutes, minutes));
}

function schedulePositionStyle(range) {
  const start = clampScheduleMinutes(range.start);
  const end = clampScheduleMinutes(range.end);
  const total = scheduleEndMinutes - scheduleStartMinutes;
  const top = ((start - scheduleStartMinutes) / total) * 100;
  const height = Math.max(((end - start) / total) * 100, 8);

  return `top:${top}%;height:${height}%;`;
}

function nestedSchedulePositionStyle(childRange, parentRange) {
  const clippedStart = Math.max(childRange.start, parentRange.start);
  const clippedEnd = Math.min(childRange.end, parentRange.end);
  const total = parentRange.end - parentRange.start;
  const top = ((clippedStart - parentRange.start) / total) * 100;
  const height = Math.max(((clippedEnd - clippedStart) / total) * 100, 18);

  return `top:${top}%;height:${height}%;`;
}

function scheduleMarkerStyle(marker) {
  const markerMinutes = toMinutes(marker);

  if (markerMinutes === null) {
    return "";
  }

  const total = scheduleEndMinutes - scheduleStartMinutes;
  const top = ((clampScheduleMinutes(markerMinutes) - scheduleStartMinutes) / total) * 100;

  return `top:${top}%;`;
}

function renderSchedule() {
  const activeWeekDates = weekDates(currentWeekStart);
  metrics.scheduleWeekLabel.textContent = formatWeekRangeLabel(currentWeekStart);

  const dayColumns = activeWeekDates
    .map((dayInfo) => {
      const daySessions = baseSchedule.find((entry) => entry.day === dayInfo.day)?.slots || [];
      const dayUnavailable = unavailableBlocks.filter((entry) => entry.day === dayInfo.day);
      const slotsMarkup = scheduleForDay(dayInfo.day)
        .map((slot) => {
          const isUnavailable = slot.type === "unavailable";
          const hasMenuOpen = isUnavailable && openScheduleMenuId === slot.id;
          const range = parseRange(slot.time);

          if (!range) {
            return "";
          }

          if (!isUnavailable) {
            const overlappingUnavailable = dayUnavailable.filter((block) => {
              const blockRange = parseRange(block.time);
              return blockRange && rangesOverlap(range, blockRange);
            });

            if (overlappingUnavailable.length) {
              return "";
            }
          }

          const overlappingSessions = isUnavailable
            ? daySessions
                .map((session) => ({
                  ...session,
                  range: parseRange(session.time),
                }))
                .filter((session) => session.range && rangesOverlap(session.range, range))
            : [];

          return `
            <div class="schedule-slot ${slot.type === "unavailable" ? "unavailable" : "session"}" style="${schedulePositionStyle(range)}">
              ${isUnavailable ? `
                <div class="schedule-slot-actions">
                  <button class="schedule-slot-gear" type="button" data-schedule-menu="${slot.id}" aria-label="Manage unavailable block">
                    &#9881;
                  </button>
                  <div class="schedule-slot-menu ${hasMenuOpen ? "open" : ""}">
                    <button class="schedule-slot-menu-button" type="button" data-edit-block="${slot.id}">Edit time</button>
                    <button class="schedule-slot-menu-button danger" type="button" data-delete-block="${slot.id}">Delete</button>
                  </div>
                </div>
              ` : ""}
              <div class="schedule-slot-badge">
                <p class="schedule-time">${slot.time}</p>
                ${isUnavailable && overlappingSessions.length ? '<p class="schedule-meta">Unavailable</p>' : scheduleLabelMarkup(slot.label)}
              </div>
              ${isUnavailable && overlappingSessions.length ? `
                <div class="schedule-slot-overlays">
                  ${overlappingSessions
                    .map(
                      (session) => `
                        <div class="schedule-conflict-card" style="${nestedSchedulePositionStyle(session.range, range)}">
                          <p class="schedule-conflict-time">${session.time}</p>
                          ${scheduleLabelMarkup(session.label, "schedule-conflict-title")}
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              ` : ""}
            </div>
          `;
        })
        .join("");

      return `
        <article class="schedule-day">
          <h4>${dayInfo.day}<span>${formatCalendarDateLabel(dayInfo.date)}</span></h4>
          <div class="schedule-day-body">
            <div class="schedule-hour-lines">
              ${scheduleHourMarkers
                .map(
                  (marker) => `
                    <div class="schedule-hour-line" style="${scheduleMarkerStyle(marker)}"></div>
                  `,
                )
                .join("")}
            </div>
            <div class="schedule-slot-layer">
              ${slotsMarkup}
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  metrics.scheduleGrid.innerHTML = `
    <div class="schedule-calendar">
      <div class="schedule-time-rail">
        <div class="schedule-time-spacer"></div>
        <div class="schedule-time-list">
          ${scheduleHourMarkers
            .map(
              (marker) => `
                <div class="schedule-time-marker" style="${scheduleMarkerStyle(marker)}">
                  <span class="schedule-hour-label">${marker}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </div>
      <div class="schedule-days-grid">
        ${dayColumns}
      </div>
    </div>
  `;
}

function showScheduleWarning(message) {
  metrics.scheduleWarning.textContent = message;
  metrics.scheduleWarning.classList.remove("hidden");
}

function clearScheduleWarning() {
  metrics.scheduleWarning.textContent = "";
  metrics.scheduleWarning.classList.add("hidden");
}

function addUnavailableBlock() {
  const day = metrics.unavailableDay.value;
  const time = metrics.unavailableTime.value.trim();
  const newRange = parseRange(time);

  if (!newRange) {
    showScheduleWarning("Enter time in a format like 4:30 PM - 5:30 PM.");
    return;
  }

  const overlappingBlock = unavailableBlocks.find((entry) => {
    if (entry.day !== day) {
      return false;
    }

    const entryRange = parseRange(entry.time);
    return entryRange && rangesOverlap(newRange, entryRange);
  });

  if (overlappingBlock) {
    showScheduleWarning("That unavailable time already overlaps an existing blocked time on this day.");
    return;
  }

  const conflicts = (baseSchedule.find((entry) => entry.day === day)?.slots || []).filter((slot) => {
    const slotRange = parseRange(slot.time);
    return slotRange && rangesOverlap(newRange, slotRange);
  });

  unavailableBlocks.push({
    id: `block-${Date.now()}`,
    day,
    time,
    label: conflicts.length ? "Unavailable - conflict flagged" : "Unavailable",
    type: "unavailable",
  });
  persistUnavailableBlocks();
  renderSchedule();
  renderUnavailabilityList();

  if (conflicts.length) {
    showScheduleWarning(`Conflict detected with ${conflicts.map((slot) => slot.label).join(", ")}. Notify internal team members about the conflict.`);
    return;
  }

  clearScheduleWarning();
}

function conflictsForRange(day, range, ignoredBlockId = null) {
  return (baseSchedule.find((entry) => entry.day === day)?.slots || []).filter((slot) => {
    const slotRange = parseRange(slot.time);
    return slotRange && rangesOverlap(range, slotRange);
  });
}

function updateUnavailableBlock(blockId) {
  const block = unavailableBlocks.find((entry) => entry.id === blockId);

  if (!block) {
    return;
  }

  const nextTime = window.prompt("Update unavailable time:", block.time);

  if (!nextTime) {
    return;
  }

  const trimmedTime = nextTime.trim();
  const nextRange = parseRange(trimmedTime);

  if (!nextRange) {
    showScheduleWarning("Enter time in a format like 4:30 PM - 5:30 PM.");
    return;
  }

  const overlappingBlock = unavailableBlocks.find((entry) => {
    if (entry.day !== block.day || entry.id === blockId) {
      return false;
    }

    const entryRange = parseRange(entry.time);
    return entryRange && rangesOverlap(nextRange, entryRange);
  });

  if (overlappingBlock) {
    showScheduleWarning("That unavailable time already overlaps an existing blocked time on this day.");
    return;
  }

  const conflicts = conflictsForRange(block.day, nextRange, blockId);
  block.time = trimmedTime;
  block.label = conflicts.length ? "Unavailable - conflict flagged" : "Unavailable";
  openScheduleMenuId = null;
  persistUnavailableBlocks();
  renderSchedule();
  renderUnavailabilityList();

  if (conflicts.length) {
    showScheduleWarning(`Conflict detected with ${conflicts.map((slot) => slot.label).join(", ")}. Notify internal team members about the conflict.`);
    return;
  }

  clearScheduleWarning();
}

function deleteUnavailableBlock(blockId) {
  unavailableBlocks = unavailableBlocks.filter((entry) => entry.id !== blockId);
  openScheduleMenuId = null;
  persistUnavailableBlocks();
  renderSchedule();
  renderUnavailabilityList();
  clearScheduleWarning();
}

function studentStatus(student) {
  if (student.needsHelp) {
    return { label: "Needs assistance", className: "warning" };
  }

  if (student.attendance < 85 || student.progress < 75) {
    return { label: "Monitor closely", className: "warning" };
  }

  return { label: "On track", className: "ok" };
}

function renderSeatCard(student) {
  const status = studentStatus(student);
  const course = courseForStudent(student);
  const initials = student.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  const alertClasses = student.alertActive ? "seat-alert bouncing" : "seat-alert hidden";
  const attendanceClass = student.presentToday ? "present" : "absent";
  const attendanceIcon = student.presentToday ? "P" : "A";
  const attendanceLabel = student.presentToday ? "Here" : "Absent";
  const studentParam = encodeURIComponent(student.name);
  const assignWorkUrl = `student.html?student=${studentParam}&assignWork=1`;

  return `
    <article class="seat-widget" draggable="true" data-open-student="${student.name}" data-seat-student="${student.name}" aria-label="${student.name} seat ${student.seat}">
      <button class="seat-drag-handle" type="button" aria-label="Drag ${student.name} to a new seat">
        ::
      </button>
      <div class="seat-label">Seat ${student.seat}</div>
      <div class="seat-top">
        <div class="seat-avatar">${initials}</div>
        <button class="${alertClasses}" type="button" data-student="${student.name}" aria-label="${student.alertActive ? `Disable alert for ${student.name}` : `${student.name} alert disabled`}">
          !
        </button>
      </div>
      <div class="student-head">
        <div>
          <h4>${student.name}</h4>
          <a class="student-course-link" href="${courseDetailsUrl(course.id)}">${course.title}</a>
          <p class="student-group-meta">${course.groupLabel}</p>
        </div>
        <div class="status-chip ${status.className}">${status.label}</div>
      </div>

      <div class="seat-stats">
        <div class="seat-stat">
          <div class="seat-stat-head">
            <span>Attendance</span>
            <strong>${student.attendance}%</strong>
          </div>
          <button class="attendance-box ${attendanceClass}" type="button" data-attendance-student="${student.name}" aria-label="Mark ${student.name} as ${student.presentToday ? "absent" : "here"}">
            <span class="attendance-icon">${attendanceIcon}</span>
            <span>${attendanceLabel}</span>
          </button>
        </div>

        <div class="seat-stat">
          <div class="seat-stat-head">
            <span>Progress</span>
            <strong>${student.progress}%</strong>
          </div>
          <div class="progress-track" aria-label="${student.name} progress">
            <span class="progress-fill" style="width:${student.progress}%"></span>
          </div>
        </div>
      </div>

      <div class="status-row">
        <p class="student-meta">Late assignments: ${student.assignmentsLate}</p>
        <div class="student-card-links">
          <a class="student-link" href="${assignWorkUrl}">Assign Work</a>
          <a class="student-link" href="student.html?student=${studentParam}">Student profile</a>
        </div>
      </div>

      <div class="seat-note">
        <strong>${student.note}</strong>
      </div>
    </article>
  `;
}

function renderCoursesCatalog() {
  if (!metrics.coursesGrid) {
    return;
  }

  metrics.coursesGrid.innerHTML = courses
    .map((course) => {
      const roster = rosterForCourse(course.id);
      const alertCount = roster.filter((student) => student.alertActive).length;
      const avgProgress = roster.length
        ? Math.round(roster.reduce((sum, student) => sum + student.progress, 0) / roster.length)
        : 0;
      const attendanceHere = roster.filter((student) => student.presentToday).length;

      return `
        <article class="course-list-card">
          <div class="course-list-head">
            <div>
              <p class="class-group-kicker">${course.groupLabel}</p>
              <h4 class="class-group-title static">${course.title}</h4>
              <p class="course-list-copy">${course.overview}</p>
            </div>
            <div class="course-list-actions">
              <a class="schedule-button schedule-button-secondary" href="${courseWorkspaceUrl(course.id)}">View Course Details</a>
              <a class="student-link" href="${course.curriculumUrl}" target="_blank" rel="noreferrer">Open curriculum</a>
            </div>
          </div>

          <div class="course-list-metrics">
            <span>${roster.length} student${roster.length === 1 ? "" : "s"}</span>
            <span>${attendanceHere} here today</span>
            <span>${avgProgress}% avg progress</span>
            <span>${alertCount} alert${alertCount === 1 ? "" : "s"}</span>
          </div>

          <div class="course-list-section">
            <p class="metric-label">Roster</p>
            ${
              roster.length
                ? `
                  <div class="course-list-roster">
                    ${roster
                      .map(
                        (student) => `
                          <a class="course-list-roster-item" href="student.html?student=${encodeURIComponent(student.name)}">
                            <strong>${student.name}</strong>
                            <span>Seat ${student.seat}</span>
                          </a>
                        `,
                      )
                      .join("")}
                  </div>
                `
                : '<p class="course-list-inline">No students assigned yet.</p>'
            }
          </div>

          <div class="course-list-section">
            <p class="metric-label">General Expectations</p>
            <div class="course-list-stack">
              ${course.expectations
                .slice(0, 3)
                .map((expectation) => `<div class="course-list-item">${expectation}</div>`)
                .join("")}
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStudents() {
  const activeCourseIds = currentClassCourseIds();
  const preview = nextScheduledClassPreview();
  const previewCourseIds = !activeCourseIds.length && currentClassPreviewActive && preview
    ? preview.courseIds
    : [];
  const displayedCourseIds = activeCourseIds.length ? activeCourseIds : previewCourseIds;
  const visibleStudents = students.filter(
    (student) => displayedCourseIds.includes(student.courseId) && filters[currentFilter](student),
  );

  if (!activeCourseIds.length && !currentClassPreviewActive) {
    metrics.studentGrid.innerHTML = `
      <article class="student-card">
        <div class="student-card-header">
          <h4>No class is active right now</h4>
          ${
            preview
              ? `<button class="schedule-button" type="button" data-preview-current-class="true">Preview Next Class</button>`
              : ""
          }
        </div>
        <p class="student-meta">The live class view appears from 10 minutes before a scheduled class through 10 minutes after it ends.</p>
        ${
          preview
            ? `
              <p class="student-meta">Next class: <strong>${preview.label}</strong> on ${preview.day} at ${preview.time}.</p>
            `
            : `
              <p class="student-meta">There are no additional scheduled classes to preview right now.</p>
            `
        }
      </article>
    `;
    return;
  }

  if (!visibleStudents.length) {
    metrics.studentGrid.innerHTML = `
      <article class="student-card">
        <h4>${activeCourseIds.length ? "No students match this live filter" : "Preview unavailable"}</h4>
        <p class="student-meta">${activeCourseIds.length ? "Try a different filter to see the active class roster." : "There is no upcoming roster available to preview with the current filter."}</p>
      </article>
    `;
    return;
  }

  const groupedMarkup = courses
      .map((course) => {
        if (!displayedCourseIds.includes(course.id)) {
          return "";
        }

      const roster = visibleStudents.filter((student) => student.courseId === course.id);

      if (!roster.length) {
        return "";
      }

      const alertCount = roster.filter((student) => student.alertActive).length;
      const absentCount = roster.filter((student) => !student.presentToday).length;

      return `
        <section class="class-group">
          <div class="class-group-header">
            <div>
              <p class="class-group-kicker">${course.groupLabel}</p>
              <a class="class-group-title" href="${courseDetailsUrl(course.id)}">${course.title}</a>
              <p class="class-group-copy">${course.focus}</p>
            </div>
            <div class="class-group-summary">
              <span>${roster.length} student${roster.length === 1 ? "" : "s"}</span>
              <span>${alertCount} alert${alertCount === 1 ? "" : "s"}</span>
              <span>${absentCount} absent</span>
            </div>
          </div>
          <div class="class-group-grid">
            ${roster.map(renderSeatCard).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  metrics.studentGrid.innerHTML = `
    ${
      !activeCourseIds.length && currentClassPreviewActive && preview
        ? `
          <article class="student-card">
            <div class="student-card-header">
              <h4>Previewing next class</h4>
              <button class="schedule-button schedule-button-secondary" type="button" data-hide-current-class-preview="true">Hide Preview</button>
            </div>
            <p class="student-meta"><strong>${preview.label}</strong> on ${preview.day} at ${preview.time}. This preview will disappear automatically once the class is live.</p>
          </article>
        `
        : ""
    }
    ${groupedMarkup}
    <article class="add-student-widget" data-add-student="true" aria-label="Add student">
      <div class="add-student-inner">
        <div class="add-student-icon">+</div>
        <h4 class="add-student-title">Add student</h4>
        <p class="add-student-copy">Create a new student widget for this classroom.</p>
      </div>
    </article>
  `;
}

function reloadStudents() {
  students = window.portalStore.getStudents();
  renderSummary();
  renderSchedule();
  renderCoursesCatalog();
  renderCurrentClassAvailability();
  renderStudents();
}

function moveStudent(draggedName, targetName) {
  const fromIndex = students.findIndex((student) => student.name === draggedName);
  const toIndex = students.findIndex((student) => student.name === targetName);

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return;
  }

  if (students[fromIndex].courseId !== students[toIndex].courseId) {
    return;
  }

  const [movedStudent] = students.splice(fromIndex, 1);
  students.splice(toIndex, 0, movedStudent);
  reseatStudents();
  persistStudents();
  renderStudents();
}

function setFilter(nextFilter) {
  currentFilter = nextFilter;

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === nextFilter);
  });

  renderStudents();
}

function setView(nextView) {
  currentView = nextView;

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === nextView);
  });

  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === nextView);
  });
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.querySelectorAll(".nav-link").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

metrics.sidebarToggle?.addEventListener("click", () => {
  sidebarHidden = true;
  persistSidebarHidden();
  renderSidebarVisibility();
});

metrics.sidebarShowButton?.addEventListener("click", () => {
  sidebarHidden = false;
  persistSidebarHidden();
  renderSidebarVisibility();
});

document.querySelectorAll(".schedule-subtab").forEach((button) => {
  button.addEventListener("click", () => setScheduleTab(button.dataset.scheduleTab));
});

metrics.faqToggle?.addEventListener("click", () => {
  setFaqOpen(!faqOpen);
});

metrics.faqClose?.addEventListener("click", () => {
  setFaqOpen(false);
});

metrics.faqForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  submitFaqQuestion(metrics.faqInput?.value || "");
});

document.querySelectorAll("[data-faq-suggestion]").forEach((button) => {
  button.addEventListener("click", () => {
    setFaqOpen(true);
    submitFaqQuestion(button.dataset.faqSuggestion || "");
  });
});

window.addEventListener("pointerdown", unlockAlertAudio, { once: true });
window.addEventListener("keydown", unlockAlertAudio, { once: true });

metrics.submitTimeoffButton?.addEventListener("click", submitTimeOffRequest);
metrics.adjustHoursButton?.addEventListener("click", () => {
  window.alert("Weekly hours are derived from the current class schedule in this demo.");
});
metrics.previousWeekButton?.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  currentWeekStart = getWeekStart(currentWeekStart);
  renderSchedule();
});
metrics.nextWeekButton?.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  currentWeekStart = getWeekStart(currentWeekStart);
  renderSchedule();
});
metrics.timeoffRows?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-subplan-index]");

  if (!button) {
    return;
  }

  handleSubPlanAction(Number(button.dataset.subplanIndex));
});

document.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-statement-toggle]");

  if (!toggle) {
    return;
  }

  const key = toggle.dataset.statementToggle;
  const details = document.querySelector(`[data-statement-details='${key}']`);

  if (!details) {
    return;
  }

  const isHidden = details.classList.contains("hidden");
  details.classList.toggle("hidden", !isHidden);
  toggle.setAttribute("aria-expanded", String(isHidden));
  toggle.textContent = isHidden ? "Hide Details" : "View Details";
});

metrics.advisorMenuButton.addEventListener("click", () => {
  toggleAdvisorMenu();
});

metrics.advisorMenu.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-advisor-action]");

  if (!actionButton) {
    return;
  }

  if (actionButton.dataset.advisorAction === "settings") {
    openSettingsModal();
    return;
  }

  if (actionButton.dataset.advisorAction === "logout") {
    openLogoutModal();
  }
});

metrics.settingsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedLocations = getSettingsSelections("locations");
  const selectedLanguages = getSettingsSelections("languages");

  instructorSettings = {
    ...instructorSettings,
    email: metrics.settingsEmail.value.trim() || "maya.brooks@northhallacademy.edu",
    phone: metrics.settingsPhone.value.trim() || "(949) 555-0187",
    pronouns: metrics.settingsPronouns.value.trim() || "She/Her",
    availableLocations: selectedLocations.length ? selectedLocations : ["Irvine"],
    teachingLanguages: selectedLanguages.length ? selectedLanguages : ["English"],
  };
  persistInstructorSettings();
  renderInstructorAccount();
  ensureSidebarViews();
  renderSummary();
  closeSettingsModal();
});

metrics.settingsClose.addEventListener("click", closeSettingsModal);
metrics.settingsCancel.addEventListener("click", closeSettingsModal);
metrics.logoutCancel.addEventListener("click", closeLogoutModal);
metrics.logoutConfirm.addEventListener("click", () => {
  closeLogoutModal();
  setLoggedOut(true);
});
metrics.signInAgain.addEventListener("click", () => {
  setLoggedOut(false);
});

metrics.settingsLocationsButton.addEventListener("click", () => {
  const isOpen = !metrics.settingsLocationsMenu.classList.contains("hidden");
  toggleSettingsMulti("languages", false);
  toggleSettingsMulti("locations", !isOpen);
});

metrics.settingsLanguagesButton.addEventListener("click", () => {
  const isOpen = !metrics.settingsLanguagesMenu.classList.contains("hidden");
  toggleSettingsMulti("locations", false);
  toggleSettingsMulti("languages", !isOpen);
});

document.querySelectorAll("[data-settings-group]").forEach((input) => {
  input.addEventListener("change", () => {
    updateSettingsMultiSummary(input.dataset.settingsGroup);
  });
});

document.addEventListener("click", (event) => {
  if (
    faqOpen &&
    !event.target.closest("#faq-panel") &&
    !event.target.closest("#faq-toggle")
  ) {
    setFaqOpen(false);
  }

  if (!event.target.closest(".advisor-menu-wrap")) {
    toggleAdvisorMenu(false);
  }

  if (!event.target.closest(".settings-multi")) {
    toggleSettingsMulti("locations", false);
    toggleSettingsMulti("languages", false);
  }

  if (event.target.closest("[data-close-settings='true']")) {
    closeSettingsModal();
  }

  if (event.target.closest("[data-close-logout='true']")) {
    closeLogoutModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  setFaqOpen(false);
  toggleAdvisorMenu(false);
  closeSettingsModal();
  closeLogoutModal();
});

metrics.blockTimeButton.addEventListener("click", addUnavailableBlock);

metrics.unavailableDay.addEventListener("change", clearScheduleWarning);
metrics.unavailableTime.addEventListener("input", clearScheduleWarning);

metrics.scheduleGrid.addEventListener("click", (event) => {
  const menuToggle = event.target.closest("[data-schedule-menu]");

  if (menuToggle) {
    const { scheduleMenu } = menuToggle.dataset;
    openScheduleMenuId = openScheduleMenuId === scheduleMenu ? null : scheduleMenu;
    renderSchedule();
    return;
  }

  const editButton = event.target.closest("[data-edit-block]");

  if (editButton) {
    updateUnavailableBlock(editButton.dataset.editBlock);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-block]");

  if (deleteButton) {
    deleteUnavailableBlock(deleteButton.dataset.deleteBlock);
    return;
  }

  if (openScheduleMenuId) {
    openScheduleMenuId = null;
    renderSchedule();
  }
});

metrics.unavailabilityList?.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-unavailability]");

  if (!deleteButton) {
    return;
  }

  deleteUnavailableBlock(deleteButton.dataset.deleteUnavailability);
});

metrics.studentGrid.addEventListener("click", (event) => {
  const previewButton = event.target.closest("[data-preview-current-class]");

  if (previewButton) {
    currentClassPreviewActive = true;
    renderStudents();
    return;
  }

  const hidePreviewButton = event.target.closest("[data-hide-current-class-preview]");

  if (hidePreviewButton) {
    currentClassPreviewActive = false;
    renderStudents();
    return;
  }

  const alertButton = event.target.closest(".seat-alert");

  if (!alertButton || alertButton.classList.contains("hidden")) {
    return;
  }

  const student = students.find((entry) => entry.name === alertButton.dataset.student);

  if (!student) {
    return;
  }

  student.alertActive = false;
  student.needsHelp = false;
  persistStudents();
  renderSummary();
  renderStudents();
  return;
});

metrics.studentGrid.addEventListener("click", (event) => {
  const attendanceButton = event.target.closest(".attendance-box");

  if (attendanceButton) {
    const student = students.find((entry) => entry.name === attendanceButton.dataset.attendanceStudent);

    if (!student) {
      return;
    }

    student.presentToday = !student.presentToday;
    persistStudents();
    renderStudents();
    return;
  }

  const addStudentCard = event.target.closest(".add-student-widget");

  if (addStudentCard) {
    createStudent();
    return;
  }

  const seatCard = event.target.closest(".seat-widget");
  const ignoredTarget = event.target.closest(".seat-alert, .student-link, .student-course-link, .class-group-title, .attendance-box, .seat-drag-handle, .add-student-widget");

  if (!seatCard || ignoredTarget) {
    return;
  }

  window.location.href = `student.html?student=${encodeURIComponent(seatCard.dataset.openStudent)}`;
});

metrics.studentGrid.addEventListener("dragstart", (event) => {
  const seatCard = event.target.closest(".seat-widget");

  if (!seatCard) {
    return;
  }

  draggedStudentName = seatCard.dataset.seatStudent;
  seatCard.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedStudentName);
});

metrics.studentGrid.addEventListener("dragover", (event) => {
  const seatCard = event.target.closest(".seat-widget");

  if (!seatCard || seatCard.dataset.seatStudent === draggedStudentName) {
    return;
  }

  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  seatCard.classList.add("drag-over");
});

metrics.studentGrid.addEventListener("dragleave", (event) => {
  const seatCard = event.target.closest(".seat-widget");

  if (!seatCard) {
    return;
  }

  seatCard.classList.remove("drag-over");
});

metrics.studentGrid.addEventListener("drop", (event) => {
  const seatCard = event.target.closest(".seat-widget");

  if (!seatCard) {
    return;
  }

  event.preventDefault();
  document.querySelectorAll(".seat-widget").forEach((card) => {
    card.classList.remove("drag-over", "dragging");
  });

  const targetStudentName = seatCard.dataset.seatStudent;
  moveStudent(draggedStudentName, targetStudentName);
  draggedStudentName = null;
});

metrics.studentGrid.addEventListener("dragend", () => {
  draggedStudentName = null;
  document.querySelectorAll(".seat-widget").forEach((card) => {
    card.classList.remove("drag-over", "dragging");
  });
});

window.addEventListener("storage", (event) => {
  if (event.key === "portal-students") {
    reloadStudents();
  }

  if (event.key === scheduleStorageKey) {
    unavailableBlocks = loadUnavailableBlocks();
    renderSummary();
    renderSchedule();
    renderUnavailabilityList();
  }

  if (event.key === timeOffStorageKey) {
    timeOffRequests = loadTimeOffRequests();
    renderTimeOffRequests();
  }

  if (event.key === settingsStorageKey) {
    instructorSettings = loadInstructorSettings();
    renderInstructorAccount();
    ensureSidebarViews();
    renderSummary();
    setLoggedOut(Boolean(instructorSettings.loggedOut));
  }
});

window.setInterval(() => {
  renderCurrentClassAvailability();
  renderStudents();
}, 60000);

ensureSidebarViews();
renderInstructorAccount();
renderFaqMessage("bot", "Hi. I can answer questions from the Daily Documents resources. Try asking about time-off requests, payment guidance, Zoom, office rules, or substitute plans.");
metrics.weeklyHoursLabel.textContent = computeWeeklyHoursLabel();
renderSummary();
renderSchedule();
renderUnavailabilityList();
renderTimeOffRequests();
renderCoursesCatalog();
renderCurrentClassAvailability();
renderStudents();
setView(currentView);
setScheduleTab(currentScheduleTab);
setLoggedOut(Boolean(instructorSettings.loggedOut));
renderSidebarVisibility();
