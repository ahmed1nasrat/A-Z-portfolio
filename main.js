gsap.registerPlugin(ScrollTrigger);

// ============================================================
// INITIAL STATES + APPLY DATA-ROT
// ============================================================
gsap.set("#nav", { opacity: 0, y: -20 });
gsap.set(".small-team .word > span", { y: "105%" });
gsap.set(".big-results .letter", { y: 80, opacity: 0 });
gsap.set("#subline", { opacity: 0, y: 20 });
gsap.set(".p-card", { opacity: 0 });
gsap.set(".stats-inner", { opacity: 0 });

// Apply each card's natural rotation as the rest-state, but start them off-screen above + rotated
document.querySelectorAll(".card").forEach((card) => {
  const rot = parseFloat(card.dataset.rot) || 0;
  card.dataset.restRot = rot;
  gsap.set(card, { y: -800, rotation: rot + 25, opacity: 0, scale: 0.7 });
});

// ============================================================
// INTRO TIMELINE
// ============================================================
const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
intro
  .to("#nav", { opacity: 1, y: 0, duration: 0.8 }, 0.1)
  .to(
    ".small-team .word > span",
    {
      y: "0%",
      duration: 0.9,
      stagger: 0.08,
      ease: "power3.out"
    },
    0.3
  )
  .to(
    ".big-results .letter",
    {
      y: 0,
      opacity: 1,
      duration: 0.9,
      stagger: 0.05,
      ease: "back.out(1.6)"
    },
    0.55
  )
  .to(
    ".card",
    {
      y: 0,
      opacity: 1,
      scale: 1,
      rotation: (i, el) => parseFloat(el.dataset.restRot) || 0,
      duration: 1.1,
      stagger: { each: 0.08, from: "center" },
      ease: "back.out(1.4)"
    },
    0.8
  )
  .to("#subline", { opacity: 1, y: 0, duration: 0.8 }, 1.6);

// ============================================================
// CONTINUOUS FLOAT ON CARDS
// ============================================================
document.querySelectorAll(".card").forEach((card, i) => {
  const rot = parseFloat(card.dataset.restRot) || 0;
  gsap.to(card, {
    y: `+=${8 + (i % 3) * 5}`,
    rotation: rot + (i % 2 === 0 ? 1.5 : -1.5),
    duration: 3 + (i % 4) * 0.5,
    delay: 1.8 + i * 0.1,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1
  });
});

// ============================================================
// NAV: fixed bar state + active section highlight
// ============================================================
const navEl = document.getElementById("nav");
const navItems = Array.from(document.querySelectorAll(".nav-links a"))
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter((item) => item.section);

function syncNav() {
  // Solid-ish backdrop once anything has scrolled under the bar
  navEl.classList.toggle("is-stuck", window.scrollY > 40);

  if (!navItems.length) return;

  const marker = window.scrollY + window.innerHeight * 0.35;
  let current = navItems[0];
  navItems.forEach((item) => {
    const top = item.section.getBoundingClientRect().top + window.scrollY;
    if (top <= marker) current = item;
  });

  // A short final section may never reach the marker; the bottom of the page
  // always belongs to the last link
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) current = navItems[navItems.length - 1];

  navItems.forEach((item) => item.link.classList.toggle("is-active", item === current));
}

window.addEventListener("scroll", syncNav, { passive: true });
window.addEventListener("resize", syncNav);
syncNav();

// ============================================================
// MOBILE NAV DRAWER
// ============================================================
const navToggle = document.getElementById("navToggle");
const navLinksEl = document.getElementById("navLinks");
const mobileQuery = window.matchMedia("(max-width: 750px)");

function setMenu(open) {
  navLinksEl.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setMenu(!navLinksEl.classList.contains("open"));
});

// A tapped link closes the drawer (its own click still scrolls to the section)
navLinksEl.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

document.addEventListener("click", (e) => {
  if (!navLinksEl.classList.contains("open")) return;
  if (!(e.target instanceof Element)) return;
  if (e.target.closest("#navLinks") || e.target.closest("#navToggle")) return;
  setMenu(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// Back to the desktop bar: never leave the drawer open
mobileQuery.addEventListener("change", (e) => {
  if (!e.matches) setMenu(false);
});

// ============================================================
// MOUSE PARALLAX ON CARDS
// ============================================================
const hero = document.querySelector(".hero");
let mx = 0,
  my = 0,
  tx = 0,
  ty = 0;
hero.addEventListener("mousemove", (e) => {
  const r = hero.getBoundingClientRect();
  mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
  my = ((e.clientY - r.top) / r.height - 0.5) * 2;
});
hero.addEventListener("mouseleave", () => {
  mx = 0;
  my = 0;
});

function parallax() {
  tx += (mx - tx) * 0.05;
  ty += (my - ty) * 0.05;
  document.querySelectorAll(".card").forEach((card) => {
    const d = parseFloat(card.dataset.depth) || 8;
    card.style.translate = `${tx * d}px ${ty * d * 0.5}px`;
  });
  requestAnimationFrame(parallax);
}
parallax();

// ============================================================
// CARD HOVER 3D LIFT
// ============================================================
document.querySelectorAll(".card").forEach((card) => {
  const restRot = parseFloat(card.dataset.restRot) || 0;
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, {
      rotateX: -py * 16,
      rotateY: px * 16,
      scale: 1.12,
      zIndex: 20,
      duration: 0.4,
      ease: "power2.out",
      transformPerspective: 700,
      overwrite: "auto"
    });
  });
  card.addEventListener("mouseleave", () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      zIndex: card.style.zIndex || "",
      duration: 0.8,
      ease: "elastic.out(1, 0.6)",
      overwrite: "auto"
    });
  });
  card.addEventListener("click", () => {
    gsap.fromTo(
      card,
      { scale: 1.15 },
      {
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      }
    );
  });
});

