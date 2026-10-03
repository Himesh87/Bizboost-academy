/*
   BizBoost Academy — Main JavaScript Logic
   Pure Vanilla JS with localStorage state persistence
   =================================================== */

// Global constant keys for localStorage
const STORAGE_KEYS = {
  USER: "bizboost_active_user",
  ALL_USERS: "bizboost_registered_users",
  COURSES: "bizboost_course_progress",
  TASK_DONE: "bizboost_daily_task_done",
  SAVED_PLAN: "bizboost_saved_growth_plan"
};

// Default Demo User credentials
const DEMO_USER = {
  fullName: "Demo Business Owner",
  bizName: "Demo Organics & Mart",
  email: "demo@bizboost.com",
  password: "123456",
  category: "Retail",
  experience: "Beginner"
};

// Initialize foundational data once DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupMobileNavigation();
  addStaticNotice();
  updateAuthNavigation();
  initLoginFlow();
  initRegisterFlow();
  initDashboard();
  initCoursesProgress();
  initGrowthSimulator();
  initMarketingMiniTools();
  initFaqAccordion();
  initContactForm();
});

/* ---------------------------------------------------
   1. Mobile Navigation & Header Helpers
   --------------------------------------------------- */

/* Static-site notice */
function addStaticNotice() {
  const host = document.querySelector(".site-header") || document.querySelector(".dashboard-main");
  if (!host || document.getElementById("staticNotice")) return;
  const el = document.createElement("div");
  el.id = "staticNotice";
  el.setAttribute("role", "status");
  el.textContent = "Static demo: profiles and progress are saved only in this browser.";
  el.style.cssText = "font-size:.82rem;padding:8px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;color:#64748b;text-align:center";
  host.parentNode.insertBefore(el, host.nextSibling);
}

function setupMobileNavigation() {
  const menuBtn = document.getElementById("mobileMenuBtn");
  const navMenu = document.getElementById("navMenu");

  if (menuBtn && navMenu) {
    menuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });
  }

  // Sidebar toggle for dashboard (mobile view)
  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const dashboardSidebar = document.getElementById("dashboardSidebar");

  if (sidebarToggleBtn && dashboardSidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
      dashboardSidebar.classList.toggle("active");
    });
  }
}

function getActiveUser() {
  const userJson = localStorage.getItem(STORAGE_KEYS.USER);
  return userJson ? JSON.parse(userJson) : null;
}

function updateAuthNavigation() {
  const navAuthArea = document.getElementById("navAuthArea");
  if (!navAuthArea) return;

  const user = getActiveUser();
  if (user) {
    navAuthArea.innerHTML = `
      <a href="dashboard.html" class="btn btn-outline"><i class="fa-solid fa-gauge"></i> ${escapeHtml(user.fullName.split(" ")[0])}</a>
      <button class="btn btn-primary" onclick="handleLogout()"><i class="fa-solid fa-arrow-right-from-bracket"></i> Logout</button>
    `;
  }
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "login.html";
}

/* ---------------------------------------------------
   2. Authentication Logic (Login & Register)
   --------------------------------------------------- */
function initLoginFlow() {
  const loginForm = document.getElementById("loginForm");
  const demoBtn = document.getElementById("demoUserBtn");

  if (demoBtn) {
    demoBtn.addEventListener("click", () => {
      // Auto-fill demo credentials
      document.getElementById("loginEmail").value = DEMO_USER.email;
      document.getElementById("loginPassword").value = DEMO_USER.password;
      loginUser(DEMO_USER.email, DEMO_USER.password);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const emailErr = document.getElementById("loginEmailError");
      const passErr = document.getElementById("loginPasswordError");

      // Simple validation
      let hasError = false;
      emailErr.textContent = "";
      passErr.textContent = "";

      if (!email || !email.includes("@")) {
        emailErr.textContent = "Please enter a valid email address.";
        hasError = true;
      }
      if (!password || password.length < 5) {
        passErr.textContent = "Password must be at least 5 characters.";
        hasError = true;
      }

      if (!hasError) {
        loginUser(email, password);
      }
    });
  }
}

