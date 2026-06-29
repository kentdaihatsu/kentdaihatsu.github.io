const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const brochureItems = document.querySelectorAll(".brochure-item");
const brochureTriggers = document.querySelectorAll(".open-brochure");

const updateHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closeNav = () => {
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

let revealTicking = false;

const syncRevealOnScroll = () => {
  revealTicking = false;

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) {
      return;
    }

    const rect = item.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;

    if (isInView) {
      item.classList.add("is-visible");
      revealObserver.unobserve(item);
    }
  });
};

const scheduleRevealSync = () => {
  if (revealTicking) {
    return;
  }

  revealTicking = true;
  window.requestAnimationFrame(syncRevealOnScroll);
};

window.addEventListener("scroll", scheduleRevealSync, { passive: true });
window.addEventListener("resize", scheduleRevealSync);
scheduleRevealSync();

const loadBrochureImages = (item) => {
  item.querySelectorAll("img[data-src]").forEach((image) => {
    image.src = image.dataset.src;
    image.loading = "lazy";
    image.removeAttribute("data-src");
  });
};

const revealBrochureContext = (item) => {
  item.classList.add("is-visible");
  item.closest(".brochure-section")?.querySelector(".section-head")?.classList.add("is-visible");
};

brochureItems.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      revealBrochureContext(item);
      loadBrochureImages(item);
    }
  });
});

brochureTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const target = document.getElementById(trigger.dataset.target);

    if (!target) {
      return;
    }

    target.open = true;
    revealBrochureContext(target);
    loadBrochureImages(target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const openBrochureFromHash = () => {
  if (!window.location.hash) {
    return;
  }

  let target = null;

  try {
    target = document.querySelector(window.location.hash);
  } catch (error) {
    return;
  }

  if (!target || !target.matches(".brochure-item")) {
    return;
  }

  target.open = true;
  revealBrochureContext(target);
  loadBrochureImages(target);
};

window.addEventListener("hashchange", openBrochureFromHash);
openBrochureFromHash();
