let students = window.portalStore.getStudents();
const courses = Object.fromEntries(window.portalStore.getCourses().map((course) => [course.id, course]));
const params = new URLSearchParams(window.location.search);
const selectedStudentName = params.get("student");
const adminCourseContextId = params.get("adminCourse");
const adminCourseContextTitle = params.get("adminCourseTitle");
const adminCourseContextInstructor = params.get("adminInstructor");
const openAssignWorkFromQuery = params.get("assignWork") === "1";
const settingsStorageKey = "portal-instructor-settings";
const subjectTopicMap = {
  "biology-201": {
    English: [
      "Genetics vocabulary practice",
      "Lab write-up revision",
      "CER paragraph revision",
      "Punnett square problem set",
      "Quiz corrections",
      "Notebook check",
    ],
    Spanish: [
      "Práctica de vocabulario de genética",
      "Revisión del informe de laboratorio",
      "Revisión del párrafo CER",
      "Conjunto de problemas de cuadro de Punnett",
      "Correcciones del cuestionario",
      "Revisión del cuaderno",
    ],
    Mandarin: [
      "遗传学词汇练习",
      "实验报告修改",
      "CER 段落修改",
      "潘尼特方格练习",
      "测验订正",
      "课堂笔记检查",
    ],
  },
  "chemistry-prep": {
    English: [
      "Balancing equations practice",
      "Correction packet completion",
      "Reaction types review",
      "Checkpoint slide revision",
      "Periodic table study set",
      "Quiz retake prep",
    ],
    Spanish: [
      "Práctica de balanceo de ecuaciones",
      "Completar el paquete de correcciones",
      "Repaso de tipos de reacciones",
      "Revisión de diapositivas del punto de control",
      "Guía de estudio de la tabla periódica",
      "Preparación para repetir el cuestionario",
    ],
    Mandarin: [
      "配平方程式练习",
      "订正资料包完成",
      "反应类型复习",
      "检查点幻灯片修改",
      "元素周期表学习任务",
      "测验重考准备",
    ],
  },
  "stem-bridge": {
    English: [
      "Quadratics guided notes",
      "Function modeling worksheet",
      "Worked example corrections",
      "Homework recovery sheet",
      "Exit ticket review",
      "Quiz readiness practice",
    ],
    Spanish: [
      "Apuntes guiados de cuadráticas",
      "Hoja de trabajo de modelado de funciones",
      "Correcciones de ejemplos resueltos",
      "Hoja de recuperación de tarea",
      "Repaso del boleto de salida",
      "Práctica para preparación del cuestionario",
    ],
    Mandarin: [
      "二次函数引导笔记",
      "函数建模练习单",
      "例题订正",
      "作业补交单",
      "随堂退出题复习",
      "测验准备练习",
    ],
  },
};

const elements = {
  name: document.getElementById("student-name"),
  cohort: document.getElementById("student-cohort"),
  seat: document.getElementById("student-seat"),
  status: document.getElementById("student-status"),
  progress: document.getElementById("student-progress"),
  progressRing: document.getElementById("student-progress-ring"),
  alert: document.getElementById("student-alert"),
  alertCopy: document.getElementById("student-alert-copy"),
  goalList: document.getElementById("student-goal-list"),
  lateWork: document.getElementById("student-late-work"),
  taskList: document.getElementById("student-task-list"),
  actions: document.getElementById("student-actions"),
  requestHelpButton: document.getElementById("request-help-button"),
  curriculumLink: document.getElementById("student-curriculum-link"),
  rewardsLink: document.getElementById("student-rewards-link"),
  assignWorkButton: document.getElementById("assign-work-button"),
  assignWorkPanel: document.getElementById("assign-work-panel"),
  assignWorkClose: document.getElementById("assign-work-close"),
  assignWorkTopicList: document.getElementById("assign-work-topic-list"),
  assignWorkText: document.getElementById("assign-work-text"),
  assignWorkSave: document.getElementById("assign-work-save"),
  assignWorkStatus: document.getElementById("assign-work-status"),
  submitSelect: document.getElementById("student-submit-select"),
  submitButton: document.getElementById("student-submit-button"),
};
let assignWorkOpen = openAssignWorkFromQuery;

function loadInstructorSettings() {
  const stored = window.localStorage.getItem(settingsStorageKey);

  if (!stored) {
    return { teachingLanguages: ["English"] };
  }

  try {
    return JSON.parse(stored);
  } catch (error) {
    return { teachingLanguages: ["English"] };
  }
}

function preferredTeachingLanguage() {
  const settings = loadInstructorSettings();
  const [firstLanguage] = settings.teachingLanguages || [];
  return firstLanguage || "English";
}

