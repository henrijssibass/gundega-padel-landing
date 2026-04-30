const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-list details").forEach((otherItem) => {
      if (otherItem !== item) otherItem.open = false;
    });
  });
});

const heroItems = document.querySelectorAll(".hero-media-item");
const heroThumbs = document.querySelectorAll(".media-thumb");

heroThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const targetId = thumb.dataset.target;

    heroThumbs.forEach((item) => item.classList.toggle("is-active", item === thumb));
    heroItems.forEach((item) => {
      const isActive = item.dataset.mediaId === targetId;
      item.classList.toggle("is-active", isActive);

      if (item.tagName === "VIDEO") {
        if (isActive) {
          item.play().catch(() => {});
        } else {
          item.pause();
        }
      }
    });
  });
});

const courtSlides = document.querySelectorAll(".court-slide");
const courtThumbs = document.querySelectorAll(".court-thumb");

courtThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const targetId = thumb.dataset.target;

    courtThumbs.forEach((item) => item.classList.toggle("is-active", item === thumb));
    courtSlides.forEach((slide) => {
      slide.classList.toggle("is-active", slide.dataset.courtId === targetId);
    });
  });
});
