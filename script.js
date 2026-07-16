/**
 * Nick Canizalez portfolio — page behavior.
 *
 * Everything below is grouped into small init*() functions, one per feature,
 * each self-contained (queries its own elements, bails out early if they're
 * missing). They're all invoked once, in order, at the bottom of the file.
 * This script is loaded at the end of <body>, so the DOM is already parsed —
 * no DOMContentLoaded wrapper is needed.
 */

// ---------------------------------------------------------------------------
// Boot loader — shown once per browser session, then dismissed.
// ---------------------------------------------------------------------------
function initBootLoader() {
  const bootLoader = document.getElementById("bootLoader");
  if (!bootLoader) return;

  const alreadySeen = sessionStorage.getItem("nickPortfolioBootSeen");

  if (alreadySeen) {
    bootLoader.classList.add("hidden");
    return;
  }

  sessionStorage.setItem("nickPortfolioBootSeen", "true");
  window.addEventListener("load", () => {
    setTimeout(() => bootLoader.classList.add("hidden"), 1250);
  });
}

// ---------------------------------------------------------------------------
// Footer year stamp.
// ---------------------------------------------------------------------------
function initYearStamp() {
  const year = document.getElementById("year");
  if (!year) return;

  year.textContent = new Date().getFullYear();
}

// ---------------------------------------------------------------------------
// Light/dark theme toggle, persisted to localStorage and synced across tabs.
// ---------------------------------------------------------------------------
function initThemeToggle() {
  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = themeToggle?.querySelector(".theme-label");
  const THEME_STORAGE_KEY = "nickPortfolioTheme";

  function updateThemeToggle(theme) {
    if (!themeToggle) return;

    const isLight = theme === "light";
    const nextTheme = isLight ? "dark" : "light";

    themeToggle.setAttribute("aria-label", `Switch to ${nextTheme} theme`);
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.title = `Switch to ${nextTheme} theme`;

    if (themeLabel) {
      themeLabel.textContent = isLight ? "Dark" : "Light";
    }
  }

  function setTheme(theme, { persist = false } = {}) {
    const safeTheme = theme === "light" ? "light" : "dark";

    root.dataset.theme = safeTheme;
    root.style.colorScheme = safeTheme;
    updateThemeToggle(safeTheme);

    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
      } catch (error) {
        // The theme still works for this page when browser storage is unavailable.
      }
    }
  }

  setTheme(root.dataset.theme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "light" ? "dark" : "light";

      root.classList.add("theme-changing");
      setTheme(nextTheme, { persist: true });

      window.setTimeout(() => {
        root.classList.remove("theme-changing");
      }, 320);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key === THEME_STORAGE_KEY && (event.newValue === "light" || event.newValue === "dark")) {
      setTheme(event.newValue);
    }
  });
}

// ---------------------------------------------------------------------------
// Exposes scroll position as a CSS custom property for the parallax background.
// ---------------------------------------------------------------------------
function initScrollBackgroundVar() {
  const root = document.documentElement;
  let ticking = false;

  function updateScrollBackground() {
    root.style.setProperty("--scrollY", window.scrollY);
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollBackground);
      ticking = true;
    }
  }, { passive: true });

  updateScrollBackground();
}

// ---------------------------------------------------------------------------
// Mobile nav menu: open/close toggle, closes on link click, outside click,
// or resize back to desktop width.
// ---------------------------------------------------------------------------
function initMobileMenu() {
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!mobileMenuToggle || !navLinks) return { closeMobileMenu: () => {} };

  function closeMobileMenu() {
    navLinks.classList.remove("open");
    mobileMenuToggle.classList.remove("open");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
    mobileMenuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  function toggleMobileMenu(event) {
    event.stopPropagation();

    const isOpen = navLinks.classList.toggle("open");
    mobileMenuToggle.classList.toggle("open", isOpen);
    mobileMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    mobileMenuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  }

  mobileMenuToggle.addEventListener("click", toggleMobileMenu);

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("click", (event) => {
    if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) {
      closeMobileMenu();
    }
  });

  // Returned so initEscapeKeyHandler() can close the menu on Escape too.
  return { closeMobileMenu };
}