function loginUser(email, password) {
  const alertBox = document.getElementById("loginAlert");

  // Check Demo User First
  if (email.toLowerCase() === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEMO_USER));
    showAlert(alertBox, "Login successful! Redirecting...", "alert-success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
    return;
  }

  // Check LocalStorage registered users
  const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
  const matchedUser = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

  if (matchedUser) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matchedUser));
    showAlert(alertBox, "Welcome back! Redirecting...", "alert-success");
    setTimeout(() => { window.location.href = "dashboard.html"; }, 800);
  } else {
    showAlert(alertBox, "Invalid credentials. Use demo@bizboost.com / 123456 or register a new account.", "alert-danger");
  }
}

function initRegisterFlow() {
  const regForm = document.getElementById("registerForm");
  if (!regForm) return;

  regForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const alertBox = document.getElementById("registerAlert");

    const fullName = document.getElementById("regFullName").value.trim();
    const bizName = document.getElementById("regBizName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();
    const confirmPassword = document.getElementById("regConfirmPassword").value.trim();
    const category = document.getElementById("regBizCategory").value;
    const experience = document.getElementById("regExperience").value;

    // Reset error fields
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");

    let valid = true;
    if (!fullName) {
      document.getElementById("regFullNameError").textContent = "Full name is required.";
      valid = false;
    }
    if (!bizName) {
      document.getElementById("regBizNameError").textContent = "Business name is required.";
      valid = false;
    }
    if (!email || !email.includes("@")) {
      document.getElementById("regEmailError").textContent = "Valid email is required.";
      valid = false;
    }
    if (!password || password.length < 6) {
      document.getElementById("regPasswordError").textContent = "Password must be 6+ characters.";
      valid = false;
    }
    if (password !== confirmPassword) {
      document.getElementById("regConfirmPasswordError").textContent = "Passwords do not match.";
      valid = false;
    }
    if (!category) {
      document.getElementById("regBizCategoryError").textContent = "Please select a category.";
      valid = false;
    }
    if (!experience) {
      document.getElementById("regExperienceError").textContent = "Please select your experience.";
      valid = false;
    }

    if (!valid) return;

    // Save into localStorage list
    const existingUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.ALL_USERS) || "[]");
    const userExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());

    if (userExists) {
      showAlert(alertBox, "This email is already registered. Please log in.", "alert-danger");
      return;
    }

    const newUser = { fullName, bizName, email, passwordHash: localPasswordHash(password), category, experience };
    existingUsers.push(newUser);
    localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(existingUsers));

    showAlert(alertBox, "Registration successful! Redirecting to login...", "alert-success");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
  });
}

function showAlert(element, text, className) {
  if (!element) return;
  element.textContent = text;
  element.className = `alert-box ${className}`;
  element.style.display = "block";
}

/* ---------------------------------------------------
   3. Dashboard Logic
   --------------------------------------------------- */
function initDashboard() {
  const dashWelcome = document.getElementById("dashWelcomeUser");
  if (!dashWelcome) return;

  // Protect route
  const user = getActiveUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Populate user data
  dashWelcome.textContent = `Welcome back, ${user.fullName} 👋`;
  const bizSub = document.getElementById("dashUserBizDetails");
  if (bizSub) {
    bizSub.textContent = `Managing ${user.bizName} • ${user.category || "General"} Sector • ${user.experience || "Beginner"} Level`;
  }

  // Bind logout
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  }

  // Load progress metrics
  updateDashboardMetrics();

  // Daily task mark completed
  const markTaskBtn = document.getElementById("markTaskCompletedBtn");
  const taskCard = document.getElementById("taskCard");
  const isTaskDone = localStorage.getItem(STORAGE_KEYS.TASK_DONE) === "true";

  if (isTaskDone && markTaskBtn && taskCard) {
    setTaskCompletedState(markTaskBtn, taskCard);
  }

  if (markTaskBtn) {
    markTaskBtn.addEventListener("click", () => {
      localStorage.setItem(STORAGE_KEYS.TASK_DONE, "true");
      setTaskCompletedState(markTaskBtn, taskCard);
      // Give bonus score feedback
      alert("🎉 Great Job! Today's practical marketing task has been recorded.");
      updateDashboardMetrics();
    });
  }
}

