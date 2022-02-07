// The API endpoint for getting the data
const API_URL = "https://fe-assignment.vaimo.net/";

// Element selectors

const productTitle = document.querySelector("#product-title");
const reviewCount = document.querySelector("#review-count");
const shippingCountry = document.querySelector("#shipping-country");
const shippingTitle = document.querySelector("#shipping-title");
const buyers = document.querySelector("#buyers");
const leadTime = document.querySelector("#lead-time");
const discountAmount = document.querySelector("#discount-amount");
const shippintTime = document.querySelector("#shipping-time");
const ratingCount = document.querySelector("#rating-count");
const mainImage = document.querySelector("img");
const hotSaleTag = document.querySelector("#tags");
const minus = document.querySelector(".quantity__minus");
const plus = document.querySelector(".quantity__plus");
const input = document.querySelector(".quantity__input");
const currentPrice = document.getElementById("current-price");
const beforePrice = document.getElementById("before-price");
const accessories = document.querySelector(".accessories");
let itemPrices = [];

//
const renderProductData = (product) => {
  const { name, reviews, shipping, discount, gallery, options, tags } = product;

  if (product != undefined) {
    productTitle.innerHTML = name;
    reviewCount.innerHTML = reviews.count;
    shippingCountry.innerHTML = shipping.method.country;
    shippingTitle.innerHTML = shipping.method.title;
    buyers.innerHTML = reviews.total_buyers;
    leadTime.innerHTML = shipping.lead_time.value;
    discountAmount.innerHTML = discount.amount;
    shippintTime.innerHTML = shipping.method.shipping_time.value;
    ratingCount.innerHTML = reviews.rating;
    mainImage.setAttribute("src", product.gallery[0].main);
    hotSaleTag.innerText = tags[0];
    productTitle.appendChild(hotSaleTag);
    currentPrice.innerHTML = setCurrentPriceValues(product);
    beforePrice.innerHTML = setBeforePriceValues(product);
  }
};

const setCurrentPriceValues = (product) => {
  const currency = product.options["battery_accessories"].price.currency.symbol;
  const currentHighest = product.options["4k"].price.value;
  const currentLowest = product.options["battery_accessories"].price.value;

  return ` ${currency} ${currentLowest} - ${currency} ${currentHighest} `;
};

const setBeforePriceValues = (product) => {
  const currency = product.options["battery_accessories"].price.currency.symbol;
  const oldHighest = product.options["4k"].old_price.value;
  const oldlowest = product.options["battery_accessories"].old_price.value;

  return ` ${currency} ${oldlowest} - ${currency} ${oldHighest} `;
};

// Gets product data from API
async function getProductData() {
  const response = await fetch(API_URL);

  const { product } = await response.json();

  return product;
}

// User timer

function getDiscountDuration(dateValue) {
  let date = Math.abs((new Date().getTime() / 1000).toFixed(0));
  let date2 = Math.abs((new Date(dateValue).getTime() / 1000).toFixed(0));

  let diff = date2 - date;
  let days = Math.floor(diff / 86400);
  let hours = Math.floor(diff / 3600) % 24;
  let minutes = Math.floor(diff / 60) % 60;
  let seconds = diff % 60;

  if (days > 0 && hours > 0 && minutes > 0 && seconds > 0) {
    document.querySelector("#discount-duration").innerHTML =
      days + "d:" + hours + "h:" + minutes + "m:" + seconds + "s";
  } else {
    return false;
    clearInterval();
  }
}

// Displays each star for each rating
function displayRatingStars(ratingCount) {
  for (let starRating = 0; starRating < ratingCount; starRating++) {
    const starElement = document.createElement("div");
    starElement.classList.add("star");
    const img = document.createElement("img");
    img.setAttribute("src", "images/star-icon.png");
    img.setAttribute("alt", "Rating Star");
    starElement.appendChild(img);
    document.querySelector(".stars").appendChild(starElement);
  }
}