// ---------------------------------------------------------------------------
// Fade/slide-in reveal animation for elements marked .reveal, on scroll into view.
// ---------------------------------------------------------------------------
function initRevealAnimations() {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.12 });

  reveals.forEach((item) => observer.observe(item));
}

// ---------------------------------------------------------------------------
// Project detail modal: content + open/close wiring.
// ---------------------------------------------------------------------------
const projectData = {
  unity: {
    title: "3D Unity Game",
    summary: "A hands-on C# and Unity project focused on building real gameplay systems instead of only small practice scripts.",
    details: [
      "Built and debugged gameplay systems for health, damage, upgrades, camera control, experience, and player progression.",
      "Worked through practical game development problems like melee detection, enemy targeting, stat scaling, UI updates, and version control.",
      "Used GitHub to track project changes and continue improving the codebase over time."
    ],
    tags: ["Unity", "C#", "Gameplay Systems", "GitHub"]
  },
  server: {
    title: "Home Media Server & Network Services",
    summary: "A Linux home lab built around self-hosted media, storage, network services, and practical infrastructure administration.",
    details: [
      "Built and maintain a Linux-based Jellyfin server with multi-drive storage, mounted filesystems, network shares, permissions, and remote administration.",
      "Configured Intel Quick Sync hardware acceleration to improve video transcoding efficiency across supported playback devices.",
      "Deployed Pi-hole as the home network's DNS resolver and filtering layer, using blocklists to reduce ads and tracking across connected devices."
    ],
    tags: ["Jellyfin", "Linux", "Pi-hole", "Networking"]
  },
  automation: {
    title: "Internal Procedure Automation",
    summary: "Workplace automation focused on reducing repetitive internal tasks and making tracking workflows cleaner.",
    details: [
      "Developed scripts for internal procedures, including TV tracking and data input workflows.",
      "Used MAC-based network identification to support more consistent tracking and device-related processes.",
      "Focused on practical process improvement rather than automation for automation's sake."
    ],
    tags: ["Scripting", "Process Automation", "Data Input", "MAC Tracking"]
  },
  servicenow: {
    title: "ServiceNow Smart Door Helper",
    summary: "A local helper concept for inspecting ServiceNow tickets and preparing safe, reviewable recommendations.",
    details: [
      "Designed around operator review instead of automatic ticket submission.",
      "Built around the idea of extracting ticket details, suggesting categories, and drafting work notes or customer replies.",
      "Explored Python, FastAPI, browser automation, and local AI-assisted workflows."
    ],
    tags: ["Python", "FastAPI", "Playwright", "Automation"]
  }
};

function initProjectModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return { closeProjectModal: () => {} };

  const modalTitle = document.getElementById("modalTitle");
  const modalSummary = document.getElementById("modalSummary");
  const modalDetails = document.getElementById("modalDetails");
  const modalTags = document.getElementById("modalTags");
  const modalClose = document.getElementById("modalClose");

  function openProjectModal(projectKey) {
    const project = projectData[projectKey];
    if (!project) return;

    modalTitle.textContent = project.title;
    modalSummary.textContent = project.summary;
    modalDetails.innerHTML = project.details.map((detail) => `<li>${detail}</li>`).join("");
    modalTags.innerHTML = project.tags.map((tag) => `<span class="tag">${tag}</span>`).join("");

    modal.classList.remove("closing");
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeProjectModal() {
    if (!modal.classList.contains("open") || modal.classList.contains("closing")) return;

    modal.classList.add("closing");

    setTimeout(() => {
      modal.classList.remove("open", "closing");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }, 250);
  }

  document.querySelectorAll("[data-project]").forEach((button) => {
    button.addEventListener("click", () => openProjectModal(button.dataset.project));
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeProjectModal);
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeProjectModal();
    }
  });

  // Returned so initEscapeKeyHandler() can close the modal on Escape too.
  return { closeProjectModal };
}