function getStudent() {
  return students.find((entry) => entry.name === selectedStudentName) || students[0];
}

function getStudentIndex() {
  return students.findIndex((entry) => entry.name === selectedStudentName);
}

function courseForStudent(student) {
  return courses[student.courseId] || null;
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

function recommendedActions(entry) {
  const actions = [];

  if (!entry.presentToday) {
    actions.push("Check in with your instructor about today's absence.");
  }

  if (entry.progress < 70) {
    actions.push("Complete the next missing assignment to raise course progress.");
  }

  if (entry.assignmentsLate > 0) {
    actions.push(`Resolve ${entry.assignmentsLate} late assignment${entry.assignmentsLate > 1 ? "s" : ""}.`);
  }

  if (!actions.length) {
    actions.push("Keep your current pace and prepare for the next unit check-in.");
  }

  return actions;
}

function topicOptionsForStudent(student) {
  const language = preferredTeachingLanguage();
  const topicSet = subjectTopicMap[student.courseId] || {};
  return topicSet[language] || topicSet.English || [];
}

function formatAssignedDate(assignedAt) {
  if (!assignedAt) {
    return "Assigned earlier";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(assignedAt));
}

function normalizeCurrentGoals(student) {
  if (Array.isArray(student.currentGoals) && student.currentGoals.length) {
    return student.currentGoals.map((goal) => {
      if (typeof goal === "string") {
        return {
          text: goal,
          assignedAt: null,
        };
      }

      return {
        text: goal.text || "",
        assignedAt: goal.assignedAt || null,
      };
    }).filter((goal) => goal.text);
  }

  return student.goal
    ? [{
      text: student.goal,
      assignedAt: null,
    }]
    : [];
}

function renderGoalSection(student) {
  const currentGoals = normalizeCurrentGoals(student);

  elements.goalList.innerHTML = currentGoals.length
    ? currentGoals.map((goalItem) => `
      <div class="student-goal-item">
        <strong>${goalItem.text}</strong>
        <span class="student-goal-date">Date assigned: ${formatAssignedDate(goalItem.assignedAt)}</span>
      </div>
    `).join("")
    : "";
}

function renderAssignWorkPanel() {
  const student = getStudent();
  const topics = topicOptionsForStudent(student);

  elements.assignWorkPanel.classList.toggle("hidden", !assignWorkOpen);
  elements.assignWorkPanel.hidden = !assignWorkOpen;
  elements.assignWorkPanel.style.display = assignWorkOpen ? "" : "none";
  elements.assignWorkButton.textContent = assignWorkOpen ? "Hide Assign Work" : "Assign Work";
  elements.assignWorkTopicList.innerHTML = topics.length
    ? topics.map((topic, index) => `
        <label class="assign-work-topic">
          <input type="checkbox" value="${topic}" data-assign-topic="${index}">
          <span>${topic}</span>
        </label>
      `).join("")
    : `<p class="student-meta">No subject topics are configured for this course yet.</p>`;
}

function renderStudent() {
  const student = getStudent();
  const status = studentStatus(student);
  const classContextLabel = adminCourseContextTitle || student.cohort;
  const classContextHref = adminCourseContextTitle ? "#" : student.curriculumUrl;
  const classContextMeta = [
    adminCourseContextId,
    adminCourseContextInstructor,
  ].filter(Boolean).join(" · ");

  document.title = `${student.name} | Student Dashboard`;
  elements.name.textContent = student.name;
  elements.cohort.textContent = classContextLabel;
  elements.cohort.href = classContextHref;
  if (adminCourseContextTitle) {
    elements.cohort.removeAttribute("target");
    elements.cohort.removeAttribute("rel");
    elements.cohort.title = classContextMeta;
  } else {
    elements.cohort.setAttribute("target", "_blank");
    elements.cohort.setAttribute("rel", "noreferrer");
    elements.cohort.removeAttribute("title");
  }
  elements.seat.textContent = `Seat ${student.seat}`;
  elements.status.textContent = status.label;
  elements.status.className = `status-chip ${status.className}`;
  elements.progress.textContent = `${student.progress}%`;
  elements.progressRing.style.setProperty("--progress", `${student.progress}`);
  elements.alert.textContent = student.alertActive ? "Active" : "Inactive";
  elements.alertCopy.textContent = student.alertActive
    ? "Your instructor has flagged a support follow-up."
    : "No active support alert right now.";
  renderGoalSection(student);
  elements.requestHelpButton.textContent = student.alertActive ? "Help Requested" : "Request Help";
  elements.requestHelpButton.classList.toggle("active", student.alertActive);
  elements.curriculumLink.href = classContextHref;
  elements.curriculumLink.textContent = adminCourseContextTitle ? "Class Context" : "Curriculum";
  if (adminCourseContextTitle) {
    elements.curriculumLink.removeAttribute("target");
    elements.curriculumLink.removeAttribute("rel");
    elements.curriculumLink.title = `Opened from ${classContextLabel}${classContextMeta ? ` (${classContextMeta})` : ""}`;
  } else {
    elements.curriculumLink.setAttribute("target", "_blank");
    elements.curriculumLink.setAttribute("rel", "noreferrer");
    elements.curriculumLink.removeAttribute("title");
  }
  elements.rewardsLink.href = student.rewardsUrl;
  elements.rewardsLink.textContent = "CM Rewards";
  elements.lateWork.textContent = student.assignmentsLate;
  elements.taskList.innerHTML = student.tasks
    .map((task) => `
      <div class="student-task-item">
        <strong>${task.text}</strong>
        <span class="student-task-date">Date assigned: ${formatAssignedDate(task.assignedAt)}</span>
      </div>
    `)
    .join("");
  elements.submitSelect.innerHTML = `
    <option value="">Choose an item</option>
    ${student.tasks.map((task, index) => `<option value="${index}">${task.text}</option>`).join("")}
  `;
  elements.actions.innerHTML = recommendedActions(student)
    .map((action) => `<div class="student-action">${action}</div>`)
    .join("");
  renderAssignWorkPanel();
}

elements.requestHelpButton.addEventListener("click", () => {
  const student = getStudent();
  student.alertActive = true;
  student.needsHelp = true;
  window.portalStore.saveStudents(students);
  renderStudent();
});

elements.submitButton.addEventListener("click", () => {
  const student = getStudent();
  const selectedIndex = Number(elements.submitSelect.value);

  if (elements.submitSelect.value === "" || Number.isNaN(selectedIndex)) {
    return;
  }

  student.tasks.splice(selectedIndex, 1);
  student.note = student.tasks.length
    ? "Work submitted. Continue with the remaining tasks."
    : "All current tasks submitted.";
  window.portalStore.saveStudents(students);
  renderStudent();
});

elements.assignWorkButton.addEventListener("click", () => {
  assignWorkOpen = !assignWorkOpen;
  renderAssignWorkPanel();
});

elements.assignWorkClose.addEventListener("click", () => {
  assignWorkOpen = false;
  renderAssignWorkPanel();
});

elements.assignWorkSave.addEventListener("click", () => {
  const studentIndex = getStudentIndex();
  const student = studentIndex >= 0 ? students[studentIndex] : getStudent();
  const selectedTopics = Array.from(document.querySelectorAll("[data-assign-topic]:checked")).map((input) => input.value);
  const customDirections = elements.assignWorkText.value.trim();

  if (!selectedTopics.length && !customDirections) {
    elements.assignWorkStatus.textContent = "Choose at least one topic or add custom directions before assigning work.";
    return;
  }

  const nextTasks = [
    ...selectedTopics.map((task) => ({
      text: task,
      assignedAt: new Date().toISOString(),
    })),
    ...(customDirections ? [{
      text: customDirections,
      assignedAt: new Date().toISOString(),
    }] : []),
  ];

  assignWorkOpen = false;
  elements.assignWorkPanel.classList.add("hidden");
  elements.assignWorkPanel.hidden = true;
  elements.assignWorkPanel.style.display = "none";
  const existingCurrentGoals = normalizeCurrentGoals(student);
  const updatedStudent = {
    ...student,
    currentGoals: [...existingCurrentGoals, ...nextTasks],
    tasks: [...nextTasks, ...student.tasks],
    note: "New assigned work has been added to this student's current tasks.",
  };

  if (studentIndex >= 0) {
    students[studentIndex] = updatedStudent;
  }

  renderGoalSection(updatedStudent);
  window.portalStore.saveStudents(students);
  students = window.portalStore.getStudents();
  document.querySelectorAll("[data-assign-topic]:checked").forEach((input) => {
    input.checked = false;
  });
  elements.assignWorkText.value = "";
  elements.assignWorkStatus.textContent = `Assigned ${nextTasks.length} new work item${nextTasks.length === 1 ? "" : "s"} to ${updatedStudent.name}.`;
  renderStudent();
});

window.addEventListener("storage", (event) => {
  if (event.key !== "portal-students") {
    return;
  }

  students = window.portalStore.getStudents();
  renderStudent();
});

renderStudent();
