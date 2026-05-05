(function renderAdminAssessmentPage() {
  const summaryEl = document.getElementById("admin-assessment-summary");
  const gridEl = document.getElementById("admin-assessment-grid");
  const searchEl = document.getElementById("admin-assessment-search");
  const locationEl = document.getElementById("admin-assessment-location");

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

    gridEl.innerHTML = visibleRecords.length ? visibleRecords.map((record) => `
    <article class="admin-assessment-card ${record.band}">
      <div class="admin-assessment-head">
        <div>
          <p class="eyebrow">Instructor Assessment</p>
          <h3>${record.name}</h3>
          <p class="metric-caption">${record.assessmentRank} · ${record.status} · ${record.locations.join(", ")}</p>
        </div>
        <div class="admin-assessment-score">
          <strong>${record.score}</strong>
          <span>${record.assessmentRank}</span>
        </div>
      </div>

      <div class="admin-assessment-metrics">
        <span class="admin-assessment-pill">Assessment ${record.assessmentRank}</span>
        <span class="admin-assessment-pill">Company role ${record.rank}</span>
        <span class="admin-assessment-pill">Active load ${record.activeLoad}</span>
        <span class="admin-assessment-pill">Completed ${record.completedLoad}</span>
        <span class="admin-assessment-pill">Students ${record.studentsSupported}</span>
        <span class="admin-assessment-pill">Alerts ${record.alerts}</span>
        <span class="admin-assessment-pill">Rate ${record.salaryRate}</span>
      </div>

      <div class="admin-assessment-list">
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

      <div class="admin-assessment-tags">
        ${(record.languages || []).map((language) => `<span class="admin-assessment-tag">${language}</span>`).join("")}
        ${(record.tags || []).map((tag) => `<span class="admin-assessment-tag muted">${tag}</span>`).join("")}
      </div>

      <div class="admin-assessment-actions">
        <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorProfileUrl === "function" ? adminInstructorProfileUrl(record.id) : "#"}">View whole profile</a>
        <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorCoursesUrl === "function" ? adminInstructorCoursesUrl(record.id) : "#"}">Connected courses</a>
        <a class="schedule-button schedule-button-secondary" href="${typeof adminInstructorAvailabilityUrl === "function" ? adminInstructorAvailabilityUrl(record.id) : "#"}">Weekly availability</a>
      </div>
    </article>
    `).join("") : `<p class="notes-empty">No instructor assessments matched the current search.</p>`;
  };

  searchEl?.addEventListener("input", (event) => {
    assessmentQuery = event.target.value || "";
    renderAssessment();
  });

  locationEl?.addEventListener("change", (event) => {
    assessmentLocation = event.target.value || "";
    renderAssessment();
  });

  renderAssessment();
})();
