/**
 * Alton Chocolates — site interactions
 * Mobile nav, announcement dismiss, qty controls, build-a-box, filters
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function initAnnouncement() {
    var bar = document.querySelector("[data-announcement]");
    var closeBtn = document.querySelector("[data-announcement-close]");
    if (!bar || !closeBtn) return;

    try {
      if (sessionStorage.getItem("alton-announcement-dismissed") === "1") {
        bar.hidden = true;
        return;
      }
    } catch (e) {}

    closeBtn.addEventListener("click", function () {
      bar.hidden = true;
      try {
        sessionStorage.setItem("alton-announcement-dismissed", "1");
      } catch (e) {}
    });
  }

  function initMobileNav() {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!header || !toggle || !mobileNav) return;

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.hidden = !open;
    });
  }

  function initQtyControls(root) {
    var scope = root || document;
    scope.querySelectorAll("[data-qty]").forEach(function (control) {
      if (control.dataset.bound === "1") return;
      control.dataset.bound = "1";

      var valueEl = control.querySelector("[data-qty-value]");
      var minus = control.querySelector("[data-qty-minus]");
      var plus = control.querySelector("[data-qty-plus]");
      if (!valueEl || !minus || !plus) return;

      function setValue(next) {
        var n = Math.max(0, next);
        valueEl.textContent = String(n);
        control.dispatchEvent(
          new CustomEvent("qtychange", { bubbles: true, detail: { value: n } })
        );
      }

      minus.addEventListener("click", function () {
        setValue(parseInt(valueEl.textContent, 10) - 1);
      });
      plus.addEventListener("click", function () {
        setValue(parseInt(valueEl.textContent, 10) + 1);
      });
    });
  }

  function money(n) {
    return "$" + n.toFixed(2);
  }

  function initBuildBox() {
    var root = document.querySelector("[data-buildbox]");
    if (!root) return;

    var page = root.closest("main") || document;
    var sizes = page.querySelectorAll("[data-box-size]");
    var status = page.querySelector("[data-treat-status]");
    var orderList = page.querySelector("[data-order-list]");
    var orderName = page.querySelector("[data-order-box-name]");
    var subtotalEl = page.querySelector("[data-order-subtotal]");
    var taxEl = page.querySelector("[data-order-tax]");
    var totalEl = page.querySelector("[data-order-total]");
    var filters = page.querySelectorAll("[data-filter]");
    var treats = page.querySelectorAll("[data-treat]");

    var state = {
      boxName: "Sharing Treat Box",
      boxPrice: 78,
      min: 24,
      max: 36
    };

    function selectedCount() {
      var total = 0;
      treats.forEach(function (card) {
        var val = card.querySelector("[data-qty-value]");
        if (val) total += parseInt(val.textContent, 10) || 0;
      });
      return total;
    }

    function updateSummary() {
      var count = selectedCount();
      if (status) {
        status.textContent =
          count + " selected" + (count >= state.max ? " · limit reached" : "");
      }

      var lines = [];
      var extras = 0;
      treats.forEach(function (card) {
        var val = card.querySelector("[data-qty-value]");
        var qty = val ? parseInt(val.textContent, 10) || 0 : 0;
        if (qty > 0) {
          lines.push(
            '<div class="buildbox-order__row"><span>' +
              card.dataset.title +
              " × " +
              qty +
              "</span><span>$" +
              (qty * (parseFloat(card.dataset.price) || 3)).toFixed(0) +
              "</span></div>"
          );
          extras += qty * (parseFloat(card.dataset.price) || 3);
        }
      });

      if (orderList) {
        orderList.innerHTML = lines.length
          ? lines.join("")
          : '<p class="body-lg" style="font-size:14px;">No treats selected yet.</p>';
      }

      var subtotal = state.boxPrice + Math.max(0, extras - state.boxPrice);
      // Design uses "from" box price; keep box price as base when empty, otherwise sum treats with floor.
      subtotal = count === 0 ? state.boxPrice : Math.max(state.boxPrice, extras);
      var tax = 0;
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      if (taxEl) taxEl.textContent = money(tax);
      if (totalEl) totalEl.textContent = money(subtotal + tax);
      if (orderName) orderName.textContent = state.boxName;
    }

    sizes.forEach(function (btn) {
      btn.addEventListener("click", function () {
        sizes.forEach(function (b) {
          b.classList.remove("is-selected");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("is-selected");
        btn.setAttribute("aria-selected", "true");
        state.boxName = btn.dataset.boxName;
        state.boxPrice = parseFloat(btn.dataset.boxPrice) || 0;
        state.min = parseInt(btn.dataset.boxMin, 10) || 0;
        state.max = parseInt(btn.dataset.boxMax, 10) || 99;
        updateSummary();
      });
    });

    filters.forEach(function (pill) {
      pill.addEventListener("click", function () {
        filters.forEach(function (p) {
          p.classList.remove("is-active");
        });
        pill.classList.add("is-active");
        var key = pill.dataset.filter;
        treats.forEach(function (card) {
          var show = key === "all" || card.dataset.category === key;
          card.style.display = show ? "" : "none";
        });
      });
    });

    page.addEventListener("qtychange", function (e) {
      if (e.target.closest("[data-treat]")) updateSummary();
    });

    var continueBtn = page.querySelector("[data-continue-payment]");
    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        var count = selectedCount();
        if (count < state.min) {
          alert(
            "Please select at least " +
              state.min +
              " treats for the " +
              state.boxName +
              "."
          );
          return;
        }
        if (count > state.max) {
          alert("Please select no more than " + state.max + " treats.");
          return;
        }
        var formField = document.querySelector("#buildBoxOrderForm, [data-buildbox-form]");
        if (formField) formField.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    initQtyControls(page);
    updateSummary();
  }

  function initGiftQty() {
    initQtyControls(document);
  }

  function initTestimonials() {
    var track = document.querySelector("[data-testimonials-track]");
    if (!track) return;
    var prev = document.querySelector("[data-testimonials-prev]");
    var next = document.querySelector("[data-testimonials-next]");
    function scrollByCard(dir) {
      var card = track.querySelector(".testimonial-card");
      var amount = card ? card.getBoundingClientRect().width + 40 : 320;
      track.scrollBy({ left: dir * amount, behavior: "smooth" });
    }
    if (prev) prev.addEventListener("click", function () { scrollByCard(-1); });
    if (next) next.addEventListener("click", function () { scrollByCard(1); });
  }

  ready(function () {
    initAnnouncement();
    initMobileNav();
    initBuildBox();
    initGiftQty();
    initTestimonials();
  });
})();
