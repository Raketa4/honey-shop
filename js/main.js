// Contact details are assembled here at runtime rather than written as plain
// text in the page source, so basic scrapers reading the static HTML/JS
// can't harvest them directly. Real visitors get working links/numbers
// after this script runs.
const TG_USERNAME = atob("QW5kcmV5MTIzOTg=");
const MAIL_USER = atob("aTEyMzk4MDk4");
const MAIL_DOMAIN = atob("eWFuZGV4LnJ1");

const EMAIL = `${MAIL_USER}@${MAIL_DOMAIN}`;
const TG_URL = `https://t.me/${TG_USERNAME}`;

const PRODUCT_OPTIONS = {
  "honey-main": "Мёд разнотравье",
  "honey-other": "Другой сорт мёда (уточнить поступление)",
  "combs": "Мёд в сотах (уточнить поступление)",
};

function initContacts() {
  document.querySelectorAll(".js-tg-link").forEach((el) => {
    el.href = TG_URL;
  });
  document.querySelectorAll(".js-mail-link").forEach((el) => {
    el.href = `mailto:${EMAIL}`;
    if ("showAddress" in el.dataset) el.textContent = EMAIL;
  });
}

initContacts();

document.querySelectorAll("[data-product]").forEach((el) => {
  el.addEventListener("click", () => {
    const key = el.getAttribute("data-product");
    const value = PRODUCT_OPTIONS[key];
    const select = document.getElementById("product");
    if (value && select) select.value = value;
  });
});

const litersInput = document.getElementById("liters");
const orderTotal = document.getElementById("orderTotal");
const PRICE_PER_LITER = 1000;

function updateTotal() {
  const liters = Math.max(3, parseInt(litersInput.value, 10) || 3);
  orderTotal.textContent = `${liters * PRICE_PER_LITER} ₽`;
}

litersInput.addEventListener("input", updateTotal);
updateTotal();

const phoneInput = document.getElementById("phone");

function formatPhone(value) {
  let digits = value.replace(/\D/g, "");
  if (!digits) return "";

  if (digits[0] === "8") digits = "7" + digits.slice(1);
  else if (digits[0] !== "7") digits = "7" + digits;
  digits = digits.slice(0, 11);

  let formatted = "+7";
  if (digits.length > 1) formatted += "-" + digits.slice(1, 4);
  if (digits.length > 4) formatted += "-" + digits.slice(4, 7);
  if (digits.length > 7) formatted += "-" + digits.slice(7, 9);
  if (digits.length > 9) formatted += "-" + digits.slice(9, 11);
  return formatted;
}

phoneInput.addEventListener("input", () => {
  phoneInput.value = formatPhone(phoneInput.value);
});

const form = document.getElementById("orderForm");
const statusEl = document.getElementById("formStatus");

// Sent via mailto: (opens the customer's own mail app) rather than posting to
// a third-party form-relay service: antivirus web-traffic scanners commonly
// flag such relays as a data-loss risk (they're a known phishing vector),
// which silently blocked real orders. mailto: makes no network request at
// all, so there is nothing for that scanning to intercept.
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const lines = [
    `Товар: ${document.getElementById("product").value}`,
    `Количество, л: ${litersInput.value}`,
    `Итого: ${orderTotal.textContent}`,
    `Имя: ${document.getElementById("name").value}`,
    `Телефон: ${document.getElementById("phone").value}`,
    `Адрес ПВЗ Озон: ${document.getElementById("pvz").value}`,
    `Комментарий: ${document.getElementById("comment").value || "-"}`,
  ];

  const subject = encodeURIComponent("Новая заявка — Уральский-мёд");
  const body = encodeURIComponent(lines.join("\n"));
  window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;

  statusEl.textContent =
    "Открылся черновик письма в вашей почтовой программе — проверьте и нажмите «Отправить». Не открылось? Напишите нам в Telegram (кнопка на карточке товара).";
  statusEl.className = "form-status";
});
