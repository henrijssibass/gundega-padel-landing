const META_PIXEL_ID = "1006268881933443";

const CONSENT_KEY = "pbg_cookie_consent";
const CHECKOUT_KEY = "pbg_checkout_started";
const PURCHASE_KEY = "pbg_purchase_sent";

/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

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

/* =========================================================
   FAQ
========================================================= */

document.querySelectorAll(".faq-list details").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;

    document.querySelectorAll(".faq-list details").forEach((otherItem) => {
      if (otherItem !== item) {
        otherItem.open = false;
      }
    });
  });
});

/* =========================================================
   HERO MEDIA GALLERY
========================================================= */

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
      const targetTime = Math.min(
        0.7,
        Math.max(0, video.duration - 0.1)
      );

      video.currentTime = Number.isFinite(targetTime)
        ? targetTime
        : 0;
    },
    { once: true }
  );
});

/* =========================================================
   COURT GALLERY
========================================================= */

const courtSlides = document.querySelectorAll(".court-slide");
const courtThumbs = document.querySelectorAll(".court-thumb");

courtThumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    const targetId = thumb.dataset.target;

    courtThumbs.forEach((item) => {
      item.classList.toggle("is-active", item === thumb);
    });

    courtSlides.forEach((slide) => {
      slide.classList.toggle(
        "is-active",
        slide.dataset.courtId === targetId
      );
    });
  });
});

/* =========================================================
   COOKIE CONSENT
========================================================= */

function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch (error) {
    return null;
  }
}

function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch (error) {
    // Ignore storage errors.
  }
}

function hasMarketingConsent() {
  return getConsent() === "accepted";
}

/* =========================================================
   META PIXEL
========================================================= */

function loadMetaPixel() {
  if (!hasMarketingConsent()) {
    return;
  }

  if (window.fbq) {
    return;
  }

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;

    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };

    if (!f._fbq) {
      f._fbq = n;
    }

    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    t = b.createElement(e);
    t.async = true;
    t.src = v;

    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  fbq("init", META_PIXEL_ID);
  fbq("track", "PageView");
}

function trackMetaEvent(eventName, params = {}) {
  if (!hasMarketingConsent()) {
    return false;
  }

  loadMetaPixel();

  if (typeof fbq !== "function") {
    return false;
  }

  fbq("track", eventName, params);

  return true;
}

/* =========================================================
   INITIATE CHECKOUT
========================================================= */

function trackBookingIntent() {
  /*
    Important:
    Do NOT mark checkout as tracked before Meta Pixel
    is actually allowed to send the event.

    This fixes the issue where a user reached /booking
    before accepting cookies, then accepted cookies,
    but InitiateCheckout never fired.
  */

  if (!hasMarketingConsent()) {
    return;
  }

  if (sessionStorage.getItem(CHECKOUT_KEY)) {
    return;
  }

  loadMetaPixel();

  if (typeof fbq !== "function") {
    return;
  }

  fbq("track", "InitiateCheckout", {
    value: 15.0,
    currency: "EUR",
    content_name: "PadelByGu izmēģinājuma treniņš"
  });

  sessionStorage.setItem(CHECKOUT_KEY, "1");
}

/* =========================================================
   PURCHASE
========================================================= */

function trackPurchase() {
  /*
    Purchase is only sent if this browser session
    actually passed through the booking flow first.

    This prevents someone manually opening
    /booking-success from generating a Purchase.
  */

  if (!hasMarketingConsent()) {
    return;
  }

  const bookingStarted =
    sessionStorage.getItem(CHECKOUT_KEY);

  const purchaseAlreadySent =
    sessionStorage.getItem(PURCHASE_KEY);

  if (!bookingStarted || purchaseAlreadySent) {
    return;
  }

  loadMetaPixel();

  if (typeof fbq !== "function") {
    return;
  }

  fbq("track", "Purchase", {
    value: 15.0,
    currency: "EUR",
    content_name: "PadelByGu izmēģinājuma treniņš"
  });

  sessionStorage.setItem(PURCHASE_KEY, "1");
}

