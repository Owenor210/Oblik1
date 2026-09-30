(() => {
'use strict';
const KEY = 'oblik-v1', BK = 'oblik-backup';
const M = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];
const $ = s => document.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uah = n => new Intl.NumberFormat('uk-UA', {maximumFractionDigits: 0}).format(Math.round(n)) + ' грн';
const ym = d => d.slice(0, 7);
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const mname = k => { const [y, m] = k.split('-'); return M[m - 1] + ' ' + y; };
const fdate = s => { const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };
const wday = s => { const [y, m, d] = s.split('-'); return new Date(y, m - 1, d).toLocaleDateString('uk-UA', {weekday: 'short'}); };
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const sum = a => a.reduce((s, x) => s + x.amount, 0);
const shift = (k, n) => { const [y, m] = k.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };

// ---------- Дані ----------
const valid = s => s && Array.isArray(s.days) && Array.isArray(s.rent) && s.settings &&
  s.days.every(x => x.date && typeof x.amount === 'number') && s.rent.every(x => x.month && typeof x.amount === 'number');
const fresh = () => ({settings: {rate: 1000, rent: 6000}, days: [], rent: []});
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (valid(s)) return s; } catch {} return fresh(); })();
const save = () => localStorage.setItem(KEY, JSON.stringify(S));

const U = {tab: 'home', wm: 'all', cm: ym(today()), ry: +today().slice(0, 4), cmode: 'month'};
const TITLES = {home: 'Облік', cal: 'Календар', work: 'Робота', rent: 'Оренда', stats: 'Статистика'};

function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2800);
}
function totals() {
  const earned = sum(S.days), paid = sum(S.rent);
  return {earned, paid, left: earned - paid, n: S.days.length, months: S.rent.length};
}

// ---------- Екрани ----------
function chart() {
  let items;
  if (U.cmode === 'day') {
    const k = ym(today()), n = new Date(+k.slice(0, 4), +k.slice(5), 0).getDate();
    items = Array.from({length: n}, (_, i) => ({l: i + 1, v: sum(S.days.filter(x => x.date === `${k}-${pad(i + 1)}`))}));
  } else {
    const keys = [...new Set(S.days.map(x => ym(x.date)))].sort().slice(-12);
    items = keys.map(k => ({l: M[k.slice(5) - 1].slice(0, 3), v: sum(S.days.filter(x => ym(x.date) === k))}));
  }
  if (!items.some(i => i.v)) return '<div class="empty">Поки немає даних для графіка</div>';
  const max = Math.max(...items.map(i => i.v), 1);
  return '<div class="bars">' + items.map(i =>
    `<div class="col"><em>${i.v ? Math.round(i.v / 100) / 10 + 'к' : ''}</em><div class="bar" style="height:${i.v / max * 78}%"></div><span>${i.l}</span></div>`).join('') + '</div>';
}
function home() {
  const t = totals();
  return `<div class="grid">
    <div class="card stat"><small>Зароблено</small><b>${uah(t.earned)}</b></div>
    <div class="card stat"><small>Відпрацьовано днів</small><b>${t.n}</b></div>
    <div class="card stat"><small>Оренда оплачена</small><b>${uah(t.paid)}</b></div>
    <div class="card stat hero"><small>Залишок</small><b>${uah(t.left)}</b></div>
  </div>
  <div class="card"><h2>Заробіток</h2>
    <div class="seg"><button data-a="cmode" data-v="day" class="${U.cmode === 'day' ? 'on' : ''}">По днях</button>
    <button data-a="cmode" data-v="month" class="${U.cmode === 'month' ? 'on' : ''}">По місяцях</button></div>${chart()}</div>`;
}
function work() {
  const months = [...new Set(S.days.map(x => ym(x.date)))].sort().reverse();
  if (U.wm !== 'all' && !months.includes(U.wm)) U.wm = 'all';
  const list = S.days.filter(x => U.wm === 'all' || ym(x.date) === U.wm).sort((a, b) => b.date.localeCompare(a.date));
  return `<select id="wm" aria-label="Місяць"><option value="all">Усі місяці</option>${months.map(k => `<option value="${k}" ${k === U.wm ? 'selected' : ''}>${mname(k)}</option>`).join('')}</select>
  <div class="card" style="margin-top:12px"><h2>${list.length} дн. · ${uah(sum(list))}</h2>
  ${list.length ? list.map(x => `<button class="row" data-a="editWork" data-id="${x.id}"><span>${fdate(x.date)} <small>${wday(x.date)}${x.note ? ' · ' + esc(x.note) : ''}</small></span><span class="amt">${uah(x.amount)}</span></button>`).join('')
    : '<div class="empty">Записів немає. Натисніть «+ Додати робочий день».</div>'}</div>
  <button class="fab" data-a="addWork">+ Додати робочий день</button>`;
}
function rent() {
  const paid = k => S.rent.find(r => r.month === k);
  const rows = Array.from({length: 12}, (_, i) => {
    const k = `${U.ry}-${pad(i + 1)}`, r = paid(k);
    return `<div class="row"><span>${M[i]} ${U.ry}<small class="${r ? 'ok' : 'bad'}">${r ? '✅ Оплачено — ' + uah(r.amount) : '❌ Не оплачено — ' + uah(S.settings.rent)}</small></span>
      ${r ? `<button class="btn d" data-a="unpay" data-m="${k}">Скасувати</button>` : `<button class="btn" data-a="pay" data-m="${k}">Оплачено</button>`}</div>`;
  }).join('');
  return `<div class="card"><h2>Оренда — ${uah(S.settings.rent)}/місяць</h2>
    <label for="rm">Місяць</label><input type="month" id="rm" value="${ym(today())}">
    <div class="acts"><button class="btn p w" data-a="payPick">Позначити як оплачено</button></div></div>
  <div class="card"><div class="nav2"><button class="btn" data-a="ry" data-v="-1">‹</button><b>${U.ry}</b><button class="btn" data-a="ry" data-v="1">›</button></div>${rows}</div>`;
}
function stats() {
  const t = totals();
  const r = [['Загальний заробіток', uah(t.earned)], ['Робочих днів', t.n], ['Середній заробіток за день', uah(t.n ? t.earned / t.n : 0)],
    ['Загальна сума оренди', uah(t.paid)], ['Місяців оплачено', t.months], ['Чистий залишок після оренди', uah(t.left)]];
  return '<div class="card">' + r.map(([a, b]) => `<div class="row"><span>${a}</span><span class="amt">${b}</span></div>`).join('') + '</div>';
}
function cal() {
  const [y, m] = U.cm.split('-').map(Number);
  const off = (new Date(y, m - 1, 1).getDay() + 6) % 7, n = new Date(y, m, 0).getDate();
  let c = ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'].map(d => `<span>${d}</span>`).join('') + '<i></i>'.repeat(off);
  for (let d = 1; d <= n; d++) {
    const ds = `${U.cm}-${pad(d)}`, w = S.days.some(x => x.date === ds);
    c += `<button class="day ${w ? 'on' : ''} ${ds === today() ? 'now' : ''}" data-a="day" data-d="${ds}">${d}</button>`;
  }
  const mt = S.days.filter(x => ym(x.date) === U.cm);
  return `<div class="card"><div class="nav2"><button class="btn" data-a="cm" data-v="-1">‹</button><b>${mname(U.cm)}</b><button class="btn" data-a="cm" data-v="1">›</button></div>
  <div class="cal">${c}</div></div><div class="card stat"><small>У цьому місяці</small><b>${mt.length} дн. · ${uah(sum(mt))}</b></div>`;
}
const VIEWS = {home, cal, work, rent, stats};
function render() {
  $('#title').textContent = TITLES[U.tab];
  $('#view').innerHTML = VIEWS[U.tab]();
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === U.tab));
}

