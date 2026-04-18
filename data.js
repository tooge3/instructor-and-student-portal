const defaultCourses = [
  {
    id: "biology-201",
    title: "Python Foundations Tutoring",
    groupLabel: "Tutoring Hours: Monday and Wednesday, 3:30 PM - 5:00 PM",
    scheduleSummary: "Mon, Wed, and Fri after school with guided biology tutoring and lab support.",
    deliveryMode: "In person small-group tutoring",
    leadFocus: "Reinforce unit concepts, repair missing lab work, and prepare students for quiz recovery.",
    currentUnit: "Unit 4 Genetics and Lab Write-Up Recovery",
    currentObjective: "Help students complete genetics practice, repair missing lab submissions, and strengthen CER writing.",
    sessionFormat: "Warm-up review, missing lab check, guided tutoring block, and exit reflection.",
    progressBenchmark: "Students should be at or above 80% completion on Unit 4 assignments before Friday.",
    curriculumLabel: "Open Python Foundations",
    curriculumUrl: "https://example.com/curriculum/biology-201",
    rewardsUrl: "https://example.com/rewards/biology-201",
    overview: "A subject-specific tutoring block for biology students who need lab reinforcement, quiz recovery, and guided practice.",
    focus: "Cell biology review, lab write-ups, genetics practice, and missing assignment recovery.",
    materials: [
      "Biology lab notebook",
      "Current unit slide deck",
      "Quiz correction packet",
      "CER writing checklist",
    ],
    interventionPriorities: [
      "Students missing two or more labs should leave with a make-up plan and due date.",
      "Flag students below 70% progress for tutor check-in and family follow-up.",
      "Use the last 10 minutes for quiz-correction review and lab submission reminders.",
    ],
    expectations: [
      "Arrive with the current lab notebook, calculator, and charged device.",
      "Submit make-up labs within one week of the original due date.",
      "Participate in warm-up, lab practice, and exit reflection every session.",
    ],
    milestones: [
      "Unit 4 genetics lab submission due Friday.",
      "Quiz corrections turned in before the next check-in block.",
      "Complete one office-hours follow-up before the next progress report.",
    ],
    prepChecklist: [
      "Print the current genetics practice set and quiz correction tracker.",
      "Open the missing-lab tracker before students arrive.",
      "Set aside CER exemplars for students revising lab conclusions.",
    ],
    instructorLookFors: [
      "Students can explain the difference between dominant and recessive traits.",
      "Students can revise a lab conclusion with stronger evidence.",
      "Students leave with a clear due date for any missing biology work.",
    ],
    familyFollowUp: [
      "Contact families when a student misses two lab-support blocks in a row.",
      "Share make-up lab deadlines when a student is behind on Unit 4 work.",
    ],
    pageNotes: [
      "Roster should be reviewed for missing labs and support flags before class starts.",
      "Families should be contacted when a student misses two lab sessions in a row.",
    ],
  },
  {
    id: "chemistry-prep",
    title: "Web Development Foundations Tutoring",
    groupLabel: "Tutoring Hours: Tuesday and Thursday, 3:15 PM - 4:45 PM",
    scheduleSummary: "Tue and Thu tutoring blocks focused on chemistry reteaching and assignment recovery.",
    deliveryMode: "Hybrid tutoring with guided packet review",
    leadFocus: "Close concept gaps before quizzes and move overdue chemistry practice toward completion.",
    currentUnit: "Chemical Reactions and Correction Packet Recovery",
    currentObjective: "Reinforce balancing equations, complete correction packets, and prepare students for checkpoint retakes.",
    sessionFormat: "Mini reteach, packet correction block, one-on-one check-ins, and checkpoint prep.",
    progressBenchmark: "Students should finish the active correction packet before asking for reassessment approval.",
    curriculumLabel: "Open Web Development Foundations",
    curriculumUrl: "https://example.com/curriculum/chemistry-prep",
    rewardsUrl: "https://example.com/rewards/chemistry-prep",
    overview: "A chemistry tutoring course focused on core concept recovery, assessment prep, and assignment completion support.",
    focus: "Equation balancing, reaction review, checkpoint preparation, and correction packets.",
    materials: [
      "Chemistry correction packet",
      "Periodic table reference sheet",
      "Checkpoint slide rubric",
      "Reaction practice set",
    ],
    interventionPriorities: [
      "Students missing packet pages should complete them before starting extension work.",
      "Quiz recovery students should review one missed standard before dismissal.",
      "Track which students still need reassessment approval before the next exam block.",
    ],
    expectations: [
      "Bring the current packet and be ready to show completed correction work.",
      "Redo missed practice before asking for extension credit.",
      "Use class time to prepare for the next checkpoint or exam retake.",
    ],
    milestones: [
      "Corrections packet checked at the start of the next session.",
      "Checkpoint slide deck reviewed before Thursday.",
      "Office-hour follow-up logged before the next report cycle.",
    ],
    prepChecklist: [
      "Pull the reaction review answer key and correction packet.",
      "Mark which students still need reassessment approval.",
      "Prepare one short balancing-equations reteach example for the opening block.",
    ],
    instructorLookFors: [
      "Students can balance simple reaction equations without prompting.",
      "Students can explain at least one corrected error from the packet.",
      "Students know their next checkpoint or reassessment date before leaving.",
    ],
    familyFollowUp: [
      "Notify families when checkpoint prep is incomplete ahead of the retake window.",
      "Flag students who miss tutoring and still need reassessment approval.",
    ],
    pageNotes: [
      "Roster should highlight late work trends and which students still need packet review.",
      "Sub plans should include the current correction packet and checkpoint rubric.",
    ],
  },
  {
    id: "stem-bridge",
    title: "JavaScript Lecture Lab",
    groupLabel: "Lecture Hours: Monday and Thursday, 4:45 PM - 6:15 PM",
    scheduleSummary: "Mon and Thu lecture-lab sessions with direct instruction, guided examples, and problem review.",
    deliveryMode: "Live lecture lab with guided note checks",
    leadFocus: "Deliver clear reteaching on Algebra II standards and support completion of guided practice.",
    currentUnit: "Quadratics and Function Modeling",
    currentObjective: "Build fluency with quadratics, support guided notes completion, and prepare students for the next quiz.",
    sessionFormat: "Direct lecture, worked examples, guided note check, and independent problem set support.",
    progressBenchmark: "Students should complete the quadratics practice check before the next Thursday block.",
    curriculumLabel: "Open JavaScript Lecture Lab",
    curriculumUrl: "https://example.com/curriculum/algebra-ii",
    rewardsUrl: "https://example.com/rewards/algebra-ii",
    overview: "A structured lecture-lab course for Algebra II students who need direct instruction, guided examples, and homework support.",
    focus: "Quadratics, function modeling, guided lecture notes, and multi-step problem solving.",
    materials: [
      "Guided notes packet",
      "Worked example slides",
      "Homework recovery sheet",
      "Exit ticket answer key",
    ],
    interventionPriorities: [
      "Students with missing guided notes should copy the day’s model examples before leaving.",
      "Students under 75% progress should be checked for quiz readiness during the final practice block.",
      "Use the last five minutes to identify which students need reteaching before the next lecture.",
    ],
    expectations: [
      "Bring lecture notes, current homework, and a charged device.",
      "Show work clearly during guided practice and exit checks.",
      "Use tutoring time to correct misconceptions before the next quiz.",
    ],
    milestones: [
      "Quadratics practice check due before the next Thursday session.",
      "Function modeling corrections completed before quiz retake.",
      "Lecture notes uploaded for the weekly participation check.",
    ],
    prepChecklist: [
      "Load the worked-example slide deck before the lecture block starts.",
      "Print the guided notes packet and homework recovery sheet.",
      "Set aside the exit ticket key for the last five minutes of class.",
    ],
    instructorLookFors: [
      "Students can identify the correct quadratic form for the problem type.",
      "Students show full work on guided examples instead of skipping steps.",
      "Students leave with notes complete enough to study before the quiz.",
    ],
    familyFollowUp: [
      "Send follow-up for students who miss lecture notes and fall behind on guided practice.",
      "Share quiz-readiness concerns when progress drops below the Algebra II benchmark.",
    ],
    pageNotes: [
      "Roster review should surface missing homework and students who need re-teaching notes.",
      "Sub plans should include the guided notes packet, worked examples, and exit ticket key.",
    ],
  },
];

