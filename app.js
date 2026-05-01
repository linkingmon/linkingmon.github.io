const DOMAIN_CONFIG = [
  {
    slug: "eda",
    label: "EDA",
    href: "./domains/eda/",
    sizeVariant: "lg",
    subtitle: "Routing / Optimization / Physical Design",
    intro: "Work on physical design, optimization flow, and infrastructure-level debugging across production and research settings.",
    keywords: ["routing", "optimization", "PPA", "physical design", "debugging", "infrastructure"]
  },
  {
    slug: "ic-design",
    label: "IC Design",
    href: "./domains/ic-design/",
    subtitle: "Chip Design / Graduate Research / Implementation",
    intro: "Digital IC architecture and implementation journey from coursework to tapeout-oriented project work.",
    keywords: ["architecture", "implementation", "verification", "chip project", "synthesis", "APR"]
  },
  {
    slug: "software-programming",
    label: "Programming",
    href: "./domains/software-programming/",
    subtitle: "Systems / Algorithms / Tools",
    intro: "Algorithm-heavy software engineering across C++, Python, systems tooling, and practical automation.",
    keywords: ["C++", "Python", "systems", "tools", "algorithms", "backend"]
  },
  {
    slug: "ai",
    label: "AI",
    href: "./domains/ai/",
    sizeVariant: "lg",
    subtitle: "Models / Experiments / Applied Learning",
    intro: "Applied machine learning projects including modeling, experimentation, and interpretation-focused work.",
    keywords: ["deep learning", "modeling", "training", "classification", "inference"]
  },
  {
    slug: "digital-comm",
    label: "Wireless Systems",
    href: "./domains/digital-comm/",
    subtitle: "DSP / Communication Systems / Signal Algorithms",
    intro: "Communication systems and DSP-focused projects spanning algorithm design, implementation, and analysis.",
    keywords: ["DSP", "modulation", "decoding", "beamforming", "signal processing", "communication IC"]
  },
  {
    slug: "explorations",
    label: "Explorations",
    href: "./domains/explorations/",
    subtitle: "Cross-Disciplinary Work / Research Curiosity",
    intro: "Cross-domain projects, self-study directions, and interdisciplinary work outside the core tracks.",
    keywords: ["interdisciplinary", "side projects", "academic breadth", "curiosity", "experiments"]
  }
];

const EXPLORE_LINKS = [
  { label: "Blog", href: "/blog/", external: false },
  { label: "Recipe", href: "/Recipe/site/", external: false },
  { label: "GitHub", href: "https://github.com/linkingmon", external: true },
  { label: "LinkedIn", href: "https://linkedin.com/in/linkingmon", external: true }
];

function injectHeader() {
  const host = document.querySelector(".site-header");
  if (!host) return;

  const rootPath = host.dataset.headerRoot || ".";
  host.innerHTML = `
    <div class="header-inner">
      <a class="brand" href="${rootPath}/">Yu-Cheng Lin</a>
      <nav class="explore-wrap" aria-label="Explore links">
        <button class="explore-trigger" type="button" aria-haspopup="true" aria-expanded="false" aria-controls="explore-menu">Explore</button>
        <ul id="explore-menu" class="explore-menu" role="menu"></ul>
      </nav>
    </div>
  `;

  const menu = host.querySelector("#explore-menu");
  EXPLORE_LINKS.forEach((item) => {
    const li = document.createElement("li");
    li.role = "none";

    const a = document.createElement("a");
    a.href = item.href;
    a.textContent = item.label;
    a.role = "menuitem";
    if (item.external) {
      a.target = "_blank";
      a.rel = "noreferrer noopener";
    }

    li.appendChild(a);
    menu.appendChild(li);
  });

  const wrap = host.querySelector(".explore-wrap");
  const trigger = host.querySelector(".explore-trigger");
  let closeTimer = null;

  const clearCloseTimer = () => {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = setTimeout(() => setOpen(false), 140);
  };

  const setOpen = (isOpen) => {
    trigger.setAttribute("aria-expanded", String(isOpen));
    menu.dataset.open = String(isOpen);
  };

  trigger.addEventListener("click", () => {
    setOpen(trigger.getAttribute("aria-expanded") !== "true");
  });

  wrap.addEventListener("mouseenter", () => {
    clearCloseTimer();
    setOpen(true);
  });
  wrap.addEventListener("mouseleave", scheduleClose);
  wrap.addEventListener("focusin", () => {
    clearCloseTimer();
    setOpen(true);
  });
  wrap.addEventListener("focusout", (event) => {
    if (!wrap.contains(event.relatedTarget)) scheduleClose();
  });

  document.addEventListener("click", (event) => {
    if (!wrap.contains(event.target)) {
      clearCloseTimer();
      setOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      clearCloseTimer();
      setOpen(false);
    }
  });
}