// ---------- Діалоги ----------
const dlg = $('#dlg');
const open = html => { dlg.innerHTML = html; if (!dlg.open) dlg.showModal(); };
const close = () => dlg.open && dlg.close();

function workForm(id, date) {
  const x = id ? S.days.find(d => d.id === id) : null;
  open(`<h2>${x ? 'Редагувати день' : 'Новий робочий день'}</h2>
  <label for="f-d">Дата</label><input type="date" id="f-d" value="${x ? x.date : date || today()}">
  <label for="f-a">Сума, грн</label><input type="number" id="f-a" inputmode="decimal" min="0" value="${x ? x.amount : S.settings.rate}">
  <label for="f-n">Коментар</label><textarea id="f-n" rows="2">${x ? esc(x.note) : ''}</textarea>
  <div class="acts"><button class="btn p" data-a="saveWork" data-id="${id || ''}">Зберегти</button>
  ${x ? `<button class="btn d" data-a="delWork" data-id="${id}">Видалити</button>` : ''}<button class="btn" data-a="close">Скасувати</button></div>`);
}
function saveWork(id) {
  const date = $('#f-d').value, amount = parseFloat($('#f-a').value), note = $('#f-n').value.trim();
  if (!date) return toast('Вкажіть дату');
  if (!(amount >= 0)) return toast('Вкажіть суму');
  if (S.days.some(x => x.date === date && x.id !== id)) return toast('На цю дату вже є запис. Відредагуйте його.');
  if (id) Object.assign(S.days.find(x => x.id === id), {date, amount, note});
  else S.days.push({id: uid(), date, amount, note});
  save(); close(); render(); toast('Збережено');
}
function dayInfo(ds) {
  const w = S.days.find(x => x.date === ds);
  open(`<h2>${fdate(ds)}, ${wday(ds)}</h2>` + (w
    ? `<div class="row"><span>Працював</span><b class="ok">Так</b></div><div class="row"><span>Отримано</span><b>${uah(w.amount)}</b></div>
       <div class="row"><span>Коментар</span><span>${esc(w.note) || '—'}</span></div>
       <div class="acts"><button class="btn p" data-a="editWork" data-id="${w.id}">Редагувати</button><button class="btn" data-a="close">Закрити</button></div>`
    : `<div class="row"><span>Працював</span><b>Ні</b></div>
       <div class="acts"><button class="btn p" data-a="addWork" data-d="${ds}">Додати робочий день</button><button class="btn" data-a="close">Закрити</button></div>`));
}
function settings() {
  open(`<h2>Налаштування</h2>
  <label for="s-r">Оплата за день, грн</label><input type="number" id="s-r" min="0" value="${S.settings.rate}">
  <label for="s-e">Оренда за місяць, грн</label><input type="number" id="s-e" min="0" value="${S.settings.rent}">
  <div class="acts"><button class="btn p" data-a="saveSet">Зберегти</button></div>
  <h2 style="margin-top:20px">Дані</h2>
  <div class="acts"><button class="btn" data-a="export">Експорт JSON</button><button class="btn" data-a="import">Імпорт JSON</button></div>
  <div class="acts"><button class="btn" data-a="backup">Зробити резервну копію</button><button class="btn" data-a="restore">Відновити з копії</button></div>
  <div class="acts"><button class="btn d" data-a="wipe">Очистити всі дані</button><button class="btn" data-a="close">Закрити</button></div>
  <input type="file" id="file" accept="application/json,.json" hidden>`);
}
function download(name, data) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'}));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
function payRent(k) {
  if (!k) return toast('Оберіть місяць');
  if (S.rent.some(r => r.month === k)) return toast('Оренда за цей місяць уже позначена як оплачена');
  S.rent.push({month: k, amount: S.settings.rent, paidAt: today()});
  save(); render(); toast(`${mname(k)} — оплачено`);
}
function replaceAll(data, msg) {
  if (!valid(data)) return toast('Некоректні дані');
  S = data; save(); close(); render(); toast(msg);
}

