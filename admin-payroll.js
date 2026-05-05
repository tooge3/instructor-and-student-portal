(function renderAdminPayrollLedger() {
  const ledgerEl = document.getElementById("admin-payroll-ledger");
  const summaryEl = document.getElementById("admin-payroll-ledger-summary");
  const searchEl = document.getElementById("admin-payroll-search");
  const statusEl = document.getElementById("admin-payroll-status");
  const hoursModalEl = document.getElementById("admin-payroll-hours-modal");
  const hoursBodyEl = document.getElementById("admin-payroll-hours-body");

  if (!ledgerEl || !summaryEl) {
    return;
  }

  if (
    typeof getInstructorRecords !== "function" ||
    typeof getCourseRecords !== "function" ||
    typeof buildInstructorCourseLoadMap !== "function"
  ) {
    ledgerEl.innerHTML = `<p class="notes-empty">Payroll tracking data is not available right now.</p>`;
    return;
  }

  const instructors = getInstructorRecords();
  const courses = getCourseRecords();
  const courseLoadMap = buildInstructorCourseLoadMap();
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
  const money = (value) => typeof currency === "function" ? currency(value) : `$${value}`;
  const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const parseMoney = (value) => {
    const match = String(value || "").match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };

  const parseScheduleHours = (schedule) => {
    const matches = String(schedule || "").match(/(\d{1,2}:\d{2}\s[AP]M)\s-\s(\d{1,2}:\d{2}\s[AP]M)/i);
    if (!matches) {
      return 0;
    }

    const parseTime = (value) => {
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

    const minutes = Math.max(0, parseTime(matches[2]) - parseTime(matches[1]));
    return minutes / 60;
  };

  const activeCourseState = (course) => {
    if (typeof courseLifecycleMeta === "function") {
      return courseLifecycleMeta(course).state;
    }
    return "active";
  };

  const paymentStatusForIndex = (index, monthOffset) => {
    const rotation = (index + monthOffset) % 7;
    if (rotation === 0 || rotation === 5) return "Pending Approval";
    if (rotation === 2 || rotation === 4) return "Processing";
    return "Paid";
  };

  const methodForInstructor = (index, instructor, monthOffset) => {
    return (instructor.locations || []).includes("Online") && (index + monthOffset) % 4 === 0
      ? "ACH Transfer"
      : "Direct Deposit";
  };

  const activeCoursesForInstructor = (instructor) => {
    const linkedCourses = courses.filter((course) => course.instructorId === instructor.id);
    const activeCourses = linkedCourses.filter((course) => {
      const state = activeCourseState(course);
      return state === "active" || state === "open";
    });
    return { linkedCourses, activeCourses };
  };

  const monthlyHoursForCourses = (activeCourses) => activeCourses.reduce((sum, course) => {
    const sessionsPerWeek = (String(course.schedule || "").match(/and/g)?.length || 0) + 1;
    return sum + (parseScheduleHours(course.schedule) * sessionsPerWeek * 4);
  }, 0);

  const monthStarts = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(2026, 4 - index, 1, 12, 0, 0);
    return {
      id: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      date,
      label: monthFormatter.format(date),
      offset: index,
    };
  });

  let query = "";
  let statusFilter = "";
  const stubHoursMap = new Map();

  const instructorRows = instructors.map((instructor, instructorIndex) => {
    const { linkedCourses, activeCourses } = activeCoursesForInstructor(instructor);
    const courseHourWeights = activeCourses.map((course) => ({
      course,
      hoursPerMonth: (() => {
        const sessionsPerWeek = (String(course.schedule || "").match(/and/g)?.length || 0) + 1;
        return parseScheduleHours(course.schedule) * sessionsPerWeek * 4;
      })(),
    }));
    const totalCourseHours = courseHourWeights.reduce((sum, item) => sum + item.hoursPerMonth, 0);
    const monthlyHoursBase = monthlyHoursForCourses(activeCourses);
    const monthlyStubs = monthStarts.map((month) => {
      const monthAdjustment = 0.9 + (((instructorIndex + month.offset) % 5) * 0.035);
      const monthlyHours = Math.round((monthlyHoursBase * monthAdjustment) * 10) / 10;
      const hourlyRate = parseMoney(instructor.salaryRate);
      const paymentStatus = paymentStatusForIndex(instructorIndex, month.offset);
      const paymentMethod = methodForInstructor(instructorIndex, instructor, month.offset);
      const grossPay = Math.round(monthlyHours * hourlyRate);
      const reimbursement = (instructorIndex + month.offset) % 6 === 0 ? 75 : (instructorIndex + month.offset) % 4 === 0 ? 35 : 0;
      const totalPayout = grossPay + reimbursement;
      const depositDate = new Date(month.date.getFullYear(), month.date.getMonth(), Math.min(25, 5 + ((instructorIndex + month.offset) % 18)));
      const hourBreakdown = courseHourWeights.length
        ? courseHourWeights.map((item, itemIndex) => {
            const isLast = itemIndex === courseHourWeights.length - 1;
            const proportionalHours = totalCourseHours ? (monthlyHours * (item.hoursPerMonth / totalCourseHours)) : 0;
            return {
              title: item.course.title,
              schedule: item.course.schedule,
              location: item.course.location,
              hours: isLast
                ? Math.round((monthlyHours - courseHourWeights.slice(0, -1).reduce((sum, prior) => {
                    const priorHours = totalCourseHours ? (monthlyHours * (prior.hoursPerMonth / totalCourseHours)) : 0;
                    return sum + Math.round(priorHours * 10) / 10;
                  }, 0)) * 10) / 10
                : Math.round(proportionalHours * 10) / 10,
            };
          })
        : [{
            title: "General instructional time",
            schedule: "No linked class schedule",
            location: "Unassigned",
            hours: monthlyHours,
          }];
      const stubKey = `${instructor.id}::${month.id}`;

      stubHoursMap.set(stubKey, {
        instructorName: instructor.name,
        instructorId: instructor.id,
        monthLabel: month.label,
        totalHours: monthlyHours,
        depositDateLabel: depositDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        paymentMethod,
        breakdown: hourBreakdown,
      });

      return {
        monthId: month.id,
        monthLabel: month.label,
        stubKey,
        monthlyHours,
        hourlyRate,
        grossPay,
        reimbursement,
        totalPayout,
        paymentStatus,
        paymentMethod,
        depositDateLabel: depositDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        depositId: `PAY-${month.id.replace("-", "")}-${String(instructorIndex + 1).padStart(3, "0")}`,
      };
    });

    const totalTrackedPayout = monthlyStubs.reduce((sum, stub) => sum + stub.totalPayout, 0);

    return {
      instructor,
      linkedCourses,
      activeCourses,
      activeLoad: courseLoadMap.get(instructor.id) || 0,
      totalTrackedPayout,
      monthlyStubs,
    };
  }).sort((left, right) => right.totalTrackedPayout - left.totalTrackedPayout || left.instructor.name.localeCompare(right.instructor.name));

  const renderLedger = () => {
    const filtered = instructorRows
      .map((row) => {
        const matchingStubs = row.monthlyStubs.filter((stub) => {
          const matchesStatus = !statusFilter || stub.paymentStatus === statusFilter;
          if (!matchesStatus) {
            return false;
          }

          if (!query) {
            return true;
          }

          const haystack = [
            row.instructor.name,
            row.instructor.id,
            (row.instructor.locations || []).join(" "),
            row.activeCourses.map((course) => course.title).join(" "),
            stub.monthLabel,
            stub.paymentStatus,
            stub.paymentMethod,
            stub.depositId,
          ].join(" ").toLowerCase();

          return haystack.includes(query);
        });

        if (!matchingStubs.length) {
          return null;
        }

        return {
          ...row,
          visibleStubs: matchingStubs,
          visiblePayout: matchingStubs.reduce((sum, stub) => sum + stub.totalPayout, 0),
        };
      })
      .filter(Boolean);

    const allVisibleStubs = filtered.flatMap((row) => row.visibleStubs);
    const totalPayout = allVisibleStubs.reduce((sum, stub) => sum + stub.totalPayout, 0);
    const paidCount = allVisibleStubs.filter((stub) => stub.paymentStatus === "Paid").length;
    const processingCount = allVisibleStubs.filter((stub) => stub.paymentStatus === "Processing").length;
    const pendingCount = allVisibleStubs.filter((stub) => stub.paymentStatus === "Pending Approval").length;

    summaryEl.innerHTML = `
      <article class="metric-card">
        <p class="metric-label">Months Tracked</p>
        <h3>${monthStarts.length}</h3>
        <p class="metric-caption">Recent payroll cycles being tracked together in the instructor ledger.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Tracked Payout</p>
        <h3>${money(totalPayout)}</h3>
        <p class="metric-caption">Combined instructor payments and reimbursements for the visible paystubs.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Paid / Processing</p>
        <h3>${paidCount} / ${processingCount}</h3>
        <p class="metric-caption">How many visible paystubs have been completed versus still moving.</p>
      </article>
      <article class="metric-card">
        <p class="metric-label">Pending Approval</p>
        <h3>${pendingCount}</h3>
        <p class="metric-caption">Instructor paystubs still waiting for final approval before release.</p>
      </article>
    `;

    ledgerEl.innerHTML = filtered.length ? `
      <div class="admin-payroll-tablehead">
        <span>Instructor</span>
        <span>Locations</span>
        <span>Rate</span>
        <span>Courses</span>
        <span>Visible Total</span>
        <span>Paystubs</span>
      </div>
      ${filtered.map((row) => `
        <details class="admin-payroll-row">
          <summary class="admin-payroll-row-summary">
            <div class="admin-payroll-cell admin-payroll-instructor-cell">
              <strong>${row.instructor.name}</strong>
              <span>${row.instructor.id}</span>
            </div>
            <div class="admin-payroll-cell">
              <span>${row.instructor.locations.join(", ")}</span>
            </div>
            <div class="admin-payroll-cell">
              <strong>${row.instructor.salaryRate}</strong>
            </div>
            <div class="admin-payroll-cell">
              <strong>${row.activeLoad}</strong>
              <span>${row.activeCourses.length} linked</span>
            </div>
            <div class="admin-payroll-cell">
              <strong>${money(row.visiblePayout)}</strong>
            </div>
            <div class="admin-payroll-cell admin-payroll-toggle-cell">
              <strong>${row.visibleStubs.length}</strong>
              <span>View details</span>
            </div>
          </summary>

          <div class="admin-payroll-row-details">
            <div class="admin-payroll-history-block">
              <p class="metric-label">Paystub history</p>
              <div class="admin-payroll-history-list">
                ${row.visibleStubs.map((stub) => `
                  <article class="admin-payroll-history-item">
                    <div class="admin-payroll-history-head">
                      <div>
                        <strong>${stub.monthLabel}</strong>
                        <span>${stub.depositId} · ${stub.depositDateLabel}</span>
                      </div>
                      <div class="admin-payroll-history-status ${stub.paymentStatus === "Paid" ? "paid" : stub.paymentStatus === "Processing" ? "processing" : "pending"}">
                        <span>${stub.paymentStatus}</span>
                        <strong>${money(stub.totalPayout)}</strong>
                      </div>
                    </div>
                    <div class="admin-payroll-history-grid">
                      <div>
                        <span>Method</span>
                        <strong>${stub.paymentMethod}</strong>
                      </div>
                      <div>
                        <span>Hours</span>
                        <button class="admin-payroll-hours-trigger" type="button" data-hours-stub="${stub.stubKey}">${stub.monthlyHours}</button>
                      </div>
                      <div>
                        <span>Gross</span>
                        <strong>${money(stub.grossPay)}</strong>
                      </div>
                      <div>
                        <span>Reimbursement</span>
                        <strong>${money(stub.reimbursement)}</strong>
                      </div>
                    </div>
                  </article>
                `).join("")}
              </div>
            </div>

            <div class="admin-payroll-course-block">
              <p class="metric-label">Payments connected to courses</p>
              <div class="admin-payroll-course-list">
                ${row.activeCourses.length ? row.activeCourses.map((course) => `
                  <a class="admin-payroll-course-item" href="admin-course-detail.html?course=${encodeURIComponent(course.id)}&instructor=${encodeURIComponent(row.instructor.id)}">
                    <strong>${course.title}</strong>
                    <span>${course.schedule}</span>
                    <span>${course.location}</span>
                  </a>
                `).join("") : `<p class="notes-empty">No active courses are currently feeding this instructor's tracked payment history.</p>`}
              </div>
            </div>
          </div>
        </details>
      `).join("")}
    ` : `<p class="notes-empty">No instructor paystubs matched the current payroll filters.</p>`;
  };

  searchEl?.addEventListener("input", (event) => {
    query = (event.target.value || "").trim().toLowerCase();
    renderLedger();
  });

  statusEl?.addEventListener("change", (event) => {
    statusFilter = event.target.value || "";
    renderLedger();
  });

  const closeHoursModal = () => {
    if (!hoursModalEl) return;
    hoursModalEl.classList.add("hidden");
    hoursModalEl.setAttribute("aria-hidden", "true");
  };

  const openHoursModal = (stubKey) => {
    const details = stubHoursMap.get(stubKey);
    if (!details || !hoursModalEl || !hoursBodyEl) {
      return;
    }

    hoursBodyEl.innerHTML = `
      <div class="admin-payroll-hours-summary">
        <div>
          <strong>${escapeHtml(details.instructorName)}</strong>
          <span>${escapeHtml(details.instructorId)} · ${escapeHtml(details.monthLabel)}</span>
        </div>
        <div class="admin-payroll-hours-total">
          <span>Total Hours</span>
          <strong>${details.totalHours}</strong>
        </div>
      </div>
      <div class="admin-payroll-hours-meta">
        <span>Deposit date: ${escapeHtml(details.depositDateLabel)}</span>
        <span>Method: ${escapeHtml(details.paymentMethod)}</span>
      </div>
      <div class="admin-payroll-hours-list">
        ${details.breakdown.map((item) => `
          <article class="admin-payroll-hours-item">
            <div>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${escapeHtml(item.schedule)} · ${escapeHtml(item.location)}</span>
            </div>
            <strong>${item.hours}</strong>
          </article>
        `).join("")}
      </div>
    `;

    hoursModalEl.classList.remove("hidden");
    hoursModalEl.setAttribute("aria-hidden", "false");
  };

  ledgerEl.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-hours-stub]");
    if (!trigger) {
      return;
    }
    openHoursModal(trigger.dataset.hoursStub);
  });

  hoursModalEl?.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-payroll-hours]")) {
      closeHoursModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && hoursModalEl && !hoursModalEl.classList.contains("hidden")) {
      closeHoursModal();
    }
  });

  renderLedger();
})();