const defaultStudents = [
  {
    name: "Ariana Patel",
    courseId: "biology-201",
    seat: "A1",
    attendance: 96,
    presentToday: true,
    progress: 88,
    assignmentsLate: 0,
    needsHelp: false,
    alertActive: false,
    note: "Consistent attendance and strong quiz improvement.",
    goal: "Earn full credit on the Unit 4 lab submission this week.",
    tasks: [
      "Finish the genetics reflection before Friday.",
      "Upload your lab notes for Unit 4.",
    ],
  },
  {
    name: "Jordan Kim",
    courseId: "biology-201",
    seat: "A2",
    attendance: 72,
    presentToday: false,
    progress: 61,
    assignmentsLate: 3,
    needsHelp: true,
    alertActive: true,
    note: "Missed two labs and requested tutoring support.",
    goal: "Complete both missing lab makeups before Friday afternoon.",
    tasks: [
      "Make up the missing cell structure lab.",
      "Submit the tutoring follow-up worksheet.",
    ],
  },
  {
    name: "Priya Shah",
    courseId: "biology-201",
    seat: "A3",
    attendance: 89,
    presentToday: true,
    progress: 74,
    assignmentsLate: 1,
    needsHelp: false,
    alertActive: false,
    note: "Participates well during guided review but still needs lab-writing support.",
    goal: "Finish the claim-evidence-reasoning draft before Wednesday tutoring.",
    tasks: [
      "Revise the lab conclusion paragraph.",
      "Complete the genetics vocabulary check.",
    ],
  },
  {
    name: "Mateo Alvarez",
    courseId: "biology-201",
    seat: "B1",
    attendance: 81,
    presentToday: true,
    progress: 67,
    assignmentsLate: 2,
    needsHelp: true,
    alertActive: false,
    note: "Needs regular prompting to finish corrections and resubmit lab work.",
    goal: "Turn in both missing biology corrections before Friday.",
    tasks: [
      "Submit the missing osmosis lab chart.",
      "Redo the Unit 3 quiz corrections.",
    ],
  },
  {
    name: "Elena Rivera",
    courseId: "chemistry-prep",
    seat: "B2",
    attendance: 84,
    presentToday: true,
    progress: 79,
    assignmentsLate: 1,
    needsHelp: false,
    alertActive: false,
    note: "Needs a gentle check-in before the next unit exam.",
    goal: "Raise your quiz average by finishing the corrections packet.",
    tasks: [
      "Review balancing equations practice set.",
      "Turn in the quiz corrections form.",
    ],
  },
  {
    name: "Liam Carter",
    courseId: "chemistry-prep",
    seat: "B3",
    attendance: 87,
    presentToday: true,
    progress: 82,
    assignmentsLate: 0,
    needsHelp: false,
    alertActive: false,
    note: "Strong participation during reaction review and independent practice.",
    goal: "Stay current on the stoichiometry packet this week.",
    tasks: [
      "Complete the reaction-type practice set.",
      "Check your packet answers against the key.",
    ],
  },
  {
    name: "Grace Park",
    courseId: "chemistry-prep",
    seat: "C1",
    attendance: 73,
    presentToday: false,
    progress: 63,
    assignmentsLate: 3,
    needsHelp: true,
    alertActive: true,
    note: "Missed a checkpoint and needs small-group reteaching before the next quiz.",
    goal: "Complete the missing correction packet and attend the next tutoring block.",
    tasks: [
      "Finish the balancing equations corrections.",
      "Submit the reaction review organizer.",
    ],
  },
  {
    name: "Marcus Lee",
    courseId: "stem-bridge",
    seat: "C2",
    attendance: 68,
    presentToday: false,
    progress: 54,
    assignmentsLate: 4,
    needsHelp: true,
    alertActive: true,
    note: "Attendance dropped for two straight weeks and he is behind on lecture notes.",
    goal: "Attend the next algebra lecture and submit all missing guided notes.",
    tasks: [
      "Upload the missing quadratics notes.",
      "Complete the homework recovery sheet.",
    ],
  },
  {
    name: "Sofia Nguyen",
    courseId: "stem-bridge",
    seat: "C3",
    attendance: 91,
    presentToday: true,
    progress: 93,
    assignmentsLate: 0,
    needsHelp: false,
    alertActive: false,
    note: "Consistently prepared and strong during lecture-lab checks.",
    goal: "Finish the challenge set for the next algebra extension block.",
    tasks: [
      "Complete the quadratics challenge set.",
      "Upload your worked examples page.",
    ],
  },
  {
    name: "Noah Bennett",
    courseId: "chemistry-prep",
    seat: "C4",
    attendance: 77,
    presentToday: true,
    progress: 58,
    assignmentsLate: 2,
    needsHelp: true,
    alertActive: true,
    note: "Low project completion and missed office hours follow-up.",
    goal: "Turn in the overdue chemistry practice and checkpoint slide deck.",
    tasks: [
      "Submit the overdue periodic table practice.",
      "Upload your project checkpoint slide.",
    ],
  },
  {
    name: "Hannah Cho",
    courseId: "stem-bridge",
    seat: "D1",
    attendance: 86,
    presentToday: true,
    progress: 76,
    assignmentsLate: 1,
    needsHelp: false,
    alertActive: false,
    note: "Keeps up with lecture notes but needs more confidence on multi-step problems.",
    goal: "Finish the function modeling practice before the next lecture lab.",
    tasks: [
      "Complete the function modeling worksheet.",
      "Check in on the homework review question set.",
    ],
  },
  {
    name: "Ethan Brooks",
    courseId: "stem-bridge",
    seat: "D2",
    attendance: 79,
    presentToday: true,
    progress: 69,
    assignmentsLate: 2,
    needsHelp: true,
    alertActive: false,
    note: "Needs reteaching support after the last quiz and tends to leave corrections incomplete.",
    goal: "Bring algebra corrections up to date before Thursday's lecture block.",
    tasks: [
      "Redo the last quiz correction page.",
      "Submit the homework reflection slip.",
    ],
  },
];

