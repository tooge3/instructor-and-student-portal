(function renderAdminAssessmentPage() {
  const summaryEl = document.getElementById("admin-assessment-summary");
  const gridEl = document.getElementById("admin-assessment-grid");
  const searchEl = document.getElementById("admin-assessment-search");
  const locationEl = document.getElementById("admin-assessment-location");
  const notesModal = document.getElementById("admin-assessment-notes-modal");
  const notesTitle = document.getElementById("admin-assessment-notes-title");
  const notesMeta = document.getElementById("admin-assessment-notes-meta");
  const notesInput = document.getElementById("admin-assessment-note-input");
  const notesList = document.getElementById("admin-assessment-notes-list");
  const notesStatus = document.getElementById("admin-assessment-notes-status");
  const historyModal = document.getElementById("admin-assessment-history-modal");
  const historyTitle = document.getElementById("admin-assessment-history-title");
  const historyMeta = document.getElementById("admin-assessment-history-meta");
  const historyList = document.getElementById("admin-assessment-history-list");
  const promotionModal = document.getElementById("admin-assessment-promotion-modal");
  const promotionTitle = document.getElementById("admin-assessment-promotion-title");
  const promotionMeta = document.getElementById("admin-assessment-promotion-meta");
  const promotionRank = document.getElementById("admin-assessment-promotion-rank");
  const promotionCycle = document.getElementById("admin-assessment-promotion-cycle");
  const promotionNote = document.getElementById("admin-assessment-promotion-note");
  const promotionStatus = document.getElementById("admin-assessment-promotion-status");
  const assessmentNotesStorageKey = "portal-admin-assessment-notes";
  const assessmentPromotionStorageKey = "portal-admin-assessment-promotions";
  let activeAssessmentNotesId = null;
  let activeAssessmentPromotionId = null;
  let activeAssessmentMenuId = null;

  if (!summaryEl || !gridEl) {
    return;
  }

  if (typeof getInstructorRecords !== "function" || typeof buildInstructorCourseLoadMap !== "function") {
    gridEl.innerHTML = `<p class="notes-empty">Assessment data is not available right now.</p>`;
    return;
  }

  const instructors = getInstructorRecords();
  const courseLoadMap = buildInstructorCourseLoadMap();
  const courses = typeof getCourseRecords === "function" ? getCourseRecords() : [];
  let assessmentQuery = "";
  let assessmentLocation = "";

  const loadAssessmentNotes = () => {
    try {
      const stored = window.localStorage.getItem(assessmentNotesStorageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  };

  const saveAssessmentNotes = (notesMap) => {
    window.localStorage.setItem(assessmentNotesStorageKey, JSON.stringify(notesMap));
  };

  const assessmentNotes = loadAssessmentNotes();
  const loadPromotionAssignments = () => {
    try {
      const stored = window.localStorage.getItem(assessmentPromotionStorageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  };

  const savePromotionAssignments = (assignments) => {
    window.localStorage.setItem(assessmentPromotionStorageKey, JSON.stringify(assignments));
  };

  const promotionAssignments = loadPromotionAssignments();

  const assessmentRankForScore = (score) => {
    if (score >= 92) return "Elite";
    if (score >= 86) return "Professional";
    if (score >= 79) return "Intermediate++";
    if (score >= 72) return "Intermediate";
    if (score >= 64) return "Beginner++";
    if (score >= 56) return "Beginner";
    return "Training";
  };

  const rankToneForRank = (rank) => {
    if (rank === "Elite" || rank === "Professional") {
      return "ready";
    }
    if (rank === "Intermediate++" || rank === "Intermediate") {
      return "growth";
    }
    return "coaching";
  };

  const parseSalaryRate = (value) => {
    const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };

  const completedCoursesForInstructor = (instructorId) => {
    if (typeof courseLifecycleMeta !== "function") {
      return 0;
    }

    return courses.filter((course) => course.instructorId === instructorId && courseLifecycleMeta(course).state === "completed").length;
  };

  const describeCommunication = (tags) => {
    if (tags.includes("Good comms")) {
      return "Strong communication signal across families and students.";
    }
    if (tags.includes("weak comms")) {
      return "Communication coaching recommended before broader leadership scope.";
    }
    return "Communication is neutral in current records.";
  };

  const describeScope = (instructor) => {
    if (instructor.tags.includes("Lower level only")) {
      return "Current instructional scope is narrower and lower-level focused.";
    }
    if (instructor.tags.includes("HS age")) {
      return "Already trusted with older student groups and broader maturity range.";
    }
    if ((instructor.languages || []).length > 1) {
      return "Multilingual coverage improves instructional range and parent communication.";
    }
    return "Scope is steady, with room to widen course and age-group coverage.";
  };

  const describeFlexibility = (instructor, activeLoad) => {
    const locationCount = (instructor.locations || []).length;
    if (instructor.tags.includes("Low work load")) {
      return "Has spare capacity and could absorb added responsibility quickly.";
    }
    if (locationCount > 1) {
      return "Cross-site flexibility makes this instructor easier to scale into bigger roles.";
    }
    if (activeLoad >= 4) {
      return "Already operating with a higher course load and useful staffing resilience.";
    }
    return "Flexibility is moderate and could improve with wider location coverage.";
  };

  const assessmentRecords = instructors.map((instructor) => {
    const activeLoad = courseLoadMap.get(instructor.id) || 0;
    const completedLoad = completedCoursesForInstructor(instructor.id);
    const connectedCourses = courses.filter((course) => course.instructorId === instructor.id);
    const sessionCount = connectedCourses.reduce((sum, course) => {
      if (course.isOpenClass) {
        const currentSession = Number.parseInt(String(course.currentSession || "0"), 10);
        return sum + (Number.isFinite(currentSession) ? currentSession : 0);
      }

      return sum + (Number.isFinite(Number(course.totalSessions)) ? Number(course.totalSessions) : 16);
    }, 0);
    const tags = Array.isArray(instructor.tags) ? instructor.tags : [];
    const locations = Array.isArray(instructor.locations) ? instructor.locations : [];
    const languages = Array.isArray(instructor.languages) ? instructor.languages : [];

    let score = 54;

    const rankBonus = {
      "Lead Instructor": 18,
      "Senior Instructor": 14,
      "Instructor": 10,
      "Associate Instructor": 6,
    };

    score += rankBonus[instructor.rank] || 0;
    score += instructor.status === "Active" ? 8 : instructor.status === "Waitlist" ? -5 : -12;
    score += Math.min(locations.length * 3, 9);
    score += Math.min(languages.length * 4, 12);
    score += activeLoad >= 2 && activeLoad <= 4 ? 8 : activeLoad === 1 ? 4 : activeLoad >= 5 ? 5 : -3;
    score += completedLoad >= 4 ? 6 : completedLoad >= 2 ? 3 : 0;
    score += instructor.studentsSupported >= 40 ? 6 : instructor.studentsSupported >= 30 ? 3 : 0;
    score -= (instructor.alerts || 0) * 4;

    if (tags.includes("Good comms")) score += 10;
    if (tags.includes("HS age")) score += 6;
    if (tags.includes("Low work load")) score += 4;
    if (tags.includes("Lower level only")) score -= 8;
    if (tags.includes("Risky")) score -= 18;
    if (tags.includes("weak comms")) score -= 12;

    score = Math.max(28, Math.min(96, score));

    const assessmentRank = assessmentRankForScore(score);
    const band = rankToneForRank(assessmentRank);
    const nextStep = band === "ready"
      ? "Consider for mentorship, lead coverage, or broader site ownership."
      : band === "growth"
        ? "Keep on promotion track after one targeted growth cycle."
        : "Prioritize coaching before expanding class or staffing scope.";

    return {
      ...instructor,
      activeLoad,
      completedLoad,
      sessionCount,
      score,
      assessmentRank,
      band,
      communicationSummary: describeCommunication(tags),
      scopeSummary: describeScope(instructor),
      flexibilitySummary: describeFlexibility(instructor, activeLoad),
      salaryNumeric: parseSalaryRate(instructor.salaryRate),
      nextStep,
    };
  }).sort((left, right) => right.score - left.score || left.name.localeCompare(right.name));

  const assessmentRecordById = new Map(assessmentRecords.map((record) => [record.id, record]));

  const assessmentHistoryForRecord = (record) => {
    const completedDate = new Date(Date.UTC(2026, (record.completedLoad + 1) % 12, 4 + (record.activeLoad % 20), 17, 0));
    const scoreDate = new Date(Date.UTC(2026, (record.score + 2) % 12, 8 + (record.completedLoad % 18), 18, 30));
    const availabilityDate = new Date(Date.UTC(2026, (record.activeLoad + 4) % 12, 12 + (record.alerts % 12), 16, 15));

    return [
      {
        createdAt: scoreDate.toISOString(),
        label: `Assessment ${record.assessmentRank}`,
        note: `Promotion-readiness score recorded at ${record.score} with ${record.activeLoad} active course${record.activeLoad === 1 ? "" : "s"}.`,
      },
      {
        createdAt: completedDate.toISOString(),
        label: "Completed courses reviewed",
        note: `${record.completedLoad} completed course${record.completedLoad === 1 ? "" : "s"} counted toward this assessment profile.`,
      },
      {
        createdAt: availabilityDate.toISOString(),
        label: "Coverage profile updated",
        note: `${record.locations.join(", ") || "No location coverage"} · ${(record.languages || []).join(", ") || "English only"}.`,
      },
    ].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  };

  const assessmentNotesForRecord = (recordId) => {
    const notes = Array.isArray(assessmentNotes[recordId]) ? assessmentNotes[recordId] : [];
    return [...notes].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
  };

  const renderAssessmentNotesList = (recordId) => {
    if (!notesList) {
      return;
    }

    const notes = assessmentNotesForRecord(recordId);
    notesList.innerHTML = notes.length
      ? notes.map((note, index) => `
        <details class="notes-entry" ${index === 0 ? "open" : ""}>
          <summary class="notes-entry-head">
            <p class="notes-entry-date">${new Date(note.createdAt).toLocaleString()}</p>
            <span class="metric-caption">${note.text.slice(0, 56)}${note.text.length > 56 ? "..." : ""}</span>
          </summary>
          <div class="notes-entry-body">
            <p>${note.text}</p>
          </div>
        </details>
      `).join("")
      : `<p class="notes-empty">No assessment notes have been added for this instructor yet.</p>`;
  };

  const renderAssessmentHistoryList = (recordId) => {
    if (!historyList) {
      return;
    }

    const record = assessmentRecordById.get(recordId);
    const history = record ? assessmentHistoryForRecord(record) : [];
    historyList.innerHTML = history.length
      ? history.map((entry, index) => `
        <details class="notes-entry" ${index === 0 ? "open" : ""}>
          <summary class="notes-entry-head">
            <p class="notes-entry-date">${new Date(entry.createdAt).toLocaleString()}</p>
            <span class="admin-history-status-pill">${entry.label}</span>
          </summary>
          <div class="notes-entry-body">
            <p>${entry.note}</p>
          </div>
        </details>
      `).join("")
      : `<p class="notes-empty">No assessment history is available for this instructor yet.</p>`;
  };

  const openAssessmentNotesModal = (recordId) => {
    const record = assessmentRecordById.get(recordId);
    if (!record || !notesModal) {
      return;
    }

    activeAssessmentNotesId = recordId;
    if (notesTitle) notesTitle.textContent = `${record.name} notes`;
    if (notesMeta) notesMeta.textContent = `${record.id} · ${record.assessmentRank} · ${record.locations.join(", ") || "Unassigned"}`;
    if (notesInput) notesInput.value = "";
    if (notesStatus) notesStatus.textContent = "";
    renderAssessmentNotesList(recordId);
    notesModal.classList.remove("hidden");
    notesModal.setAttribute("aria-hidden", "false");
  };

  const closeAssessmentNotesModal = () => {
    activeAssessmentNotesId = null;
    notesModal?.classList.add("hidden");
    notesModal?.setAttribute("aria-hidden", "true");
    if (notesInput) notesInput.value = "";
    if (notesStatus) notesStatus.textContent = "";
  };

  const saveAssessmentNote = () => {
    if (!activeAssessmentNotesId || !notesInput) {
      return;
    }

    const text = notesInput.value.trim();
    if (!text) {
      if (notesStatus) notesStatus.textContent = "Add a short note before saving.";
      return;
    }

    const currentNotes = assessmentNotesForRecord(activeAssessmentNotesId);
    assessmentNotes[activeAssessmentNotesId] = [
      {
        text,
        createdAt: new Date().toISOString(),
      },
      ...currentNotes,
    ];
    saveAssessmentNotes(assessmentNotes);
    if (notesStatus) notesStatus.textContent = "Note saved.";
    notesInput.value = "";
    renderAssessmentNotesList(activeAssessmentNotesId);
    renderAssessment();
  };

  const openAssessmentHistoryModal = (recordId) => {
    const record = assessmentRecordById.get(recordId);
    if (!record || !historyModal) {
      return;
    }

    if (historyTitle) historyTitle.textContent = `${record.name} history`;
    if (historyMeta) historyMeta.textContent = `${record.id} · ${record.assessmentRank} · Score ${record.score}`;
    renderAssessmentHistoryList(recordId);
    historyModal.classList.remove("hidden");
    historyModal.setAttribute("aria-hidden", "false");
  };

  const closeAssessmentHistoryModal = () => {
    historyModal?.classList.add("hidden");
    historyModal?.setAttribute("aria-hidden", "true");
  };

  const openPromotionModal = (recordId) => {
    const record = assessmentRecordById.get(recordId);
    if (!record || !promotionModal) {
      return;
    }

    activeAssessmentPromotionId = recordId;
    const assignment = promotionAssignments[recordId] || {};
    if (promotionTitle) promotionTitle.textContent = `Assign promotion assessment for ${record.name}`;
    if (promotionMeta) promotionMeta.textContent = `${record.id} · ${record.assessmentRank} · ${record.rank}`;
    if (promotionRank) promotionRank.value = assignment.targetRank || record.assessmentRank || "Intermediate";
    if (promotionCycle) promotionCycle.value = assignment.reviewCycle || "";
    if (promotionNote) promotionNote.value = assignment.note || "";
    if (promotionStatus) promotionStatus.textContent = "";
    promotionModal.classList.remove("hidden");
    promotionModal.setAttribute("aria-hidden", "false");
  };

  const closePromotionModal = () => {
    activeAssessmentPromotionId = null;
    promotionModal?.classList.add("hidden");
    promotionModal?.setAttribute("aria-hidden", "true");
    if (promotionStatus) promotionStatus.textContent = "";
  };

  const savePromotionAssignment = () => {
    if (!activeAssessmentPromotionId || !promotionRank || !promotionCycle || !promotionNote) {
      return;
    }

    promotionAssignments[activeAssessmentPromotionId] = {
      targetRank: promotionRank.value || "",
      reviewCycle: promotionCycle.value.trim(),
      note: promotionNote.value.trim(),
      updatedAt: new Date().toISOString(),
    };
    savePromotionAssignments(promotionAssignments);
    if (promotionStatus) promotionStatus.textContent = "Promotion assessment assigned.";
  };

  const renderAssessment = () => {
    const query = assessmentQuery.trim().toLowerCase();
    const visibleRecords = assessmentRecords.filter((record) => {
      const matchesLocation = !assessmentLocation || (record.locations || []).includes(assessmentLocation);

      if (!matchesLocation) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        record.name,
        record.rank,
        record.assessmentRank,
        record.status,
        (record.locations || []).join(" "),
        (record.languages || []).join(" "),
        (record.tags || []).join(" "),
        record.communicationSummary,
        record.scopeSummary,
        record.flexibilitySummary,
      ].join(" ").toLowerCase();

      return haystack.includes(query);
    });

    const rankCounts = {
      elite: visibleRecords.filter((record) => record.assessmentRank === "Elite").length,
      professional: visibleRecords.filter((record) => record.assessmentRank === "Professional").length,
      intermediate: visibleRecords.filter((record) => record.assessmentRank === "Intermediate++" || record.assessmentRank === "Intermediate").length,
      training: visibleRecords.filter((record) => record.assessmentRank === "Beginner++" || record.assessmentRank === "Beginner" || record.assessmentRank === "Training").length,
    };

    const averageScore = visibleRecords.length
      ? Math.round(visibleRecords.reduce((sum, record) => sum + record.score, 0) / visibleRecords.length)
      : 0;

    summaryEl.innerHTML = `
      <article class="metric-card">
        <p class="metric-label">Elite</p>
        <h3>${rankCounts.elite}</h3>
        <p class="metric-caption">Promotion-ready instructors with the strongest overall readiness profile.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Professional</p>
        <h3>${rankCounts.professional}</h3>
        <p class="metric-caption">High-trust instructors who are close to larger ownership or mentorship scope.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Intermediate Band</p>
        <h3>${rankCounts.intermediate}</h3>
        <p class="metric-caption">Solid contributors with meaningful growth potential still in motion.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Average Score</p>
        <h3>${averageScore}</h3>
        <p class="metric-caption">Current promotion-readiness average across the visible instructor set.</p>
      </article>
    `;

    gridEl.innerHTML = visibleRecords.length ? `
      <div class="admin-assessment-listview">
        <div class="admin-assessment-listhead">
          <span>Instructor</span>
          <span>Assessment</span>
          <span>Rank</span>
          <span>Locations</span>
          <span>Active Load</span>
          <span>Completed</span>
          <span># of Session</span>
          <span>Status</span>
          <span>History</span>
          <span>Notes</span>
          <span>Menu</span>
        </div>
        <div class="admin-assessment-listbody">
          ${visibleRecords.map((record) => `
            <details class="admin-assessment-row ${record.band}">
              <summary class="admin-assessment-summary-row">
                <span class="admin-assessment-cell admin-assessment-cell-name">
                  <strong>${record.name}</strong>
                  <small>${record.id}</small>
                </span>
                <span class="admin-assessment-cell">
                  <span class="admin-assessment-rank-pill">${record.assessmentRank}</span>
                </span>
                <span class="admin-assessment-cell">${record.rank}</span>
                <span class="admin-assessment-cell">${record.locations.join(", ") || "Unassigned"}</span>
                <span class="admin-assessment-cell">${record.activeLoad}</span>
                <span class="admin-assessment-cell">${record.completedLoad}</span>
                <span class="admin-assessment-cell">
                  <span class="admin-assessment-score-inline">${record.sessionCount}</span>
                </span>
                <span class="admin-assessment-cell">
                  <span class="status-chip ${record.band === "ready" ? "on-track" : record.band === "growth" ? "review" : "attention"} admin-status-chip">${record.status}</span>
                </span>
                <span class="admin-assessment-cell">
                  <button class="admin-icon-button" type="button" data-assessment-history="${record.id}" aria-label="Open assessment history for ${record.name}" title="View history">
                    <span class="admin-icon-button-glyph">↺</span>
                    <span class="admin-icon-button-count">${assessmentHistoryForRecord(record).length}</span>
                  </button>
                </span>
                <span class="admin-assessment-cell">
                  <button class="admin-icon-button" type="button" data-assessment-notes="${record.id}" aria-label="Open assessment notes for ${record.name}" title="${assessmentNotesForRecord(record.id).length ? assessmentNotesForRecord(record.id)[0].text.replace(/"/g, "&quot;") : "Add note"}">
                    <span class="admin-icon-button-glyph">🗒</span>
                    <span class="admin-icon-button-count">${assessmentNotesForRecord(record.id).length}</span>
                  </button>
                </span>
                <span class="admin-assessment-cell">
                  <div class="admin-inline-menu-wrap">
                    <button class="admin-menu-button" type="button" data-assessment-menu-toggle="${record.id}" aria-label="Assessment menu for ${record.name}">…</button>
                    ${activeAssessmentMenuId === record.id ? `
                      <div class="admin-session-menu-list admin-inline-menu-list">
                        <a class="schedule-slot-menu-button" href="${typeof adminInstructorProfileUrl === "function" ? adminInstructorProfileUrl(record.id) : "#"}">View instructor profile</a>
                        <button class="schedule-slot-menu-button" type="button" data-assign-promotion="${record.id}">Assign promotion assessment</button>
                      </div>
                    ` : ""}
                  </div>
                </span>
              </summary>
              <div class="admin-assessment-detail-row">
                <div class="admin-assessment-detail-grid">
                  <div>
                    <span>Communication</span>
                    <p>${record.communicationSummary}</p>
                  </div>
                  <div>
                    <span>Instructional Scope</span>
                    <p>${record.scopeSummary}</p>
                  </div>
                  <div>
                    <span>Staffing Flexibility</span>
                    <p>${record.flexibilitySummary}</p>
                  </div>
                  <div>
                    <span>Company Next Step</span>
                    <p>${record.nextStep}</p>
                  </div>
                </div>
                <div class="admin-assessment-meta-row">
                  <div class="admin-assessment-tags">
                    ${(record.languages || []).map((language) => `<span class="admin-assessment-tag">${language}</span>`).join("")}
                    ${(record.tags || []).map((tag) => `<span class="admin-assessment-tag muted">${tag}</span>`).join("")}
                    <span class="admin-assessment-tag">Students ${record.studentsSupported}</span>
                    <span class="admin-assessment-tag">Alerts ${record.alerts}</span>
                    <span class="admin-assessment-tag">Rate ${record.salaryRate}</span>
                  </div>
                  <div class="admin-assessment-actions">
                    <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorProfileUrl === "function" ? adminInstructorProfileUrl(record.id) : "#"}">View whole profile</a>
                    <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorCoursesUrl === "function" ? adminInstructorCoursesUrl(record.id) : "#"}">Connected courses</a>
                    <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorAvailabilityUrl === "function" ? adminInstructorAvailabilityUrl(record.id) : "#"}">Weekly availability</a>
                  </div>
                </div>
              </div>
            </details>
          `).join("")}
        </div>
      </div>
    ` : `<p class="notes-empty">No instructor assessments matched the current search.</p>`;
  };

  searchEl?.addEventListener("input", (event) => {
    assessmentQuery = event.target.value || "";
    renderAssessment();
  });

  locationEl?.addEventListener("change", (event) => {
    assessmentLocation = event.target.value || "";
    renderAssessment();
  });

  gridEl.addEventListener("click", (event) => {
    const historyButton = event.target.closest("[data-assessment-history]");
    const notesButton = event.target.closest("[data-assessment-notes]");
    const menuToggle = event.target.closest("[data-assessment-menu-toggle]");
    const assignPromotionButton = event.target.closest("[data-assign-promotion]");

    if (historyButton) {
      event.preventDefault();
      event.stopPropagation();
      activeAssessmentMenuId = null;
      openAssessmentHistoryModal(historyButton.dataset.assessmentHistory);
      return;
    }

    if (notesButton) {
      event.preventDefault();
      event.stopPropagation();
      activeAssessmentMenuId = null;
      openAssessmentNotesModal(notesButton.dataset.assessmentNotes);
      return;
    }

    if (menuToggle) {
      event.preventDefault();
      event.stopPropagation();
      activeAssessmentMenuId = activeAssessmentMenuId === menuToggle.dataset.assessmentMenuToggle
        ? null
        : menuToggle.dataset.assessmentMenuToggle;
      renderAssessment();
      return;
    }

    if (assignPromotionButton) {
      event.preventDefault();
      event.stopPropagation();
      activeAssessmentMenuId = null;
      openPromotionModal(assignPromotionButton.dataset.assignPromotion);
    }
  });

  document.getElementById("admin-assessment-notes-close")?.addEventListener("click", closeAssessmentNotesModal);
  document.getElementById("admin-assessment-notes-cancel")?.addEventListener("click", closeAssessmentNotesModal);
  document.getElementById("admin-assessment-notes-save")?.addEventListener("click", saveAssessmentNote);
  document.getElementById("admin-assessment-history-close")?.addEventListener("click", closeAssessmentHistoryModal);
  document.getElementById("admin-assessment-history-cancel")?.addEventListener("click", closeAssessmentHistoryModal);
  document.getElementById("admin-assessment-promotion-close")?.addEventListener("click", closePromotionModal);
  document.getElementById("admin-assessment-promotion-cancel")?.addEventListener("click", closePromotionModal);
  document.getElementById("admin-assessment-promotion-save")?.addEventListener("click", savePromotionAssignment);

  renderAssessment();
})();
