/* ===============================
   FOOTER YEAR
================================ */
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

/* ===============================
   PAGE-LOAD ANIMATION TRIGGER
   (THIS FIXES THE MISSING HERO)
================================ */
requestAnimationFrame(() => {
  document.documentElement.classList.add("is-loaded");
});

/* ===============================
   BIZ CAROUSEL AUTO-SCROLL
================================ */
(() => {
  const strip = document.querySelector(".biz-strip");
  const track = document.getElementById("bizTrack");
  if (!strip || !track) return;

  let intervalId = null;
  let paused = false;
  let userInteracting = false;
  const STEP_DELAY = 3000;

  const getStep = () => {
    const firstCard = track.querySelector(".biz-card");
    if (!firstCard) return 250;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || "0");
    const cardWidth = firstCard.getBoundingClientRect().width;
    return cardWidth + gap;
  };

  const next = () => {
    if (paused || userInteracting) return;

    const step = getStep();
    const maxScroll = strip.scrollWidth - strip.clientWidth;

    if (strip.scrollLeft >= maxScroll - 5) {
      strip.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    strip.scrollBy({ left: step, behavior: "smooth" });
  };

  const start = () => {
    if (intervalId) return;
    intervalId = setInterval(next, STEP_DELAY);
  };

  strip.addEventListener("mouseenter", () => paused = true);
  strip.addEventListener("mouseleave", () => paused = false);

  let scrollTimeout = null;
  strip.addEventListener("scroll", () => {
    userInteracting = true;
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => userInteracting = false, 400);
  }, { passive: true });

  strip.addEventListener("touchstart", () => userInteracting = true, { passive: true });
  strip.addEventListener("touchend", () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => userInteracting = false, 700);
  }, { passive: true });

  start();
})();

/* ===============================
   BIZ CAROUSEL ARROWS
================================ */
(() => {
  const strip = document.querySelector(".biz-strip");
  const track = document.getElementById("bizTrack");
  const leftBtn = document.querySelector(".biz-arrow.left");
  const rightBtn = document.querySelector(".biz-arrow.right");
  if (!strip || !track || !leftBtn || !rightBtn) return;

  const getStep = () => {
    const firstCard = track.querySelector(".biz-card");
    if (!firstCard) return 250;

    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap || "0");
    const cardWidth = firstCard.getBoundingClientRect().width;
    return cardWidth + gap;
  };

  leftBtn.addEventListener("click", () => {
    strip.scrollBy({ left: -getStep(), behavior: "smooth" });
  });

  rightBtn.addEventListener("click", () => {
    strip.scrollBy({ left: getStep(), behavior: "smooth" });
  });
})();

/* ===============================
   MOBILE NAV DROPDOWNS — FIXED
================================ */
(() => {

  const dropdowns = document.querySelectorAll(".nav-dropdown");

  const isTouch =
    window.matchMedia("(hover: none), (pointer: coarse)").matches;

  if (!isTouch) return;

  dropdowns.forEach(dd => {

    const btn = dd.querySelector(".nav-dropbtn");
    const menu = dd.querySelector(".nav-dropmenu");

    if (!btn || !menu) return;

    const close = () => {
      dd.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    };

    btn.addEventListener("click", (e) => {

      e.preventDefault();
      e.stopPropagation();

      const open = dd.classList.toggle("is-open");

      btn.setAttribute("aria-expanded", open ? "true" : "false");

    });

    menu.addEventListener("click", e => e.stopPropagation());

    document.addEventListener("click", e => {
      if (!dd.contains(e.target)) close();
    });

    document.addEventListener("keydown", e => {
      if (e.key === "Escape") close();
    });

  });

})();