// ============================================================
// SCROLL: CARDS FAN OUT, "big results" SCALES UP
// ============================================================
ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  scrub: 0.8,
  onUpdate: (self) => {
    const p = self.progress;
    // Big results scales up and stays gray
    gsap.set(".big-results", { scale: 1 + 0.15 * p, opacity: 1 - 0.4 * p });
    // Small team rises out
    gsap.set(".small-team", { y: -60 * p, opacity: 1 - p * 1.5 });
    // Cards: outer cards fly further out, center cards drift up more
    const moves = [
      { x: -260, y: -40, rot: -25 }, // 1
      { x: -200, y: 20, rot: -18 }, // 2
      { x: -120, y: 80, rot: -10 }, // 3
      { x: -40, y: 120, rot: -4 }, // 4
      { x: 40, y: 120, rot: 4 }, // 5
      { x: 120, y: 80, rot: 12 }, // 6
      { x: 200, y: 20, rot: 22 }, // 7
      { x: 260, y: -40, rot: 28 } // 8
    ];
    document.querySelectorAll(".card").forEach((card, i) => {
      const m = moves[i];
      const rest = parseFloat(card.dataset.restRot) || 0;
      gsap.set(card, {
        x: m.x * p,
        y: m.y * p,
        rotation: rest + m.rot * p
      });
    });
    gsap.set("#subline", { opacity: 1 - p * 2 });
  }
});

// ============================================================
// TEAM GRID REVEAL ON SCROLL
// ============================================================
gsap.from(".eyebrow, .team-head h2", {
  opacity: 0,
  y: 30,
  duration: 0.9,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: { trigger: ".team-head", start: "top 80%" }
});

// Single tween per card: the old pair ran a .to({ y: 0 }) AND a .from({ y: 70 })
// over the same y, and with a 1s duration + 0.1s stagger the last card sat well
// below its row for ~1.4s after the grid scrolled in. Tightened so the cards
// land together, and clearProps hands transform back to CSS so :hover works.
gsap.from(".p-card", {
  opacity: 0,
  y: 24,
  scale: 0.98,
  duration: 0.55,
  stagger: 0.05,
  ease: "power2.out",
  clearProps: "transform,opacity",
  scrollTrigger: { trigger: "#projects", start: "top 80%" }
});

// ============================================================
// STATS REVEAL + COUNTERS
// ============================================================
gsap.to(".stats-inner", {
  opacity: 1,
  y: 0,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: { trigger: ".stats", start: "top 80%" }
});
gsap.from(".stats-inner", {
  y: 60,
  scale: 0.97,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: { trigger: ".stats", start: "top 80%" }
});

ScrollTrigger.create({
  trigger: ".stats",
  start: "top 75%",
  onEnter: () => {
    document.querySelectorAll(".stat-block .num").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const span = el.querySelector("span");

      // Each number counts at its own pace and lands on its value independently,
      // so small numbers (2, 5) don't sit around waiting on the big one (100).
      // Duration scales with the value, so every counter finishes in its own time.
      const duration = gsap.utils.clamp(0.4, 1.6, target * 0.016);
      const proxy = { v: 0 };

      gsap.to(proxy, {
        v: target,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          span.textContent = Math.floor(proxy.v).toLocaleString();
        },
        onComplete: () => {
          span.textContent = target.toLocaleString();
        }
      });
    });
  },
  once: true
});

// ============================================================
// CTA / BUTTON CLICKS
// ============================================================
document.querySelectorAll(".nav-cta, .arrow-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    gsap.fromTo(
      btn,
      { scale: 1 },
      {
        scale: 0.93,
        duration: 0.12,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      }
    );
  });
});

// ============================================================
// CONTACT MODAL
// ============================================================
const contactOverlay = document.getElementById("contactOverlay");
const contactCard = document.getElementById("contactCard");

function openContact() {
  contactOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeContact() {
  contactOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.querySelector(".nav-cta").addEventListener("click", openContact);
contactOverlay.addEventListener("click", (e) => {
  if (!contactCard.contains(e.target)) closeContact();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && contactOverlay.classList.contains("open")) closeContact();
});

document.querySelector(".nav-cta").addEventListener("click", () => {
  gsap.fromTo(
    ".nav-cta",
    { scale: 1 },
    { scale: 0.93, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut" }
  );
});

// Big results: subtle letter rise on hover of the wrap
document
  .querySelector(".big-results-wrap")
  .addEventListener("mouseenter", () => {
    gsap.to(".big-results .letter", {
      y: -8,
      duration: 0.5,
      stagger: 0.03,
      ease: "back.out(1.6)"
    });
  });
document
  .querySelector(".big-results-wrap")
  .addEventListener("mouseleave", () => {
    gsap.to(".big-results .letter", {
      y: 0,
      duration: 0.6,
      stagger: 0.03,
      ease: "elastic.out(1, 0.6)"
    });
  });