function setTaskCompletedState(button, card) {
  button.innerHTML = `<i class="fa-solid fa-circle-check"></i> Completed`;
  button.disabled = true;
  button.classList.remove("btn-accent");
  button.classList.add("btn-outline");
  card.style.opacity = "0.85";
  card.style.borderLeftColor = "var(--success)";
}

function updateDashboardMetrics() {
  const overallProgEl = document.getElementById("dashOverallProgress");
  const overallBarEl = document.getElementById("dashOverallProgressBar");
  const completedCountEl = document.getElementById("dashCompletedCount");
  const scoreDisplayEl = document.getElementById("dashGrowthScoreDisplay");

  const progressData = getStoredCourseProgress();
  const totalLessons = 17; // c1:4 + c2:5 + c3:4 + c4:4
  const completedLessons = progressData.c1 + progressData.c2 + progressData.c3 + progressData.c4;

  const pct = Math.round((completedLessons / totalLessons) * 100);

  if (overallProgEl) overallProgEl.textContent = `${pct}%`;
  if (overallBarEl) overallBarEl.style.width = `${pct}%`;
  if (completedCountEl) completedCountEl.textContent = `${completedLessons} / ${totalLessons}`;

  // Read simulator score if stored, else fallback
  const storedScore = localStorage.getItem("bizboost_last_score") || "74";
  if (scoreDisplayEl) {
    scoreDisplayEl.textContent = `${storedScore} / 100`;
  }
}

/* ---------------------------------------------------
   4. Course Learning & Progress Tracking
   --------------------------------------------------- */
const DEFAULT_COURSE_PROGRESS = {
  c1: 3, // Digital Marketing Fundamentals (out of 4)
  c2: 2, // Social Media Marketing (out of 5)
  c3: 1, // WhatsApp Marketing (out of 4)
  c4: 0  // Content Creation (out of 4)
};

const COURSE_TOTALS = { c1: 4, c2: 5, c3: 4, c4: 4 };

function getStoredCourseProgress() {
  const data = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSE_PROGRESS));
    return { ...DEFAULT_COURSE_PROGRESS };
  }
  return JSON.parse(data);
}

function initCoursesProgress() {
  renderCourseProgressBars();
}

function renderCourseProgressBars() {
  const progress = getStoredCourseProgress();

  for (let key in COURSE_TOTALS) {
    const total = COURSE_TOTALS[key];
    const current = progress[key] || 0;
    const pct = Math.round((current / total) * 100);

    const pctLabel = document.getElementById(`${key}-pct`);
    const progressBar = document.getElementById(`${key}-bar`);

    if (pctLabel) pctLabel.textContent = `${pct}%`;
    if (progressBar) progressBar.style.width = `${pct}%`;
  }
}

// Global scope for HTML button onclick handler
window.toggleCourseProgress = function(courseId) {
  const progress = getStoredCourseProgress();
  const max = COURSE_TOTALS[courseId];

  if (progress[courseId] < max) {
    progress[courseId] += 1;
    alert(`Progress updated! You have completed Lesson ${progress[courseId]} of ${max}.`);
  } else {
    // Reset to demo looping
    progress[courseId] = 0;
    alert(`Course completed and reset for review!`);
  }

  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(progress));
  renderCourseProgressBars();
  updateDashboardMetrics();
};

