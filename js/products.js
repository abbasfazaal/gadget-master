const formatUGXPrice = amount => new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0
}).format(Math.round(Number(amount) || 0));

const getProducts = async () => {
  try {
    const results = await fetch("./data/products.json");
    const data = await results.json();
    const products = data.products;
    return products;
  } catch (err) {
    console.log(err);
  }
};

/*
=============
Load Category Products
=============
 */
const categoryCenter = document.querySelector(".category__center");

const getFilterBtns = () => document.querySelectorAll(".filter-btn");

const setActiveTab = id => {
  getFilterBtns().forEach(btn => {
    const isActive = btn.dataset.id === id;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
};

let productsCache = [];

const displayProductItems = items => {
  if (!categoryCenter) return;
  if (!items.length) {
    categoryCenter.innerHTML = '<p class="no-products">No products found in this category.</p>';
    return;
  }

  const displayProduct = items.map(product => {
    const imageSrc = decodeURI(product.image.replace(/^\.\//, ''));
    return `
      <div class="product category__products" data-id="${product.id}">
        <div class="product__header">
          <img src="${imageSrc}" alt="${product.title}">
        </div>
        <div class="product__footer">
          <h3>${product.title}</h3>
          <p class="product__category">${product.category}</p>
          <p class="product__description">Essential ${product.category.toLowerCase()} gear for your everyday setup.</p>
          <div class="product__badge">${product.category === 'Phones' ? 'New' : product.category === 'Laptops' ? 'Best Seller' : product.category === 'Audio' ? 'On Sale' : 'Popular'}</div>
          <div class="rating">
            <svg><use xlink:href="./images/sprite.svg#icon-star-full"></use></svg>
            <svg><use xlink:href="./images/sprite.svg#icon-star-full"></use></svg>
            <svg><use xlink:href="./images/sprite.svg#icon-star-full"></use></svg>
            <svg><use xlink:href="./images/sprite.svg#icon-star-full"></use></svg>
            <svg><use xlink:href="./images/sprite.svg#icon-star-empty"></use></svg>
          </div>
          <div class="product__price">
            <h4>UGX ${formatUGXPrice(product.price)}</h4>
          </div>
          <a href="#"><button type="button" class="product__btn">Add To Cart</button></a>
        </div>
        <ul>
          <li>
            <a data-tip="Quick View" data-place="left" href="#">
              <svg><use xlink:href="./images/sprite.svg#icon-eye"></use></svg>
            </a>
          </li>
          <li>
            <a data-tip="Add To Wishlist" data-place="left" href="#">
              <svg><use xlink:href="./images/sprite.svg#icon-heart-o"></use></svg>
            </a>
          </li>
          <li>
            <a data-tip="Add To Compare" data-place="left" href="#">
              <svg><use xlink:href="./images/sprite.svg#icon-loop2"></use></svg>
            </a>
          </li>
        </ul>
      </div>`;
  }).join("");

  categoryCenter.innerHTML = displayProduct;
};

/*
=============
Filtering
=============
 */

const handleFilterClick = id => {
  setActiveTab(id);

  const filteredProducts = id === "All Products"
    ? productsCache
    : productsCache.filter(product => product.category === id);

  displayProductItems(filteredProducts);
};

const attachFilterButtonListeners = () => {
  const tabsContainer = document.querySelector(".title__container.tabs");
  if (!tabsContainer) return;

  tabsContainer.addEventListener("click", async e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    handleFilterClick(id);
  });
};

window.addEventListener("DOMContentLoaded", async function () {
  const products = await getProducts();
  productsCache = products || [];

  // default active tab
  setActiveTab('All Products');
  attachFilterButtonListeners();

  // Check for search query in URL
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search');

  if (searchQuery) {
    // Filter products based on search query
    const filteredProducts = productsCache.filter(product => 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Display search results heading
    const categoryCenter = document.querySelector(".category__center");
    if (categoryCenter && categoryCenter.parentElement) {
      const heading = document.createElement('h2');
      heading.style.paddingLeft = '20px';
      heading.textContent = `Search Results for "${searchQuery}" (${filteredProducts.length} found)`;
      categoryCenter.parentElement.insertBefore(heading, categoryCenter);
    }

    if (filteredProducts.length === 0) {
      if (categoryCenter) {
        categoryCenter.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No products found matching your search.</p>';
      }
    } else {
      displayProductItems(filteredProducts);
    }
  } else {
    displayProductItems(productsCache);
  }
});

/*
=============
Product Details Left
=============
 */
const pic1 = document.getElementById("pic1");
const pic2 = document.getElementById("pic2");
const pic3 = document.getElementById("pic3");
const pic4 = document.getElementById("pic4");
const pic5 = document.getElementById("pic5");
const picContainer = document.querySelector(".product__pictures");
const zoom = document.getElementById("zoom");
const pic = document.getElementById("pic");

// Picture List
const picList = [pic1, pic2, pic3, pic4, pic5];

// Active Picture
let picActive = 1;

["mouseover", "touchstart"].forEach(event => {
  if (picContainer) {
    picContainer.addEventListener(event, e => {
      const target = e.target.closest("img");
      if (!target) return;
      const id = target.id.slice(3);
      changeImage(`./images/products/iPhone/iphone${id}.jpeg`, id);
    });
  }
});

// change active image
const changeImage = (imgSrc, n) => {
  // change the main image
  pic.src = imgSrc;
  // change the background-image
  zoom.style.backgroundImage = `url(${imgSrc})`;
  //   remove the border from the previous active side image
  picList[picActive - 1].classList.remove("img-active");
  // add to the active image
  picList[n - 1].classList.add("img-active");
  //   update the active side picture
  picActive = n;
};

/*
=============
Product Details Bottom
=============
 */

const btns = document.querySelectorAll(".detail-btn");
const detail = document.querySelector(".product-detail__bottom");
const contents = document.querySelectorAll(".content");

if (detail) {
  detail.addEventListener("click", e => {
    const target = e.target.closest(".detail-btn");
    if (!target) return;

    const id = target.dataset.id;
    if (id) {
      Array.from(btns).forEach(btn => {
        // remove active from all btn
        btn.classList.remove("active");
        e.target.closest(".detail-btn").classList.add("active");
      });
      // hide other active
      Array.from(contents).forEach(content => {
        content.classList.remove("active");
      });
      const element = document.getElementById(id);
      element.classList.add("active");
    }
  });
}
