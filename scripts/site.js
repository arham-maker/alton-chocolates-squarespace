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

    function dismiss() {
      bar.hidden = true;
      bar.setAttribute("hidden", "");
      bar.classList.add("is-dismissed");
      bar.style.setProperty("display", "none", "important");
      try {
        sessionStorage.setItem("alton-announcement-dismissed", "1");
      } catch (e) {}
    }

    try {
      if (sessionStorage.getItem("alton-announcement-dismissed") === "1") {
        dismiss();
        return;
      }
    } catch (e) {}

    closeBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      dismiss();
    });
  }

  function initMobileNav() {
    var header = document.querySelector("[data-site-header]");
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (!header || !toggle || !mobileNav) return;

    if (!mobileNav.querySelector("[data-mobile-account]")) {
      var account = document.createElement("a");
      account.href = "/sign-in";
      account.className = "mobile-nav__account";
      account.setAttribute("data-mobile-account", "");
      account.setAttribute("data-account-link", "");
      account.textContent = "Account / Sign In";
      mobileNav.appendChild(account);
    }

    toggle.addEventListener("click", function () {
      var open = header.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileNav.hidden = !open;
      if (open) mobileNav.removeAttribute("hidden");
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

      var min = parseInt(control.getAttribute("data-qty-min"), 10);
      if (isNaN(min) || min < 0) min = 0;

      function setValue(next) {
        var raw = parseInt(next, 10);
        if (isNaN(raw)) raw = min;
        var n = Math.max(min, raw);
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
    var val = Number(n);
    if (!isFinite(val)) val = 0;
    return "$" + val.toFixed(2);
  }

  function slugify(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/&amp;/g, "and")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  var PRODUCT_CATALOG = {
    "salted-caramel": { title: "Salted Caramel", price: 28, image: "/assets/images/shop-product-1.png", category: "Bonbons", kind: "product", desc: "A classic salted caramel finished in silky chocolate.", meta: "Bonbon" },
    "raspberry-chocolate": { title: "Raspberry Chocolate", price: 12, image: "/assets/images/shop-product-2.png", category: "Bonbons", kind: "product", desc: "Bright raspberry ganache in a delicate chocolate shell.", meta: "Bonbon" },
    "passion-fruit-ganache": { title: "Passion Fruit Ganache", price: 16, image: "/assets/images/shop-product-3.png", category: "Bonbons", kind: "product", desc: "Tangy passion fruit ganache balanced with dark chocolate.", meta: "Bonbon" },
    "pistachio-praline": { title: "Pistachio Praline", price: 14, image: "/assets/images/shop-product-4.png", category: "Bonbons", kind: "product", desc: "Roasted pistachio praline with a crisp chocolate shell.", meta: "Bonbon" },
    "hazelnut-praline": { title: "Hazelnut Praline", price: 28, image: "/assets/images/shop-product-5.png", category: "Bonbons", kind: "product", desc: "Smooth hazelnut praline for a rich, nutty finish.", meta: "Bonbon" },
    "coconut-ganache": { title: "Coconut Ganache", price: 12, image: "/assets/images/shop-product-6.png", category: "Bonbons", kind: "product", desc: "Creamy coconut ganache wrapped in milk chocolate.", meta: "Bonbon" },
    "blueberry-vanilla-ganache": { title: "Blueberry Vanilla Ganache", price: 16, image: "/assets/images/shop-product-7.png", category: "Bonbons", kind: "product", desc: "Blueberry and vanilla ganache in a soft shell.", meta: "Bonbon" },
    "mint-dark-chocolate": { title: "Mint Dark Chocolate", price: 14, image: "/assets/images/shop-product-8.png", category: "Bonbons", kind: "product", desc: "Cool mint meets deep dark chocolate.", meta: "Bonbon" },
    "artisan-chocolate-bar": { title: "Artisan Chocolate Bar", price: 12, image: "/assets/images/product-bar.png", category: "Chocolate Bars", kind: "product", desc: "A smooth artisan chocolate bar for everyday savoring.", meta: "Bar · 70g" },
    "sea-salt-chocolate-bar-set": { title: "Sea Salt Chocolate Bar Set", price: 24, image: "/assets/images/gift-prod-3.png", category: "Chocolate Bars", kind: "product", desc: "A set of sea salt bars ready for gifting or sharing.", meta: "Bar set" },
    "chocolate-bark-box": { title: "Chocolate Bark Box", price: 29, image: "/assets/images/gift-coll-2.png", category: "Bark", kind: "gift", desc: "Crisp chocolate bark pieces in a ready-to-gift box.", meta: "Bark box" },
    "dark-and-white-bark-assortment": { title: "Dark & White Bark Assortment", price: 28, image: "/assets/images/gift-prod-8.png", category: "Bark", kind: "gift", desc: "An assortment of dark and white chocolate bark.", meta: "Bark" },
    "sea-salt-caramels": { title: "Sea Salt Caramels", price: 16, image: "/assets/images/product-caramels.png", category: "Caramels", kind: "product", desc: "Soft caramels finished with flaky sea salt.", meta: "Caramels" },
    "sea-salt-caramel-gift-box": { title: "Sea Salt Caramel Gift Box", price: 28, image: "/assets/images/gift-prod-5.png", category: "Caramels", kind: "gift", desc: "Sea salt caramels presented in gift-ready packaging.", meta: "Gift box" },
    "bonbon-collection": { title: "Bonbon Collection", price: 28, image: "/assets/images/product-bonbon.png", category: "Bonbons", kind: "product", desc: "A curated collection of handcrafted bonbons.", meta: "Collection" },
    "chocolate-bar": { title: "Chocolate Bar", price: 12, image: "/assets/images/product-bar.png", category: "Chocolate Bars", kind: "product", desc: "Classic Alton chocolate bar.", meta: "Bar · 70g" },
    "chocolate-cookies": { title: "Chocolate Cookies", price: 14, image: "/assets/images/product-cookies.png", category: "Cookies", kind: "product", desc: "Rich chocolate cookies baked in small batches.", meta: "Cookies" },
    "sea-salt-chocolate-bar": { title: "Sea Salt Chocolate Bar", price: 12, image: "/assets/images/product-detail-bar.png", category: "Chocolate Bars", kind: "product", desc: "A silky dark chocolate bar finished with flaky sea salt. Smooth, balanced, and made for savoring one square at a time.", meta: "Mostly Dark · 70g" },
    "signature-celebration-gift-box": { title: "Signature Celebration Gift Box", price: 48, image: "/assets/images/gift-detail.png", category: "Gift Boxes", kind: "gift", desc: "Twelve handcrafted pieces in a ready-to-gift box — mostly dark chocolates chosen for celebrations, thank-yous, and everyday indulgence.", meta: "Mostly Dark · 12 pieces" },
    "signature-bonbon-box": { title: "Signature Bonbon Box", price: 48, image: "/assets/images/gift-coll-1.png", category: "Gift Boxes", kind: "gift", desc: "Our signature bonbon assortment in ribbon-ready packaging.", meta: "12 pieces" },
    "sea-salt-caramels-gift": { title: "Sea Salt Caramels", price: 34, image: "/assets/images/gift-coll-3.png", category: "Gift Boxes", kind: "gift", desc: "Soft sea salt caramels presented as a premium gift.", meta: "Gift" },
    "artisan-chocolate-bars": { title: "Artisan Chocolate Bars", price: 18, image: "/assets/images/gift-coll-4.png", category: "Gift Boxes", kind: "gift", desc: "A selection of artisan chocolate bars for gifting.", meta: "Bars" },
    "toffee-collections": { title: "Toffee Collections", price: 28, image: "/assets/images/gift-coll-5.png", category: "Gift Boxes", kind: "gift", desc: "Buttery toffee collections ready to gift.", meta: "Toffee" },
    "chocolate-chip-cookies": { title: "Chocolate Chip Cookies", price: 34, image: "/assets/images/gift-coll-6.png", category: "Gift Boxes", kind: "gift", desc: "Chocolate chip cookies in gift packaging.", meta: "Cookies" },
    "signature-bonbon-collection": { title: "Signature Bonbon Collection", price: 32, image: "/assets/images/gift-prod-1.png", category: "Gift Boxes", kind: "gift", desc: "Signature bonbons for birthdays and celebrations.", meta: "Collection" },
    "artisan-chocolate-bark-collection": { title: "Artisan Chocolate Bark Collection", price: 26, image: "/assets/images/gift-prod-2.png", category: "Gift Boxes", kind: "gift", desc: "Artisan bark assortment for thank-yous and holidays.", meta: "Bark" },
    "classic-english-toffee": { title: "Classic English Toffee", price: 28, image: "/assets/images/gift-prod-4.png", category: "Gift Boxes", kind: "gift", desc: "Classic English toffee with a chocolate finish.", meta: "Toffee" },
    "chocolate-cookie-collection": { title: "Chocolate Cookie Collection", price: 24, image: "/assets/images/gift-prod-6.png", category: "Gift Boxes", kind: "gift", desc: "A collection of chocolate cookies for sharing.", meta: "Cookies" },
    "dark-chocolate-bonbon-box": { title: "Dark Chocolate Bonbon Box", price: 34, image: "/assets/images/gift-prod-7.png", category: "Gift Boxes", kind: "gift", desc: "Mostly dark bonbons in a celebration-ready box.", meta: "Bonbons" },
    "hazelnut-crunch-bar-set": { title: "Hazelnut Crunch Bar Set", price: 28, image: "/assets/images/gift-prod-1.png", category: "Gift Boxes", kind: "gift", desc: "Hazelnut crunch bars packaged as a set.", meta: "Bars" },
    "vanilla-bean-toffee-collection": { title: "Vanilla Bean Toffee Collection", price: 32, image: "/assets/images/gift-prod-2.png", category: "Gift Boxes", kind: "gift", desc: "Vanilla bean toffee for holidays and celebrations.", meta: "Toffee" },
    "caramel-assortment-box": { title: "Caramel Assortment Box", price: 32, image: "/assets/images/gift-prod-3.png", category: "Gift Boxes", kind: "gift", desc: "An assortment of soft caramels in gift packaging.", meta: "Caramels" },
    "double-chocolate-cookie-box": { title: "Double Chocolate Cookie Box", price: 22, image: "/assets/images/gift-prod-4.png", category: "Gift Boxes", kind: "gift", desc: "Double chocolate cookies boxed for gifting.", meta: "Cookies" }
  };

  function getCatalogItem(id) {
    if (!id) return null;
    return PRODUCT_CATALOG[String(id)] || null;
  }

  function cartStorageGet(key) {
    try {
      var raw = localStorage.getItem(key);
      if (raw != null) return raw;
    } catch (e) {}
    try {
      return sessionStorage.getItem(key);
    } catch (e2) {}
    return null;
  }

  function cartStorageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
    try {
      sessionStorage.removeItem(key);
    } catch (e2) {}
  }

  function openMailto(mailto) {
    try {
      var a = document.createElement("a");
      a.href = mailto;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      window.location.href = mailto;
    }
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
        var formField = document.querySelector("[data-buildbox-form]");
        if (formField) {
          formField.scrollIntoView({ behavior: "smooth", block: "start" });
          var first = formField.querySelector("input, textarea");
          if (first) setTimeout(function () { first.focus(); }, 400);
        }
      });
    }

    initQtyControls(page);
    updateSummary();
  }

  function initGiftQty() {
    initQtyControls(document);

    var pills = document.querySelectorAll("[data-gift-filter]");
    var cards = document.querySelectorAll("[data-gift-card]");
    if (!pills.length || !cards.length) return;

    var state = { price: "under-50", occasion: "" };

    function applyFilters() {
      var max = null;
      if (state.price === "under-25") max = 25;
      else if (state.price === "under-50") max = 50;
      else if (state.price === "under-75") max = 75;

      cards.forEach(function (card) {
        var price = parseFloat(card.getAttribute("data-price")) || 0;
        var occ = (card.getAttribute("data-occasion") || "").toLowerCase();
        var priceOk = max == null || price <= max;
        var occOk = !state.occasion || occ.indexOf(state.occasion) !== -1;
        card.hidden = !(priceOk && occOk);
        card.style.display = "";
      });
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var key = pill.getAttribute("data-gift-filter") || "";
        var isPrice = key.indexOf("under-") === 0;
        if (isPrice) {
          state.price = key;
          pills.forEach(function (p) {
            if ((p.getAttribute("data-gift-filter") || "").indexOf("under-") === 0) {
              p.classList.toggle("is-active", p === pill);
            }
          });
        } else {
          // toggle occasion (click again to clear)
          state.occasion = state.occasion === key ? "" : key;
          pills.forEach(function (p) {
            var k = p.getAttribute("data-gift-filter") || "";
            if (k.indexOf("under-") !== 0) {
              p.classList.toggle("is-active", k === state.occasion);
            }
          });
        }
        applyFilters();
      });
    });

    // honor default active price pill
    var activePrice = document.querySelector(
      '[data-gift-filter].is-active[data-gift-filter^="under-"], [data-gift-filter^="under-"].is-active'
    );
    if (!activePrice) {
      activePrice = document.querySelector('[data-gift-filter="under-50"]');
    }
    if (activePrice) {
      state.price = activePrice.getAttribute("data-gift-filter") || "under-50";
    }
    applyFilters();
  }

  function initTestimonials() {
    document.querySelectorAll("[data-testimonials]").forEach(function (section) {
      var track = section.querySelector("[data-testimonials-track]");
      var viewport = section.querySelector(".testimonials__viewport");
      var prev = section.querySelector("[data-testimonials-prev]");
      var next = section.querySelector("[data-testimonials-next]");
      if (!track || !viewport) return;

      // Drop empty cards (e.g. collection products with no quote text)
      Array.prototype.slice
        .call(track.querySelectorAll(".testimonial-card"))
        .forEach(function (card) {
          var quote = card.querySelector(".testimonial-card__quote");
          var text = quote ? String(quote.textContent || "").replace(/\s+/g, " ").trim() : "";
          if (!text || text === "—" || text.length < 3) {
            card.parentNode.removeChild(card);
          }
        });

      var defaults = [
        {
          q: "“Every box feels like a celebration. The flavors are delicate, rich, and unforgettable.”",
          n: "— Jamie L."
        },
        {
          q: "“Alton chocolates made our wedding favors the talk of the evening.”",
          n: "— Morgan S."
        },
        {
          q: "“The bonbons are pure artistry. Beautiful shells and incredible fillings.”",
          n: "— Riley T."
        },
        {
          q: "“Our go-to gift for every occasion. Always arrives looking perfect.”",
          n: "— Avery K."
        },
        {
          q: "“From salted caramel to pistachio praline, every piece is a delight.”",
          n: "— Sam P."
        },
        {
          q: "“Thoughtful packaging and flavors that feel truly handcrafted.”",
          n: "— Jordan M."
        }
      ];

      if (!track.querySelectorAll(".testimonial-card").length) {
        track.innerHTML = defaults
          .map(function (item) {
            return (
              '<article class="testimonial-card">' +
              '<p class="testimonial-card__quote">' +
              item.q +
              "</p>" +
              '<p class="testimonial-card__name">' +
              item.n +
              "</p>" +
              "</article>"
            );
          })
          .join("");
      }

      var cards = Array.prototype.slice.call(track.querySelectorAll(".testimonial-card"));
      if (!cards.length) return;

      var index = 0;
      var timer = null;
      var gap = 40;

      function perView() {
        if (window.matchMedia("(max-width: 640px)").matches) return 1;
        if (window.matchMedia("(max-width: 900px)").matches) return 2;
        return 3;
      }

      function maxIndex() {
        return Math.max(0, cards.length - perView());
      }

      function layout() {
        var styles = window.getComputedStyle(track);
        gap = parseFloat(styles.columnGap || styles.gap) || 40;
        var view = perView();
        var width =
          viewport.getBoundingClientRect().width ||
          viewport.clientWidth ||
          section.clientWidth ||
          900;
        if (width < 80) width = 900;
        var cardWidth = Math.max(180, (width - gap * (view - 1)) / view);
        cards.forEach(function (card) {
          card.style.setProperty("flex", "0 0 " + cardWidth + "px", "important");
          card.style.setProperty("width", cardWidth + "px", "important");
          card.style.setProperty("max-width", cardWidth + "px", "important");
          card.style.setProperty("min-width", Math.max(180, cardWidth) + "px", "important");
          card.style.setProperty("opacity", "1", "important");
          card.style.setProperty("visibility", "visible", "important");
        });
        track.style.setProperty("display", "flex", "important");
        track.style.setProperty("transform", track.style.transform || "translate3d(0,0,0)");
        viewport.style.setProperty("overflow", "hidden", "important");
        viewport.style.setProperty("min-height", "160px", "important");
      }

      function goTo(nextIndex, animate) {
        var max = maxIndex();
        if (nextIndex < 0) nextIndex = max;
        if (nextIndex > max) nextIndex = 0;
        index = nextIndex;

        var card = cards[0];
        var step = (card.getBoundingClientRect().width || card.offsetWidth || 280) + gap;
        track.style.transition = animate === false ? "none" : "transform 0.45s ease";
        track.style.transform = "translate3d(" + -(index * step) + "px, 0, 0)";
      }

      function refresh() {
        layout();
        goTo(Math.min(index, maxIndex()), false);
      }

      if (prev) {
        prev.addEventListener("click", function (e) {
          e.preventDefault();
          goTo(index - 1);
          restartAuto();
        });
      }
      if (next) {
        next.addEventListener("click", function (e) {
          e.preventDefault();
          goTo(index + 1);
          restartAuto();
        });
      }

      var startX = 0;
      var dragging = false;
      track.addEventListener(
        "touchstart",
        function (e) {
          if (!e.touches.length) return;
          startX = e.touches[0].clientX;
          dragging = true;
          restartAuto();
        },
        { passive: true }
      );
      track.addEventListener(
        "touchend",
        function (e) {
          if (!dragging || !e.changedTouches.length) return;
          var dx = e.changedTouches[0].clientX - startX;
          dragging = false;
          if (Math.abs(dx) < 40) return;
          goTo(index + (dx < 0 ? 1 : -1));
        },
        { passive: true }
      );

      function restartAuto() {
        if (timer) clearInterval(timer);
        timer = setInterval(function () {
          goTo(index + 1);
        }, 5000);
      }

      window.addEventListener("resize", refresh);
      // layout after paint so viewport has real width
      refresh();
      if (window.requestAnimationFrame) {
        window.requestAnimationFrame(function () {
          refresh();
        });
      }
      setTimeout(refresh, 100);
      restartAuto();
    });
  }

  function initEditableSlots() {
    document.querySelectorAll("[data-alton-editable]").forEach(function (slot) {
      var cms = slot.querySelector(".alton-editable__cms");
      if (!cms) return;
      var has =
        cms.querySelector(
          ".sqs-block, .sqs-block-html, .sqs-block-button, .sqs-block-image, .sqs-block-markdown, .sqs-block-summary-v2, .sqs-block-product, .sqs-block-form, .sqs-block-newsletter, .sqs-block-quote, .sqs-block-gallery"
        ) !== null;
      if (has) slot.classList.add("has-cms");
    });

    var announce = document.querySelector("[data-announcement]");
    if (announce) {
      var edit = announce.querySelector(".announcement-bar__editable");
      if (
        edit &&
        edit.querySelector(".sqs-block, .sqs-block-html, p") &&
        String(edit.textContent || "").replace(/\s+/g, " ").trim().length > 2
      ) {
        announce.classList.add("has-cms-announcement");
      }
    }
  }

  function initSqsFormSlots() {
    document.querySelectorAll("[data-sqs-form-slot]").forEach(function (slot) {
      var hasReal =
        slot.querySelector(".sqs-block, .form-wrapper, form, .newsletter-block, .sqs-block-form") !==
        null;
      if (!hasReal) return;
      var wrap =
        slot.closest(".contact-section__form") ||
        slot.closest(".newsletter__inner");
      if (wrap) wrap.classList.add("has-sqs-form");
    });
  }

  function setFormStatus(form, message, type) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.hidden = false;
    status.textContent = message;
    status.classList.remove("is-success", "is-error");
    if (type) status.classList.add(type);
  }

  function showThanks(message) {
    var modal = document.querySelector("[data-thanks]");
    if (!modal) return;
    var msg = modal.querySelector("[data-thanks-message]");
    if (msg && message) msg.textContent = message;
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    // restart check animation
    var svg = modal.querySelector(".alton-thanks__check");
    if (svg) {
      var clone = svg.cloneNode(true);
      svg.parentNode.replaceChild(clone, svg);
    }
  }

  function hideThanks() {
    var modal = document.querySelector("[data-thanks]");
    if (!modal) return;
    modal.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function initThanks() {
    document.querySelectorAll("[data-thanks-close]").forEach(function (btn) {
      btn.addEventListener("click", hideThanks);
    });
    document.addEventListener("keydown", function (e) {
      var modal = document.querySelector("[data-thanks]");
      if (e.key === "Escape" && modal && !modal.hidden) hideThanks();
    });
  }

  function initShop() {
    var tabs = document.querySelectorAll("[data-shop-tab]");
    var products = document.querySelectorAll("[data-shop-product]");
    var empty = document.querySelector("[data-shop-empty]");
    if (!tabs.length || !products.length) return;

    function showCategory(cat) {
      var visible = 0;
      products.forEach(function (card) {
        var match = card.getAttribute("data-category") === cat;
        card.hidden = !match;
        card.classList.remove("is-entering");
        if (match) {
          visible += 1;
          // reflow for animation
          void card.offsetWidth;
          card.classList.add("is-entering");
        }
      });
      if (empty) empty.hidden = visible > 0;
      var grid = document.querySelector("[data-shop-products]");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function activateCategory(cat, scroll) {
      if (!cat) return;
      var match = null;
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-shop-tab") === cat;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        if (on) match = t;
      });
      if (!match) return;
      // temporarily disable scroll on deep-link
      if (scroll === false) {
        var grid = document.querySelector("[data-shop-products]");
        var orig = grid && grid.scrollIntoView;
        if (grid) grid.scrollIntoView = function () {};
        showCategory(cat);
        if (grid && orig) grid.scrollIntoView = orig;
      } else {
        showCategory(cat);
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-shop-tab");
        activateCategory(cat, true);
        try {
          var url = new URL(window.location.href);
          url.searchParams.set("category", cat);
          window.history.replaceState({}, "", url.pathname + "?" + url.searchParams.toString() + url.hash);
        } catch (e) {}
      });
    });

    var params = new URLSearchParams(window.location.search);
    var deepCat = params.get("category") || params.get("tab") || "";
    if (deepCat) {
      activateCategory(deepCat, false);
    }

    initQtyControls(document.querySelector("[data-shop-products]"));
    initOrderButtons();
  }

  var orderCart = [];

  function loadOrderCart() {
    try {
      var raw = cartStorageGet("alton-order-cart");
      orderCart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(orderCart)) orderCart = [];
      // migrate sessionStorage cart into localStorage when present
      try {
        if (raw && !localStorage.getItem("alton-order-cart")) {
          localStorage.setItem("alton-order-cart", raw);
        }
      } catch (e2) {}
    } catch (e) {
      orderCart = [];
    }
  }

  function saveOrderCart() {
    try {
      cartStorageSet("alton-order-cart", JSON.stringify(orderCart));
    } catch (e) {}
  }

  function clearOrderCart() {
    orderCart = [];
    saveOrderCart();
    updateCartCountBadge();
  }

  function cartGrandTotal() {
    return orderCart.reduce(function (sum, item) {
      var price = parseFloat(item.price) || 0;
      var qty = parseInt(item.qty, 10) || 0;
      return sum + price * qty;
    }, 0);
  }

  function addToOrderCart(item) {
    var qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    var price = parseFloat(item.price) || 0;
    var title = String(item.title || "Item").trim();
    var image = item.image ? String(item.image) : "";
    var meta = item.meta ? String(item.meta) : "";
    var editUrl = item.editUrl ? String(item.editUrl) : "";
    var id = item.id ? String(item.id) : slugify(title);
    var existing = null;
    for (var i = 0; i < orderCart.length; i++) {
      var sameId = id && orderCart[i].id && orderCart[i].id === id;
      var sameLegacy =
        !id &&
        orderCart[i].title === title &&
        orderCart[i].price === price &&
        String(orderCart[i].meta || "") === meta;
      if (sameId || sameLegacy) {
        existing = orderCart[i];
        break;
      }
    }
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
      if (image) existing.image = image;
      if (meta) existing.meta = meta;
      if (editUrl) existing.editUrl = editUrl;
      if (id) existing.id = id;
      if (title) existing.title = title;
      existing.price = price;
    } else {
      var row = { id: id, title: title, price: price, qty: qty };
      if (image) row.image = image;
      if (meta) row.meta = meta;
      if (editUrl) row.editUrl = editUrl;
      orderCart.push(row);
    }
    saveOrderCart();
    updateCartCountBadge();
  }

  function setOrderCartQty(index, qty) {
    var idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= orderCart.length) return;
    var next = Math.max(0, Math.min(99, parseInt(qty, 10) || 0));
    if (next < 1) {
      orderCart.splice(idx, 1);
    } else {
      orderCart[idx].qty = next;
    }
    saveOrderCart();
    updateCartCountBadge();
  }

  function cartItemCount() {
    return orderCart.reduce(function (n, item) {
      return n + (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  function updateCartCountBadge() {
    loadOrderCart();
    var count = cartItemCount();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      if (count > 0) {
        el.textContent = String(count);
        el.removeAttribute("data-empty");
      } else {
        el.textContent = "";
        el.setAttribute("data-empty", "1");
      }
    });
  }

  function removeFromOrderCart(index) {
    var idx = parseInt(index, 10);
    if (isNaN(idx) || idx < 0 || idx >= orderCart.length) return;
    orderCart.splice(idx, 1);
    saveOrderCart();
    updateCartCountBadge();
    renderOrderCart();
    if (!orderCart.length) closeOrderModal();
  }

  function renderOrderCart() {
    var modal = document.querySelector("[data-order-modal]");
    if (!modal) return;
    var list = modal.querySelector("[data-order-cart]");
    var grand = modal.querySelector("[data-order-grand]");
    var form = modal.querySelector("[data-order-form]");
    if (!list) return;

    if (!orderCart.length) {
      list.innerHTML = '<p class="body-lg">Your order is empty.</p>';
      if (grand) grand.textContent = "";
      return;
    }

    list.innerHTML = orderCart
      .map(function (item, idx) {
        var line = (item.price * item.qty).toFixed(2);
        return (
          '<div class="alton-order__line" data-cart-index="' +
          idx +
          '">' +
          '<div class="alton-order__line-main">' +
          "<strong>" +
          item.qty +
          " × " +
          escapeHtml(item.title) +
          "</strong>" +
          "<span>$" +
          line +
          "</span>" +
          "</div>" +
          '<button type="button" class="alton-order__line-remove" data-cart-remove="' +
          idx +
          '" aria-label="Remove ' +
          escapeHtml(item.title) +
          '">Remove</button>' +
          "</div>"
        );
      })
      .join("");

    var total = cartGrandTotal().toFixed(2);
    if (grand) grand.textContent = "Order total: $" + total;

    if (form) {
      var titles = orderCart
        .map(function (i) {
          return i.qty + "x " + i.title;
        })
        .join(", ");
      var set = function (sel, val) {
        var el = form.querySelector(sel);
        if (el) el.value = val;
      };
      set("[data-order-product]", titles);
      set(
        "[data-order-qty]",
        String(
          orderCart.reduce(function (n, i) {
            return n + i.qty;
          }, 0)
        )
      );
      set("[data-order-unit]", "");
      set("[data-order-total]", total);
      set(
        "[data-order-lines]",
        orderCart
          .map(function (i) {
            return i.qty + " × " + i.title + " @ $" + i.price.toFixed(2);
          })
          .join("\n")
      );
    }

    list.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        removeFromOrderCart(parseInt(btn.getAttribute("data-cart-remove"), 10));
      });
    });
  }

  function initOrderButtons() {
    initOrderModal();
    loadOrderCart();

    function readOrderFromCard(card) {
      var title =
        card.getAttribute("data-title") ||
        (card.querySelector(".product-title")
          ? card.querySelector(".product-title").textContent.trim()
          : "Item");
      var id =
        card.getAttribute("data-product-id") ||
        card.getAttribute("data-id") ||
        slugify(title);
      var priceAttr = card.getAttribute("data-price");
      var price = parseFloat(priceAttr);
      if (isNaN(price)) {
        var priceEl = card.querySelector(".product-card__price");
        price = priceEl
          ? parseFloat(String(priceEl.textContent).replace(/[^0-9.]/g, "")) || 0
          : 0;
      }
      var catalog = getCatalogItem(id);
      if (catalog && (!price || isNaN(price))) price = catalog.price;
      if (catalog && (!title || title === "Item")) title = catalog.title;
      var qtyEl = card.querySelector("[data-qty-value]");
      var qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
      if (qty < 1) qty = 1;
      if (qty > 99) qty = 99;
      var imgEl = card.querySelector(".product-card__image img, .gift-collection-card__image img, img");
      var image = imgEl ? imgEl.getAttribute("src") || "" : "";
      if (!image && catalog) image = catalog.image || "";
      var isGift =
        card.hasAttribute("data-gift-card") ||
        card.getAttribute("data-category") === "gifts" ||
        card.classList.contains("gift-collection-card") ||
        (catalog && catalog.kind === "gift");
      var base = isGift ? "/gift-details" : "/product";
      var editUrl =
        card.getAttribute("data-edit-url") ||
        base + "?id=" + encodeURIComponent(id);
      return {
        id: id,
        title: title,
        price: price,
        qty: qty,
        image: image,
        editUrl: editUrl,
        meta: catalog ? catalog.meta || "" : ""
      };
    }

    function orderFromCard(card) {
      if (!card) return;
      addToOrderCart(readOrderFromCard(card));
      window.location.href = "/cart";
    }

    function goToProductPage(card) {
      if (!card) return;
      var data = readOrderFromCard(card);
      try {
        sessionStorage.setItem("alton-pdp-preview", JSON.stringify(data));
      } catch (e) {}
      var href =
        card.getAttribute("data-edit-url") ||
        (card.querySelector('a[href*="/product"], a[href*="/gift-details"]')
          ? card.querySelector('a[href*="/product"], a[href*="/gift-details"]').getAttribute("href")
          : null) ||
        data.editUrl;
      window.location.href = href;
    }

    document.querySelectorAll("[data-shop-order]").forEach(function (btn) {
      if (btn.dataset.boundOrder === "1") return;
      btn.dataset.boundOrder = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        orderFromCard(
          btn.closest("[data-shop-product], [data-gift-card], .product-card")
        );
      });
    });

    document
      .querySelectorAll(
        "[data-shop-product], [data-gift-card], .product-card[data-orderable], .gift-collection-card"
      )
      .forEach(function (card) {
        if (card.dataset.boundCardOrder === "1") return;
        card.dataset.boundCardOrder = "1";
        card.classList.add("product-card--orderable");
        if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");

        card.addEventListener("click", function (e) {
          if (
            e.target.closest(
              "[data-qty], [data-qty-minus], [data-qty-plus], a, button"
            )
          ) {
            return;
          }
          e.preventDefault();
          goToProductPage(card);
        });

        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            goToProductPage(card);
          }
        });
      });
  }

  function openOrderModal() {
    var modal = document.querySelector("[data-order-modal]");
    if (!modal) return;
    loadOrderCart();
    if (!orderCart.length) return;
    renderOrderCart();
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
    var first = modal.querySelector("#order-name");
    if (first) setTimeout(function () { first.focus(); }, 50);
  }

  function closeOrderModal() {
    var modal = document.querySelector("[data-order-modal]");
    if (!modal) return;
    modal.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function initOrderModal() {
    var modal = document.querySelector("[data-order-modal]");
    if (!modal || modal.getAttribute("data-ready")) return;
    modal.setAttribute("data-ready", "1");
    loadOrderCart();

    modal.querySelectorAll("[data-order-close]").forEach(function (el) {
      el.addEventListener("click", closeOrderModal);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal && !modal.hidden) closeOrderModal();
    });

    var form = modal.querySelector("[data-order-form]");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      loadOrderCart();
      if (!orderCart.length) {
        closeOrderModal();
        return;
      }

      var data = new FormData(form);
      var total = cartGrandTotal().toFixed(2);
      var itemLines = orderCart.map(function (item) {
        return (
          "- " +
          item.qty +
          " × " +
          item.title +
          " @ $" +
          item.price.toFixed(2) +
          " = $" +
          (item.price * item.qty).toFixed(2)
        );
      });
      var lines = [
        "New Alton Chocolates order",
        "",
        "Items:",
        itemLines.join("\n"),
        "",
        "Order total: $" + total,
        "",
        "Customer details:",
        "Name: " + String(data.get("name") || ""),
        "Email: " + String(data.get("email") || ""),
        "Phone: " + String(data.get("phone") || ""),
        "Address: " + String(data.get("address") || ""),
        "Notes: " + String(data.get("notes") || "")
      ];

      var subjectItems = orderCart
        .map(function (i) {
          return i.title;
        })
        .slice(0, 3)
        .join(", ");
      if (orderCart.length > 3) subjectItems += " + more";

      var mailto =
        "mailto:galton4@gmail.com?subject=" +
        encodeURIComponent("Alton order — " + subjectItems) +
        "&body=" +
        encodeURIComponent(lines.join("\n"));

      var count = orderCart.reduce(function (n, i) {
        return n + i.qty;
      }, 0);
      closeOrderModal();
      form.reset();
      showThanks(
        "Order submitted (" +
          count +
          " item" +
          (count === 1 ? "" : "s") +
          ", $" +
          total +
          "). We will confirm by email shortly."
      );
      openMailto(mailto);
      clearOrderCart();
    });

    document.querySelectorAll("[data-order-open]").forEach(function (btn) {
      if (btn.dataset.boundOrderOpen === "1") return;
      btn.dataset.boundOrderOpen = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openOrderModal();
      });
    });
  }

  function initForms() {
    var contactEmail = "galton4@gmail.com";

    var params = new URLSearchParams(window.location.search);
    var product = params.get("product");
    var subject = params.get("subject");
    var messageField = document.querySelector("#contact-message");
    if (messageField && (product || subject)) {
      var bits = [];
      if (product) bits.push("I'm interested in: " + product);
      if (subject) bits.push(subject);
      messageField.value = bits.join("\n");
    }

    document.querySelectorAll("[data-alton-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        var kind = form.getAttribute("data-alton-form") || "contact";
        var data = new FormData(form);
        var lines = [];
        data.forEach(function (value, key) {
          if (String(value).trim()) lines.push(key + ": " + value);
        });

        var mailSubject =
          kind === "newsletter"
            ? "Alton Chocolates newsletter signup"
            : kind === "buildbox"
              ? "Alton Chocolates build-a-box order"
              : "Alton Chocolates contact form";
        if (product) mailSubject += " — " + product;

        var body = lines.join("\n");
        var mailto =
          "mailto:" +
          encodeURIComponent(contactEmail) +
          "?subject=" +
          encodeURIComponent(mailSubject) +
          "&body=" +
          encodeURIComponent(body);

        var thanksMsg =
          kind === "newsletter"
            ? "You are subscribed. Welcome to Alton Chocolates."
            : kind === "buildbox"
              ? "Thank you! Your custom box order was received. We will confirm soon."
              : "Thank you! Your message was sent. We will reply soon.";

        setFormStatus(form, thanksMsg, "is-success");
        showThanks(thanksMsg);
        openMailto(mailto);
        form.reset();
      });
    });

    // Build-a-box checkout form (uses data-buildbox-form)
    document.querySelectorAll("[data-buildbox-form]").forEach(function (form) {
      if (form.dataset.boundBuild === "1") return;
      form.dataset.boundBuild = "1";
      form.setAttribute("data-alton-form", "buildbox");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var data = new FormData(form);
        var lines = ["Build-a-Box order"];
        var subtotal = document.querySelector("[data-order-subtotal]");
        var total = document.querySelector("[data-order-total]");
        var boxName = document.querySelector("[data-order-box-name]");
        if (boxName) lines.push("Box: " + boxName.textContent.trim());
        lines.push("Selected treats:");
        document.querySelectorAll("[data-treat]").forEach(function (card) {
          var val = card.querySelector("[data-qty-value]");
          var qty = val ? parseInt(val.textContent, 10) || 0 : 0;
          if (qty > 0) {
            lines.push(
              "- " +
                qty +
                " × " +
                (card.dataset.title || "Treat") +
                " @ $" +
                (parseFloat(card.dataset.price) || 0).toFixed(2)
            );
          }
        });
        if (subtotal) lines.push("Subtotal: " + subtotal.textContent.trim());
        if (total) lines.push("Total: " + total.textContent.trim());
        data.forEach(function (value, key) {
          if (String(value).trim()) lines.push(key + ": " + value);
        });
        var mailto =
          "mailto:" +
          encodeURIComponent(contactEmail) +
          "?subject=" +
          encodeURIComponent("Alton Chocolates build-a-box order") +
          "&body=" +
          encodeURIComponent(lines.join("\n"));
        showThanks("Thank you! Your custom box order was received. We will confirm soon.");
        openMailto(mailto);
        form.reset();
      });
    });
  }

  var SEARCH_INDEX = [
    { title: "Salted Caramel", type: "Shop", meta: "$28", url: "/product?id=salted-caramel", tags: "bonbon caramel" },
    { title: "Raspberry Chocolate", type: "Shop", meta: "$12", url: "/shop#products", tags: "bonbon raspberry" },
    { title: "Passion Fruit Ganache", type: "Shop", meta: "$16", url: "/shop#products", tags: "bonbon ganache" },
    { title: "Pistachio Praline", type: "Shop", meta: "$14", url: "/shop#products", tags: "bonbon pistachio" },
    { title: "Hazelnut Praline", type: "Shop", meta: "$28", url: "/shop#products", tags: "bonbon hazelnut" },
    { title: "Coconut Ganache", type: "Shop", meta: "$12", url: "/shop#products", tags: "bonbon coconut" },
    { title: "Blueberry Vanilla Ganache", type: "Shop", meta: "$16", url: "/shop#products", tags: "bonbon blueberry" },
    { title: "Mint Dark Chocolate", type: "Shop", meta: "$14", url: "/shop#products", tags: "bonbon mint dark" },
    { title: "Bonbon Collection", type: "Bestsellers", meta: "$28", url: "/product?id=bonbon-collection", tags: "bonbon box" },
    { title: "Chocolate Bar", type: "Bestsellers", meta: "$12", url: "/shop#products", tags: "bars bar" },
    { title: "Sea Salt Caramels", type: "Bestsellers", meta: "$16", url: "/shop#products", tags: "caramels" },
    { title: "Chocolate Cookies", type: "Bestsellers", meta: "$14", url: "/shop#products", tags: "cookies" },
    { title: "Signature Bonbon Box", type: "Gifts", meta: "$48", url: "/gift-details?id=signature-bonbon-box", tags: "gift bonbon" },
    { title: "Chocolate Bark Box", type: "Gifts", meta: "$29", url: "/gifts", tags: "gift bark" },
    { title: "Sea Salt Caramels Gift", type: "Gifts", meta: "$34", url: "/gifts", tags: "gift caramel" },
    { title: "Artisan Chocolate Bars", type: "Gifts", meta: "$18", url: "/gifts", tags: "gift bars" },
    { title: "Toffee Collections", type: "Gifts", meta: "$28", url: "/gifts", tags: "gift toffee" },
    { title: "Chocolate Chip Cookies", type: "Gifts", meta: "$34", url: "/gifts", tags: "gift cookies" },
    { title: "Corporate Gifting", type: "Gifts", meta: "", url: "/gifts", tags: "business corporate" },
    { title: "Build Your Box", type: "Page", meta: "", url: "/build-box", tags: "custom box build" },
    { title: "Our Story", type: "Page", meta: "", url: "/our-story", tags: "about story" },
    { title: "Shop", type: "Page", meta: "", url: "/shop", tags: "all chocolates" },
    { title: "Gifts", type: "Page", meta: "", url: "/gifts", tags: "presents" },
    { title: "Contact Us", type: "Page", meta: "", url: "/contact", tags: "support help email phone" },
    { title: "Sign In", type: "Page", meta: "", url: "/sign-in", tags: "account login" },
    { title: "Sign Up", type: "Page", meta: "", url: "/sign-up", tags: "account register" },
    { title: "Cart", type: "Page", meta: "", url: "/cart", tags: "bag checkout" },
    { title: "Checkout", type: "Page", meta: "", url: "/checkout", tags: "order payment" },
    { title: "Sea Salt Chocolate Bar", type: "Shop", meta: "$12", url: "/product?id=sea-salt-chocolate-bar", tags: "bars product detail" },
    { title: "Signature Celebration Gift Box", type: "Gifts", meta: "$48", url: "/gift-details?id=signature-celebration-gift-box", tags: "gift details box" }
  ];

  function searchCatalog(query) {
    var q = String(query || "").trim().toLowerCase();
    if (!q) return [];
    var terms = q.split(/\s+/).filter(Boolean);
    return SEARCH_INDEX.filter(function (item) {
      var hay = (item.title + " " + item.type + " " + (item.tags || "") + " " + (item.meta || "")).toLowerCase();
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    }).slice(0, 12);
  }

  function renderSearchResults(root, query) {
    if (!root) return;
    var resultsEl = root.querySelector("[data-search-results]");
    var emptyEl = root.querySelector("[data-search-empty]");
    var hintEl = root.querySelector("[data-search-hint]");
    if (!resultsEl) return;

    var items = searchCatalog(query);
    resultsEl.innerHTML = "";

    if (!String(query || "").trim()) {
      if (emptyEl) emptyEl.hidden = true;
      if (hintEl) hintEl.hidden = false;
      return;
    }

    if (hintEl) hintEl.hidden = true;

    if (!items.length) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    items.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "alton-search__item";
      a.href = item.url;
      a.innerHTML =
        '<div><p class="alton-search__item-title">' +
        item.title +
        '</p><span class="label" style="letter-spacing:0.12em;">' +
        item.type +
        "</span></div>" +
        (item.meta
          ? '<span class="alton-search__item-meta">' + item.meta + "</span>"
          : "");
      resultsEl.appendChild(a);
    });
  }

  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    var openBtns = document.querySelectorAll("[data-search-open]");
    var closeBtns = document.querySelectorAll("[data-search-close]");

    function openSearch() {
      if (!panel) return;
      panel.hidden = false;
      document.documentElement.style.overflow = "hidden";
      openBtns.forEach(function (btn) {
        btn.setAttribute("aria-expanded", "true");
      });
      var input = panel.querySelector("[data-search-input]");
      if (input) {
        setTimeout(function () { input.focus(); }, 10);
      }
    }

    function closeSearch() {
      if (!panel) return;
      panel.hidden = true;
      document.documentElement.style.overflow = "";
      openBtns.forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
    }

    openBtns.forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        openSearch();
      });
    });

    closeBtns.forEach(function (btn) {
      btn.addEventListener("click", closeSearch);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && panel && !panel.hidden) closeSearch();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      var root =
        form.closest("[data-search-panel]") ||
        form.closest(".search-page") ||
        form.parentElement;
      var input = form.querySelector("[data-search-input]");

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var q = input ? input.value : "";
        renderSearchResults(root, q);
        if (panel && !panel.hidden && input) input.focus();
      });

      if (input) {
        input.addEventListener("input", function () {
          renderSearchResults(root, input.value);
        });
      }
    });

    // If landed on /search?q= or /search page with query, run catalog search UI
    var pageParams = new URLSearchParams(window.location.search);
    var initialQ = pageParams.get("q") || pageParams.get("query") || "";
    var searchPage = document.querySelector(".search-page");
    if (searchPage && initialQ) {
      var pageInput = searchPage.querySelector("[data-search-input]");
      if (pageInput) pageInput.value = initialQ;
      renderSearchResults(searchPage, initialQ);
    }

    // Enhance Squarespace system search page when present
    if (/\/search\/?$/i.test(window.location.pathname) && initialQ) {
      var host = document.querySelector(".alton-main") || document.body;
      if (host && !document.querySelector(".search-page")) {
        var box = document.createElement("section");
        box.className = "search-page section";
        box.innerHTML =
          '<div class="section-header"><p class="label">Alton catalog</p><h2 class="heading-lg">Matching treats</h2></div>' +
          '<div class="alton-search__results alton-search__results--page" data-search-results></div>' +
          '<p class="alton-search__empty body-lg" data-search-empty hidden style="text-align:center;">No catalog matches.</p>';
        host.insertBefore(box, host.firstChild);
        renderSearchResults(box, initialQ);
      }
    }
  }


  function initProductLinks() {
    document
      .querySelectorAll(
        "[data-shop-product], [data-gift-card], .product-card[data-orderable], .gift-collection-card"
      )
      .forEach(function (card) {
        var titleEl = card.querySelector(".product-title");
        var title =
          card.getAttribute("data-title") ||
          (titleEl ? titleEl.textContent.trim() : "");
        if (!title) return;
        var id = card.getAttribute("data-product-id") || slugify(title);
        card.setAttribute("data-product-id", id);
        if (!card.getAttribute("data-title")) card.setAttribute("data-title", title);
        var isGift =
          card.hasAttribute("data-gift-card") ||
          card.classList.contains("gift-collection-card") ||
          card.getAttribute("data-category") === "gifts" ||
          ((getCatalogItem(id) || {}).kind === "gift");
        var base = isGift ? "/gift-details" : "/product";
        var href = base + "?id=" + encodeURIComponent(id);
        card.setAttribute("data-edit-url", href);
        card.querySelectorAll('a[href="/product"], a[href="/gift-details"], a[href^="/product?"], a[href^="/gift-details?"]').forEach(function (a) {
          a.setAttribute("href", href);
        });
        var priceEl = card.querySelector(".product-card__price");
        if (priceEl && !card.getAttribute("data-price")) {
          var p = parseFloat(String(priceEl.textContent).replace(/[^0-9.]/g, ""));
          if (!isNaN(p)) card.setAttribute("data-price", String(p));
        }
      });
  }

  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach(function (section) {
      section.querySelectorAll("[data-faq-item]").forEach(function (item) {
        var trigger = item.querySelector("[data-faq-trigger]");
        var panel = item.querySelector("[data-faq-panel]");
        if (!trigger || !panel) return;
        if (trigger.dataset.boundFaq === "1") return;
        trigger.dataset.boundFaq = "1";
        trigger.addEventListener("click", function () {
          var open = item.classList.contains("is-open");
          section.querySelectorAll("[data-faq-item]").forEach(function (other) {
            other.classList.remove("is-open");
            var t = other.querySelector("[data-faq-trigger]");
            var p = other.querySelector("[data-faq-panel]");
            if (t) t.setAttribute("aria-expanded", "false");
            if (p) p.hidden = true;
          });
          if (!open) {
            item.classList.add("is-open");
            trigger.setAttribute("aria-expanded", "true");
            panel.hidden = false;
          }
        });
      });
    });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cartTaxAmount(subtotal) {
    return Math.round(subtotal * 0.05 * 100) / 100;
  }

  function getAltonCartMarkup() {
    return (
      '<section class="cart-page section" aria-labelledby="cart-heading" data-cart-page data-cart-bridged="1">' +
      '<div class="cart-page__header">' +
      "<div>" +
      '<h1 id="cart-heading" class="heading-lg">Your Cart</h1>' +
      '<p class="label cart-page__count" data-cart-heading-count>(0 Products)</p>' +
      "</div>" +
      '<button type="button" class="btn btn--text cart-page__clear" data-cart-clear>Clear All</button>' +
      "</div>" +
      '<div class="cart-layout">' +
      '<div class="cart-lines" data-cart-lines>' +
      '<p class="body-lg cart-lines__empty" data-cart-empty>Your cart is empty. <a href="/shop">Browse the shop</a> or <a href="/gifts">explore gifts</a>.</p>' +
      "</div>" +
      '<aside class="cart-summary" aria-labelledby="cart-summary-heading">' +
      '<h2 id="cart-summary-heading" class="cart-summary__title">Order Summary</h2>' +
      '<div class="cart-summary__items" data-cart-summary-items></div>' +
      '<div class="cart-summary__rows">' +
      '<div class="cart-summary__row"><span>Subtotal</span><span data-cart-subtotal>$0.00</span></div>' +
      '<div class="cart-summary__row"><span>Tax</span><span data-cart-tax>5%</span></div>' +
      '<div class="cart-summary__row cart-summary__row--total"><span>Total</span><span data-cart-total>$0.00</span></div>' +
      "</div>" +
      '<a class="btn btn--terracotta cart-summary__cta" href="/checkout" data-cart-checkout>Proceed to Checkout</a>' +
      '<a class="btn btn--text cart-summary__continue" href="/shop">Continue Shopping</a>' +
      "</aside></div></section>"
    );
  }

  function getAltonCheckoutMarkup() {
    return (
      '<section class="checkout-page section" aria-labelledby="checkout-heading" data-checkout-page data-checkout-bridged="1">' +
      '<h1 id="checkout-heading" class="heading-lg">Checkout</h1>' +
      '<p class="body-lg checkout-page__subtitle">Complete your information to place your order.</p>' +
      '<div class="checkout-layout">' +
      '<form class="checkout-form" data-checkout-form novalidate>' +
      '<fieldset class="checkout-step"><legend class="checkout-step__title"><span class="checkout-step__num">1</span> Contact and Address</legend>' +
      '<div class="checkout-form__grid">' +
      '<div class="form-field"><label for="checkout-email">Email Address</label><input id="checkout-email" name="email" type="email" autocomplete="email" required placeholder="Email address"></div>' +
      '<div class="form-field"><label for="checkout-phone">Phone Number</label><input id="checkout-phone" name="phone" type="tel" autocomplete="tel" placeholder="Phone number"></div>' +
      '<div class="form-field"><label for="checkout-first">First Name</label><input id="checkout-first" name="first_name" type="text" autocomplete="given-name" required placeholder="First name"></div>' +
      '<div class="form-field"><label for="checkout-last">Last Name</label><input id="checkout-last" name="last_name" type="text" autocomplete="family-name" required placeholder="Last name"></div>' +
      '<div class="form-field form-field--full"><label for="checkout-address">Address</label><input id="checkout-address" name="address" type="text" autocomplete="street-address" required placeholder="Street address"></div>' +
      '<div class="form-field form-field--full"><label for="checkout-apt">Apartment / Suite (optional)</label><input id="checkout-apt" name="apartment" type="text" autocomplete="address-line2" placeholder="Apartment, suite, etc."></div>' +
      '<div class="form-field"><label for="checkout-city">City</label><input id="checkout-city" name="city" type="text" autocomplete="address-level2" required placeholder="City"></div>' +
      '<div class="form-field"><label for="checkout-state">State</label><input id="checkout-state" name="state" type="text" autocomplete="address-level1" required placeholder="State"></div>' +
      '<div class="form-field"><label for="checkout-zip">ZIP Code</label><input id="checkout-zip" name="zip" type="text" autocomplete="postal-code" required placeholder="ZIP code"></div>' +
      "</div></fieldset>" +
      '<div class="checkout-gift" data-gift-panel>' +
      '<label class="checkout-gift__toggle"><input type="checkbox" name="is_gift" value="yes" data-gift-toggle><span>This is a gift</span></label>' +
      '<div class="checkout-gift__fields" data-gift-fields hidden>' +
      '<div class="checkout-form__grid">' +
      '<div class="form-field"><label for="gift-recipient">Recipient’s Name</label><input id="gift-recipient" name="gift_recipient" type="text" placeholder="To"></div>' +
      '<div class="form-field"><label for="gift-from">From</label><input id="gift-from" name="gift_from" type="text" placeholder="From"></div>' +
      '<div class="form-field form-field--full"><label for="gift-message">Message</label><textarea id="gift-message" name="gift_message" rows="3" placeholder="Write a short note"></textarea></div>' +
      '<label class="checkout-gift__hide form-field--full"><input type="checkbox" name="hide_prices" value="yes"><span>Hide prices on packing slip</span></label>' +
      "</div></div></div>" +
      '<fieldset class="checkout-step"><legend class="checkout-step__title"><span class="checkout-step__num">2</span> Payment Method</legend>' +
      '<div class="checkout-pay" role="radiogroup" aria-label="Payment method">' +
      '<label class="checkout-pay__option is-selected"><input type="radio" name="payment" value="card" checked data-pay-method><img src="/assets/icons/mastercard.svg" alt="" width="36" height="24"><span>Credit or Debit Card</span></label>' +
      '<label class="checkout-pay__option"><input type="radio" name="payment" value="paypal" data-pay-method><img src="/assets/icons/paypal.svg" alt="" width="36" height="24"><span>Pay with PayPal</span></label>' +
      "</div>" +
      '<div class="checkout-card-fields" data-card-fields>' +
      '<div class="checkout-form__grid">' +
      '<div class="form-field form-field--full"><label for="card-number">Card Number</label><input id="card-number" name="card_number" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="xxxx xxxx xxxx xxxx"></div>' +
      '<div class="form-field form-field--full"><label for="card-name">Name on Card</label><input id="card-name" name="card_name" type="text" autocomplete="cc-name" placeholder="Name on card"></div>' +
      '<div class="form-field"><label for="card-exp">Expiration Date</label><input id="card-exp" name="card_exp" type="text" autocomplete="cc-exp" placeholder="MM / YY"></div>' +
      '<div class="form-field"><label for="card-cvc">Security Code</label><input id="card-cvc" name="card_cvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC"></div>' +
      "</div>" +
      '<p class="label checkout-card-note">Demo checkout — card details are not processed. Orders are sent by email.</p>' +
      "</div></fieldset>" +
      '<button type="submit" class="btn btn--terracotta checkout-form__submit">Place Order</button>' +
      '<p class="form-status" data-form-status hidden role="status" aria-live="polite"></p>' +
      "</form>" +
      '<aside class="cart-summary checkout-summary" aria-labelledby="checkout-summary-heading">' +
      '<div class="checkout-summary__head"><h2 id="checkout-summary-heading" class="cart-summary__title">Order Summary</h2>' +
      '<a class="btn btn--text checkout-summary__edit" href="/cart">Edit Cart</a></div>' +
      '<div class="checkout-summary__items" data-checkout-items></div>' +
      '<div class="cart-summary__rows">' +
      '<div class="cart-summary__row"><span>Subtotal</span><span data-checkout-subtotal>$0.00</span></div>' +
      '<div class="cart-summary__row"><span>Tax</span><span data-checkout-tax>5%</span></div>' +
      '<div class="cart-summary__row cart-summary__row--total"><span>Total</span><span data-checkout-total>$0.00</span></div>' +
      "</div></aside></div></section>"
    );
  }

  function sitePath() {
    return String(window.location.pathname || "").replace(/\/$/, "") || "/";
  }

  function isSquarespaceCartPath() {
    return /\/cart$/i.test(sitePath()) || /\/shopping-cart$/i.test(sitePath());
  }

  function isAltonCheckoutPath() {
    return /\/check-?out$/i.test(sitePath());
  }

  function hideNativeSquarespaceCart(main) {
    if (!main) return;
    document.documentElement.classList.add("alton-custom-cart");
    document.body.classList.add("alton-custom-cart");
    try {
      main
        .querySelectorAll(
          ".sqs-cart-container, .Cart, .cart-wrapper, .empty-cart, .cart-empty, [class*='cartEmpty'], [class*='Cart-empty']"
        )
        .forEach(function (el) {
          if (el.closest("[data-cart-page], .alton-cart-bridge")) return;
          el.setAttribute("hidden", "");
          el.style.setProperty("display", "none", "important");
        });
    } catch (e) {}

    Array.prototype.slice
      .call(main.querySelectorAll("h1, h2, p, a, button, .sqs-block-button-element"))
      .forEach(function (el) {
        if (el.closest("[data-cart-page], .alton-cart-bridge, [data-checkout-page], .alton-checkout-bridge")) {
          return;
        }
        var t = String(el.textContent || "")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        if (
          t === "shopping cart" ||
          t.indexOf("nothing in your shopping cart") !== -1 ||
          t === "continue shopping"
        ) {
          var block =
            el.closest(".sqs-block, .sqs-col, section, article, .row, .cart") || el;
          if (block.closest("[data-cart-page], .alton-cart-bridge")) return;
          block.setAttribute("hidden", "");
          block.style.setProperty("display", "none", "important");
        }
      });
  }

  function hideNativeSquarespaceCheckout(main) {
    if (!main) return;
    document.documentElement.classList.add("alton-custom-checkout");
    document.body.classList.add("alton-custom-checkout");
    try {
      main
        .querySelectorAll(
          ".sqs-checkout, .sqs-checkout-page, .Checkout, .cart-checkout, .order-form-wrapper, #checkoutForm, [data-test='checkout-form']"
        )
        .forEach(function (el) {
          if (el.closest("[data-checkout-page], .alton-checkout-bridge")) return;
          el.setAttribute("hidden", "");
          el.style.setProperty("display", "none", "important");
        });
    } catch (e) {}
  }

  function mountAltonCartOnNativePage() {
    if (!isSquarespaceCartPath()) return false;
    if (document.querySelector("[data-cart-page]")) return false;

    var main =
      document.querySelector("main.alton-main, main#page, #page, .alton-main") ||
      document.body;
    hideNativeSquarespaceCart(main);

    var bridge = document.createElement("div");
    bridge.className = "alton-cart-bridge";
    bridge.innerHTML = getAltonCartMarkup();
    main.insertBefore(bridge, main.firstChild);
    return true;
  }

  function mountAltonCheckoutOnNativePage() {
    if (!isAltonCheckoutPath()) return false;
    if (document.querySelector("[data-checkout-page]")) return false;

    var main =
      document.querySelector("main.alton-main, main#page, #page, .alton-main") ||
      document.body;
    hideNativeSquarespaceCheckout(main);

    var bridge = document.createElement("div");
    bridge.className = "alton-checkout-bridge";
    bridge.innerHTML = getAltonCheckoutMarkup();
    main.insertBefore(bridge, main.firstChild);
    return true;
  }

  function goToCheckout() {
    window.location.assign("/checkout");
  }

  function initCartPage() {
    mountAltonCartOnNativePage();
    var root = document.querySelector("[data-cart-page]");
    if (!root) return;
    if (root.getAttribute("data-cart-ready") === "1") return;
    root.setAttribute("data-cart-ready", "1");
    loadOrderCart();

    var list = root.querySelector("[data-cart-lines]");
    var countEl = root.querySelector("[data-cart-heading-count]");
    var summaryItems = root.querySelector("[data-cart-summary-items]");
    var subtotalEl = root.querySelector("[data-cart-subtotal]");
    var taxEl = root.querySelector("[data-cart-tax]");
    var totalEl = root.querySelector("[data-cart-total]");
    var clearBtn = root.querySelector("[data-cart-clear]");
    var checkoutBtn = root.querySelector("[data-cart-checkout]");

    function render() {
      loadOrderCart();
      var count = cartItemCount();
      var subtotal = cartGrandTotal();
      var tax = orderCart.length ? cartTaxAmount(subtotal) : 0;
      if (countEl) countEl.textContent = "(" + count + " Product" + (count === 1 ? "" : "s") + ")";
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      if (taxEl) taxEl.textContent = orderCart.length ? "5%" : "$0.00";
      if (totalEl) totalEl.textContent = money(subtotal + tax);
      updateCartCountBadge();

      if (summaryItems) {
        summaryItems.innerHTML = orderCart.length
          ? orderCart
              .map(function (item) {
                var line =
                  (parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 0);
                return (
                  '<div class="cart-summary__item"><span>' +
                  escapeHtml(item.title) +
                  "</span><span>" +
                  money(line) +
                  "</span></div>"
                );
              })
              .join("")
          : "";
      }

      if (!list) return;

      if (!orderCart.length) {
        list.innerHTML =
          '<p class="body-lg cart-lines__empty" data-cart-empty>Your cart is empty. <a href="/shop">Browse the shop</a> or <a href="/gifts">explore gifts</a>.</p>';
        if (checkoutBtn) checkoutBtn.setAttribute("aria-disabled", "true");
        return;
      }

      if (checkoutBtn) checkoutBtn.removeAttribute("aria-disabled");
      list.innerHTML = orderCart
        .map(function (item, idx) {
          var img = item.image || "/assets/images/cart-gift-box.png";
          var lineTotal = money(
            (parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 0)
          );
          var editHref =
            item.editUrl ||
            (item.id
              ? (/gift/i.test(item.editUrl || "") ||
                (getCatalogItem(item.id) || {}).kind === "gift"
                  ? "/gift-details?id=" + encodeURIComponent(item.id)
                  : "/product?id=" + encodeURIComponent(item.id))
              : "/product");
          return (
            '<article class="cart-line" data-cart-index="' +
            idx +
            '">' +
            '<div class="cart-line__image"><img src="' +
            escapeHtml(img) +
            '" alt="" loading="lazy"></div>' +
            '<div class="cart-line__info">' +
            '<h3 class="cart-line__title">' +
            escapeHtml(item.title) +
            "</h3>" +
            (item.meta
              ? '<p class="cart-line__meta">' + escapeHtml(item.meta) + "</p>"
              : "") +
            "</div>" +
            '<div class="cart-line__side">' +
            '<span class="cart-line__price">' +
            lineTotal +
            "</span>" +
            '<div class="cart-line__actions">' +
            '<a class="cart-line__btn" href="' +
            escapeHtml(editHref) +
            '"><img src="/assets/icons/edit.svg" alt="" width="16" height="16"><span>Edit</span></a>' +
            '<button type="button" class="cart-line__btn" data-cart-remove="' +
            idx +
            '"><img src="/assets/icons/delete.svg" alt="" width="16" height="16"><span>Delete</span></button>' +
            "</div></div></article>"
          );
        })
        .join("");

      list.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          removeFromOrderCart(parseInt(btn.getAttribute("data-cart-remove"), 10));
          render();
        });
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        loadOrderCart();
        if (!orderCart.length) return;
        if (!window.confirm("Clear all items from your cart?")) return;
        clearOrderCart();
        render();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.setAttribute("href", "/checkout");
      checkoutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        loadOrderCart();
        if (!orderCart.length) {
          alert("Your cart is empty.");
          return;
        }
        goToCheckout();
      });
    }

    render();
  }

  function initCheckoutPage() {
    mountAltonCheckoutOnNativePage();
    var root = document.querySelector("[data-checkout-page]");
    if (!root) return;
    if (root.getAttribute("data-checkout-ready") === "1") return;
    root.setAttribute("data-checkout-ready", "1");
    loadOrderCart();

    var itemsEl = root.querySelector("[data-checkout-items]");
    var subtotalEl = root.querySelector("[data-checkout-subtotal]");
    var taxEl = root.querySelector("[data-checkout-tax]");
    var shippingEl = root.querySelector("[data-checkout-shipping]");
    var totalEl = root.querySelector("[data-checkout-total]");
    var form = root.querySelector("[data-checkout-form]");
    var giftToggle = root.querySelector("[data-gift-toggle]");
    var giftFields = root.querySelector("[data-gift-fields]");
    var cardFields = root.querySelector("[data-card-fields]");

    function renderSummary() {
      loadOrderCart();
      var subtotal = cartGrandTotal();
      var tax = orderCart.length ? cartTaxAmount(subtotal) : 0;
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      if (taxEl) taxEl.textContent = orderCart.length ? "5%" : "$0.00";
      if (shippingEl) {
        var shipping = orderCart.length ? (subtotal >= 75 ? 0 : 8) : 0;
        shippingEl.textContent = !orderCart.length
          ? "$0.00"
          : shipping === 0
            ? "Free"
            : money(shipping);
      }
      if (totalEl) totalEl.textContent = money(subtotal + tax);
      var submitBtn = form ? form.querySelector('[type="submit"]') : null;
      if (submitBtn) {
        if (!orderCart.length) {
          submitBtn.disabled = true;
          submitBtn.setAttribute("aria-disabled", "true");
        } else {
          submitBtn.disabled = false;
          submitBtn.removeAttribute("aria-disabled");
        }
      }
      if (!itemsEl) return;
      if (!orderCart.length) {
        itemsEl.innerHTML = '<p class="body-lg">No items. <a href="/cart">Return to cart</a>.</p>';
        return;
      }
      itemsEl.innerHTML = orderCart
        .map(function (item) {
          var line =
            (parseFloat(item.price) || 0) * (parseInt(item.qty, 10) || 0);
          return (
            '<div class="checkout-summary__item"><span>' +
            escapeHtml(item.qty + " × " + item.title) +
            (item.meta ? " · " + escapeHtml(item.meta) : "") +
            "</span><span>" +
            money(line) +
            "</span></div>"
          );
        })
        .join("");
    }

    function setGiftRequired(on) {
      ["gift_recipient", "gift_from"].forEach(function (name) {
        var el = form && form.querySelector('[name="' + name + '"]');
        if (!el) return;
        if (on) el.setAttribute("required", "");
        else el.removeAttribute("required");
      });
    }

    function setCardRequired(on) {
      ["card_name", "card_number", "card_exp", "card_cvc"].forEach(function (name) {
        var el = form && form.querySelector('[name="' + name + '"]');
        if (!el) return;
        if (on) el.setAttribute("required", "");
        else el.removeAttribute("required");
      });
    }

    if (giftToggle && giftFields) {
      giftToggle.addEventListener("change", function () {
        giftFields.hidden = !giftToggle.checked;
        setGiftRequired(giftToggle.checked);
      });
      setGiftRequired(giftToggle.checked);
    }

    root.querySelectorAll("[data-pay-method]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        root.querySelectorAll(".checkout-pay__option").forEach(function (opt) {
          opt.classList.toggle("is-selected", opt.querySelector("input") === radio);
        });
        if (cardFields) cardFields.hidden = radio.value !== "card";
        setCardRequired(radio.value === "card");
      });
    });
    var checkedPay = root.querySelector("[data-pay-method]:checked");
    setCardRequired(checkedPay && checkedPay.value === "card");

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        loadOrderCart();
        if (!orderCart.length) {
          alert("Your cart is empty.");
          window.location.href = "/cart";
          return;
        }

        var data = new FormData(form);
        var subtotal = cartGrandTotal();
        var tax = cartTaxAmount(subtotal);
        var total = (subtotal + tax).toFixed(2);
        var itemLines = orderCart.map(function (item) {
          return (
            "- " +
            item.qty +
            " × " +
            item.title +
            (item.meta ? " (" + item.meta + ")" : "") +
            " @ $" +
            item.price.toFixed(2) +
            " = $" +
            (item.price * item.qty).toFixed(2)
          );
        });
        var fullName = [
          String(data.get("first_name") || ""),
          String(data.get("last_name") || "")
        ]
          .join(" ")
          .trim();
        var lines = [
          "New Alton Chocolates checkout order",
          "",
          "Items:",
          itemLines.join("\n"),
          "",
          "Subtotal: $" + subtotal.toFixed(2),
          "Tax (5%): $" + tax.toFixed(2),
          "Order total: $" + total,
          "",
          "Contact:",
          "Name: " + fullName,
          "Email: " + String(data.get("email") || ""),
          "Phone: " + String(data.get("phone") || ""),
          "Address: " + String(data.get("address") || ""),
          "Apartment: " + String(data.get("apartment") || ""),
          "City: " + String(data.get("city") || ""),
          "State: " + String(data.get("state") || ""),
          "ZIP: " + String(data.get("zip") || ""),
          "Payment: " + String(data.get("payment") || "")
        ];
        if (data.get("is_gift") === "yes") {
          lines.push(
            "",
            "Gift order:",
            "To: " + String(data.get("gift_recipient") || ""),
            "From: " + String(data.get("gift_from") || ""),
            "Message: " + String(data.get("gift_message") || ""),
            "Hide prices: " + (data.get("hide_prices") === "yes" ? "Yes" : "No")
          );
        }

        var subjectItems = orderCart
          .map(function (i) {
            return i.title;
          })
          .slice(0, 3)
          .join(", ");
        if (orderCart.length > 3) subjectItems += " + more";

        var mailto =
          "mailto:galton4@gmail.com?subject=" +
          encodeURIComponent("Alton checkout — " + subjectItems) +
          "&body=" +
          encodeURIComponent(lines.join("\n"));

        var count = cartItemCount();
        form.reset();
        if (giftFields) giftFields.hidden = true;
        setGiftRequired(false);
        setCardRequired(false);
        showThanks(
          "Order placed (" +
            count +
            " item" +
            (count === 1 ? "" : "s") +
            ", $" +
            total +
            "). We will confirm by email shortly."
        );
        openMailto(mailto);
        clearOrderCart();
        renderSummary();
      });
    }

    renderSummary();
  }

  function loadUsers() {
    try {
      var raw = localStorage.getItem("alton-users");
      var users = raw ? JSON.parse(raw) : [];
      return Array.isArray(users) ? users : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    try {
      localStorage.setItem("alton-users", JSON.stringify(users));
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem("alton-session");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    try {
      localStorage.setItem(
        "alton-session",
        JSON.stringify({
          email: user.email,
          name: user.name || "",
          at: Date.now()
        })
      );
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem("alton-session");
    } catch (e) {}
  }

  function updateAccountLinks() {
    var session = getSession();
    document.querySelectorAll(".site-header__account, [data-account-link]").forEach(function (link) {
      if (session && session.email) {
        link.setAttribute("href", "/");
        link.setAttribute("aria-label", "Signed in as " + (session.name || session.email));
        link.setAttribute("title", "Signed in as " + (session.name || session.email));
        link.classList.add("is-signed-in");
      } else {
        link.setAttribute("href", "/sign-in");
        link.setAttribute("aria-label", "Account");
        link.removeAttribute("title");
        link.classList.remove("is-signed-in");
      }
    });
  }

  function initAuthForms() {
    if (document.querySelector("[data-auth-page]")) {
      document.body.classList.add("is-auth-page");
    }
    updateAccountLinks();

    document.querySelectorAll("[data-auth-form]").forEach(function (form) {
      if (form.dataset.boundAuth === "1") return;
      form.dataset.boundAuth = "1";
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        var kind = form.getAttribute("data-auth-form");
        var data = new FormData(form);
        var email = String(data.get("email") || "")
          .trim()
          .toLowerCase();
        var password = String(data.get("password") || "");
        var name = String(data.get("name") || "").trim();
        var users = loadUsers();

        if (kind === "signup") {
          if (users.some(function (u) { return u.email === email; })) {
            setFormStatus(form, "An account with this email already exists. Please sign in.", "is-error");
            return;
          }
          if (password.length < 6) {
            setFormStatus(form, "Password must be at least 6 characters.", "is-error");
            return;
          }
          var user = { name: name, email: email, password: password };
          users.push(user);
          saveUsers(users);
          setSession(user);
          updateAccountLinks();
          setFormStatus(form, "Account created.", "is-success");
          showThanks("Welcome to Alton Chocolates. Your account is ready.");
          setTimeout(function () {
            window.location.href = "/";
          }, 1200);
        } else {
          var found = users.filter(function (u) {
            return u.email === email && u.password === password;
          })[0];
          if (!found) {
            setFormStatus(
              form,
              users.some(function (u) { return u.email === email; })
                ? "Incorrect password. Please try again."
                : "No account found for that email. Please create an account.",
              "is-error"
            );
            return;
          }
          setSession(found);
          updateAccountLinks();
          setFormStatus(form, "Signed in.", "is-success");
          showThanks("Signed in. Welcome back" + (found.name ? ", " + found.name : "") + ".");
          setTimeout(function () {
            window.location.href = "/";
          }, 1200);
        }
        form.reset();
      });
    });

    document.querySelectorAll("[data-auth-google]").forEach(function (btn) {
      if (btn.dataset.boundAuthGoogle === "1") return;
      btn.dataset.boundAuthGoogle = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        showThanks("Google sign-in is a demo button only — not connected.");
      });
    });
  }

  function initPdp() {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id") || root.getAttribute("data-pdp-id") || "";
    var catalog = getCatalogItem(id);
    var preview = null;
    try {
      preview = JSON.parse(sessionStorage.getItem("alton-pdp-preview") || "null");
    } catch (e) {
      preview = null;
    }
    if (!catalog && preview && preview.id && preview.id === id) {
      catalog = {
        title: preview.title,
        price: preview.price,
        image: preview.image,
        meta: preview.meta || "",
        category: /gift/i.test(window.location.pathname) ? "Gift Boxes" : "Shop",
        kind: /gift/i.test(window.location.pathname) ? "gift" : "product",
        desc: ""
      };
    }

    if (catalog) {
      if (id) root.setAttribute("data-pdp-id", id);
      root.setAttribute("data-pdp-title", catalog.title);
      root.setAttribute("data-pdp-price", String(catalog.price));
      if (catalog.image) root.setAttribute("data-pdp-image", catalog.image);
      if (catalog.meta) root.setAttribute("data-pdp-meta", catalog.meta);
      var base = catalog.kind === "gift" ? "/gift-details" : "/product";
      root.setAttribute("data-pdp-href", base + "?id=" + encodeURIComponent(id || slugify(catalog.title)));

      var titleEl = root.querySelector("#pdp-title, #gift-pdp-title, .pdp-info h1");
      if (titleEl) titleEl.textContent = catalog.title;
      var priceEl = root.querySelector(".pdp-info__price");
      if (priceEl) priceEl.textContent = "$" + Number(catalog.price).toFixed(0);
      var catEl = root.querySelector(".pdp-info__category");
      if (catEl && catalog.category) catEl.textContent = catalog.category;
      var descEl = root.querySelector(".pdp-info__desc");
      if (descEl && catalog.desc) descEl.textContent = catalog.desc;
      var crumb = root.querySelector(".pdp-breadcrumb [aria-current='page']");
      if (crumb) crumb.textContent = catalog.title;
      var mainImg = root.querySelector("[data-pdp-main-image]");
      if (mainImg && catalog.image) {
        mainImg.src = catalog.image;
        mainImg.alt = catalog.title;
      }
      var firstThumb = root.querySelector("[data-pdp-thumb]");
      if (firstThumb && catalog.image) {
        firstThumb.setAttribute("data-pdp-thumb", catalog.image);
        var thumbImg = firstThumb.querySelector("img");
        if (thumbImg) thumbImg.src = catalog.image;
      }
    }

    initQtyControls(root);

    root.querySelectorAll("[data-pdp-thumb]").forEach(function (thumb) {
      if (thumb.dataset.boundThumb === "1") return;
      thumb.dataset.boundThumb = "1";
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-pdp-thumb");
        var main = root.querySelector("[data-pdp-main-image]");
        if (main && src) main.src = src;
        root.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) {
          t.classList.toggle("is-active", t === thumb);
        });
      });
    });

    root.querySelectorAll(".pdp-options__option input[type='radio']").forEach(function (radio) {
      if (radio.dataset.boundType === "1") return;
      radio.dataset.boundType = "1";
      radio.addEventListener("change", function () {
        var group = radio.closest(".pdp-options__list") || root;
        group.querySelectorAll(".pdp-options__option").forEach(function (opt) {
          opt.classList.toggle("is-selected", opt.querySelector("input") === radio);
        });
        if (radio.hasAttribute("data-pdp-price")) {
          var nextPrice = parseFloat(radio.getAttribute("data-pdp-price")) || 0;
          root.setAttribute("data-pdp-price", String(nextPrice));
          var priceEl2 = root.querySelector(".pdp-info__price");
          if (priceEl2) priceEl2.textContent = "$" + nextPrice.toFixed(0);
        }
        if (radio.hasAttribute("data-pdp-type")) {
          root.setAttribute("data-pdp-meta", radio.value);
        }
      });
    });

    var addBtn = root.querySelector("[data-pdp-add-cart]");
    if (addBtn && addBtn.dataset.boundAddCart !== "1") {
      addBtn.dataset.boundAddCart = "1";
      addBtn.addEventListener("click", function () {
        var pid = root.getAttribute("data-pdp-id") || id || "";
        var title =
          root.getAttribute("data-pdp-title") ||
          (root.querySelector("#pdp-title, #gift-pdp-title")
            ? root.querySelector("#pdp-title, #gift-pdp-title").textContent.trim()
            : "Item");
        if (!pid) pid = slugify(title);
        var priceRadio = root.querySelector("input[data-pdp-price]:checked");
        var price = priceRadio
          ? parseFloat(priceRadio.getAttribute("data-pdp-price")) || 0
          : parseFloat(root.getAttribute("data-pdp-price")) || 0;
        var image = root.getAttribute("data-pdp-image") || "";
        var metaParts = [];
        var sizeRadio = root.querySelector("[name='box_size']:checked");
        var typeRadio = root.querySelector("[data-pdp-type]:checked");
        if (sizeRadio) metaParts.push(sizeRadio.value);
        if (typeRadio) metaParts.push(typeRadio.value);
        var meta = metaParts.join(" · ") || root.getAttribute("data-pdp-meta") || "";
        var qtyEl = root.querySelector("[data-pdp-qty] [data-qty-value]");
        var qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
        if (qty < 1) qty = 1;
        var mainImg2 = root.querySelector("[data-pdp-main-image]");
        if (mainImg2 && mainImg2.getAttribute("src")) image = mainImg2.getAttribute("src");
        var editUrl =
          root.getAttribute("data-pdp-href") ||
          (/gift-details/i.test(window.location.pathname)
            ? "/gift-details?id=" + encodeURIComponent(pid)
            : "/product?id=" + encodeURIComponent(pid));

        addToOrderCart({
          id: pid,
          title: title,
          price: price,
          qty: qty,
          image: image,
          meta: meta,
          editUrl: editUrl
        });
        window.location.href = "/cart";
      });
    }

    var buildLink = root.querySelector("[data-pdp-build-box]");
    if (buildLink) {
      var pid2 = root.getAttribute("data-pdp-id") || id || "";
      var title2 = root.getAttribute("data-pdp-title") || "";
      var href = "/build-box";
      var q = [];
      if (pid2) q.push("product=" + encodeURIComponent(pid2));
      if (title2) q.push("title=" + encodeURIComponent(title2));
      if (q.length) href += "?" + q.join("&");
      buildLink.setAttribute("href", href);
    }
  }

  ready(function () {
    initAnnouncement();
    initMobileNav();
    initProductLinks();
    initBuildBox();
    initGiftQty();
    initTestimonials();
    initEditableSlots();
    initSqsFormSlots();
    initThanks();
    initShop();
    initOrderButtons();
    initForms();
    initSearch();
    initFaq();
    initCartPage();
    initCheckoutPage();
    initAuthForms();
    initPdp();
    updateCartCountBadge();
  });
})();
