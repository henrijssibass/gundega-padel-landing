const META_PIXEL_ID = "1006268881933443";
const CONSENT_KEY = "pbg_cookie_consent";

const DIRECT_BOOKING_URL =
  "https://book.padelbygu.com/widget/booking/yVYX05jfBIQx4nXSsoQh";

let checkoutEventSent = false;
let mobileRedirectScheduled = false;


/* =========================================================
   DEVICE DETECTION
========================================================= */

function isMobileBookingDevice() {
  const ua = navigator.userAgent || "";

  const phoneOrAndroid =
    /Android|iPhone|iPod/i.test(ua);

  /*
    Modern iPadOS can identify itself as Macintosh.
  */
  const iPad =
    navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1;

  return phoneOrAndroid || iPad;
}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

const revealItems =
  document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {

  const observer =
    new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "is-visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.14
      }
    );

  revealItems.forEach((item) => {
    observer.observe(item);
  });

} else {

  revealItems.forEach((item) => {
    item.classList.add("is-visible");
  });

}


/* =========================================================
   FAQ
========================================================= */

document
  .querySelectorAll(".faq-list details")
  .forEach((item) => {

    item.addEventListener(
      "toggle",
      () => {

        if (!item.open) return;

        document
          .querySelectorAll(
            ".faq-list details"
          )
          .forEach((otherItem) => {

            if (otherItem !== item) {
              otherItem.open = false;
            }

          });

      }
    );

  });


/* =========================================================
   HERO MEDIA GALLERY
========================================================= */

const heroItems =
  document.querySelectorAll(
    ".hero-media-item"
  );

const heroThumbs =
  document.querySelectorAll(
    ".media-thumb"
  );

heroThumbs.forEach((thumb) => {

  thumb.addEventListener(
    "click",
    () => {

      const targetId =
        thumb.dataset.target;

      heroThumbs.forEach((item) => {

        item.classList.toggle(
          "is-active",
          item === thumb
        );

      });

      heroItems.forEach((item) => {

        const isActive =
          item.dataset.mediaId ===
          targetId;

        item.classList.toggle(
          "is-active",
          isActive
        );

        if (
          item.tagName === "VIDEO"
        ) {

          if (isActive) {

            item
              .play()
              .catch(() => {});

          } else {

            item.pause();

          }

        }

      });

    }
  );

});


document
  .querySelectorAll(
    ".media-thumb video"
  )
  .forEach((video) => {

    video.addEventListener(
      "loadedmetadata",
      () => {

        const targetTime =
          Math.min(
            0.7,
            Math.max(
              0,
              video.duration - 0.1
            )
          );

        video.currentTime =
          Number.isFinite(targetTime)
            ? targetTime
            : 0;

      },
      {
        once: true
      }
    );

  });


/* =========================================================
   COURT GALLERY
========================================================= */

const courtSlides =
  document.querySelectorAll(
    ".court-slide"
  );

const courtThumbs =
  document.querySelectorAll(
    ".court-thumb"
  );

courtThumbs.forEach((thumb) => {

  thumb.addEventListener(
    "click",
    () => {

      const targetId =
        thumb.dataset.target;

      courtThumbs.forEach((item) => {

        item.classList.toggle(
          "is-active",
          item === thumb
        );

      });

      courtSlides.forEach((slide) => {

        slide.classList.toggle(
          "is-active",
          slide.dataset.courtId ===
            targetId
        );

      });

    }
  );

});


/* =========================================================
   COOKIE CONSENT
========================================================= */

function getConsent() {

  try {

    return localStorage.getItem(
      CONSENT_KEY
    );

  } catch (error) {

    return null;

  }

}


function setConsent(value) {

  try {

    localStorage.setItem(
      CONSENT_KEY,
      value
    );

  } catch (error) {

    /*
      Storage unavailable.
      Continue without saving.
    */

  }

}