// ---------- Події ----------
const A = {
  close,
  addWork: e => workForm(null, e.dataset.d),
  editWork: e => workForm(e.dataset.id),
  saveWork: e => saveWork(e.dataset.id),
  delWork: e => { if (confirm('Видалити цей запис?')) { S.days = S.days.filter(x => x.id !== e.dataset.id); save(); close(); render(); } },
  day: e => dayInfo(e.dataset.d),
  cm: e => { U.cm = shift(U.cm, +e.dataset.v); render(); },
  ry: e => { U.ry += +e.dataset.v; render(); },
  cmode: e => { U.cmode = e.dataset.v; render(); },
  pay: e => payRent(e.dataset.m),
  payPick: () => payRent($('#rm').value),
  unpay: e => { if (confirm(`Скасувати оплату за ${mname(e.dataset.m)}?`)) { S.rent = S.rent.filter(r => r.month !== e.dataset.m); save(); render(); } },
  settings,
  saveSet: () => {
    const r = parseFloat($('#s-r').value), e = parseFloat($('#s-e').value);
    if (!(r >= 0) || !(e >= 0)) return toast('Вкажіть коректні суми');
    S.settings = {rate: r, rent: e}; save(); close(); render(); toast('Збережено');
  },
  export: () => download(`oblik-${today()}.json`, S),
  import: () => $('#file').click(),
  backup: () => { localStorage.setItem(BK, JSON.stringify(S)); download(`oblik-backup-${today()}.json`, S); toast('Резервну копію створено'); },
  restore: () => {
    try { const b = JSON.parse(localStorage.getItem(BK)); if (!valid(b)) throw 0;
      if (confirm('Замінити поточні дані резервною копією?')) replaceAll(b, 'Відновлено'); }
    catch { toast('Резервної копії на цьому пристрої ще немає'); }
  },
  wipe: () => { if (confirm('Видалити ВСІ дані без можливості відновлення?')) replaceAll(fresh(), 'Дані очищено'); }
};
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-a]'); if (!t) return;
  if (t.dataset.tab) { U.tab = t.dataset.tab; render(); window.scrollTo(0, 0); }
  else A[t.dataset.a]?.(t);
});
document.addEventListener('change', e => {
  if (e.target.id === 'wm') { U.wm = e.target.value; render(); }
  if (e.target.id === 'file' && e.target.files[0]) {
    e.target.files[0].text().then(tx => {
      try { const d = JSON.parse(tx); if (valid(d) && confirm('Замінити поточні дані імпортованими?')) replaceAll(d, 'Імпортовано'); else if (!valid(d)) toast('Некоректний файл'); }
      catch { toast('Не вдалося прочитати файл'); }
    });
  }
});

render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(() => {});
})();
