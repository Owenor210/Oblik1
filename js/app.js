const STORAGE_KEY = "oblik1-v2";

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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  render();
}

function money(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0
  }).format(number) + " ₴";
}

function number(value) {
  return Number(value) || 0;
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
   MODALS
========================= */

function openModal(type) {
  currentModal = type;

  const modal = document.getElementById("modal");
  const title = document.getElementById("modalTitle");
  const fields = document.getElementById("modalFields");

  let html = "";

  if (type === "income") {
    title.textContent = "Додати дохід";

    html = `
      <div class="form-group">
        <label>Тип доходу</label>
        <select name="incomeType">
          <option value="main">Основна зарплата</option>
          <option value="extra">Додатковий дохід</option>
          <option value="other">Інше</option>
        </select>
      </div>

      <div class="form-group">
        <label>Сума</label>
        <input name="amount" type="number" min="0" step="1" placeholder="Наприклад 10000" required>
      </div>

      <div class="form-group">
        <label>Назва</label>
        <input name="name" type="text" placeholder="Наприклад зарплата">
      </div>
    `;
  }

  if (type === "expense") {
    title.textContent = "Додати витрату";

    html = `
      <div class="form-group">
        <label>Сума</label>
        <input name="amount" type="number" min="0" step="1" placeholder="Наприклад 1500" required>
      </div>

      <div class="form-group">
        <label>Категорія</label>
        <select name="category">
          <option>Їжа</option>
          <option>Житло</option>
          <option>Транспорт</option>
          <option>Покупки</option>
          <option>Розваги</option>
          <option>Інше</option>
        </select>
      </div>

      <div class="form-group">
        <label>Назва</label>
        <input name="name" type="text" placeholder="Наприклад продукти">
      </div>
    `;
  }

  if (type === "debt") {
    title.textContent = "Додати борг";

    html = `
      <div class="form-group">
        <label>Назва боргу</label>
        <input name="name" type="text" placeholder="Наприклад MFO" required>
      </div>

      <div class="form-group">
        <label>Сума боргу</label>
        <input name="amount" type="number" min="0" step="1" placeholder="Наприклад 15000" required>
      </div>

      <div class="form-group">
        <label>Тип боргу</label>
        <select name="type">
          <option value="mfo">МФО</option>
          <option value="credit">Кредит</option>
          <option value="card">Кредитна картка</option>
          <option value="person">Людина</option>
          <option value="other">Інше</option>
        </select>
      </div>

      <div class="form-group">
        <label>Відсоток на місяць (%)</label>
        <input name="rate" type="number" min="0" step="0.01" placeholder="Наприклад 10">
      </div>

      <div class="form-group">
        <label>Комісія / додатковий платіж (₴)</label>
        <input name="fee" type="number" min="0" step="1" placeholder="0">
      </div>

      <div class="form-group">
        <label>Мінімальний платіж (₴)</label>
        <input name="minPayment" type="number" min="0" step="1" placeholder="0">
      </div>
    `;
  }

  if (type === "subscription") {
    title.textContent = "Додати підписку";

    html = `
      <div class="form-group">
        <label>Назва</label>
        <input name="name" type="text" placeholder="Наприклад Netflix" required>
      </div>

      <div class="form-group">
        <label>Щомісячна вартість</label>
        <input name="amount" type="number" min="0" step="1" placeholder="Наприклад 299" required>
      </div>
    `;
  }

  if (type === "fund") {
    title.textContent = "Фінансова подушка";

    html = `
      <div class="form-group">
        <label>Поточна сума подушки</label>
        <input name="amount" type="number" min="0" step="1" value="${number(data.fund)}">
      </div>

      <div class="form-group">
        <label>Ціль подушки</label>
        <input name="target" type="number" min="0" step="1" value="${number(data.fundTarget)}">
      </div>
    `;
  }

  if (type === "work") {
    title.textContent = "Додатковий заробіток";

    html = `
      <div class="form-group">
        <label>Кількість робочих днів</label>
        <input name="days" type="number" min="0" step="1" value="${number(data.workDays)}">
      </div>

      <div class="form-group">
        <label>Оплата за день</label>
        <input name="rate" type="number" min="0" step="1" value="${number(data.workRate)}">
      </div>
    `;
  }

  if (type === "settings") {
    title.textContent = "Налаштування";

    html = `
      <div class="form-group">
        <label>Ціль фінансової подушки</label>
        <input name="target" type="number" min="0" step="1" value="${number(data.fundTarget)}">
      </div>
    `;
  }

  fields.innerHTML = html;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("modal");

  modal.classList.remove("open");
  document.body.style.overflow = "";
  currentModal = null;
}

function submitModal(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  const get = (name) => formData.get(name);

  if (currentModal === "income") {
    data.incomes.push({
      id: Date.now(),
      type: get("incomeType"),
      amount: number(get("amount")),
      name: get("name") || "Дохід",
      date: new Date().toISOString()
    });
  }

  if (currentModal === "expense") {
    data.expenses.push({
      id: Date.now(),
      amount: number(get("amount")),
      category: get("category"),
      name: get("name") || get("category"),
      date: new Date().toISOString()
    });
  }

  if (currentModal === "debt") {
    data.debts.push({
      id: Date.now(),
      name: get("name") || "Борг",
      amount: number(get("amount")),
      type: get("type"),
      rate: number(get("rate")),
      fee: number(get("fee")),
      minPayment: number(get("minPayment")),
      paid: 0
    });
  }

  if (currentModal === "subscription") {
    data.subscriptions.push({
      id: Date.now(),
      name: get("name"),
      amount: number(get("amount"))
    });
  }

  if (currentModal === "fund") {
    data.fund = number(get("amount"));
    data.fundTarget = number(get("target"));
  }

  if (currentModal === "work") {
    data.workDays = number(get("days"));
    data.workRate = number(get("rate"));
  }

  if (currentModal === "settings") {
    data.fundTarget = number(get("target"));
  }

  saveData();
  closeModal();
}

function deleteDebt(id) {
  data.debts = data.debts.filter(debt => debt.id !== id);
  saveData();
}

function deleteSubscription(id) {
  data.subscriptions =
    data.subscriptions.filter(sub => sub.id !== id);

  saveData();
}

/* =========================
   DEBT PRIORITY
========================= */

function debtPriority(debt) {
  let score = 0;

  if (debt.type === "mfo") {
    score += 30;
  }

  score += number(debt.rate) * 5;
  score += number(debt.fee) * 3;

  if (number(debt.minPayment) > 0) {
    score += 2;
  }

  return score;
}

function debtTypeName(type) {
  const names = {
    mfo: "МФО",
    credit: "Кредит",
    card: "Кредитна картка",
    person: "Людина",
    other: "Інше"
  };

  return names[type] || "Інше";
}

/* =========================
   RENDER
========================= */

function render() {
  const mainIncome = data.incomes
    .filter(item => item.type === "main")
    .reduce((sum, item) => sum + number(item.amount), 0);

  const extraIncome = data.incomes
    .filter(item => item.type === "extra")
    .reduce((sum, item) => sum + number(item.amount), 0);

  const otherIncome = data.incomes
    .filter(item => item.type === "other")
    .reduce((sum, item) => sum + number(item.amount), 0);

  const workTotal =
    number(data.workDays) * number(data.workRate);

  const totalIncome =
    mainIncome +
    extraIncome +
    otherIncome +
    workTotal;

  const totalExpenses = data.expenses
    .reduce((sum, item) => sum + number(item.amount), 0);

  const subscriptionTotal = data.subscriptions
    .reduce((sum, item) => sum + number(item.amount), 0);

  const totalDebt = data.debts
    .reduce((sum, debt) => {
      const balance =
        Math.max(0, number(debt.amount) - number(debt.paid));

      return sum + balance;
    }, 0);

  const available =
    totalIncome -
    totalExpenses -
    subscriptionTotal -
    totalDebt;

  setText("availableBalance", money(available));
  setText("monthIncome", money(totalIncome));
  setText("monthExpenses", money(totalExpenses));

  setText("mainSalary", money(mainIncome));
  setText("extraSalary", money(extraIncome + workTotal));
  setText("emergencyFund", money(data.fund));
  setText("totalDebt", money(totalDebt));

  setText("fundAmount", money(data.fund));
  setText("fundTarget", money(data.fundTarget));

  const percentage =
    data.fundTarget > 0
      ? Math.min(100, (data.fund / data.fundTarget) * 100)
      : 0;

  const progress = document.getElementById("fundProgress");

  if (progress) {
    progress.style.width = percentage + "%";
  }

  setText(
    "fundPercent",
    Math.round(percentage) + "%"
  );

  setText("planIncome", money(totalIncome));
  setText(
    "planExpenses",
    money(totalExpenses)
  );
  setText(
    "planSubs",
    money(subscriptionTotal)
  );

  const remaining =
    totalIncome -
    totalExpenses -
    subscriptionTotal;

  setText("planRemaining", money(remaining));

  setText("workDays", data.workDays);
  setText("workRate", money(data.workRate));
  setText("workTotal", money(workTotal));

  renderDebts();
  renderSubscriptions();
  updateSimulator();
}

function renderDebts() {
  const container = document.getElementById("debtsList");

  if (!data.debts.length) {
    container.innerHTML = `
      <div class="empty-card">
        <div>💳</div>
        <strong>Боргів поки немає</strong>
        <span>
          Додай борг, щоб бачити залишок та пріоритет погашення.
        </span>
      </div>
    `;

    return;
  }

  const debts = [...data.debts]
    .map(debt => ({
      ...debt,
      priority: debtPriority(debt),
      balance: Math.max(
        0,
        number(debt.amount) - number(debt.paid)
      )
    }))
    .sort((a, b) => b.priority - a.priority);

  container.innerHTML = debts.map((debt, index) => {

    const original = number(debt.amount);

    const paidPercent =
      original > 0
        ? Math.min(100, (number(debt.paid) / original) * 100)
        : 0;

    return `
      <div class="debt-card ${index === 0 ? "priority" : ""}">

        <div class="debt-head">

          <div>
            <div class="debt-name">
              ${esc(debt.name)}
            </div>

            <div class="debt-type">
              ${esc(debtTypeName(debt.type))}
            </div>

            ${
              index === 0
                ? `<div class="priority-badge">
                    🔥 Погасити в першу чергу
                   </div>`
                : ""
            }
          </div>

          <div class="debt-balance">
            ${money(debt.balance)}
          </div>

        </div>

        <div class="debt-details">

          <div class="debt-detail">
            <span>Ставка</span>
            <strong>${number(debt.rate)}%</strong>
          </div>

          <div class="debt-detail">
            <span>Комісія</span>
            <strong>${money(debt.fee)}</strong>
          </div>

          <div class="debt-detail">
            <span>Мін. платіж</span>
            <strong>${money(debt.minPayment)}</strong>
          </div>

        </div>

        <div class="item-progress">
          <div style="width:${paidPercent}%"></div>
        </div>

        <button
          onclick="deleteDebt(${debt.id})"
          style="
            margin-top:12px;
            background:transparent;
            color:var(--muted);
            font-size:11px;
          "
        >
          Видалити борг
        </button>

      </div>
    `;
  }).join("");
}

function renderSubscriptions() {
  const container =
    document.getElementById("subscriptionsList");

  if (!data.subscriptions.length) {
    container.innerHTML = `
      <div class="empty-card">
        <div>🔄</div>
        <strong>Підписок немає</strong>
        <span>
          Додай щомісячні платежі, щоб контролювати їх.
        </span>
      </div>
    `;

    return;
  }

  container.innerHTML =
    data.subscriptions.map(sub => `
      <div class="item-card">

        <div class="item-top">

          <div>
            <div class="item-name">
              ${esc(sub.name)}
            </div>

            <div class="item-meta">
              Щомісячна оплата
            </div>
          </div>

          <div class="item-amount">
            ${money(sub.amount)}
          </div>

        </div>

        <button
          onclick="deleteSubscription(${sub.id})"
          style="
            margin-top:10px;
            background:transparent;
            color:var(--muted);
            font-size:11px;
          "
        >
          Видалити
        </button>

      </div>
    `).join("");
}

/* =========================
   SIMULATOR
========================= */

function updateSimulator() {
  const slider = document.getElementById("simulator");

  if (!slider) {
    return;
  }

  const extra = number(slider.value);

  setText("simulatorValue", money(extra));

  const result =
    document.getElementById("simulatorResult");

  if (!data.debts.length) {
    result.textContent =
      "Додай борги, щоб побачити розрахунок.";

    return;
  }

  const totalDebt = data.debts.reduce(
    (sum, debt) =>
      sum +
      Math.max(
        0,
        number(debt.amount) - number(debt.paid)
      ),
    0
  );

  const after =
    Math.max(0, totalDebt - extra);

  const paid =
    Math.min(extra, totalDebt);

  const priority =
    [...data.debts]
      .sort((a, b) =>
        debtPriority(b) - debtPriority(a)
      )[0];

  result.innerHTML = `
    Якщо додатково направити
    <strong>${money(extra)}</strong>
    на борги, залишиться приблизно
    <strong>${money(after)}</strong>.

    <br><br>

    Першим варто враховувати:
    <strong>${esc(priority.name)}</strong>.

    <br>

    Погашення:
    <strong>${money(paid)}</strong>.
  `;
}

/* =========================
   HELPERS
========================= */

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================
   START
========================= */

document.addEventListener("DOMContentLoaded", () => {
  render();

  const modal = document.getElementById("modal");

  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
});

window.openModal = openModal;
window.closeModal = closeModal;
window.submitModal = submitModal;
window.deleteDebt = deleteDebt;
window.deleteSubscription = deleteSubscription;
window.updateSimulator = updateSimulator;
window.scrollToTop = scrollToTop;