// === CONFIG ===
// AUTO-DETECT: uses localhost backend when developing, Render backend when live.
// After deploying to Render, replace PROD_API_URL with your actual service URL.
const PROD_API_URL = "https://portfolio-api.onrender.com/api/contact";
const LOCAL_API_URL = "http://localhost:8000/api/contact";
const API_URL = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? LOCAL_API_URL
  : PROD_API_URL;

// === SKILLS DATA ===
const skills = [
  { name: "HTML & CSS",        icon: "fab fa-html5",    pct: 95 },
  { name: "Python",            icon: "fab fa-python",   pct: 88 },
  { name: "Django",            icon: "fas fa-server",   pct: 80 },
  { name: "Power BI",          icon: "fas fa-chart-pie", pct: 85 },
  { name: "Git & GitHub",      icon: "fab fa-github",   pct: 85 },
  { name: "Machine Learning",  icon: "fas fa-brain",    pct: 78 },
  { name: "SQL & Databases",   icon: "fas fa-database", pct: 80 },
  { name: "Data Visualization",icon: "fas fa-chart-line",pct: 88 },
];

// === PROJECTS DATA ===
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

// === RENDER SKILLS ===
const skillsGrid = document.getElementById("skillsGrid");
skills.forEach((s) => {
  skillsGrid.insertAdjacentHTML(
    "beforeend",
    `<div class="col-md-6 reveal">
      <div class="skill-card">
        <div class="skill-head">
          <div><i class="${s.icon}"></i> <span class="ms-2 fw-semibold">${s.name}</span></div>
        </div>
        <div class="progress"><div class="progress-bar" data-pct="${s.pct}"></div></div>
      </div>
    </div>`
  );
});

// === RENDER PROJECTS ===
const projectsGrid = document.getElementById("projectsGrid");
projects.forEach((p) => {
  const thumb = p.image
    ? `<div class="project-thumb has-img" style="background-image:url('${p.image}')"></div>`
    : `<div class="project-thumb"><i class="${p.icon}"></i></div>`;
  projectsGrid.insertAdjacentHTML(
    "beforeend",
    `<div class="col-md-6 col-lg-4 reveal">
      <div class="project-card h-100">
        ${thumb}
        <div class="project-body">
          <span class="tag mb-2">${p.year}</span>
          <h4 class="mt-2">${p.title}</h4>
          <p class="text-muted-c">${p.desc}</p>
          <div>${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        </div>
      </div>
    </div>`
  );
});

// === SCROLL REVEAL + PROGRESS BAR ANIMATION ===
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        e.target.querySelectorAll(".progress-bar").forEach((bar) => {
          bar.style.width = bar.dataset.pct + "%";
        });
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// === CONTACT FORM ===
const form    = document.getElementById("contactForm");
const status  = document.getElementById("formStatus");
const btnText = document.getElementById("btnText");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "";
  status.className   = "mt-3";
  btnText.innerHTML  = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  const data = Object.fromEntries(new FormData(form));

  try {
    const res  = await fetch(API_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to send message");

    status.textContent = "✓ Message sent! I'll get back to you soon.";
    status.classList.add("success");
    form.reset();
  } catch (err) {
    const msg = err.message.includes("Failed to fetch")
      ? "✗ Could not reach the server. Please try again later."
      : "✗ " + err.message;
    status.textContent = msg;
    status.classList.add("error");
  } finally {
    btnText.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
  }
});

// === NAV ACTIVE STATE ===
const navLinks = document.querySelectorAll(".custom-nav .nav-link");
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  document.querySelectorAll("section").forEach((sec) => {
    if (sec.offsetTop <= y && sec.offsetTop + sec.offsetHeight > y) {
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + sec.id)
      );
    }
  });
});