// ---------------------------------------------------------------------------
// Escape key closes whichever overlay (modal / mobile menu) is open.
// ---------------------------------------------------------------------------
function initEscapeKeyHandler({ closeProjectModal, closeMobileMenu }) {
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
      closeMobileMenu();
    }
  });
}

// ---------------------------------------------------------------------------
// Cinematic homepage animation + pinned "story" scroll section (GSAP/ScrollTrigger).
// Degrades gracefully: still sets the first story card active even if GSAP
// hasn't loaded, and skips all motion entirely under prefers-reduced-motion.
// ---------------------------------------------------------------------------
function initCinematicScroll() {
  const hasGsap = typeof gsap !== "undefined";
  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const storySection = document.querySelector(".story-pin-section");
  const storyWrap = document.querySelector(".story-pin-wrap");
  const steps = Array.from(document.querySelectorAll(".story-step"));
  const cards = Array.from(document.querySelectorAll(".story-visual-card"));
  const progressRail = document.querySelector(".story-progress-rail span");

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setActiveStory(index) {
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });

    cards.forEach((card, cardIndex) => {
      card.classList.toggle("active", cardIndex === index);
    });
  }

  if (steps.length && cards.length) {
    setActiveStory(0);
  }

  if (!hasGsap || reducedMotion) {
    return;
  }

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // The hero only animates on page load. It is not scrubbed by scroll.
  gsap.fromTo(".cinematic-intro, .cinematic-name",
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", delay: 0.08, clearProps: "transform" }
  );

  gsap.fromTo(".cinematic-subtitle, .cinematic-actions, .cinematic-eyebrow",
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.75, stagger: 0.09, ease: "power2.out", delay: 0.38, clearProps: "transform" }
  );

  gsap.fromTo(".device-glass-card",
    { opacity: 0, y: 34, rotateX: 10, rotateY: -14, scale: 0.95 },
    { opacity: 1, y: 0, rotateX: 5, rotateY: -8, scale: 1, duration: 0.9, ease: "power3.out", delay: 0.45, clearProps: "opacity" }
  );

  if (!hasScrollTrigger || !storySection || !storyWrap || !steps.length || !cards.length) {
    return;
  }

  const desktopQuery = window.matchMedia("(min-width: 901px)");

  function setupPinnedStory() {
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars && trigger.vars.id === "story-pin") {
        trigger.kill(true);
      }
    });

    storySection.style.setProperty("--story-progress", "0");
    if (progressRail) progressRail.style.width = "0%";
    setActiveStory(0);

    if (!desktopQuery.matches) {
      storyWrap.style.clearProperty("transform");
      storyWrap.style.clearProperty("position");
      return;
    }

    ScrollTrigger.create({
      id: "story-pin",
      trigger: storySection,
      start: "top top+=110",
      end: () => "+=" + Math.min(Math.max(window.innerHeight * 2.9, 1650), 2450),
      pin: storyWrap,
      pinSpacing: true,
      scrub: 0.85,
      anticipatePin: 0.75,
      invalidateOnRefresh: true,
      snap: {
        snapTo(value) {
          const maxIndex = Math.max(steps.length - 1, 1);
          return Math.round(value * maxIndex) / maxIndex;
        },
        duration: { min: 0.12, max: 0.24 },
        delay: 0.045,
        ease: "power1.inOut"
      },
      onUpdate(self) {
        const maxIndex = steps.length - 1;
        const progress = clamp(self.progress, 0, 1);
        const activeIndex = clamp(Math.round(progress * maxIndex), 0, maxIndex);

        setActiveStory(activeIndex);
        storySection.style.setProperty("--story-progress", progress.toFixed(4));
        if (progressRail) {
          progressRail.style.width = `${progress * 100}%`;
        }
      }
    });
  }

  let storyResizeTimer;

  function refreshPinnedStory() {
    setupPinnedStory();
    ScrollTrigger.refresh();
  }

  refreshPinnedStory();

  window.addEventListener("resize", () => {
    window.clearTimeout(storyResizeTimer);
    storyResizeTimer = window.setTimeout(refreshPinnedStory, 150);
  });

  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  }, { once: true });
}