const storageKey = "portal-students";
const studentCourseReportsStorageKey = "portal-student-course-reports";
const legacySeedNames = [
  "Ariana Patel",
  "Jordan Kim",
  "Elena Rivera",
  "Marcus Lee",
  "Sofia Nguyen",
  "Noah Bennett",
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function courseLookup() {
  return Object.fromEntries(defaultCourses.map((course) => [course.id, course]));
}

function inferCourseId(student) {
  const lookup = courseLookup();

  if (student.courseId && lookup[student.courseId]) {
    return student.courseId;
  }

  const legacyTitleMap = {
    "Biology 201": "biology-201",
    "Chemistry Prep": "chemistry-prep",
    "STEM Bridge": "stem-bridge",
    "Biology 201 Tutoring": "biology-201",
    "Chemistry Foundations Tutoring": "chemistry-prep",
    "Algebra II Lecture Lab": "stem-bridge",
    "Python Foundations Tutoring": "biology-201",
    "Web Development Foundations Tutoring": "chemistry-prep",
    "JavaScript Lecture Lab": "stem-bridge",
  };
  const legacyMatch = legacyTitleMap[student.courseId] || legacyTitleMap[student.cohort];

  if (legacyMatch && lookup[legacyMatch]) {
    return legacyMatch;
  }

  const match = defaultCourses.find((course) => course.title === student.cohort);
  return match && lookup[match.id] ? match.id : defaultCourses[0].id;
}

function seatForIndex(index) {
  const row = String.fromCharCode(65 + Math.floor(index / 3));
  const column = (index % 3) + 1;
  return `${row}${column}`;
}

function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) {
    return [];
  }

  return tasks.map((task) => {
    if (typeof task === "string") {
      return {
        text: task,
        assignedAt: null,
      };
    }

    return {
      text: task.text || "",
      assignedAt: task.assignedAt || null,
    };
  }).filter((task) => task.text);
}