/* ---------------------------------------------------
   5. Business Growth Simulator (Interactive Algorithm)
   --------------------------------------------------- */
function initGrowthSimulator() {
  const form = document.getElementById("growthSimulatorForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const bizType = document.getElementById("simBizType").value;
    const customers = parseInt(document.getElementById("simCustomers").value, 10) || 0;
    const followers = parseInt(document.getElementById("simFollowers").value, 10) || 0;
    const budget = parseInt(document.getElementById("simBudget").value, 10) || 0;
    const presence = document.getElementById("simPresence").value;
    const experience = document.getElementById("simExperience").value;
    const goal = document.getElementById("simGoal").value;

    // Calculate score (0 - 100)
    let score = 30; // base score

    if (followers > 500) score += 15;
    else if (followers > 100) score += 10;
    else score += 5;

    if (customers > 200) score += 15;
    else if (customers > 50) score += 10;
    else score += 5;

    if (budget >= 5000) score += 15;
    else if (budget >= 1500) score += 10;
    else score += 5;

    if (presence === "Website + Social Media") score += 15;
    else if (presence === "Instagram + Facebook") score += 10;
    else if (presence === "Instagram only") score += 6;
    else score += 2;

    if (experience === "Advanced") score += 10;
    else if (experience === "Intermediate") score += 7;
    else score += 4;

    // Normalizing between 35 and 95 for realistic demo
    score = Math.min(Math.max(score, 38), 94);

    // Save latest score in localStorage
    localStorage.setItem("bizboost_last_score", score.toString());

    // Render result
    displaySimulatorResults(score, bizType, presence, experience, goal, budget);
  });
}

function displaySimulatorResults(score, bizType, presence, experience, goal, budget) {
  const resultWrap = document.getElementById("simulatorResultWrap");
  const scoreNum = document.getElementById("growthScoreNum");
  const summaryPara = document.getElementById("scoreSummaryPara");

  if (!resultWrap || !scoreNum) return;

  scoreNum.textContent = score;
  summaryPara.innerHTML = `
    Your <strong>${escapeHtml(bizType)}</strong> business scored <strong>${score}/100</strong>. 
    With your target goal to <em>"${escapeHtml(goal)}"</em> and current setup (<em>${escapeHtml(presence)}</em>), 
    we have tailored a structured 4-week roadmap to maximize your local market dominance.
  `;

  // Dynamic recommendations for Week 1 to 4
  const week1 = [
    `Audit and re-brand your ${presence.includes("Instagram") ? "Instagram Business profile" : "primary online page"} with high-resolution logos.`,
    `Write a direct bio highlighting your business specialty in ${bizType}.`,
    `Publish full address, operating hours, and a direct WhatsApp click-to-chat link.`,
    `Upload 3 introductory showcase photos of bestselling items.`
  ];

  const week2 = [
    `Draft 3 educational posts answering the top questions customers ask in ${bizType}.`,
    `Record 2 unpolished, authentic mobile videos showcasing behind-the-scenes or product packaging.`,
    `Design a simple Monday-to-Friday content rhythm so you never run out of concepts.`
  ];

  const week3 = [
    `Set up a WhatsApp Business Product Catalog with accurate prices and descriptions.`,
    `Engage daily: Spend 10 minutes replying to direct inquiries and thanking commenters.`,
    `Offer a small digital voucher or loyalty stamp to in-store customers who mention your social pages.`
  ];

  const week4 = [
    budget > 1000 
      ? `Allocate ₹${Math.round(budget * 0.4)} toward a targeted geo-local Instagram post to reach customers within a 5 km radius.`
      : `Host a collaborative giveaway or cross-promotion with another non-competing local vendor.`,
    `Review which post earned the highest saves and inquiries to replicate its formula.`,
    `Collect 5 genuine Google or WhatsApp reviews to establish solid social proof.`
  ];

  populateList("week1List", week1);
  populateList("week2List", week2);
  populateList("week3List", week3);
  populateList("week4List", week4);

  resultWrap.style.display = "block";
  resultWrap.scrollIntoView({ behavior: "smooth" });
}

