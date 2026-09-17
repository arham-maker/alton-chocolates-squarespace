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

    var pills = document.querySelectorAll("[data-gift-filter]");
    var cards = document.querySelectorAll("[data-gift-card]");
    if (!pills.length || !cards.length) return;

    function applyGiftFilter(key) {
      var max = null;
      if (key === "under-25") max = 25;
      else if (key === "under-50") max = 50;
      else if (key === "under-75") max = 75;

      cards.forEach(function (card) {
        if (max == null) {
          card.style.display = "";
          return;
        }
        var price = parseFloat(card.getAttribute("data-price")) || 0;
        card.style.display = price <= max ? "" : "none";
      });
    }

    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var key = pill.getAttribute("data-gift-filter") || "";
        var isPrice = key.indexOf("under-") === 0;
        if (isPrice) {
          pills.forEach(function (p) {
            if ((p.getAttribute("data-gift-filter") || "").indexOf("under-") === 0) {
              p.classList.remove("is-active");
            }
          });
          pill.classList.add("is-active");
          applyGiftFilter(key);
        } else {
          pills.forEach(function (p) {
            var k = p.getAttribute("data-gift-filter") || "";
            if (k.indexOf("under-") !== 0) p.classList.remove("is-active");
          });
          pill.classList.add("is-active");
        }
      });
    });
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

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-shop-tab");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        showCategory(cat);
      });
    });

    initQtyControls(document.querySelector("[data-shop-products]"));

    document.querySelectorAll("[data-shop-order]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest("[data-shop-product]");
        if (!card) return;
        var title = card.getAttribute("data-title") || "Item";
        var price = parseFloat(card.getAttribute("data-price")) || 0;
        var qtyEl = card.querySelector("[data-qty-value]");
        var qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
        if (qty < 1) qty = 1;
        var total = (price * qty).toFixed(2);
        var summary =
          "Order received: " +
          qty +
          " × " +
          title +
          " ($" +
          total +
          "). We will confirm by email shortly.";
        showThanks(summary);

        var mailto =
          "mailto:galton4@gmail.com?subject=" +
          encodeURIComponent("Alton order — " + title) +
          "&body=" +
          encodeURIComponent(
            "Product: " + title + "\nQty: " + qty + "\nTotal: $" + total
          );
        setTimeout(function () {
          window.location.href = mailto;
        }, 900);
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
            : "Thank you! Your message was sent. We will reply soon.";

        showThanks(thanksMsg);
        form.reset();

        setTimeout(function () {
          window.location.href = mailto;
        }, 900);
      });
    });
  }

  var SEARCH_INDEX = [
    { title: "Salted Caramel", type: "Shop", meta: "$28", url: "/shop#products", tags: "bonbon caramel" },
    { title: "Raspberry Chocolate", type: "Shop", meta: "$12", url: "/shop#products", tags: "bonbon raspberry" },
    { title: "Passion Fruit Ganache", type: "Shop", meta: "$16", url: "/shop#products", tags: "bonbon ganache" },
    { title: "Pistachio Praline", type: "Shop", meta: "$14", url: "/shop#products", tags: "bonbon pistachio" },
    { title: "Hazelnut Praline", type: "Shop", meta: "$28", url: "/shop#products", tags: "bonbon hazelnut" },
    { title: "Coconut Ganache", type: "Shop", meta: "$12", url: "/shop#products", tags: "bonbon coconut" },
    { title: "Blueberry Vanilla Ganache", type: "Shop", meta: "$16", url: "/shop#products", tags: "bonbon blueberry" },
    { title: "Mint Dark Chocolate", type: "Shop", meta: "$14", url: "/shop#products", tags: "bonbon mint dark" },
    { title: "Bonbon Collection", type: "Bestsellers", meta: "$28", url: "/#bestsellers-heading", tags: "bonbon box" },
    { title: "Chocolate Bar", type: "Bestsellers", meta: "$12", url: "/shop#products", tags: "bars bar" },
    { title: "Sea Salt Caramels", type: "Bestsellers", meta: "$16", url: "/shop#products", tags: "caramels" },
    { title: "Chocolate Cookies", type: "Bestsellers", meta: "$14", url: "/shop#products", tags: "cookies" },
    { title: "Signature Bonbon Box", type: "Gifts", meta: "$48", url: "/gifts", tags: "gift bonbon" },
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
    { title: "Contact Us", type: "Page", meta: "", url: "/contact", tags: "support help email phone" }
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

  ready(function () {
    initAnnouncement();
    initMobileNav();
    initBuildBox();
    initGiftQty();
    initTestimonials();
    initSqsFormSlots();
    initThanks();
    initShop();
    initForms();
    initSearch();
  });
})();