function normalizeGoalItems(goals, fallbackGoal) {
  if (Array.isArray(goals) && goals.length) {
    return goals.map((goal) => {
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

  return fallbackGoal
    ? [{
      text: fallbackGoal,
      assignedAt: null,
    }]
    : [];
}

function studentWithCourse(student, index) {
  const lookup = courseLookup();
  const courseId = inferCourseId(student);
  const course = lookup[courseId] || defaultCourses[0];

  return {
    ...student,
    currentGoals: normalizeGoalItems(student.currentGoals, student.goal),
    assignedWork: Array.isArray(student.assignedWork) ? student.assignedWork : [],
    tasks: normalizeTasks(student.tasks),
    courseId: course.id,
    cohort: course.title,
    curriculumLabel: course.curriculumLabel,
    curriculumUrl: course.curriculumUrl,
    rewardsUrl: course.rewardsUrl,
    seat: student.seat || seatForIndex(index),
  };
}

function ensureAtLeastOneInstructorAlert(students) {
  if (students.some((student) => student.alertActive)) {
    return students;
  }

  const preferredName = "Grace Park";
  const fallbackIndex = students.findIndex((student) => student.name === preferredName);
  const targetIndex = fallbackIndex >= 0 ? fallbackIndex : 0;

  return students.map((student, index) =>
    index === targetIndex
      ? {
          ...student,
          needsHelp: true,
          alertActive: true,
        }
      : student,
  );
}

function loadStudents() {
  const stored = window.localStorage.getItem(storageKey);

  if (!stored) {
    const seededStudents = ensureAtLeastOneInstructorAlert(clone(defaultStudents).map(studentWithCourse));
    window.localStorage.setItem(storageKey, JSON.stringify(seededStudents));
    return seededStudents;
  }

  try {
    const parsed = JSON.parse(stored);
    const isLegacySeed =
      Array.isArray(parsed) &&
      parsed.length <= legacySeedNames.length &&
      parsed.every((student) => legacySeedNames.includes(student.name));

    if (isLegacySeed) {
      const resetStudents = ensureAtLeastOneInstructorAlert(clone(defaultStudents).map(studentWithCourse));
      window.localStorage.setItem(storageKey, JSON.stringify(resetStudents));
      return resetStudents;
    }

    const mergedByName = new Map();

    parsed.forEach((student, index) => {
      mergedByName.set(student.name, studentWithCourse(student, index));
    });

    defaultStudents.forEach((student, index) => {
      if (!mergedByName.has(student.name)) {
        mergedByName.set(student.name, studentWithCourse(student, index));
      }
    });

    const normalizedStudents = ensureAtLeastOneInstructorAlert(Array.from(mergedByName.values()));
    window.localStorage.setItem(storageKey, JSON.stringify(normalizedStudents));
    return normalizedStudents;
  } catch (error) {
    const fallbackStudents = ensureAtLeastOneInstructorAlert(clone(defaultStudents).map(studentWithCourse));
    window.localStorage.setItem(storageKey, JSON.stringify(fallbackStudents));
    return fallbackStudents;
  }
}

function loadStudentCourseReports() {
  const stored = window.localStorage.getItem(studentCourseReportsStorageKey);

  if (!stored) {
    const normalized = normalizeStudentCourseReports({});
    saveStudentCourseReports(normalized);
    return normalized;
  }

  try {
    const normalized = normalizeStudentCourseReports(JSON.parse(stored));
    window.localStorage.setItem(studentCourseReportsStorageKey, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    const normalized = normalizeStudentCourseReports({});
    saveStudentCourseReports(normalized);
    return normalized;
  }
}

function saveStudentCourseReports(reportMap) {
  window.localStorage.setItem(
    studentCourseReportsStorageKey,
    JSON.stringify(normalizeStudentCourseReports(reportMap)),
  );
}

function buildSeedStudentCourseReports() {
  const seededReports = {};
  const seededStudents = defaultStudents.map((student, index) => studentWithCourse(student, index));
  const dateBase = new Date("2026-04-16T15:00:00");
  const totalExpectedReports = seededStudents.length * 3;
  const targetCompletedReports = Math.max(1, Math.round(totalExpectedReports * 0.95));
  let completedReportsRemaining = targetCompletedReports;

  seededStudents.forEach((student, index) => {
    const expectedReports = 3;
    const remainingStudents = seededStudents.length - index;
    const minimumFutureCapacity = Math.max(0, remainingStudents - 1) * expectedReports;
    const completedReports = Math.max(
      0,
      Math.min(
        expectedReports,
        completedReportsRemaining - minimumFutureCapacity > 0
          ? Math.min(expectedReports, completedReportsRemaining - minimumFutureCapacity)
          : Math.min(expectedReports - 1, completedReportsRemaining),
      ),
    );
    const history = Array.from({ length: completedReports }, (_, historyIndex) => {
      const submittedAt = new Date(dateBase);
      submittedAt.setDate(dateBase.getDate() - ((completedReports - historyIndex) * 7) - (index % 3));

      return {
        submittedAt: submittedAt.toISOString(),
        summary: `${student.name} completed the ${historyIndex + 1 === completedReports ? "latest" : "previous"} check-in with steady engagement in ${student.cohort}.`,
        assignmentUpdate: historyIndex % 2 === 0
          ? "Core practice set was completed with only minor revisions needed."
          : "Student made progress on assigned work and still has one follow-up item remaining.",
        attendanceUpdate: student.presentToday
          ? "Attendance remained consistent and class pacing stayed on target."
          : "Attendance has been mixed, so pacing notes were included for follow-up.",
        nextStep: historyIndex + 1 === completedReports
          ? "Continue with the next guided assignment and review the flagged concept before the next session."
          : "Return to the missed concept checkpoint and bring questions to the next class.",
      };
    });

    seededReports[student.courseId] = seededReports[student.courseId] || {};
    seededReports[student.courseId][student.name] = {
      courseId: student.courseId,
      studentName: student.name,
      expectedReports,
      history,
    };

    completedReportsRemaining -= completedReports;
  });

  return seededReports;
}

function normalizeStudentCourseReportRecord(report, courseId, studentName) {
  const history = Array.isArray(report?.history)
    ? report.history
        .filter((entry) => entry && entry.submittedAt)
        .sort((left, right) => new Date(left.submittedAt) - new Date(right.submittedAt))
    : report?.submittedAt
      ? [{
          submittedAt: report.submittedAt,
          summary: report.summary || "",
          assignmentUpdate: report.assignmentUpdate || "",
          attendanceUpdate: report.attendanceUpdate || "",
          nextStep: report.nextStep || "",
        }]
      : [];

  const latest = history[history.length - 1] || null;
  const expectedReports = Math.max(report?.expectedReports || 3, history.length);

  return {
    courseId,
    studentName,
    expectedReports,
    completedReports: history.length,
    complete: history.length >= expectedReports,
    history,
    submittedAt: latest?.submittedAt || null,
    summary: latest?.summary || "",
    assignmentUpdate: latest?.assignmentUpdate || "",
    attendanceUpdate: latest?.attendanceUpdate || "",
    nextStep: latest?.nextStep || "",
  };
}

function normalizeStudentCourseReports(reportMap) {
  const seededReports = buildSeedStudentCourseReports();
  const mergedReports = clone(seededReports);

  Object.entries(reportMap || {}).forEach(([courseId, reportsByStudent]) => {
    mergedReports[courseId] = mergedReports[courseId] || {};

    Object.entries(reportsByStudent || {}).forEach(([studentName, report]) => {
      const seededReport = mergedReports[courseId]?.[studentName]
        ? normalizeStudentCourseReportRecord(mergedReports[courseId][studentName], courseId, studentName)
        : normalizeStudentCourseReportRecord({}, courseId, studentName);
      const storedReport = normalizeStudentCourseReportRecord(report, courseId, studentName);

      mergedReports[courseId][studentName] = normalizeStudentCourseReportRecord(
        {
          ...storedReport,
          expectedReports: Math.max(seededReport.expectedReports || 3, storedReport.expectedReports || 3),
          history: (storedReport.history?.length || 0) >= (seededReport.history?.length || 0)
            ? storedReport.history
            : seededReport.history,
        },
        courseId,
        studentName,
      );
    });
  });

  return mergedReports;
}

function seededHistoryForCourseStudent(courseId, studentName, studentIndex, totalStudents) {
  const expectedReports = 3;
  const totalExpected = totalStudents * expectedReports;
  const targetCompleted = Math.max(1, Math.round(totalExpected * 0.95));
  const threshold = targetCompleted / expectedReports;
  const fullyCompleteCount = Math.floor(threshold);
  const partialRemainder = targetCompleted - (fullyCompleteCount * expectedReports);
  let completedReports = expectedReports;

  if (studentIndex < fullyCompleteCount) {
    completedReports = expectedReports;
  } else if (studentIndex === fullyCompleteCount && partialRemainder > 0) {
    completedReports = partialRemainder;
  } else {
    completedReports = 0;
  }

  const course = courseLookup()[courseId];
  const student = loadStudents().find((entry) => entry.name === studentName);
  const dateBase = new Date("2026-04-16T15:00:00");
  const history = Array.from({ length: completedReports }, (_, historyIndex) => {
    const submittedAt = new Date(dateBase);
    submittedAt.setDate(dateBase.getDate() - ((completedReports - historyIndex) * 7) - (studentIndex % 3));

    return {
      submittedAt: submittedAt.toISOString(),
      summary: `${studentName} completed the ${historyIndex + 1 === completedReports ? "latest" : "previous"} check-in with steady engagement in ${course?.title || "this class"}.`,
      assignmentUpdate: historyIndex % 2 === 0
        ? "Core practice set was completed with only minor revisions needed."
        : "Student made progress on assigned work and still has one follow-up item remaining.",
      attendanceUpdate: student?.presentToday
        ? "Attendance remained consistent and class pacing stayed on target."
        : "Attendance has been mixed, so pacing notes were included for follow-up.",
      nextStep: historyIndex + 1 === completedReports
        ? "Continue with the next guided assignment and review the flagged concept before the next session."
        : "Return to the missed concept checkpoint and bring questions to the next class.",
    };
  });

  return normalizeStudentCourseReportRecord(
    {
      courseId,
      studentName,
      expectedReports,
      history,
    },
    courseId,
    studentName,
  );
}

window.portalStore = {
  getStudents() {
    return loadStudents();
  },

  saveStudents(students) {
    const normalizedStudents = ensureAtLeastOneInstructorAlert(students.map(studentWithCourse));
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(normalizedStudents),
    );
  },

  getCourses() {
    return clone(defaultCourses);
  },

  getCourse(courseId) {
    const course = courseLookup()[courseId];
    return course ? clone(course) : null;
  },

  getCourseByStudentName(studentName) {
    const student = loadStudents().find((entry) => entry.name === studentName);
    return student ? this.getCourse(student.courseId) : null;
  },

  getRosterByCourse(courseId) {
    return loadStudents().filter((student) => student.courseId === courseId);
  },

  getStudentCourseReports(courseId) {
    const reports = loadStudentCourseReports();
    return clone(reports[courseId] || {});
  },

  getStudentCourseReport(courseId, studentName) {
    const reports = loadStudentCourseReports();
    return reports[courseId]?.[studentName] ? clone(reports[courseId][studentName]) : null;
  },

  ensureStudentCourseReports(courseId, studentNames) {
    const reports = loadStudentCourseReports();
    reports[courseId] = reports[courseId] || {};

    (studentNames || []).forEach((studentName, index) => {
      const existing = reports[courseId][studentName]
        ? normalizeStudentCourseReportRecord(reports[courseId][studentName], courseId, studentName)
        : null;

      if (!existing || (existing.completedReports || 0) === 0) {
        reports[courseId][studentName] = seededHistoryForCourseStudent(
          courseId,
          studentName,
          index,
          studentNames.length,
        );
      }
    });

    saveStudentCourseReports(reports);
    return clone(reports[courseId]);
  },

  saveStudentCourseReport(courseId, studentName, report) {
    const reports = loadStudentCourseReports();
    const existing = reports[courseId]?.[studentName]
      ? normalizeStudentCourseReportRecord(reports[courseId][studentName], courseId, studentName)
      : normalizeStudentCourseReportRecord({}, courseId, studentName);
    const submittedAt = report.submittedAt || new Date().toISOString();

    reports[courseId] = reports[courseId] || {};
    reports[courseId][studentName] = normalizeStudentCourseReportRecord(
      {
        ...existing,
        expectedReports: existing.expectedReports || 3,
        history: [
          ...(existing.history || []),
          {
            submittedAt,
            summary: report.summary || "",
            assignmentUpdate: report.assignmentUpdate || "",
            attendanceUpdate: report.attendanceUpdate || "",
            nextStep: report.nextStep || "",
          },
        ],
      },
      courseId,
      studentName,
    );
    saveStudentCourseReports(reports);
  },

  courseWorkspaceUrl(courseId) {
    const pageMap = {
      "biology-201": "python-foundations.html",
      "chemistry-prep": "web-development-foundations.html",
      "stem-bridge": "javascript-lecture-lab.html",
    };

    return pageMap[courseId] || "javascript-lecture-lab.html";
  },

  courseDetailsUrl(courseId) {
    const course = this.getCourse(courseId);
    return course ? course.curriculumUrl : "#";
  },
};