function normalizeCategory(field) {
  const map = {
    "EDA": ["eda"],
    "IC Design": ["ic-design"],
    "Programming": ["software-programming"],
    "AI": ["ai"],
    "Digital Comm.": ["digital-comm"],
    "Bio": ["explorations"],
    "BIO": ["explorations"],
    "Other": ["explorations"]
  };
  return map[field] || [];
}

function normalizeLinks(rawLinks) {
  const links = {
    github: [],
    paper: [],
    demo: [],
    linkedin: [],
    leetcode: [],
    email: [],
    external: []
  };

  (rawLinks || []).forEach((link) => {
    const label = String(link.label || "").toLowerCase();
    const url = link.url;
    if (!url) return;

    if (label.includes("github")) links.github.push(url);
    else if (label.includes("paper")) links.paper.push(url);
    else if (label.includes("demo")) links.demo.push(url);
    else if (label.includes("linkedin")) links.linkedin.push(url);
    else if (label.includes("leetcode")) links.leetcode.push(url);
    else if (label.includes("email") || url.startsWith("mailto:")) links.email.push(url);
    else links.external.push(url);
  });

  const hasAny = Object.values(links).some((group) => group.length > 0);
  return hasAny ? links : undefined;
}

function toProject(topic, category, rank) {
  return {
    id: `${category}-${topic.time}-${rank}-${topic.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    title: topic.title,
    category,
    period: topic.time,
    summary: topic.summary || "No summary provided.",
    description: topic.summary || topic.title,
    tags: [topic.type, ...(topic.fields || [])].filter(Boolean),
    featured: false,
    links: normalizeLinks(topic.links)
  };
}

function scoreProject(project) {
  const scoreByType = {
    Work: 30,
    Milestone: 25,
    "Self-Study/Audit": 12,
    "Taken Course": 10
  };

  const type = project.tags.find((tag) => scoreByType[tag]) || "";
  const points = scoreByType[type] || 0;
  const dateScore = Number((project.period || "").replace(/[^0-9]/g, "")) || 0;
  return points * 100000 + dateScore;
}

async function loadProjectsByCategory() {
  const response = await fetch("/expert.json");
  const source = await response.json();
  const byCategory = Object.fromEntries(DOMAIN_CONFIG.map((d) => [d.slug, []]));

  (source.topics || []).forEach((topic) => {
    const categories = new Set((topic.fields || []).flatMap(normalizeCategory));
    if (!categories.size && topic.type === "Milestone") {
      categories.add("explorations");
    }
    categories.forEach((category) => {
      byCategory[category].push(toProject(topic, category, byCategory[category].length));
    });
  });

  Object.values(byCategory).forEach((arr) => {
    arr.sort((a, b) => (a.period < b.period ? 1 : -1));
    const top = [...arr].sort((a, b) => scoreProject(b) - scoreProject(a)).slice(0, 3).map((p) => p.id);
    arr.forEach((p) => {
      p.featured = top.includes(p.id);
    });
  });

  return byCategory;
}

function domainBySlug(slug) {
  return DOMAIN_CONFIG.find((d) => d.slug === slug);
}

function layoutHomeNodes() {
  const grid = document.getElementById("domains-grid");
  if (!grid) return;

  const nodes = Array.from(grid.querySelectorAll(".domain-node"));
  if (!nodes.length) return;

  const isPhone = window.matchMedia("(max-width: 560px)").matches;
  const rect = grid.getBoundingClientRect();
  const width = rect.width;
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (isPhone) {
    const size = Math.round(Math.max(112, Math.min(168, width * 0.32)));
    const height = Math.round(
      Math.max(size * 2.45, Math.min(viewportHeight * 0.72, size * 3.2))
    );
    grid.style.height = `${height}px`;

    console.log("[domain-layout]", {
      mode: "phone",
      gridWidth: Math.round(width),
      gridHeight: Math.round(height),
      viewportWidth: window.innerWidth,
      viewportHeight,
      nodeSize: size
    });

    const anchors = [
      [0.12, 0.08],
      [0.57, 0.04],
      [0.3, 0.29],
      [0.03, 0.54],
      [0.52, 0.5],
      [0.26, 0.75]
    ];

    nodes.forEach((node, idx) => {
      const [ax, ay] = anchors[idx] || [0.25, 0.25];
      const jitterX = (((idx * 37 + Math.round(width)) % 17) - 8) * 0.006;
      const jitterY = (((idx * 29 + Math.round(width)) % 13) - 6) * 0.008;
      const maxLeft = Math.max(0, width - size);
      const maxTop = Math.max(0, height - size);
      const left = Math.round(Math.min(maxLeft, Math.max(0, (ax + jitterX) * width)));
      const top = Math.round(Math.min(maxTop, Math.max(0, (ay + jitterY) * height)));

      node.style.width = `${size}px`;
      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
      node.style.setProperty("--node-size", `${size}px`);
      node.style.animationName = "";
      node.style.animationDuration = "";
      node.style.animationDelay = "";
      node.style.zIndex = String(10 + idx);
    });
    return;
  }

  console.log("[domain-layout]", {
    mode: "desktop",
    gridWidth: Math.round(width),
    viewportWidth: window.innerWidth,
    viewportHeight
  });

  grid.style.height = "";
  nodes.forEach((node) => {
    node.style.left = "";
    node.style.top = "";
    node.style.width = "";
    node.style.removeProperty("--node-size");
    node.style.animationName = "";
    node.style.animationDuration = "";
    node.style.animationDelay = "";
    node.style.zIndex = "";
  });
}

let layoutRaf = 0;
function scheduleHomeLayout() {
  if (layoutRaf) cancelAnimationFrame(layoutRaf);
  layoutRaf = requestAnimationFrame(() => {
    layoutHomeNodes();
    layoutRaf = 0;
  });
}

function renderHomeNodes() {
  const grid = document.getElementById("domains-grid");
  if (!grid) return;
  grid.innerHTML = "";

  DOMAIN_CONFIG.forEach((domain) => {
    const node = document.createElement("a");
    node.className = "domain-node";
    node.href = domain.href;
    node.dataset.node = domain.slug;
    node.innerHTML = `<span class="domain-label">${domain.label}</span><span class="domain-hint">${domain.subtitle}</span>`;

    node.addEventListener("click", (event) => {
      event.preventDefault();
      node.classList.add("is-entering");
      setTimeout(() => {
        window.location.href = domain.href;
      }, 180);
    });

    grid.appendChild(node);
  });

  scheduleHomeLayout();
}

function linkSet(links) {
  if (!links) return "";

  const renderGroup = (group, baseLabel) => {
    return (group || []).map((url, idx) => {
      const label = idx === 0 ? baseLabel : `${baseLabel} ${idx + 1}`;
      return `<a href="${url}" target="_blank" rel="noreferrer noopener">${label}</a>`;
    });
  };

  const items = [
    ...renderGroup(links.linkedin, "LinkedIn"),
    ...renderGroup(links.github, "GitHub"),
    ...renderGroup(links.leetcode, "LeetCode"),
    ...renderGroup(links.email, "Email"),
    ...renderGroup(links.paper, "Paper"),
    ...renderGroup(links.demo, "Demo"),
    ...renderGroup(links.external, "Link")
  ];

  if (!items.length) return "";
  return `<div class="links">${items.join("")}</div>`;
}

function renderTags(tags) {
  const filtered = (tags || []).filter((tag) => tag && tag !== "Taken Course" && tag !== "Work");
  if (!filtered.length) return "";
  return `<div class="tags">${filtered.slice(0, 6).map((t) => `<span>${t}</span>`).join("")}</div>`;
}

async function loadPersonalTopics() {
  const response = await fetch("/personal.json");
  const source = await response.json();
  return source.topics || [];
}

function groupByField(topics) {
  const grouped = {};
  topics.forEach((item) => {
    (item.fields || []).forEach((field) => {
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(item);
    });
  });
  return grouped;
}

function renderAboutPage(topics) {
  const root = document.getElementById("about-root");
  if (!root) return;

  const grouped = groupByField(topics);
  const bio = (grouped["Bio"] || [])[0];
  const sections = ["Work Experience", "Education", "Awards", "Publications"];

  root.innerHTML = `
    <section class="domain-header">
      <p class="eyebrow">About</p>
      <h1>Yu-Cheng Lin</h1>
      <p class="domain-intro">${(bio?.content || "").replace(/\n/g, "<br>")}</p>
      ${bio ? linkSet(normalizeLinks(bio.links)) : ""}
    </section>

    ${sections.map((title) => `
      <section class="archive-section" aria-labelledby="${title.toLowerCase().replace(/[^a-z]+/g, "-")}-heading">
        <h2 class="section-title" id="${title.toLowerCase().replace(/[^a-z]+/g, "-")}-heading">${title}</h2>
        <ul class="archive-list">
          ${(grouped[title] || []).map((entry) => `
            <li>
              <p>${entry.content}</p>
              ${linkSet(normalizeLinks(entry.links))}
            </li>
          `).join("") || "<li>No items yet.</li>"}
        </ul>
      </section>
    `).join("")}
  `;
}

function renderDomainPage(slug, byCategory) {
  const domain = domainBySlug(slug);
  const root = document.getElementById("domain-root");
  if (!domain || !root) return;

  const projects = byCategory[slug] || [];
  const featured = projects.filter((p) => p.featured);
  const archive = projects.filter((p) => !p.featured);

  root.innerHTML = `
    <section class="domain-header">
      <p class="eyebrow">Domain</p>
      <h1>${domain.label}</h1>
      <p class="domain-intro">${domain.intro}</p>
      <div class="keyword-strip">${domain.keywords.map((w) => `<span>${w}</span>`).join("")}</div>
    </section>

    <section aria-labelledby="featured-heading">
      <h2 class="section-title" id="featured-heading">Featured Projects</h2>
      <div class="project-grid">
        ${featured.map((p) => `
          <article class="project-card">
            <h3>${p.title}</h3>
            <p class="project-meta">${p.period || "N/A"}</p>
            <p class="project-summary">${p.summary}</p>
            ${renderTags(p.tags)}
            ${linkSet(p.links)}
          </article>
        `).join("") || "<p>No featured items yet.</p>"}
      </div>
    </section>

    <section class="archive-section" aria-labelledby="archive-heading">
      <h2 class="section-title" id="archive-heading">Project Archive</h2>
      <ul class="archive-list">
        ${archive.map((p) => `
          <li>
            <strong>${p.title}</strong> <span class="project-meta">(${p.period || "N/A"})</span>
            <p>${p.summary}</p>
            ${renderTags(p.tags)}
            ${linkSet(p.links)}
          </li>
        `).join("") || "<li>No archive items yet.</li>"}
      </ul>
    </section>
  `;
}

async function bootstrap() {
  injectHeader();
  renderHomeNodes();
  window.addEventListener("resize", scheduleHomeLayout);

  const domainRoot = document.getElementById("domain-root");
  const aboutRoot = document.getElementById("about-root");

  if (domainRoot) {
    const slug = domainRoot.dataset.domain;
    try {
      const byCategory = await loadProjectsByCategory();
      renderDomainPage(slug, byCategory);
    } catch (error) {
      domainRoot.innerHTML = `<p>Unable to load project data right now.</p>`;
    }
  }

  if (aboutRoot) {
    try {
      const topics = await loadPersonalTopics();
      renderAboutPage(topics);
    } catch (error) {
      aboutRoot.innerHTML = `<p>Unable to load about data right now.</p>`;
    }
  }
}

bootstrap();