function hasMarketingConsent() {

  return (
    getConsent() === "accepted"
  );

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

  !(function (
    f,
    b,
    e,
    v,
    n,
    t,
    s
  ) {

    if (f.fbq) return;

    n = f.fbq = function () {

      n.callMethod
        ? n.callMethod.apply(
            n,
            arguments
          )
        : n.queue.push(
            arguments
          );

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

    s =
      b.getElementsByTagName(
        e
      )[0];

    s.parentNode.insertBefore(
      t,
      s
    );

  })(
    window,
    document,
    "script",
    "https://connect.facebook.net/en_US/fbevents.js"
  );

  fbq(
    "init",
    META_PIXEL_ID
  );

  fbq(
    "track",
    "PageView"
  );

}


/* =========================================================
   INITIATE CHECKOUT
========================================================= */

function trackBookingIntent() {

  if (!hasMarketingConsent()) {
    return;
  }

  if (checkoutEventSent) {
    return;
  }

  loadMetaPixel();

  if (
    typeof fbq !== "function"
  ) {
    return;
  }

  fbq(
    "track",
    "InitiateCheckout",
    {
      value: 15.0,
      currency: "EUR",
      content_name:
        "PadelByGu izmēģinājuma treniņš"
    }
  );

  checkoutEventSent = true;

}


/* =========================================================
   PURCHASE
========================================================= */

function trackPurchase() {

  if (!hasMarketingConsent()) {
    return;
  }

  const params =
    new URLSearchParams(
      window.location.search
    );

  /*
    Only fire Purchase after
    successful GHL payment redirect.
  */
  if (
    params.get("paid") !== "1"
  ) {
    return;
  }

  loadMetaPixel();

  if (
    typeof fbq !== "function"
  ) {
    return;
  }

  fbq(
    "track",
    "Purchase",
    {
      value: 15.0,
      currency: "EUR",
      content_name:
        "PadelByGu izmēģinājuma treniņš"
    }
  );

  /*
    Remove ?paid=1 so refresh
    does not generate another Purchase.
  */
  params.delete("paid");

  const cleanQuery =
    params.toString();

  const cleanUrl =
    window.location.pathname +
    (
      cleanQuery
        ? "?" + cleanQuery
        : ""
    ) +
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

function preserveTrackingParams(
  url
) {

  try {

    const currentParams =
      new URLSearchParams(
        window.location.search
      );

    const usefulKeys = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid"
    ];

    const target =
      new URL(
        url,
        window.location.origin
      );

    usefulKeys.forEach((key) => {

      const value =
        currentParams.get(key);

      if (
        value &&
        !target.searchParams.has(
          key
        )
      ) {

        target.searchParams.set(
          key,
          value
        );

      }

    });

    if (
      target.origin ===
      window.location.origin
    ) {

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
  .querySelectorAll(
    ".js-booking-link"
  )
  .forEach((link) => {

    const originalHref =
      link.getAttribute("href") ||
      "/booking";

    link.href =
      preserveTrackingParams(
        originalHref
      );

  });


/* =========================================================
   DESKTOP BOOKING EMBED
========================================================= */

function loadDesktopBooking() {

  const bookingFrame =
    document.querySelector(
      "[data-booking-frame]"
    );

  if (!bookingFrame) {
    return;
  }

  const baseSrc =
    bookingFrame.dataset.src;

  if (!baseSrc) {
    return;
  }

  const iframeUrl =
    preserveTrackingParams(
      baseSrc
    );

  if (
    bookingFrame.getAttribute(
      "src"
    ) !== iframeUrl
  ) {

    bookingFrame.setAttribute(
      "src",
      iframeUrl
    );

  }

}


/* =========================================================
   MOBILE DIRECT BOOKING
========================================================= */

function getDirectBookingUrl() {

  return preserveTrackingParams(
    DIRECT_BOOKING_URL
  );

}


function redirectToDirectBooking(
  delay = 100
) {

  if (mobileRedirectScheduled) {
    return;
  }

  mobileRedirectScheduled = true;

  document.body.classList.add(
    "mobile-direct-booking"
  );

  window.setTimeout(
    () => {

      window.location.replace(
        getDirectBookingUrl()
      );

    },
    delay
  );

}


function handleBookingExperience() {

  const page =
    document.body?.dataset?.page;

  if (page !== "booking") {
    return;
  }

  /*
    Desktop:
    keep PadelByGu website + embedded GHL calendar.
  */
  if (!isMobileBookingDevice()) {

    loadDesktopBooking();

    return;

  }

  /*
    Mobile:
    don't even load the iframe.
    Go directly to GHL so Apple Pay /
    Google Pay can work as top-level checkout.
  */
  document.body.classList.add(
    "mobile-direct-booking"
  );

  const consent =
    getConsent();

  /*
    New visitor:
    wait for cookie choice before redirect.
  */
  if (!consent) {
    return;
  }

  /*
    If accepted, give Pixel a short moment
    to send PageView / InitiateCheckout.
  */
  if (
    consent === "accepted"
  ) {

    redirectToDirectBooking(
      900
    );

  } else {

    redirectToDirectBooking(
      100
    );

  }

}


/* =========================================================
   COOKIE BANNER
========================================================= */

const cookieBanner =
  document.querySelector(
    "#cookieBanner"
  );

const cookieAccept =
  document.querySelector(
    "#cookieAccept"
  );

const cookieReject =
  document.querySelector(
    "#cookieReject"
  );


function showCookieBannerIfNeeded() {

  if (!cookieBanner) {
    return;
  }

  if (!getConsent()) {

    cookieBanner.hidden = false;

  }

}


function acceptCookies() {

  setConsent(
    "accepted"
  );

  if (cookieBanner) {

    cookieBanner.hidden = true;

  }

  loadMetaPixel();

  runPageTracking();

  /*
    On mobile continue automatically
    to top-level GHL after consent.
  */
  if (
    document.body?.dataset?.page ===
      "booking" &&
    isMobileBookingDevice()
  ) {

    redirectToDirectBooking(
      900
    );

  }

}


function rejectCookies() {

  setConsent(
    "rejected"
  );

  if (cookieBanner) {

    cookieBanner.hidden = true;

  }

  /*
    Booking/payment still works.
    We simply don't load Meta Pixel.
  */
  if (
    document.body?.dataset?.page ===
      "booking" &&
    isMobileBookingDevice()
  ) {

    redirectToDirectBooking(
      100
    );

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

  if (page === "booking") {

    trackBookingIntent();

  }

  if (
    page === "booking-success"
  ) {

    trackPurchase();

  }

}


/* =========================================================
   INITIALIZATION
========================================================= */

if (hasMarketingConsent()) {

  loadMetaPixel();

}

showCookieBannerIfNeeded();

runPageTracking();

handleBookingExperience();
