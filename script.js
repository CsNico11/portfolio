const bootLoader = document.getElementById("bootLoader");
const shouldShowBootLoader = !sessionStorage.getItem("nickPortfolioBootSeen");

if (bootLoader) {
  if (!shouldShowBootLoader) {
    bootLoader.classList.add("hidden");
  } else {
    sessionStorage.setItem("nickPortfolioBootSeen", "true");
    window.addEventListener("load", () => {
      setTimeout(() => {
        bootLoader.classList.add("hidden");
      }, 1250);
    });
  }
}

const year = document.getElementById("year");
if (year) {
  year.textContent = new Date().getFullYear();
}

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

const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const navLinks = document.getElementById("navLinks");

function closeMobileMenu() {
  if (!navLinks || !mobileMenuToggle) return;

  navLinks.classList.remove("open");
  mobileMenuToggle.classList.remove("open");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
  mobileMenuToggle.setAttribute("aria-label", "Open navigation menu");
}

function toggleMobileMenu(event) {
  event.stopPropagation();
  if (!navLinks || !mobileMenuToggle) return;

  const isOpen = navLinks.classList.toggle("open");
  mobileMenuToggle.classList.toggle("open", isOpen);
  mobileMenuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  mobileMenuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
}

if (mobileMenuToggle && navLinks) {
  mobileMenuToggle.addEventListener("click", toggleMobileMenu);

  navLinks.addEventListener("click", (event) => {
    event.stopPropagation();
  });

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
}

const reveals = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, { threshold: 0.12 });

reveals.forEach((item) => observer.observe(item));

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
    title: "Home Media Server & Automation",
    summary: "A home lab project built around networking, remote access, automation, and practical system control.",
    details: [
      "Configured a home lab environment using static IPs, bridge networking, and remote access tools.",
      "Used Python scripts with Home Assistant to automate device tasks and schedule power cycles.",
      "Gained hands-on experience with Linux services, remote administration, and basic infrastructure troubleshooting."
    ],
    tags: ["Python", "Linux", "Home Assistant", "Networking"]
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

const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalSummary = document.getElementById("modalSummary");
const modalDetails = document.getElementById("modalDetails");
const modalTags = document.getElementById("modalTags");
const modalClose = document.getElementById("modalClose");

function openProjectModal(projectKey) {
  const project = projectData[projectKey];
  if (!project || !modal) return;

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
  if (!modal || !modal.classList.contains("open") || modal.classList.contains("closing")) return;

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

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeProjectModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
    closeMobileMenu();
  }
});