/* ===============================
   FORM SUBMISSION HANDLER
================================ */
(() => {
  // ⬇️ PASTE your Google Apps Script Web App URL between the quotes.
  //    (Step-by-step in GOOGLE-SHEETS-SETUP.md — this is the ONLY line you edit.)
  const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbzqYBiRwV5ufqMKjRF2cdS4B7oX73ynHRx_aea41jTAcJVv2xBENRQMOh6-zk7edE0K/exec";

  const forms = document.querySelectorAll(".quote-form");

  forms.forEach((form) => {
    const card = form.closest(".hero-form-card");
    const thanks = card?.querySelector(".quote-thanks");
    if (!card || !thanks) return;

    let submitting = false;

    form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitting) return;

  // ---- Validation: email + phone ----
  const emailEl = form.querySelector('[name="email"]');
  const phoneEl = form.querySelector('[name="phone"]');

  if (emailEl) {
    emailEl.setCustomValidity("");
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());
    if (!emailOk) {
      emailEl.setCustomValidity("Please enter a valid email address (e.g. name@example.com).");
      emailEl.reportValidity();
      return;
    }
  }

  if (phoneEl) {
    phoneEl.setCustomValidity("");
    const digits = phoneEl.value.replace(/\D/g, "");
    const phoneOk = digits.length === 10 || (digits.length === 11 && digits[0] === "1");
    if (!phoneOk) {
      phoneEl.setCustomValidity("Please enter a valid 10-digit U.S. phone number.");
      phoneEl.reportValidity();
      return;
    }
  }

  // Let the browser check the remaining required fields too.
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Send as URL-encoded so Google Apps Script can read the fields
  // (it does NOT parse multipart/form-data into e.parameter).
  const body = new URLSearchParams(new FormData(form));

  submitting = true;
  const submitBtn = form.querySelector('[type="submit"]');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.dataset.label = submitBtn.textContent; submitBtn.textContent = "Sending…"; }

  try {
    await fetch(SHEET_ENDPOINT, {
      method: "POST",
      body: body,
      mode: "no-cors"
    });

    // Google Apps Script responses are opaque to the browser (no-cors mode),
    // so if the request didn't throw we treat it as delivered and thank the user.
    form.style.display = "none";
    thanks.style.display = "block";
    form.reset();

  } catch (err) {
    console.error("FETCH ERROR:", err);
    submitting = false;
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitBtn.dataset.label || "Submit"; }
    alert("Something went wrong sending your info. Please try again or call us at (727) 618-7152.");
  }
});

  // Clear the custom error as soon as the user edits the field.
  ["email", "phone"].forEach((n) => {
    const el = form.querySelector('[name="' + n + '"]');
    if (el) el.addEventListener("input", () => el.setCustomValidity(""));
  });
  });
})();

/* =========================================
   HAMBURGER MENU (CORRECT FINAL FIX)
========================================= */
(() => {

  const hamburger = document.getElementById("hamburgerBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!hamburger || !mobileMenu) return;


  /* THE REAL FUNCTION */
  const setOpen = (open) => {

  mobileMenu.classList.toggle("open", open);

  document.body.classList.toggle("menu-open", open);

  hamburger.setAttribute("aria-expanded", open ? "true" : "false");

  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");


  /* THIS LINE CLOSES ALL SECTIONS WHEN MENU OPENS */
  if (open){

    document.querySelectorAll(".mm-group").forEach(group => {

      group.classList.remove("open");

    });

  }

};


  /* CLICK HAMBURGER */
  hamburger.addEventListener("click", (e) => {

    e.preventDefault();
    e.stopPropagation();

    setOpen(!mobileMenu.classList.contains("open"));

  });


  /* CLICK MENU LINK */
  mobileMenu.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => setOpen(false));

  });


  /* CLICK OUTSIDE */
  document.addEventListener("click", (e) => {

    if (!mobileMenu.classList.contains("open")) return;

    if (mobileMenu.contains(e.target)) return;

    if (hamburger.contains(e.target)) return;

    setOpen(false);

  });


  /* ESC KEY */
  document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

      setOpen(false);

    }

  });

})();


/* MOBILE DROPDOWN TOGGLES */

document.querySelectorAll(".mm-toggle").forEach(button => {

  button.addEventListener("click", function(){

    const group = this.parentElement;

    const isOpen = group.classList.contains("open");


    /* close all */
    document.querySelectorAll(".mm-group").forEach(g => {

      g.classList.remove("open");

    });


    /* open clicked */
    if (!isOpen){

      group.classList.add("open");

    }

  });

});

// FAQ ACCORDION
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const answer = faqItem.querySelector('.faq-answer');
    const icon = button.querySelector('.faq-icon');

    document.querySelectorAll('.faq-item').forEach(item => {
      if (item !== faqItem) {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.display = 'none';
        item.querySelector('.faq-icon').textContent = '+';
      }
    });

    if (faqItem.classList.contains('active')) {
      faqItem.classList.remove('active');
      answer.style.display = 'none';
      icon.textContent = '+';
    } else {
      faqItem.classList.add('active');
      answer.style.display = 'block';
      icon.textContent = '−';
    }
  });
});
