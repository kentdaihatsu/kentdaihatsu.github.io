const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const brochureItems = document.querySelectorAll(".brochure-item");
const brochureTriggers = document.querySelectorAll(".open-brochure");
const carousels = document.querySelectorAll("[data-carousel]");
const imageOpeners = document.querySelectorAll("[data-full-image]");
const imageDialog = document.querySelector("[data-image-dialog]");
const dialogImage = document.querySelector("[data-dialog-image]");
const dialogClose = document.querySelector("[data-dialog-close]");

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

carousels.forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".promo-banner"));
  const prev = carousel.querySelector("[data-carousel-prev]");
  const next = carousel.querySelector("[data-carousel-next]");
  const dotsWrap = carousel.querySelector("[data-carousel-dots]");
  let index = 0;

  if (!track || slides.length === 0 || !prev || !next || !dotsWrap) {
    return;
  }

  const dots = slides.map((_, dotIndex) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "carousel-dot";
    dot.setAttribute("aria-label", `Lihat banner ${dotIndex + 1}`);
    dot.addEventListener("click", () => setSlide(dotIndex));
    dotsWrap.append(dot);
    return dot;
  });

  const setSlide = (nextIndex) => {
    index = (nextIndex + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  };

  prev.addEventListener("click", () => setSlide(index - 1));
  next.addEventListener("click", () => setSlide(index + 1));
  setSlide(0);
});

const closeImageDialog = () => {
  if (!imageDialog) {
    return;
  }

  if (imageDialog.open) {
    imageDialog.close();
  }
};

imageOpeners.forEach((opener) => {
  opener.addEventListener("click", () => {
    const src = opener.dataset.fullImage;
    const alt = opener.dataset.fullAlt || opener.querySelector("img")?.alt || "";

    if (!src || !imageDialog || !dialogImage) {
      return;
    }

    dialogImage.src = src;
    dialogImage.alt = alt;

    if (typeof imageDialog.showModal === "function") {
      imageDialog.showModal();
      return;
    }

    window.open(src, "_blank", "noopener");
  });
});

dialogClose?.addEventListener("click", closeImageDialog);

imageDialog?.addEventListener("click", (event) => {
  if (event.target === imageDialog) {
    closeImageDialog();
  }
});
