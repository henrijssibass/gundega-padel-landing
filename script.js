const META_PIXEL_ID = "1006268881933443";
const CONSENT_KEY = "pbg_cookie_consent";
const CHECKOUT_KEY = "pbg_checkout_started";
const PURCHASE_KEY = "pbg_purchase_sent";

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

    heroThumbs.forEach((item) => {
      item.classList.toggle("is-active", item === thumb);
    });

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

document.querySelectorAll(".media-thumb video").forEach((video) => {
  video.addEventListener(
    "loadedmetadata",
    () => {
      const targetTime = Math.min(0.7, Math.max(0, video.duration - 0.1));
      video.currentTime = Number.isFinite(targetTime) ? targetTime : 0;
    },
    { once: true }
  );
});

const courtSlides = document.querySelectorAll(".court-slide");
const courtThumbs = document.querySelectorAll(".court-thumb");

courtThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const targetId = thumb.dataset.target;

    courtThumbs.forEach((item) => {
      item.classList.toggle("is-active", item === thumb);
    });

    courtSlides.forEach((slide) => {
      slide.classList.toggle("is-active", slide.dataset.courtId === targetId);
    });
  });
});

/* -----------------------------
   Consent + Meta Pixel
------------------------------ */

function getConsent() {
  return localStorage.getItem(CONSENT_KEY);
}

function hasMarketingConsent() {
  return getConsent() === "accepted";
}

function loadMetaPixel() {
  if (!hasMarketingConsent() || window.fbq) return;

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

function trackMetaEvent(eventName, params = {}) {
  if (!hasMarketingConsent()) return;
  loadMetaPixel();

  if (typeof fbq === "function") {
    fbq("track", eventName, params);
  }
}

function trackBookingIntent() {
  if (!sessionStorage.getItem(CHECKOUT_KEY)) {
    sessionStorage.setItem(CHECKOUT_KEY, "1");

    trackMetaEvent("InitiateCheckout", {
      value: 15.0,
      currency: "EUR",
      content_name: "PadelByGu izmēģinājuma treniņš"
    });
  }
}

function trackPurchase() {
  const bookingStarted = sessionStorage.getItem(CHECKOUT_KEY);

  if (bookingStarted && !sessionStorage.getItem(PURCHASE_KEY)) {
    trackMetaEvent("Purchase", {
      value: 15.0,
      currency: "EUR",
      content_name: "PadelByGu izmēģinājuma treniņš"
    });

    if (hasMarketingConsent()) {
      sessionStorage.setItem(PURCHASE_KEY, "1");
    }
  }
}

function preserveTrackingParams(url) {
  const currentParams = new URLSearchParams(window.location.search);
  const usefulKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];
  const target = new URL(url, window.location.origin);

  usefulKeys.forEach((key) => {
    const value = currentParams.get(key);
    if (value && !target.searchParams.has(key)) {
      target.searchParams.set(key, value);
    }
  });

  return target.pathname + target.search + target.hash;
}

document.querySelectorAll(".js-booking-link").forEach((link) => {
  link.href = preserveTrackingParams(link.getAttribute("href") || "/booking");

  link.addEventListener("click", () => {
    trackBookingIntent();
  });
});

/* Booking iframe receives ad attribution parameters where available. */
const bookingFrame = document.querySelector("#padelbyguBookingFrame");

if (bookingFrame) {
  const baseSrc = bookingFrame.dataset.src || bookingFrame.getAttribute("src");
  const currentParams = new URLSearchParams(window.location.search);
  const target = new URL(baseSrc);
  const usefulKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"];

  usefulKeys.forEach((key) => {
    const value = currentParams.get(key);
    if (value) target.searchParams.set(key, value);
  });

  bookingFrame.src = target.toString();
}

/* -----------------------------
   Cookie banner
------------------------------ */

const cookieBanner = document.querySelector("#cookieBanner");
const cookieAccept = document.querySelector("#cookieAccept");
const cookieReject = document.querySelector("#cookieReject");

function showCookieBannerIfNeeded() {
  if (!cookieBanner) return;

  if (!getConsent()) {
    cookieBanner.hidden = false;
  }
}

function acceptCookies() {
  localStorage.setItem(CONSENT_KEY, "accepted");
  if (cookieBanner) cookieBanner.hidden = true;

  loadMetaPixel();
  runPageTracking();
}

function rejectCookies() {
  localStorage.setItem(CONSENT_KEY, "rejected");
  if (cookieBanner) cookieBanner.hidden = true;
}

cookieAccept?.addEventListener("click", acceptCookies);
cookieReject?.addEventListener("click", rejectCookies);

/* -----------------------------
   Page-specific tracking
------------------------------ */

function runPageTracking() {
  const page = document.body?.dataset?.page;

  if (page === "booking") {
    trackBookingIntent();
  }

  if (page === "booking-success") {
    trackPurchase();
  }
}

if (hasMarketingConsent()) {
  loadMetaPixel();
}

showCookieBannerIfNeeded();
runPageTracking();
