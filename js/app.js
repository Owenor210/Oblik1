const STORAGE_KEY = "oblik1-v3";

const defaultData = {
  incomes: [],
  expenses: [],
  debts: [],
  subscriptions: [],
  fund: 0,
  fundTarget: 50000,
  workDays: 0,
  workRate: 1000
};

let data = loadData();
let currentModal = null;

let calendarDate = new Date();
let selectedDate = formatDate(new Date());

function loadData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return structuredClone(defaultData);
    }

    return {
      ...structuredClone(defaultData),
      ...JSON.parse(saved)
    };
  } catch (error) {
    console.error(error);
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );

  render();
}

function number(value) {
  return Number(value) || 0;
}

function money(value) {
  return (
    new Intl.NumberFormat("uk-UA", {
      maximumFractionDigits: 0
    }).format(number(value)) + " ₴"
  );
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================
   DATE
========================= */

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function parseDate(value) {
  const parts = value.split("-");

  return new Date(
    Number(parts[0]),
    Number(parts[1]) - 1,
    Number(parts[2])
  );
}

function todayString() {
  return formatDate(new Date());
}

/* =========================
   CALENDAR
========================= */

function changeMonth(direction) {
  calendarDate.setMonth(
    calendarDate.getMonth() + direction
  );

  renderCalendar();
}

function renderCalendar() {
  const container =
    document.getElementById("calendarDays");

  if (!container) return;

  const monthNames = [
    "Січень",
    "Лютий",
    "Березень",
    "Квітень",
    "Травень",
    "Червень",
    "Липень",
    "Серпень",
    "Вересень",
    "Жовтень",
    "Листопад",
    "Грудень"
  ];

  const month =
    calendarDate.getMonth();

  const year =
    calendarDate.getFullYear();

  setText(
    "calendarMonth",
    monthNames[month]
  );

  setText(
    "calendarYear",
    year
  );

  const firstDay =
    new Date(year, month, 1);

  let startDay =
    firstDay.getDay();

  // Неділя = 0.
  // Для календаря початок з понеділка.
  startDay =
    startDay === 0
      ? 6
      : startDay - 1;

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const previousMonthDays =
    new Date(
      year,
      month,
      0
    ).getDate();

  let html = "";

  // Дні попереднього місяця
  for (let i = startDay - 1; i >= 0; i--) {

    const day =
      previousMonthDays - i;

    html += `
      <button
        class="calendar-day muted-day"
        disabled
      >
        <span>${day}</span>
      </button>
    `;
  }

  // Поточний місяць
  for (let day = 1; day <= daysInMonth; day++) {

    const date =
      new Date(year, month, day);

    const dateString =
      formatDate(date);

    const dayIncomes =
      data.incomes.filter(
        item => item.date === dateString
      );

    const dayExpenses =
      data.expenses.filter(
        item => item.date === dateString
      );

    const incomeTotal =
      dayIncomes.reduce(
        (sum, item) =>
          sum + number(item.amount),
        0
      );

    const expenseTotal =
      dayExpenses.reduce(
        (sum, item) =>
          sum + number(item.amount),
        0
      );

    const isToday =
      dateString === todayString();

    const isSelected =
      dateString === selectedDate;

    let classes =
      "calendar-day";

    if (isToday) {
      classes += " today";
    }

    if (isSelected) {
      classes += " selected";
    }

    const hasIncome =
      incomeTotal > 0;

    const hasExpense =
      expenseTotal > 0;

    html += `
      <button
        class="${classes}"
        onclick="selectCalendarDate('${dateString}')"
      >

        <span class="calendar-number">
          ${day}
        </span>

        ${
          hasIncome
            ? `<small class="calendar-income">
                +${formatShortMoney(incomeTotal)}
               </small>`
            : ""
        }

        ${
          hasExpense
            ? `<small class="calendar-expense">
                -${formatShortMoney(expenseTotal)}
               </small>`
            : ""
        }

      </button>
    `;
  }

  // Заповнення сітки до 42 клітинок
  const currentCells =
    startDay + daysInMonth;

  const remainingCells =
    currentCells <= 35
      ? 35 - currentCells
      : 42 - currentCells;

  for (let day = 1; day <= remainingCells; day++) {

    html += `
      <button
        class="calendar-day muted-day"
        disabled
      >
        <span>${day}</span>
      </button>
    `;
  }

  container.innerHTML = html;

  renderSelectedDay();
}

function formatShortMoney(value) {
  const amount = number(value);

  if (amount >= 1000000) {
    return (
      (amount / 1000000)
        .toFixed(1)
        .replace(".0", "") +
      "м"
    );
  }

  if (amount >= 1000) {
    return (
      (amount / 1000)
        .toFixed(1)
        .replace(".0", "") +
      "к"
    );
  }

  return amount;
}

function selectCalendarDate(date) {
  selectedDate = date;

  const parsed =
    parseDate(date);

  calendarDate =
    new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      1
    );

  renderCalendar();
}

