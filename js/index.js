/*
=============
Contact Form
=============
*/
const contactForm = document.querySelector(".contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thank you for your message! We will get back to you soon.");
    contactForm.reset();
  });
}

/*
=============
Navigation
=============
*/
const navOpen = document.querySelector(".nav__hamburger");
const navClose = document.querySelector(".close__toggle");
const menu = document.querySelector(".nav__menu");
const scrollLink = document.querySelectorAll(".scroll-link");
const navContainer = document.querySelector(".nav__menu");

if (navOpen && menu && navContainer) {
  navOpen.addEventListener("click", () => {
    menu.classList.add("open");
    document.body.classList.add("active");
    navContainer.style.left = "0";
    navContainer.style.width = "30rem";
  });
}

if (navClose && menu && navContainer) {
  navClose.addEventListener("click", () => {
    menu.classList.remove("open");
    document.body.classList.remove("active");
    navContainer.style.left = "-30rem";
    navContainer.style.width = "0";
  });
}

/*
=============
Fixed Navigation
=============
*/
const navBar = document.querySelector(".navigation");
const gotoTop = document.querySelector(".goto-top");

// Smooth Scroll
Array.from(scrollLink).forEach(link => {
  link.addEventListener("click", e => {
    if (link.classList.contains("page-link")) {
      return;
    }

    const href = e.currentTarget.getAttribute("href");
    if (!href || !href.startsWith("#")) {
      return;
    }

    e.preventDefault();

    const id = href.slice(1);
    const element = document.getElementById(id);

    if (element && navBar) {
      const navHeight = navBar.getBoundingClientRect().height;
      const fixNav = navBar.classList.contains("fix__nav");
      let position = element.offsetTop - navHeight;

      if (!fixNav) {
        position = position - navHeight;
      }

      window.scrollTo({
        left: 0,
        top: position,
      });

      if (navContainer) {
        navContainer.style.left = "-30rem";
        navContainer.style.width = "0";
      }

      document.body.classList.remove("active");
      menu?.classList.remove("open");
    }
  });
});

// Fix NavBar
if (navBar && gotoTop) {
  window.addEventListener("scroll", () => {
    const scrollHeight = window.pageYOffset;
    const navHeight = navBar.getBoundingClientRect().height;

    if (scrollHeight > navHeight) {
      navBar.classList.add("fix__nav");
    } else {
      navBar.classList.remove("fix__nav");
    }

    if (scrollHeight > 300) {
      gotoTop.classList.add("show-top");
    } else {
      gotoTop.classList.remove("show-top");
    }
  });
}

/*
=============
Login / Cart / Search
=============
*/
let login = document.querySelector(".login-form");
let shoppingCart = document.querySelector(".shopping-cart");
let searchForm = document.querySelector(".search-form");

const loginBtn = document.querySelector("#login-btn");
const cartBtn = document.querySelector("#cart-btn");
const searchBtn = document.querySelector("#search-btn");

if (loginBtn && login) {
  loginBtn.onclick = (e) => {
    e.preventDefault();
    login.classList.toggle("active");
    searchForm?.classList.remove("active");
    shoppingCart?.classList.remove("active");
  };
}

if (cartBtn && shoppingCart) {
  cartBtn.onclick = (e) => {
    e.preventDefault();
    shoppingCart.classList.toggle("active");
    searchForm?.classList.remove("active");
    login?.classList.remove("active");
  };
}

if (searchBtn && searchForm) {
  searchBtn.onclick = (e) => {
    e.preventDefault();
    searchForm.classList.toggle("active");
    shoppingCart?.classList.remove("active");
    login?.classList.remove("active");

    if (searchForm.classList.contains("active")) {
      document.getElementById("search-box")?.focus();
    }
  };
}

/*
=============
Search Functionality
=============
*/
const searchBox = document.getElementById("search-box");
const suggestionsBox = document.getElementById("search-suggestions");
let searchProductsCache = null;

const loadProductsForSearch = async () => {
  if (searchProductsCache) return searchProductsCache;
  const products = await getProducts();
  searchProductsCache = products || [];
  return searchProductsCache;
};

const executeSearch = (query) => {
  const searchQuery = query.trim();
  if (searchQuery.length === 0) return;
  localStorage.setItem("searchQuery", searchQuery);
  window.location.href = "product.html?search=" + encodeURIComponent(searchQuery);
};

const renderSuggestions = (items, query) => {
  if (!suggestionsBox) return;
  if (!items.length || query.trim().length === 0) {
    suggestionsBox.classList.remove("active");
    suggestionsBox.innerHTML = "";
    return;
  }

  const html = items
    .slice(0, 6)
    .map(product => `
      <div class="item" data-query="${product.title}" data-search="${product.title}">
        <div class="title">${product.title}</div>
        <div class="meta">${product.category}</div>
      </div>
    `)
    .join("");

  suggestionsBox.innerHTML = html;
  suggestionsBox.classList.add("active");

  suggestionsBox.querySelectorAll(".item").forEach(el => {
    el.addEventListener("click", () => {
      const queryValue = el.dataset.search || "";
      if (searchBox) searchBox.value = queryValue;
      suggestionsBox.classList.remove("active");
      executeSearch(queryValue);
    });
  });
};

if (searchBox) {
  searchBox.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (query.length === 0) {
      renderSuggestions([], query);
      return;
    }

    const products = await loadProductsForSearch();
    const matched = products.filter(product => {
      const title = product.title.toLowerCase();
      const category = product.category.toLowerCase();
      return title.includes(query.toLowerCase()) || category.includes(query.toLowerCase());
    });

    renderSuggestions(matched, query);
  });

  searchBox.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      executeSearch(searchBox.value);
    }
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".searchF")) {
      suggestionsBox?.classList.remove("active");
    }
  });

  const searchLabel = document.getElementById("search-submit");
  if (searchLabel) {
    searchLabel.addEventListener("click", (e) => {
      e.preventDefault();
      executeSearch(searchBox.value);
    });
  }
}