// Description: Helper methods the generate an accessory for accessories section
const accessoryElement = (obj, key, index) => {
  return `<div class="accessory-item">
          <span id="accessory">${obj[key].label}</span>
          <span id="accessory-price">${obj[key].price.currency.symbol} ${
    obj[key].price.value
  }</span>
          <div class="quantity">
          <button class="quantity__minus button" data-label="${
            obj[key].label
          }" data-id="${index + 1}"><span>-</span></button>
          <input name="quantity" type="text" id="quantity_${
            index + 1
          }" class="quantity__input " value="1">
          <button class="quantity__plus button" data-label="${
            obj[key].label
          }" data-id="${index + 1}"><span>+</span></button>
        </div>         
      </div>
    `;
};

// Description: Displays accessories section on UI
const displayAccessories = (obj) => {
  let accessory = "";

  Object.keys(obj).forEach((key, index) => {
    accessory += accessoryElement(obj, key, index);

    // Store object values for total prices later
    setAccessoryItems(obj, key);
  });

  document.querySelector(".accessories").innerHTML = accessory;
};

const setAccessoryItems = (obj, key) => {
  const { label, price } = obj && obj;

  itemPrices.push({
    label: obj[key].label,
    price: obj[key].price.value,
    qty: 1,
  });
};

const totalAmount = () => {
  let total = 0;

  itemPrices.length > 0 &&
    itemPrices.forEach((accessory) => {
      let price = accessory.price * accessory.qty;
      total = total + price;
    });

  document.getElementById("total-amount").innerHTML = total.toFixed(2);
};

// Increase the qty of an accessory
const updateAccessoryQuantity = (label, newQuanity) => {
  if (itemPrices.length > 0) {
    // Find the currently updating accessory
    const accessory = itemPrices.find((access) => access.label === label);

    if (accessory != undefined) {
      const updatedItems = itemPrices.filter((acc) => acc.label !== label);

      accessory.qty = newQuanity;

      itemPrices = [...updatedItems];

      itemPrices.push(accessory);

      // Calculate the total price of all accessory items
      totalAmount();
    }
  }
};

// Description: Listens for click events on accessories section
accessories.addEventListener("click", (e) => {
  const buttonClassList = e.target.classList;

  if (
    buttonClassList.contains("button") &&
    buttonClassList.contains("quantity__minus")
  ) {
    // Get the data id of the button
    const dataID = e.target.getAttribute("data-id");

    const dataLabel = e.target.getAttribute("data-label");

    // Get the input that matches the ID
    const input = document.getElementById("quantity_" + dataID);

    //

    // Get value of the input
    if (input != undefined) {
      let value = input.value;

      if (value > 0) value--;

      input.value = value;

      // Update the quantity of the accessory
      updateAccessoryQuantity(dataLabel, value);
    }
  }

  if (
    buttonClassList.contains("button") &&
    buttonClassList.contains("quantity__plus")
  ) {
    // Get the data id of the button
    const dataID = e.target.getAttribute("data-id");

    const dataLabel = e.target.getAttribute("data-label");

    // Get the input that matches the ID
    const input = document.getElementById("quantity_" + dataID);

    // Get value of the input
    if (input != undefined) {
      let value = input.value;

      if (value >= 0) value++;

      input.value = value;

      // Update the quantity of the accessory
      updateAccessoryQuantity(dataLabel, value);
    }
  }
});

// The init methods initialises our application
const init = (async () => {
  // Get product data from API
  const product = await getProductData();
  console.log("product:", product);

  // Get end date, rating count and options
  const { discount, reviews, options } = product && product;

  // Render product data on UI
  renderProductData(product);

  // Displaying ratings
  displayRatingStars(reviews.rating);

  // Getting the discount duration
  setInterval(() => {
    getDiscountDuration(discount.end_date);
  }, 1000);

  // Display accessories section
  displayAccessories(options);

  // Display initial total amount
  totalAmount();
})();