function renderSelectedDay() {
  const container =
    document.getElementById(
      "selectedDayInfo"
    );

  if (!container) return;

  const incomes =
    data.incomes.filter(
      item => item.date === selectedDate
    );

  const expenses =
    data.expenses.filter(
      item => item.date === selectedDate
    );

  const totalIncome =
    incomes.reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );

  const totalExpense =
    expenses.reduce(
      (sum, item) =>
        sum + number(item.amount),
      0
    );

  const date =
    parseDate(selectedDate);

  const formattedDate =
    date.toLocaleDateString(
      "uk-UA",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    );

  if (
    incomes.length === 0 &&
    expenses.length === 0
  ) {

    container.innerHTML = `
      <div class="day-info-card-inner">

        <div class="day-info-header">

          <div>
            <span>Вибраний день</span>
            <strong>${formattedDate}</strong>
          </div>

          <button
            onclick="openIncomeForDate('${selectedDate}')"
          >
            ＋
          </button>

        </div>

        <div class="empty-day">
          <div>💸</div>
          <strong>Операцій немає</strong>
          <span>
            Додай дохід або витрату за цей день.
          </span>
        </div>

      </div>
    `;

    return;
  }

  let html = `
    <div class="day-info-card-inner">

      <div class="day-info-header">

        <div>
          <span>Вибраний день</span>
          <strong>${formattedDate}</strong>
        </div>

        <button
          onclick="openIncomeForDate('${selectedDate}')"
        >
          ＋
        </button>

      </div>

      <div class="day-summary">

        <div>
          <span>Надійшло</span>
          <strong class="income-text">
            +${money(totalIncome)}
          </strong>
        </div>

        <div>
          <span>Витрачено</span>
          <strong class="expense-text">
            -${money(totalExpense)}
          </strong>
        </div>

      </div>

      <div class="transactions">
  `;

  incomes.forEach(item => {

    html += `
      <div class="transaction income-transaction">

        <div class="transaction-icon">
          💰
        </div>

        <div class="transaction-info">

          <strong>
            ${esc(item.name)}
          </strong>

          <span>
            ${esc(item.sourceName || incomeSourceName(item.type))}
          </span>

        </div>

        <strong class="income-text">
          +${money(item.amount)}
        </strong>

      </div>
    `;
  });

  expenses.forEach(item => {

    html += `
      <div class="transaction">

        <div class="transaction-icon">
          🛒
        </div>

        <div class="transaction-info">

          <strong>
            ${esc(item.name)}
          </strong>

          <span>
            ${esc(item.category || "Витрата")}
          </span>

        </div>

        <strong class="expense-text">
          -${money(item.amount)}
        </strong>

      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function openIncomeForDate(date) {
  selectedDate = date;
  openModal("income");
}

/* =========================
   MODALS
========================= */

function openModal(type) {

  currentModal = type;

  const modal =
    document.getElementById("modal");

  const title =
    document.getElementById(
      "modalTitle"
    );

  const fields =
    document.getElementById(
      "modalFields"
    );

  let html = "";

  if (type === "income") {

    title.textContent =
      "Додати дохід";

    html = `
      <div class="form-group">

        <label>
          Дата отримання
        </label>

        <input
          name="date"
          type="date"
          value="${selectedDate}"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Звідки гроші?
        </label>

        <select
          name="incomeType"
          id="incomeType"
          onchange="toggleIncomeSource()"
        >

          <option value="main">
            Основна зарплата
          </option>

          <option value="extra">
            Додаткова зарплата
          </option>

          <option value="work">
            Оплата за робочі дні
          </option>

          <option value="freelance">
            Підробіток
          </option>

          <option value="business">
            Бізнес
          </option>

          <option value="investment">
            Інвестиції
          </option>

          <option value="gift">
            Подарунок
          </option>

          <option value="other">
            Інше
          </option>

        </select>

      </div>


      <div
        class="form-group"
        id="customSourceGroup"
        style="display:none"
      >

        <label>
          Назва джерела
        </label>

        <input
          name="customSource"
          type="text"
          placeholder="Наприклад продаж"
        >

      </div>


      <div class="form-group">

        <label>
          Сума
        </label>

        <input
          name="amount"
          type="number"
          min="0"
          step="1"
          placeholder="Наприклад 10000"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Коментар
        </label>

        <input
          name="name"
          type="text"
          placeholder="Наприклад зарплата за вересень"
        >

      </div>
    `;
  }


  if (type === "expense") {

    title.textContent =
      "Додати витрату";

    html = `

      <div class="form-group">

        <label>
          Дата
        </label>

        <input
          name="date"
          type="date"
          value="${selectedDate}"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Сума
        </label>

        <input
          name="amount"
          type="number"
          min="0"
          step="1"
          placeholder="Наприклад 1500"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Категорія
        </label>

        <select name="category">

          <option>Їжа</option>
          <option>Житло</option>
          <option>Оренда</option>
          <option>Транспорт</option>
          <option>Покупки</option>
          <option>Розваги</option>
          <option>Комунальні</option>
          <option>Інше</option>

        </select>

      </div>


      <div class="form-group">

        <label>
          Назва
        </label>

        <input
          name="name"
          type="text"
          placeholder="Наприклад продукти"
        >

      </div>
    `;
  }


  if (type === "debt") {

    title.textContent =
      "Додати борг";

    html = `

      <div class="form-group">

        <label>
          Назва боргу
        </label>

        <input
          name="name"
          type="text"
          placeholder="Наприклад MFO"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Сума боргу
        </label>

        <input
          name="amount"
          type="number"
          min="0"
          step="1"
          placeholder="15000"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Тип боргу
        </label>

        <select name="type">

          <option value="mfo">
            МФО
          </option>

          <option value="credit">
            Кредит
          </option>

          <option value="card">
            Кредитна картка
          </option>

          <option value="person">
            Людина
          </option>

          <option value="other">
            Інше
          </option>

        </select>

      </div>


      <div class="form-group">

        <label>
          Відсоток на місяць (%)
        </label>

        <input
          name="rate"
          type="number"
          min="0"
          step="0.01"
          placeholder="10"
        >

      </div>


      <div class="form-group">

        <label>
          Комісія (₴)
        </label>

        <input
          name="fee"
          type="number"
          min="0"
          step="1"
          placeholder="0"
        >

      </div>


      <div class="form-group">

        <label>
          Мінімальний платіж (₴)
        </label>

        <input
          name="minPayment"
          type="number"
          min="0"
          step="1"
          placeholder="0"
        >

      </div>
    `;
  }


  if (type === "subscription") {

    title.textContent =
      "Додати підписку";

    html = `

      <div class="form-group">

        <label>
          Назва
        </label>

        <input
          name="name"
          type="text"
          placeholder="Netflix"
          required
        >

      </div>


      <div class="form-group">

        <label>
          Щомісячна вартість
        </label>

        <input
          name="amount"
          type="number"
          min="0"
          step="1"
          placeholder="299"
          required
        >

      </div>
    `;
  }


  if (type === "fund") {

    title.textContent =
      "Фінансова подушка";

    html = `

      <div class="form-group">

        <label>
          Поточна сума
        </label>

        <input
          name="amount"
          type="number"
          min="0"
          value="${number(data.fund)}"
        >

      </div>


      <div class="form-group">

        <label>
          Ціль
        </label>

        <input
          name="target"
          type="number"
          min="0"
          value="${number(data.fundTarget)}"
        >

      </div>
    `;
  }


  if (type === "work") {

    title.textContent =
      "Додатковий заробіток";

    html = `

      <div class="form-group">

        <label>
          Кількість робочих днів
        </label>

        <input
          name="days"
          type="number"
          min="0"
          value="${number(data.workDays)}"
        >

      </div>


      <div class="form-group">

        <label>
          Оплата за день
        </label>

        <input
          name="rate"
          type="number"
          min="0"
          value="${number(data.workRate)}"
        >

      </div>
    `;
  }


  if (type === "settings") {

    title.textContent =
      "Налаштування";

    html = `

      <div class="form-group">

        <label>
          Ціль фінансової подушки
        </label>

        <input
          name="target"
          type="number"
          min="0"
          value="${number(data.fundTarget)}"
        >

      </div>
    `;
  }


  fields.innerHTML = html;

  modal.classList.add("open");

  document.body.style.overflow =
    "hidden";
}

function toggleIncomeSource() {

  const select =
    document.getElementById(
      "incomeType"
    );

  const group =
    document.getElementById(
      "customSourceGroup"
    );

  if (!select || !group) {
    return;
  }

  group.style.display =
    select.value === "other"
      ? "block"
      : "none";
}

function closeModal() {

  const modal =
    document.getElementById(
      "modal"
    );

  modal.classList.remove("open");

  document.body.style.overflow =
    "";

  currentModal = null;
}

/* =========================
   SAVE MODAL
========================= */

function submitModal(event) {

  event.preventDefault();

  const form =
    event.target;

  const formData =
    new FormData(form);

  const get =
    name => formData.get(name);


  if (currentModal === "income") {

    const date =
      get("date") || todayString();

    const type =
      get("incomeType");

    const customSource =
      get("customSource");

    const source =
      type === "other" &&
      customSource
        ? customSource
        : incomeSourceName(type);

    data.incomes.push({

      id: Date.now(),

      date,

      type,

      sourceName: source,

      amount:
        number(
          get("amount")
        ),

      name:
        get("name") ||
        source

    });

    selectedDate =
      date;
  }


  if (currentModal === "expense") {

    const date =
      get("date") || todayString();

    data.expenses.push({

      id: Date.now(),

      date,

      amount:
        number(
          get("amount")
        ),

      category:
        get("category"),

      name:
        get("name") ||
        get("category")

    });

    selectedDate =
      date;
  }


  if (currentModal === "debt") {

    data.debts.push({

      id: Date.now(),

      name:
        get("name") ||
        "Борг",

      amount:
        number(
          get("amount")
        ),

      type:
        get("type"),

      rate:
        number(
          get("rate")
        ),

      fee:
        number(
          get("fee")
        ),

      minPayment:
        number(
          get("minPayment")
        ),

      paid: 0

    });
  }


  if (currentModal === "subscription") {

    data.subscriptions.push({

      id: Date.now(),

      name:
        get("name"),

      amount:
        number(
          get("amount")
        )

    });
  }


  if (currentModal === "fund") {

    data.fund =
      number(
        get("amount")
      );

    data.fundTarget =
      number(
        get("target")
      );
  }


  if (currentModal === "work") {

    data.workDays =
      number(
        get("days")
      );

    data.workRate =
      number(
        get("rate")
      );
  }


  if (currentModal === "settings") {

    data.fundTarget =
      number(
        get("target")
      );
  }


  saveData();

  closeModal();

  renderCalendar();
  renderSelectedDay();
}

/* =========================
   INCOME SOURCES
========================= */

function incomeSourceName(type) {

  const sources = {

    main:
      "Основна зарплата",

    extra:
      "Додаткова зарплата",

    work:
      "Оплата за робочі дні",

    freelance:
      "Підробіток",

    business:
      "Бізнес",

    investment:
      "Інвестиції",

    gift:
      "Подарунок",

    other:
      "Інше"

  };

  return (
    sources[type] ||
    "Інше"
  );
}

/* =========================