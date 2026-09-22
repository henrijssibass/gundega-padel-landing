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
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add(
            "is-visible"
          );

          observer.unobserve(
            entry.target
          );
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
    item.classList.add(
      "is-visible"
    );
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

        if (!item.open) {
          return;
        }

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
   HERO MEDIA CAROUSEL
========================================================= */

const heroItems =
  Array.from(
    document.querySelectorAll(
      ".hero-media-item"
    )
  );

const heroDots =
  Array.from(
    document.querySelectorAll(
      ".hero-dot"
    )
  );

const heroFrame =
  document.querySelector(
    "#heroCarousel"
  );

const heroPrev =
  document.querySelector(
    "#heroPrev"
  );

const heroNext =
  document.querySelector(
    "#heroNext"
  );

let currentHeroIndex = 0;


/* =========================================================
   SHOW HERO MEDIA
========================================================= */

function showHeroMedia(index) {
  if (!heroItems.length) {
    return;
  }

  /*
    Infinite carousel:
    -1 -> last item
    last + 1 -> first item
  */
  currentHeroIndex =
    (
      index +
      heroItems.length
    ) %
    heroItems.length;


  heroItems.forEach(
    (item, itemIndex) => {

      const isActive =
        itemIndex ===
        currentHeroIndex;

      item.classList.toggle(
        "is-active",
        isActive
      );

      item.setAttribute(
        "aria-hidden",
        isActive
          ? "false"
          : "true"
      );

      /*
        Only active video plays.
      */
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

    }
  );


  heroDots.forEach(
    (dot, dotIndex) => {

      const isActive =
        dotIndex ===
        currentHeroIndex;

      dot.classList.toggle(
        "is-active",
        isActive
      );

      dot.setAttribute(
        "aria-selected",
        isActive
          ? "true"
          : "false"
      );

    }
  );
}


/* =========================================================
   PREVIOUS / NEXT
========================================================= */

function showPreviousHeroMedia() {
  showHeroMedia(
    currentHeroIndex - 1
  );
}


function showNextHeroMedia() {
  showHeroMedia(
    currentHeroIndex + 1
  );
}


heroPrev?.addEventListener(
  "click",
  showPreviousHeroMedia
);


heroNext?.addEventListener(
  "click",
  showNextHeroMedia
);


/* =========================================================
   DOT NAVIGATION
========================================================= */

heroDots.forEach((dot) => {

  dot.addEventListener(
    "click",
    () => {

      const index =
        Number(
          dot.dataset.index
        );

      if (
        Number.isFinite(index)
      ) {
        showHeroMedia(index);
      }

    }
  );

});


/* =========================================================
   KEYBOARD NAVIGATION
========================================================= */

heroFrame?.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "ArrowLeft"
    ) {

      event.preventDefault();
      showPreviousHeroMedia();

    }

    if (
      event.key === "ArrowRight"
    ) {

      event.preventDefault();
      showNextHeroMedia();

    }

  }
);


/* =========================================================
   MOBILE SWIPE
========================================================= */

let heroTouchStartX = 0;
let heroTouchStartY = 0;


heroFrame?.addEventListener(
  "touchstart",
  (event) => {

    const touch =
      event.changedTouches[0];

    heroTouchStartX =
      touch.clientX;

    heroTouchStartY =
      touch.clientY;

  },
  {
    passive: true
  }
);


heroFrame?.addEventListener(
  "touchend",
  (event) => {

    const touch =
      event.changedTouches[0];

    const deltaX =
      touch.clientX -
      heroTouchStartX;

    const deltaY =
      touch.clientY -
      heroTouchStartY;

    /*
      Normal vertical scrolling
      should not change slides.
    */
    if (
      Math.abs(deltaX) <
      Math.abs(deltaY)
    ) {
      return;
    }

    /*
      Ignore tiny finger movements.
    */
    if (
      Math.abs(deltaX) < 45
    ) {
      return;
    }

    if (deltaX < 0) {
      showNextHeroMedia();
    } else {
      showPreviousHeroMedia();
    }

  },
  {
    passive: true
  }
);


/* =========================================================
   HERO INITIAL STATE
========================================================= */

showHeroMedia(0);


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
    Purchase only after successful
    GHL payment redirect:
    /booking-success?paid=1
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
    Remove paid=1 after sending event
    so a refresh does not create
    another Purchase.
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
    keep website + embedded calendar.
  */
  if (!isMobileBookingDevice()) {

    loadDesktopBooking();

    return;

  }


  /*
    Mobile:
    skip embedded iframe and open
    GHL as top-level page so Apple Pay /
    Google Pay can be available.
  */
  document.body.classList.add(
    "mobile-direct-booking"
  );


  const consent =
    getConsent();


  /*
    First-time visitor:
    wait until cookie choice is made.
  */
  if (!consent) {
    return;
  }


  /*
    With marketing consent give Pixel
    a short time to send events.
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
    Continue automatically to the
    direct mobile booking page.
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
    Meta Pixel simply remains off.
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