// ---------------------------------------------------------------------------
// Cat companion that peeks over the pinned story panel while it's in view:
// entrance/exit pop animation, idle blink loop, respects reduced-motion.
// ---------------------------------------------------------------------------
function initStoryCatCompanion() {
  const stage = document.querySelector(".story-visual-stage");
  const catWindow = stage?.querySelector(".story-cat-window");
  const cat = stage?.querySelector(".story-cat-companion");

  if (!stage || !catWindow || !cat) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let isVisible = false;
  let blinkTimer;
  let blinkEndTimer;
  let popTimer;
  let entranceTimer;
  let exitTimer;

  function clearCatTimers() {
    window.clearTimeout(blinkTimer);
    window.clearTimeout(blinkEndTimer);
    window.clearTimeout(popTimer);
    window.clearTimeout(entranceTimer);
    window.clearTimeout(exitTimer);
  }

  function triggerPop() {
    if (reducedMotion) return;

    catWindow.classList.remove("is-popping");
    void catWindow.offsetWidth;
    catWindow.classList.add("is-popping");

    window.clearTimeout(popTimer);
    popTimer = window.setTimeout(() => {
      catWindow.classList.remove("is-popping");
    }, 520);
  }

  function scheduleBlink() {
    window.clearTimeout(blinkTimer);
    if (!isVisible || reducedMotion) return;

    const delay = 8000 + Math.random() * 8000;
    blinkTimer = window.setTimeout(() => {
      if (!isVisible) return;

      cat.classList.add("is-blinking");
      blinkEndTimer = window.setTimeout(() => {
        cat.classList.remove("is-blinking");
        scheduleBlink();
      }, 150);
    }, delay);
  }

  function showCat() {
    if (isVisible) return;
    isVisible = true;

    window.clearTimeout(exitTimer);
    cat.classList.add("is-visible");

    if (!reducedMotion) {
      cat.classList.add("is-entering");
      triggerPop();
      entranceTimer = window.setTimeout(() => {
        cat.classList.remove("is-entering");
      }, 700);
    }

    scheduleBlink();
  }

  function hideCat() {
    if (!isVisible) return;
    isVisible = false;

    window.clearTimeout(blinkTimer);
    window.clearTimeout(blinkEndTimer);
    cat.classList.remove("is-blinking", "is-entering");

    if (reducedMotion) {
      cat.classList.remove("is-visible");
      return;
    }

    triggerPop();
    exitTimer = window.setTimeout(() => {
      cat.classList.remove("is-visible");
    }, 180);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
        showCat();
      } else {
        hideCat();
      }
    });
  }, {
    threshold: [0, 0.18],
    rootMargin: "-8% 0px -8% 0px"
  });

  observer.observe(stage);

  window.addEventListener("pagehide", () => {
    observer.disconnect();
    clearCatTimers();
  }, { once: true });
}

// ---------------------------------------------------------------------------
// Run everything, in the same order the original inline script did.
// ---------------------------------------------------------------------------
initBootLoader();
initYearStamp();
initThemeToggle();
initScrollBackgroundVar();
const { closeMobileMenu } = initMobileMenu();
initRevealAnimations();
const { closeProjectModal } = initProjectModal();
initEscapeKeyHandler({ closeProjectModal, closeMobileMenu });
initCinematicScroll();
initStoryCatCompanion();