/* =========================================================
   PRESERVE UTM + FBCLID
========================================================= */

function preserveTrackingParams(url) {
  try {
    const currentParams =
      new URLSearchParams(window.location.search);

    const usefulKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid"
    ];

    const target =
      new URL(url, window.location.origin);

    usefulKeys.forEach((key) => {
      const value = currentParams.get(key);

      if (
        value &&
        !target.searchParams.has(key)
      ) {
        target.searchParams.set(key, value);
      }
    });

    /*
      Internal URLs remain clean:
      /booking?utm_source=...
    */

    if (target.origin === window.location.origin) {
      return (
        target.pathname +
        target.search +
        target.hash
      );
    }

    return target.toString();
  } catch (error) {
    return url;
  }
}

/* =========================================================
   BOOKING CTA LINKS
========================================================= */

document
  .querySelectorAll(".js-booking-link")
  .forEach((link) => {
    const originalHref =
      link.getAttribute("href") || "/booking";

    link.href =
      preserveTrackingParams(originalHref);

    link.addEventListener("click", () => {
      /*
        If consent already exists,
        InitiateCheckout can fire immediately.

        If consent has not been given,
        /booking will fire it after consent.
      */

      trackBookingIntent();
    });
  });

/* =========================================================
   GHL BOOKING IFRAME
========================================================= */

const bookingFrame =
  document.querySelector(
    "#padelbyguBookingFrame"
  );

if (bookingFrame) {
  const baseSrc =
    bookingFrame.dataset.src ||
    bookingFrame.getAttribute("src");

  if (baseSrc) {
    try {
      const currentParams =
        new URLSearchParams(
          window.location.search
        );

      const target = new URL(baseSrc);

      const usefulKeys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "fbclid"
      ];

      usefulKeys.forEach((key) => {
        const value =
          currentParams.get(key);

        if (value) {
          target.searchParams.set(
            key,
            value
          );
        }
      });

      bookingFrame.src =
        target.toString();
    } catch (error) {
      bookingFrame.src = baseSrc;
    }
  }
}

/* =========================================================
   COOKIE BANNER
========================================================= */

const cookieBanner =
  document.querySelector("#cookieBanner");

const cookieAccept =
  document.querySelector("#cookieAccept");

const cookieReject =
  document.querySelector("#cookieReject");

function showCookieBannerIfNeeded() {
  if (!cookieBanner) {
    return;
  }

  if (!getConsent()) {
    cookieBanner.hidden = false;
  }
}

function acceptCookies() {
  setConsent("accepted");

  if (cookieBanner) {
    cookieBanner.hidden = true;
  }

  /*
    Pixel now loads AFTER explicit consent.
  */

  loadMetaPixel();

  /*
    Also fire the page-specific conversion event
    that may have been blocked before consent.
  */

  runPageTracking();
}

function rejectCookies() {
  setConsent("rejected");

  if (cookieBanner) {
    cookieBanner.hidden = true;
  }
}

cookieAccept?.addEventListener(
  "click",
  acceptCookies
);

cookieReject?.addEventListener(
  "click",
  rejectCookies
);

/* =========================================================
   PAGE-SPECIFIC TRACKING
========================================================= */

function runPageTracking() {
  const page =
    document.body?.dataset?.page;

  /*
    /booking
  */

  if (page === "booking") {
    trackBookingIntent();
  }

  /*
    /booking-success
  */

  if (page === "booking-success") {
    trackPurchase();
  }
}

/* =========================================================
   INITIALIZATION
========================================================= */

/*
  Returning visitors who already accepted
  marketing cookies can load Meta immediately.
*/

if (hasMarketingConsent()) {
  loadMetaPixel();
}

/*
  First-time visitors see consent banner.
*/

showCookieBannerIfNeeded();

/*
  Run page event.

  If consent doesn't exist yet, nothing fires.
  After the visitor clicks "Pieņemt",
  acceptCookies() calls this function again.
*/

runPageTracking();