function populateList(elementId, items) {
  const list = document.getElementById(elementId);
  if (!list) return;
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

/* ---------------------------------------------------
   6. Marketing Mini-Tools (Caption, Hashtag, Ideas)
   --------------------------------------------------- */
function initMarketingMiniTools() {
  // Caption Generator
  const btnGenCaption = document.getElementById("btnGenCaption");
  if (btnGenCaption) {
    btnGenCaption.addEventListener("click", () => {
      const product = document.getElementById("capProduct").value.trim() || "Fresh Arrivals";
      const audience = document.getElementById("capAudience").value.trim() || "Smart Shoppers";
      const tone = document.getElementById("capTone").value;
      const resultBox = document.getElementById("captionResult");
      const resultText = document.getElementById("captionResultText");

      let caption = "";
      if (tone === "Exciting") {
        caption = `🔥 Upgrade Alert for all ${audience}! Discover our brand-new ${product} designed to make your day better. Available at limited launch prices today! Tap the link in bio or WhatsApp us to claim yours now! 🚀✨`;
      } else if (tone === "Professional") {
        caption = `Quality meets reliability. We are pleased to present our latest ${product}, curated specifically for ${audience}. Designed for durability, value, and customer satisfaction. Visit our store or message us for detailed specifications.`;
      } else {
        caption = `Hey ${audience}! 👋 Looking for the perfect ${product}? We've got something special handcrafted just for you. Drop by our store or send a DM—we are always happy to help you find your match! ☕💛`;
      }

      resultText.textContent = caption;
      resultBox.style.display = "block";
    });
  }

  // Hashtag Generator
  const btnGenHashtag = document.getElementById("btnGenHashtag");
  if (btnGenHashtag) {
    btnGenHashtag.addEventListener("click", () => {
      const category = document.getElementById("hashCategory").value;
      const resultBox = document.getElementById("hashtagResult");
      const badgesContainer = document.getElementById("hashtagBadges");

      const tagMap = {
        Clothing: ["#LocalFashion", "#IndianWear", "#OOTDIndia", "#BoutiqueFinds", "#StyleDaily", "#SmallBusinessIndia", "#ClothingBrand"],
        Food: ["#FoodieVibes", "#LocalCafe", "#BakersOfInstagram", "#FreshEats", "#FoodLove", "#StreetEats", "#HomeCookedTaste"],
        Beauty: ["#GlowUp", "#SkincareRoutine", "#SalonStyle", "#SelfCareIndia", "#BeautyTips", "#HealthySkin", "#LocalSalon"],
        Retail: ["#ShopSmall", "#SupportLocal", "#HandmadeGoodies", "#RetailTherapy", "#QualityGoods", "#HomeDecorIndia"],
        Services: ["#ProfessionalService", "#TrustedExperts", "#LocalRepairs", "#CustomerFirst", "#SmallBizSupport"]
      };

      const tags = tagMap[category] || tagMap.Retail;
      badgesContainer.innerHTML = "";
      tags.forEach(t => {
        const span = document.createElement("span");
        span.className = "tag-pill";
        span.textContent = t;
        badgesContainer.appendChild(span);
      });

      resultBox.style.display = "block";
    });
  }

  // Content Idea Generator
  const btnGenIdeas = document.getElementById("btnGenIdeas");
  if (btnGenIdeas) {
    btnGenIdeas.addEventListener("click", () => {
      const category = document.getElementById("ideaCategory").value;
      const resultBox = document.getElementById("ideasResult");
      const ideasList = document.getElementById("ideasList");

      const ideaMap = {
        Clothing: [
          "“3 Ways to Style” 15-second reel featuring a single versatile garment.",
          "Customer spotlight wearing your collection at an event.",
          "Behind the seams: How fabrics are sourced and selected for comfort.",
          "Quick poll: Which color option would you wear this weekend?",
          "Packing an order video with personal thank-you notes."
        ],
        Food: [
          "Morning prep routine reel before opening the kitchen/bakery.",
          "Close-up video capturing the sizzle/frosting process of your top dessert.",
          "Introducing the team member behind your special recipes.",
          "“Order of the Day”: Answering why a particular dish is beloved.",
          "Weekend discount announcement exclusively for WhatsApp VIP members."
        ],
        Beauty: [
          "Before vs. After client glow-up clip (with permission).",
          "Common ingredient debunked: What actually benefits dry or oily skin.",
          "Tools of the trade: How we sanitize and sterilize equipment daily.",
          "Mini tutorial: Fast 3-minute evening self-care routine.",
          "Weekly Q&A answering follower beauty questions."
        ],
        Retail: [
          "Unboxing new stock inventory that just arrived in store.",
          "Staff pick of the week and why it's a customer favorite.",
          "Comparison guide: Budget option vs. Premium selection.",
          "How to properly clean and maintain this item at home.",
          "Tour of the store aisles for shoppers exploring nearby."
        ],
        Services: [
          "Case study: How we fixed a client's problem in under 2 hours.",
          "3 subtle warning signs that your equipment or setup needs servicing.",
          "Checklist of things to verify before hiring any local contractor.",
          "Customer review quote displayed over photo of finished work.",
          "A day in the life of our on-field service technician."
        ]
      };

      const ideas = ideaMap[category] || ideaMap.Retail;
      ideasList.innerHTML = "";
      ideas.forEach(idea => {
        const li = document.createElement("li");
        li.textContent = idea;
        ideasList.appendChild(li);
      });

      resultBox.style.display = "block";
    });
  }
}

// Global helper for clipboard
window.copyToClipboard = function(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  const text = el.innerText || el.textContent;
  navigator.clipboard.writeText(text).then(() => {
    alert("Copied to clipboard!");
  }).catch(() => {
    alert("Copying failed. Please highlight and copy manually.");
  });
};

/* ---------------------------------------------------
   7. FAQ Accordion
   --------------------------------------------------- */
function initFaqAccordion() {
  const accHeaders = document.querySelectorAll(".accordion-header");
  accHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const content = header.nextElementSibling;
      const isOpen = content.classList.contains("open");

      // Close all open accordions for tidy view
      document.querySelectorAll(".accordion-content").forEach(c => c.classList.remove("open"));
      document.querySelectorAll(".accordion-header").forEach(h => h.classList.remove("active"));

      if (!isOpen) {
        header.classList.add("active");
        content.classList.add("open");
      }
    });
  });
}

/* ---------------------------------------------------
   8. Contact Form
   --------------------------------------------------- */
function initContactForm() {
  const form = document.getElementById("contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();
    const alertBox = document.getElementById("contactAlert");

    // Validation
    let hasErr = false;
    document.querySelectorAll(".error-msg").forEach(el => el.textContent = "");

    if (!name) {
      document.getElementById("contactNameError").textContent = "Name is required.";
      hasErr = true;
    }
    if (!email || !email.includes("@")) {
      document.getElementById("contactEmailError").textContent = "Valid email is required.";
      hasErr = true;
    }
    if (!message) {
      document.getElementById("contactMessageError").textContent = "Message cannot be empty.";
      hasErr = true;
    }

    if (!hasErr) {
      showAlert(alertBox, "Thanks — your message was recorded in this browser demo. No email was sent.", "alert-success");
      form.reset();
    }
  });
}

/* ---------------------------------------------------
   Security / Helper Utility
   --------------------------------------------------- */
function localPasswordHash(password) {
  // Static-demo credential protection only. This is NOT a replacement for server authentication.
  let hash = 2166136261;
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function escapeHtml(string) {
  if (!string) return "";
  return String(string)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
