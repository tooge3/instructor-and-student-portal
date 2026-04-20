(function () {
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function parseScheduleLabel(groupLabel) {
    const cleaned = (groupLabel || "").replace(/^[^:]+:\s*/, "").trim();
    const days = weekdayNames.filter((day) => cleaned.includes(day));
    const timeMatch = cleaned.match(/(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/i);

    return {
      days,
      timeLabel: timeMatch ? timeMatch[1] : cleaned,
    };
  }

  function buildOccurrences(days, totalNeeded) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeDays = days.length ? days : ["Monday"];
    const activeIndexes = new Set(activeDays.map((day) => weekdayNames.indexOf(day)));
    const cursor = new Date(today);
    cursor.setDate(cursor.getDate() - 120);
    const results = [];

    while (results.length < totalNeeded) {
      if (activeIndexes.has(cursor.getDay())) {
        results.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return results;
  }

  function buildStructuredDates(groupLabel, totalSessions, currentSession) {
    const schedule = parseScheduleLabel(groupLabel);
    const occurrences = buildOccurrences(schedule.days, totalSessions + 40);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let anchorIndex = occurrences.findIndex((entry) => entry >= today);

    if (anchorIndex < 0) {
      anchorIndex = occurrences.length - 1;
    }

    const startIndex = Math.max(0, anchorIndex - (currentSession - 1));
    return {
      timeLabel: schedule.timeLabel,
      dates: occurrences.slice(startIndex, startIndex + totalSessions),
    };
  }

  function buildOpenClassDates(groupLabel, currentSession) {
    const schedule = parseScheduleLabel(groupLabel);
    const occurrences = buildOccurrences(schedule.days, 40);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pastDates = occurrences.filter((entry) => entry <= today);
    const count = Math.max(1, currentSession || 8);

    return {
      timeLabel: schedule.timeLabel,
      dates: pastDates.slice(-count),
    };
  }

  function attachSessionReports(entries, roster, reportsByStudent) {
    const pastEntries = entries.filter((entry) => !entry.isFuture);

    pastEntries.forEach((entry, entryIndex) => {
      const reverseOffset = (pastEntries.length - 1) - entryIndex;

      if (reverseOffset >= 3) {
        entry.attachedReports = [];
        entry.reportLabel = "Missing reports";
        entry.reportState = "missing";
        return;
      }

      const attachedReports = roster
        .map((student) => {
          const history = Array.isArray(reportsByStudent?.[student.name]?.history)
            ? reportsByStudent[student.name].history
            : [];
          const historyIndex = history.length - 1 - reverseOffset;

          if (historyIndex < 0) {
            return null;
          }

          const historyEntry = history[historyIndex];
          return {
            studentName: student.name,
            assignmentUpdate: historyEntry.assignmentUpdate,
            nextStep: historyEntry.nextStep,
            submittedAt: historyEntry.submittedAt,
          };
        })
        .filter(Boolean);

      entry.attachedReports = attachedReports;
      entry.reportLabel = attachedReports.length ? "Contains reports" : "Missing reports";
      entry.reportState = attachedReports.length ? "complete" : "missing";
    });
  }

  function buildSessionEntries({ course, roster, reportsByStudent, currentSession, totalSessions = 16, isOpenClass = false }) {
    const sessionConfig = isOpenClass
      ? buildOpenClassDates(course.groupLabel, currentSession)
      : buildStructuredDates(course.groupLabel, totalSessions, currentSession);
    const dates = sessionConfig.dates;

    const entries = dates.map((date, index) => {
      const attendanceCount = Math.max(0, roster.length - ((index + 1) % 3));
      const isFuture = !isOpenClass && (index + 1) > currentSession;
      const presentStudents = isFuture ? [] : roster.slice(0, attendanceCount).map((student) => student.name);
      const absentStudents = isFuture ? [] : roster.slice(attendanceCount).map((student) => student.name);

      return {
        index,
        label: `${index + 1}`,
        isFuture,
        isCurrent: !isOpenClass && (index + 1) === currentSession,
        dateLabel: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        timeLabel: sessionConfig.timeLabel,
        attendancePillLabel: isFuture ? "Scheduled" : `${attendanceCount}/${roster.length || 0}`,
        attendanceState: isFuture ? "neutral" : absentStudents.length ? "warning" : "ok",
        presentStudents,
        absentStudents,
        attachedReports: [],
        reportLabel: isFuture ? "Not due yet" : "Missing reports",
        reportState: isFuture ? "upcoming" : "missing",
      };
    });

    attachSessionReports(entries, roster, reportsByStudent || {});
    return entries;
  }

  function renderSessionsPanel(entries) {
    return `
      <section class="panel course-sessions-panel-inner">
        <div class="course-session-history-head">
          <p class="eyebrow">Sessions</p>
          <h4>All scheduled sessions</h4>
        </div>
        <div class="course-sessions-table-wrap">
          <div class="course-sessions-table">
            <div class="course-sessions-header-row">
              <div>Session</div>
              <div>Date</div>
              <div>Time</div>
              <div>Attendance</div>
              <div>Reports</div>
            </div>
            ${entries.map((entry) => `
              <div class="course-sessions-row">
                <div><strong>${entry.label}</strong></div>
                <div>${entry.dateLabel}</div>
                <div>${entry.timeLabel}</div>
                <div>
                  <button class="course-session-pill ${entry.attendanceState}" type="button" data-open-course-session-attendance="${entry.index}">
                    ${entry.attendancePillLabel}
                  </button>
                </div>
                <div>
                  <button class="course-session-pill ${entry.reportState === "complete" ? "ok" : entry.reportState === "missing" ? "warning" : "neutral"}" type="button" data-open-course-session-reports="${entry.index}">
                    ${entry.reportLabel}
                  </button>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderSessionReportsBody(entry) {
    if (!entry.attachedReports.length) {
      return `
        <article class="notes-entry">
          <p class="notes-entry-body">${entry.isFuture ? "Reports are not due yet for this session." : "No submitted reports are attached to this session yet."}</p>
        </article>
      `;
    }

    return entry.attachedReports.map((report, index) => `
      <article class="notes-entry">
        <div class="notes-entry-head">
          <p class="notes-entry-date">Report ${index + 1} · ${new Date(report.submittedAt).toLocaleString()}</p>
        </div>
        <div class="report-history-sections">
          <p class="notes-entry-body"><strong>${report.studentName}</strong></p>
          <p class="notes-entry-body"><strong>Assignment Update:</strong> ${report.assignmentUpdate}</p>
          <p class="notes-entry-body"><strong>Next Steps:</strong> ${report.nextStep}</p>
        </div>
      </article>
    `).join("");
  }

  function renderSessionAttendanceBody(entry) {
    if (entry.isFuture) {
      return `
        <article class="notes-entry">
          <p class="notes-entry-body">Attendance is not available yet for this future session.</p>
        </article>
      `;
    }

    return `
      <article class="notes-entry">
        <div class="report-history-sections">
          <p class="notes-entry-body"><strong>Present:</strong> ${entry.presentStudents.length ? entry.presentStudents.join(", ") : "No students listed."}</p>
          <p class="notes-entry-body"><strong>Absent:</strong> ${entry.absentStudents.length ? entry.absentStudents.join(", ") : "No absences recorded."}</p>
        </div>
      </article>
    `;
  }

  function openSessionModal(modalRefs, { title, summary, body }) {
    if (!modalRefs?.modal || !modalRefs?.list) {
      return;
    }

    if (modalRefs.title) {
      modalRefs.title.textContent = title;
    }
    if (modalRefs.summary) {
      modalRefs.summary.textContent = summary;
    }
    modalRefs.list.innerHTML = body;
    modalRefs.modal.classList.remove("hidden");
    modalRefs.modal.setAttribute("aria-hidden", "false");
  }

  function closeSessionModal(modalRefs) {
    if (!modalRefs?.modal) {
      return;
    }

    modalRefs.modal.classList.add("hidden");
    modalRefs.modal.setAttribute("aria-hidden", "true");
  }

  window.CourseSessionsUI = {
    buildSessionEntries,
    renderSessionsPanel,
    renderSessionReportsBody,
    renderSessionAttendanceBody,
    openSessionModal,
    closeSessionModal,
  };
})();
