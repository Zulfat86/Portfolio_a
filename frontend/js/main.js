// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const API = {
  prod:  "https://portfolio-a-ce4h.onrender.com",
  local: "http://localhost:8000/api/contact",
};

const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? API.local
  : API.prod;

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Skills
// ─────────────────────────────────────────────────────────────────────────────
const skills = [
  { name: "HTML & CSS",         icon: "fab fa-html5",     pct: 95 },
  { name: "Python",             icon: "fab fa-python",    pct: 88 },
  { name: "Django",             icon: "fas fa-server",    pct: 80 },
  { name: "Power BI",           icon: "fas fa-chart-pie", pct: 85 },
  { name: "Git & GitHub",       icon: "fab fa-github",    pct: 85 },
  { name: "Machine Learning",   icon: "fas fa-brain",     pct: 78 },
  { name: "SQL & Databases",    icon: "fas fa-database",  pct: 80 },
  { name: "Data Visualization", icon: "fas fa-chart-line",pct: 88 },
];

// ─────────────────────────────────────────────────────────────────────────────
// DATA — Projects
// ─────────────────────────────────────────────────────────────────────────────
const projects = [
  {
    image: "images/sales-dashboard.png",
    title: "Sales Dashboard",
    desc:  "Interactive Power BI dashboard visualizing monthly sales performance and customer segmentation.",
    tags:  ["Power BI", "DAX", "Analytics"],
    year:  "2026",
  },
  {
    image: "images/agent-dashboard.png",
    title: "Agent Transaction Dashboard",
    desc:  "Power BI dashboard for PBZ agent transaction performance with KPIs and trend analysis.",
    tags:  ["Power BI", "Banking", "KPIs"],
    year:  "2025",
  },
  {
    image: "images/istockphoto-2177607223-1024x1024.jpg",
    title: "House Price Prediction",
    desc:  "Django web app predicting house prices using the California housing dataset and regression models.",
    tags:  ["Django", "Python", "ML"],
    year:  "2026",
  },
  {
    icon:  "fas fa-globe",
    title: "Portfolio Website",
    desc:  "Responsive portfolio website built with Bootstrap, CSS and JavaScript to showcase my projects.",
    tags:  ["Bootstrap", "JS", "CSS"],
    year:  "2026",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RENDER — Skills grid
// ─────────────────────────────────────────────────────────────────────────────
const skillsGrid = document.getElementById("skillsGrid");

skills.forEach(({ icon, name, pct }) => {
  skillsGrid.insertAdjacentHTML(
    "beforeend",
    `<div class="col-md-6 reveal">
      <div class="skill-card">
        <div class="skill-head">
          <div><i class="${icon}"></i><span class="ms-2 fw-semibold">${name}</span></div>
        </div>
        <div class="progress">
          <div class="progress-bar" data-pct="${pct}"></div>
        </div>
      </div>
    </div>`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// RENDER — Projects grid
// ─────────────────────────────────────────────────────────────────────────────
const projectsGrid = document.getElementById("projectsGrid");

projects.forEach(({ image, icon, title, desc, tags, year }) => {
  const thumb = image
    ? `<div class="project-thumb has-img" style="background-image:url('${image}')"></div>`
    : `<div class="project-thumb"><i class="${icon}"></i></div>`;

  const tagHTML = tags.map((t) => `<span class="tag">${t}</span>`).join("");

  projectsGrid.insertAdjacentHTML(
    "beforeend",
    `<div class="col-md-6 col-lg-4 reveal">
      <div class="project-card h-100">
        ${thumb}
        <div class="project-body">
          <span class="tag mb-2">${year}</span>
          <h4 class="mt-2">${title}</h4>
          <p class="text-muted-c">${desc}</p>
          <div>${tagHTML}</div>
        </div>
      </div>
    </div>`,
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION — Scroll reveal + progress bars
// ─────────────────────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("visible");

      entry.target.querySelectorAll(".progress-bar").forEach((bar) => {
        bar.style.width = bar.dataset.pct + "%";
      });

      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 },
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────────────────────────────────────
const form    = document.getElementById("contactForm");
const status  = document.getElementById("formStatus");
const btnText = document.getElementById("btnText");

const setStatus = (text, type) => {
  status.textContent = text;
  status.className   = `mt-3 ${type}`;
};

const setBtn = (sending) => {
  btnText.innerHTML = sending
    ? '<i class="fas fa-spinner fa-spin"></i> Sending...'
    : '<i class="fas fa-paper-plane"></i> Send Message';
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("", "");
  setBtn(true);

  const payload = Object.fromEntries(new FormData(form));

  try {
    const res  = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to send message");

    setStatus("✓ Message sent! I'll get back to you soon.", "success");
    form.reset();
  } catch (err) {
    const msg = err.message.includes("Failed to fetch")
      ? "✗ Could not reach the server. Please try again later."
      : `✗ ${err.message}`;
    setStatus(msg, "error");
  } finally {
    setBtn(false);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// NAV — Active link on scroll
// ─────────────────────────────────────────────────────────────────────────────
const navLinks = document.querySelectorAll(".custom-nav .nav-link");

window.addEventListener("scroll", () => {
  const scrollY = window.scrollY + 120;

  document.querySelectorAll("section").forEach((sec) => {
    const inView = sec.offsetTop <= scrollY && sec.offsetTop + sec.offsetHeight > scrollY;

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${sec.id}`) {
        link.classList.toggle("active", inView);
      }
    });
  });
});
