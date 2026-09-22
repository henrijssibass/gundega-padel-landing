const META_PIXEL_ID = "1006268881933443";
const CONSENT_KEY = "pbg_cookie_consent";

let checkoutEventSent = false;

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
    // Storage unavailable — simply continue without saving.
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


/* =========================================================
   INITIATE CHECKOUT
========================================================= */

function trackBookingIntent() {
  if (!hasMarketingConsent()) {
    return;
  }

  /*
    Tikai vienreiz konkrētās /booking lapas ielādes laikā.
    Reload = jauna page load = jauns checkout event.
  */
  if (checkoutEventSent) {
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

  checkoutEventSent = true;
}


/* =========================================================
   PURCHASE
========================================================= */

function trackPurchase() {
  if (!hasMarketingConsent()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);

  /*
    Purchase tiek sūtīts tikai tad, ja GHL pēc veiksmīga
    maksājuma redirectē uz:
    /booking-success?paid=1
  */
  if (params.get("paid") !== "1") {
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

  /*
    Pēc eventa nosūtīšanas izņemam ?paid=1 no URL,
    lai refresh nerada vēl vienu Purchase.
  */
  params.delete("paid");

  const cleanQuery = params.toString();

  const cleanUrl =
    window.location.pathname +
    (cleanQuery ? "?" + cleanQuery : "") +
    window.location.hash;

  window.history.replaceState(
    {},
    document.title,
    cleanUrl
  );
}


/* =========================================================
   UTM / FBCLID PRESERVATION
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

    const target = new URL(url, window.location.origin);

    usefulKeys.forEach((key) => {
      const value = currentParams.get(key);

      if (
        value &&
        !target.searchParams.has(key)
      ) {
        target.searchParams.set(key, value);
      }
    });

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
   HOMEPAGE BOOKING LINKS
========================================================= */

document
  .querySelectorAll(".js-booking-link")
  .forEach((link) => {
    const originalHref =
      link.getAttribute("href") || "/booking";

    link.href =
      preserveTrackingParams(originalHref);

    /*
      Te vairs NEIZŠAUJAM InitiateCheckout.
      Tas izšaus tikai tad, kad cilvēks reāli
      būs nonācis /booking lapā.
    */
  });


/* =========================================================
   GHL BOOKING IFRAME
========================================================= */

const bookingFrame =
  document.querySelector(
    'iframe[src*="book.padelbygu.com/widget/booking/"]'
  );

if (bookingFrame) {

  const baseSrc =
    bookingFrame.getAttribute("src");

  if (baseSrc) {

    try {

      const currentParams =
        new URLSearchParams(window.location.search);

      const target =
        new URL(baseSrc);

      const usefulKeys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "fbclid"
      ];

      let hasTrackingParams = false;

      usefulKeys.forEach((key) => {

        const value =
          currentParams.get(key);

        if (value) {

          target.searchParams.set(
            key,
            value
          );

          hasTrackingParams = true;

        }

      });

      /*
        Only change iframe URL when actual
        tracking parameters exist.

        Normal /booking visits therefore use
        the exact GHL-generated iframe URL.
      */
      if (hasTrackingParams) {

        const newSrc =
          target.toString();

        const currentSrc =
          bookingFrame.src;

        if (currentSrc !== newSrc) {

          bookingFrame.src =
            newSrc;

        }

      }

    } catch (error) {

      console.warn(
        "Booking iframe URL error:",
        error
      );

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

  loadMetaPixel();

  /*
    Ja lietotājs jau atrodas /booking,
    InitiateCheckout izšaus tūlīt pēc consent.
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
   PAGE-SPECIFIC META EVENTS
========================================================= */

function runPageTracking() {
  const page =
    document.body?.dataset?.page;

  /*
    padelbygu.com/booking
  */
  if (page === "booking") {
    trackBookingIntent();
  }

  /*
    padelbygu.com/booking-success?paid=1
  */
  if (page === "booking-success") {
    trackPurchase();
  }
}


/* =========================================================
   INITIALIZATION
========================================================= */

/*
  Ja lietotājs iepriekš jau piekritis,
  Pixel uzreiz ielādējas.
*/
if (hasMarketingConsent()) {
  loadMetaPixel();
}

/*
  Ja izvēles vēl nav, parādām banneri.
*/
showCookieBannerIfNeeded();

/*
  /booking -> InitiateCheckout
  /booking-success?paid=1 -> Purchase

  Ja consent vēl nav dots, nekas nenotiek.
  Pēc "Pieņemt visas" runPageTracking()
  tiek izsaukts vēlreiz.
*/
runPageTracking();
