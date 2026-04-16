const students = [
  {
    name: "Ariana Patel",
    cohort: "Biology 201",
    attendance: 96,
    progress: 88,
    assignmentsLate: 0,
    needsHelp: false,
    note: "Consistent attendance and strong quiz improvement.",
  },
  {
    name: "Jordan Kim",
    cohort: "Biology 201",
    attendance: 72,
    progress: 61,
    assignmentsLate: 3,
    needsHelp: true,
    note: "Missed two labs and requested tutoring support.",
  },
  {
    name: "Elena Rivera",
    cohort: "Chemistry Prep",
    attendance: 84,
    progress: 79,
    assignmentsLate: 1,
    needsHelp: false,
    note: "Needs a gentle check-in before the next unit exam.",
  },
  {
    name: "Marcus Lee",
    cohort: "STEM Bridge",
    attendance: 68,
    progress: 54,
    assignmentsLate: 4,
    needsHelp: true,
    note: "Attendance dropped for two straight weeks. Flagged for advisor call.",
  },
  {
    name: "Sofia Nguyen",
    cohort: "STEM Bridge",
    attendance: 91,
    progress: 93,
    assignmentsLate: 0,
    needsHelp: false,
    note: "On track for distinction status.",
  },
  {
    name: "Noah Bennett",
    cohort: "Chemistry Prep",
    attendance: 77,
    progress: 58,
    assignmentsLate: 2,
    needsHelp: true,
    note: "Low project completion and missed office hours follow-up.",
  },
];

const filters = {
  all: () => true,
  atRisk: (student) => student.needsHelp,
  attendance: (student) => student.attendance < 80,
};

const metrics = {
  attendanceRate: document.getElementById("attendance-rate"),
  attendanceCaption: document.getElementById("attendance-caption"),
  averageProgress: document.getElementById("average-progress"),
  progressCaption: document.getElementById("progress-caption"),
  assistanceCount: document.getElementById("assistance-count"),
  assistanceCaption: document.getElementById("assistance-caption"),
  activeStudentCount: document.getElementById("active-student-count"),
  urgentAlertCount: document.getElementById("urgent-alert-count"),
  trendGrid: document.getElementById("trend-grid"),
  alertList: document.getElementById("alert-list"),
  studentGrid: document.getElementById("student-grid"),
};

let currentFilter = "all";

function average(values) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function renderSummary() {
  const attendanceAverage = average(students.map((student) => student.attendance));
  const progressAverage = average(students.map((student) => student.progress));
  const helpCount = students.filter((student) => student.needsHelp).length;
  const attendanceRiskCount = students.filter((student) => student.attendance < 80).length;

  metrics.attendanceRate.textContent = `${attendanceAverage}%`;
  metrics.attendanceCaption.textContent = `${attendanceRiskCount} students are below the 80% target.`;
  metrics.averageProgress.textContent = `${progressAverage}%`;
  metrics.progressCaption.textContent = "Average course completion across active students.";
  metrics.assistanceCount.textContent = `${helpCount}`;
  metrics.assistanceCaption.textContent = "Students currently flagged for intervention.";
  metrics.activeStudentCount.textContent = students.length;
  metrics.urgentAlertCount.textContent = helpCount;
}

function renderTrends() {
  const trendCards = [
    {
      label: "Present Today",
      value: "26 / 30",
      width: 87,
    },
    {
      label: "Assignments Submitted",
      value: "82%",
      width: 82,
    },
    {
      label: "Tutoring Requests",
      value: "4",
      width: 40,
    },
    {
      label: "On-Track Students",
      value: "70%",
      width: 70,
    },
  ];

  metrics.trendGrid.innerHTML = trendCards
    .map(
      (card) => `
        <article class="trend-card">
          <p class="metric-label">${card.label}</p>
          <strong>${card.value}</strong>
          <div class="mini-bar" aria-hidden="true">
            <span style="width:${card.width}%"></span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderAlerts() {
  const alertStudents = students.filter((student) => student.needsHelp);

  metrics.alertList.innerHTML = alertStudents
    .map(
      (student) => `
        <article class="alert-item">
          <h4>${student.name}</h4>
          <p class="alert-meta">${student.cohort} • Attendance ${student.attendance}% • Progress ${student.progress}%</p>
          <p class="alert-copy">${student.note}</p>
        </article>
      `,
    )
    .join("");
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

function renderStudents() {
  const visibleStudents = students.filter(filters[currentFilter]);

  metrics.studentGrid.innerHTML = visibleStudents
    .map((student) => {
      const status = studentStatus(student);

      return `
        <article class="student-card">
          <div class="student-head">
            <div>
              <h4>${student.name}</h4>
              <p class="student-meta">${student.cohort}</p>
            </div>
            <div class="status-chip ${status.className}">${status.label}</div>
          </div>

          <div class="student-stat-row">
            <span>Attendance</span>
            <strong>${student.attendance}%</strong>
          </div>
          <div class="progress-track" aria-label="${student.name} attendance">
            <span class="progress-fill" style="width:${student.attendance}%"></span>
          </div>

          <div class="student-stat-row">
            <span>Progress</span>
            <strong>${student.progress}%</strong>
          </div>
          <div class="progress-track" aria-label="${student.name} progress">
            <span class="progress-fill" style="width:${student.progress}%"></span>
          </div>

          <div class="status-row">
            <p class="student-meta">Late assignments: ${student.assignmentsLate}</p>
            <p class="student-meta">${student.needsHelp ? "Advisor follow-up required" : "No urgent intervention"}</p>
          </div>

          <div class="support-note">${student.note}</div>
        </article>
      `;
    })
    .join("");
}

function setFilter(nextFilter) {
  currentFilter = nextFilter;

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === nextFilter);
  });

  renderStudents();
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

renderSummary();
renderTrends();
renderAlerts();
renderStudents();
