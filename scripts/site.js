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
    initOrderButtons();
  }

  var orderCart = [];

  function loadOrderCart() {
    try {
      var raw = sessionStorage.getItem("alton-order-cart");
      orderCart = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(orderCart)) orderCart = [];
    } catch (e) {
      orderCart = [];
    }
  }

  function saveOrderCart() {
    try {
      sessionStorage.setItem("alton-order-cart", JSON.stringify(orderCart));
    } catch (e) {}
  }

  function clearOrderCart() {
    orderCart = [];
    saveOrderCart();
    updateCartCountBadge();
  }

  function cartGrandTotal() {
    return orderCart.reduce(function (sum, item) {
      return sum + item.price * item.qty;
    }, 0);
  }

  function addToOrderCart(item) {
    var qty = Math.max(1, Math.min(99, parseInt(item.qty, 10) || 1));
    var price = parseFloat(item.price) || 0;
    var title = String(item.title || "Item").trim();
    var image = item.image ? String(item.image) : "";
    var meta = item.meta ? String(item.meta) : "";
    var existing = null;
    for (var i = 0; i < orderCart.length; i++) {
      if (
        orderCart[i].title === title &&
        orderCart[i].price === price &&
        String(orderCart[i].meta || "") === meta
      ) {
        existing = orderCart[i];
        break;
      }
    }
    if (existing) {
      existing.qty = Math.min(99, existing.qty + qty);
      if (image && !existing.image) existing.image = image;
      if (meta && !existing.meta) existing.meta = meta;
    } else {
      var row = { title: title, price: price, qty: qty };
      if (image) row.image = image;
      if (meta) row.meta = meta;
      orderCart.push(row);
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
    if (index < 0 || index >= orderCart.length) return;
    orderCart.splice(index, 1);
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
          item.title +
          "</strong>" +
          "<span>$" +
          line +
          "</span>" +
          "</div>" +
          '<button type="button" class="alton-order__line-remove" data-cart-remove="' +
          idx +
          '" aria-label="Remove ' +
          item.title +
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
      var priceAttr = card.getAttribute("data-price");
      var price = parseFloat(priceAttr);
      if (isNaN(price)) {
        var priceEl = card.querySelector(".product-card__price");
        price = priceEl
          ? parseFloat(String(priceEl.textContent).replace(/[^0-9.]/g, "")) || 0
          : 0;
      }
      var qtyEl = card.querySelector("[data-qty-value]");
      var qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
      if (qty < 1) qty = 1;
      if (qty > 99) qty = 99;
      var imgEl = card.querySelector(".product-card__image img, .gift-collection-card__image img, img");
      var image = imgEl ? imgEl.getAttribute("src") || "" : "";
      return { title: title, price: price, qty: qty, image: image };
    }

    function orderFromCard(card) {
      if (!card) return;
      addToOrderCart(readOrderFromCard(card));
      openOrderModal();
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
      .querySelectorAll("[data-shop-product], [data-gift-card], .product-card[data-orderable]")
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
          orderFromCard(card);
        });

        card.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            orderFromCard(card);
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
      clearOrderCart();
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
      setTimeout(function () {
        window.location.href = mailto;
      }, 700);
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

        showThanks(thanksMsg);
        form.reset();

        setTimeout(function () {
          window.location.href = mailto;
        }, 900);
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
    { title: "Contact Us", type: "Page", meta: "", url: "/contact", tags: "support help email phone" },
    { title: "Sign In", type: "Page", meta: "", url: "/sign-in", tags: "account login" },
    { title: "Sign Up", type: "Page", meta: "", url: "/sign-up", tags: "account register" },
    { title: "Cart", type: "Page", meta: "", url: "/cart", tags: "bag checkout" },
    { title: "Checkout", type: "Page", meta: "", url: "/checkout", tags: "order payment" },
    { title: "Sea Salt Chocolate Bar", type: "Shop", meta: "$12", url: "/product", tags: "bars product detail" },
    { title: "Signature Celebration Gift Box", type: "Gifts", meta: "$48", url: "/gift-details", tags: "gift details box" }
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

  function initFaq() {
    document.querySelectorAll("[data-faq]").forEach(function (section) {
      section.querySelectorAll("[data-faq-item]").forEach(function (item) {
        var trigger = item.querySelector("[data-faq-trigger]");
        var panel = item.querySelector("[data-faq-panel]");
        if (!trigger || !panel || trigger.dataset.boundFaq === "1") return;
        trigger.dataset.boundFaq = "1";
        trigger.addEventListener("click", function () {
          var open = item.classList.toggle("is-open");
          trigger.setAttribute("aria-expanded", open ? "true" : "false");
          panel.hidden = !open;
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

  function initCartPage() {
    var root = document.querySelector("[data-cart-page]");
    if (!root) return;
    loadOrderCart();

    var list = root.querySelector("[data-cart-lines]");
    var empty = root.querySelector("[data-cart-empty]");
    var countEl = root.querySelector("[data-cart-heading-count]");
    var subtotalEl = root.querySelector("[data-cart-subtotal]");
    var totalEl = root.querySelector("[data-cart-total]");
    var clearBtn = root.querySelector("[data-cart-clear]");
    var checkoutBtn = root.querySelector("[data-cart-checkout]");

    function render() {
      loadOrderCart();
      var count = cartItemCount();
      if (countEl) countEl.textContent = "(" + count + " Product" + (count === 1 ? "" : "s") + ")";
      if (subtotalEl) subtotalEl.textContent = money(cartGrandTotal());
      if (totalEl) totalEl.textContent = money(cartGrandTotal());
      updateCartCountBadge();

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
          var img =
            item.image || "/assets/images/cart-gift-box.png";
          var lineTotal = money(item.price * item.qty);
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
            '<p class="cart-line__desc">Qty: ' +
            item.qty +
            "</p>" +
            "</div>" +
            '<div class="cart-line__side">' +
            '<span class="cart-line__price">' +
            lineTotal +
            "</span>" +
            '<div class="cart-line__actions">' +
            '<a class="cart-line__btn" href="/product" aria-label="Edit ' +
            escapeHtml(item.title) +
            '"><img src="/assets/icons/edit.svg" alt="" width="16" height="16"></a>' +
            '<button type="button" class="cart-line__btn" data-cart-remove="' +
            idx +
            '" aria-label="Remove ' +
            escapeHtml(item.title) +
            '"><img src="/assets/icons/delete.svg" alt="" width="16" height="16"></button>' +
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
        if (!orderCart.length) return;
        if (!window.confirm("Clear all items from your cart?")) return;
        clearOrderCart();
        render();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", function (e) {
        loadOrderCart();
        if (!orderCart.length) {
          e.preventDefault();
          alert("Your cart is empty.");
        }
      });
    }

    render();
  }

  function initCheckoutPage() {
    var root = document.querySelector("[data-checkout-page]");
    if (!root) return;
    loadOrderCart();

    var itemsEl = root.querySelector("[data-checkout-items]");
    var subtotalEl = root.querySelector("[data-checkout-subtotal]");
    var shippingEl = root.querySelector("[data-checkout-shipping]");
    var totalEl = root.querySelector("[data-checkout-total]");
    var form = root.querySelector("[data-checkout-form]");
    var giftToggle = root.querySelector("[data-gift-toggle]");
    var giftFields = root.querySelector("[data-gift-fields]");
    var cardFields = root.querySelector("[data-card-fields]");

    function renderSummary() {
      loadOrderCart();
      var subtotal = cartGrandTotal();
      var shipping = orderCart.length ? 0 : 0;
      if (subtotalEl) subtotalEl.textContent = money(subtotal);
      if (shippingEl) shippingEl.textContent = orderCart.length ? money(shipping) : "$0.00";
      if (totalEl) totalEl.textContent = money(subtotal + shipping);
      if (!itemsEl) return;
      if (!orderCart.length) {
        itemsEl.innerHTML = '<p class="body-lg">No items. <a href="/cart">Return to cart</a>.</p>';
        return;
      }
      itemsEl.innerHTML = orderCart
        .map(function (item) {
          return (
            '<div class="checkout-summary__item"><span>' +
            escapeHtml(item.qty + " × " + item.title) +
            (item.meta ? " · " + escapeHtml(item.meta) : "") +
            "</span><span>" +
            money(item.price * item.qty) +
            "</span></div>"
          );
        })
        .join("");
    }

    if (giftToggle && giftFields) {
      giftToggle.addEventListener("change", function () {
        giftFields.hidden = !giftToggle.checked;
      });
    }

    root.querySelectorAll("[data-pay-method]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        root.querySelectorAll(".checkout-pay__option").forEach(function (opt) {
          opt.classList.toggle("is-selected", opt.querySelector("input") === radio);
        });
        if (cardFields) cardFields.hidden = radio.value !== "card";
      });
    });

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
        var total = cartGrandTotal().toFixed(2);
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
        var lines = [
          "New Alton Chocolates checkout order",
          "",
          "Items:",
          itemLines.join("\n"),
          "",
          "Order total: $" + total,
          "",
          "Contact:",
          "Name: " + String(data.get("name") || ""),
          "Email: " + String(data.get("email") || ""),
          "Phone: " + String(data.get("phone") || ""),
          "Address: " + String(data.get("address") || ""),
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
        clearOrderCart();
        form.reset();
        if (giftFields) giftFields.hidden = true;
        renderSummary();
        showThanks(
          "Order placed (" +
            count +
            " item" +
            (count === 1 ? "" : "s") +
            ", $" +
            total +
            "). We will confirm by email shortly."
        );
        setTimeout(function () {
          window.location.href = mailto;
        }, 700);
      });
    }

    renderSummary();
  }

  function initAuthForms() {
    if (document.querySelector("[data-auth-page]")) {
      document.body.classList.add("is-auth-page");
    }

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
        if (kind === "signup") {
          showThanks("Welcome to Alton Chocolates. Your account is ready.");
          setTimeout(function () {
            window.location.href = "/sign-in";
          }, 1200);
        } else {
          showThanks("Signed in. Welcome back.");
          setTimeout(function () {
            window.location.href = "/";
          }, 1200);
        }
        form.reset();
      });
    });

    document.querySelectorAll("[data-auth-google]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        showThanks("Google sign-in is a demo button only — not connected.");
      });
    });
  }

  function initPdp() {
    var root = document.querySelector("[data-pdp]");
    if (!root) return;

    initQtyControls(root);

    root.querySelectorAll("[data-pdp-thumb]").forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-pdp-thumb");
        var main = root.querySelector("[data-pdp-main-image]");
        if (main && src) main.src = src;
        root.querySelectorAll(".pdp-gallery__thumb").forEach(function (t) {
          t.classList.toggle("is-active", t === thumb);
        });
      });
    });

    root.querySelectorAll("[data-pdp-type]").forEach(function (radio) {
      radio.addEventListener("change", function () {
        root.querySelectorAll(".pdp-options__option").forEach(function (opt) {
          opt.classList.toggle("is-selected", opt.querySelector("input") === radio);
        });
      });
    });

    var addBtn = root.querySelector("[data-pdp-add-cart]");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        var title =
          root.getAttribute("data-pdp-title") ||
          (root.querySelector("#pdp-title, #gift-pdp-title")
            ? root.querySelector("#pdp-title, #gift-pdp-title").textContent.trim()
            : "Item");
        var price = parseFloat(root.getAttribute("data-pdp-price")) || 0;
        var image = root.getAttribute("data-pdp-image") || "";
        var meta = root.getAttribute("data-pdp-meta") || "";
        var typeRadio = root.querySelector("[data-pdp-type]:checked");
        if (typeRadio) meta = typeRadio.value;
        var qtyEl = root.querySelector("[data-pdp-qty] [data-qty-value]");
        var qty = qtyEl ? parseInt(qtyEl.textContent, 10) || 1 : 1;
        var mainImg = root.querySelector("[data-pdp-main-image]");
        if (mainImg && mainImg.getAttribute("src")) image = mainImg.getAttribute("src");

        addToOrderCart({
          title: title,
          price: price,
          qty: qty,
          image: image,
          meta: meta
        });
        window.location.href = "/cart";
      });
    }
  }

  ready(function () {
    initAnnouncement();
    initMobileNav();
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
