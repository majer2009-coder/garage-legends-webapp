const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
 
// ===== ДАННЫЕ =====
const REGIONS = [
    { id: 'ru', name: '🇷🇺 Россия', code: 'RUS' },
    { id: 'kz', name: '🇰🇿 Казахстан', code: 'KAZ' },
    { id: 'by', name: '🇧🇪 Беларусь', code: 'BLR' },
    { id: 'az', name: '🇦🇿 Азербайджан', code: 'AZE' },
    { id: 'am', name: '🇦🇲 Армения', code: 'ARM' },
    { id: 'ge', name: '🇬🇪 Грузия', code: 'GEO' },
    { id: 'de', name: '🇩🇪 Германия', code: 'DEU' },
    { id: 'ae', name: '🇦🇪 Дубай', code: 'ARE' },
];
 
const RARITIES = {
    common: { name: 'Обычный', class: 'rarity-common', color: '#aaa' },
    uncommon: { name: 'Необычный', class: 'rarity-uncommon', color: '#4caf50' },
    rare: { name: 'Редкий', class: 'rarity-rare', color: '#2196f3' },
    epic: { name: 'Эпический', class: 'rarity-epic', color: '#9c27b0' },
    legendary: { name: 'Легендарный', class: 'rarity-legendary', color: '#ff9800' },
    mythic: { name: 'Мифический', class: 'rarity-mythic', color: '#f44336' },
    secret: { name: 'Секретный', class: 'rarity-secret', color: '#ffd700' },
};
 
const CARS = [
    { id: 1, name: 'ВАЗ-2106', emoji: '🚗', rarity: 'common' },
    { id: 2, name: 'BMW M3', emoji: '🚙', rarity: 'rare' },
    { id: 3, name: 'Mercedes AMG', emoji: '🏎️', rarity: 'epic' },
    { id: 4, name: 'Ferrari 488', emoji: '🏁', rarity: 'legendary' },
    { id: 5, name: 'Lamborghini Huracán', emoji: '🚀', rarity: 'mythic' },
    { id: 6, name: 'Bugatti Chiron', emoji: '💎', rarity: 'secret' }, { id: 'basic', name: 'Обычный контейнер', price: 500, desc: 'Шанс на редкий номер', chances: { common: 50, uncommon: 25, rare: 15, epic: 7, legendary: 2, mythic: 0.8, secret: 0.2 } },
    { id: 'gold', name: 'Золотой контейнер', price: 2500, desc: 'Повышенный шанс на эпические', chances: { common: 20, uncommon: 25, rare: 25, epic: 18, legendary: 8, mythic: 3, secret: 1 } },
    { id: 'elite', name: 'Элитный контейнер', price: 10000, desc: 'Шанс на легендарные и секретные', chances: { common: 5, uncommon: 10, rare: 20, epic: 30, legendary: 20, mythic: 10, secret: 5 } },
];
 
// ===== СОСТОЯНИЕ =====
let state = {
    balance: 50000,
    prestige: 0,
    region: 'ru',
    garage: [  { id: 1, title: 'Ferrari 488 + номер А123БВ 77', seller: 'Игрок_42', currentBid: 15000, timer: 3600 },
        { id: 2, title: 'Секретный номер М777ММ 01', seller: 'Легенда_99', currentBid: 50000, timer: 7200 },
        { id: 3, title: 'Lamborghini + номер К001КК 777', seller: 'Скоростной', currentBid: 30000, timer: 1800 },
    ],
    stats: { containersOpened: 0, totalEarned: 0, bestDrop: null },
};
 
// ===== УТИЛИТЫ =====
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
 
function rollRarity(chances) {
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (const of Object.entries(chances)) {
        cumulative += chance;
        if (roll <= cumulative) return rarity;
    }
    return 'common';
}
 
function generatePlate(region) {
    const letters = 'АВЕКМНОРСТУХ';
    const reg = REGIONS.find(r => r.id === region);
    const code = reg ? reg.code : 'RUS';
    const format = rand(0, 2);
    if (format === 0) return `${letters[rand(0,8)]}${rand(100,999)}${letters }${letters } ${code}`;
    if (format === 1) return `${rand(100,999)}${letters }${letters[rand(0,8)]} ${code}`;
    return `${letters }${letters }${rand(100,999)} ${code}`;
}
 
function formatMoney(n) { return n.toLocaleString('ru-RU'); }
 
function showToast(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
}
 
// ===== РЕНДЕР =====
function renderRegionBar() {
    const bar = document.getElementById('regionBar');
    bar.innerHTML = REGIONS.map(r =>
        `<div class="region-chip ${r.id === state.region ? 'active' : ''}" onclick="setRegion('${r.id}')">${r.name}</div>`
    ).join('');
}
 
function setRegion(id) {
    state.region = id;
    renderRegionBar();
    render();
}
 
function renderHeader() {
    document.getElementById('balance').textContent = formatMoney(state.balance);
    document.getElementById('prestige').textContent = state.prestige;
}
 
function renderGarage() {
    if (state.garage.length === 0) {
        return `<div class="profile-section"><h3>Твой гараж пуст</h3><p style="font-size:12px;color:#888">Открой контейнер, чтобы получить первую машину!</p></div>`;
    }
    return `<div class="garage-grid">${state.garage.map(car => `
        <div class="car-card">
            <div class="car-img">${car.emoji}</div>
            <div class="car-name">${car.name}</div>
            <div class="car-plate ${RARITIES .class}">${car.plate}</div>
            <div style="font-size:10px;color:#666;margin-top:4px">${RARITIES .name}</div>
        </div>`).join('')}</div>`;
}
 
function renderContainers() {
    return CONTAINERS.map(c => `
        <div class="container-card">
            <h3>${c.name}</h3>
            <p>${c.desc}</p>
            <div style="font-size:13px;margin-bottom:10px">Цена: <b>${formatMoney(c.price)} ₽</b></div>
            <button class="btn btn-gold" onclick="openContainer('${c.id}')">Открыть</button>
        </div>`).join('');
}
 
function renderMarket() {
    if (state.inventory.length === 0) {
        return `<div class="profile-section"><h3>Инвентарь пуст</h3><p style="font-size:12px;color:#888">Здесь будут твои номера и машины для продажи</p></div>`;
    }
    return state.inventory.map((item, i) => `
        <div class="container-card">
            <h3>${item.type === 'car' ? item.emoji + ' ' + item.name : 'Номер ' + item.plate}</h3>
            <p>Редкость: ${RARITIES .name} • Регион: ${REGIONS.find(r=>r.id===item.region).name}</p>
            <div style="font-size:13px;margin-bottom:10px">Цена: <b>${formatMoney(item.price)} ₽</b></div>
            <button class="btn btn-blue" onclick="sellItem(${i})">Продать</button>
        </div>`).join('');
}
 
function renderAuction() {
    return state.auction.map(lot => `
        <div class="auction-card">
            <div class="lot-title">${lot.title}</div>
            <div class="lot-info">Продавец: ${lot.seller}</div>
            <div class="lot-timer">⏳ Осталось: ${Math.floor(lot.timer/60)} мин</div>
            <div style="font-size:14px;margin-bottom:8px">Текущая ставка: <b>${formatMoney(lot.currentBid)} ₽</b></div>
            <div class="bid-row">
                <input type="number" placeholder="Ставка" id="bid${lot.id}" min="${lot.currentBid + 100}">
                <button class="btn btn-red" onclick="placeBid(${lot.id})">Ставка</button>
            </div>
        </div>`).join('');
}
 
function renderProfile() {
    return `
        <div class="profile-section">
            <h3>Статистика</h3>
            <div class="profile-row"><span>Открыто контейнеров</span><span>${state.stats.containersOpened}</span></div>
            <div class="profile-row"><span>Всего заработано</span><span>${formatMoney(state.stats.totalEarned)} ₽</span></div>
            <div class="profile-row"><span>Лучший дроп</span><span>${state.stats.bestDrop ? RARITIES .name : '—'}</span></div>
            <div class="profile-row"><span>Машин в гараже</span><span>${state.garage.length}</span></div>
            <div class="profile-row"><span>Предметов в инвентаре</span><span>${state.inventory.length}</span></div>
        </div>
        <div class="profile-section">
            <h3>Достижения</h3>
            <div class="profile-row"><span>🥇 Первая машина</span><span>${state.garage.length > 0 ? '✅' : '❌'}</span></div>
            <div class="profile-row"><span>🥈 10 контейнеров</span><span>${state.stats.containersOpened >= 10 ? '✅' : '❌'}</span></div>
            <div class="profile-row"><span>🥉 Секретный номер</span><span>${state.stats.bestDrop === 'secret' ? '✅' : '❌'}</span></div>
        </div>`;
}
 
function render() {
    renderHeader();
    const main = document.getElementById('mainContent');
    const tab = document.querySelector('.nav-item.active').dataset.tab;
    if (tab === 'garage') main.innerHTML = renderGarage();
    else if (tab === 'containers') main.innerHTML = renderContainers();
    else if (tab === 'market') main.innerHTML = renderMarket();
    else if (tab === 'auction') main.innerHTML = renderAuction();
    else if (tab === 'profile') main.innerHTML = renderProfile();
}
 
// ===== ДЕЙСТВИЯ =====
function openContainer(id) {
    const c = CONTAINERS.find(x => x.id === id);
    if (state.balance < c.price) { showToast('Недостаточно средств!'); return; }
    state.balance -= c.price;
    state.stats.containersOpened++;
    const rarity = rollRarity(c.chances);
    const car = CARS[rand(0, CARS.length - 1)];
    const plate = generatePlate(state.region);
    const item = { type: 'car', ...car, plate, plateRarity: rarity, region: state.region, price: rand(c.price, c.price * 3) };
    state.garage.push(item);
    if (!state.stats.bestDrop || Object.keys(RARITIES).indexOf(rarity) > Object.keys(RARITIES).indexOf(state.stats.bestDrop)) {
        state.stats.bestDrop = rarity;
    }
    showToast(`Выпал: ${car.name} с номером ${plate} (${RARITIES .name})!`);
    render();
}
 
function sellItem(i) {
    const item = state.inventory ;
    state.balance += item.price;
    state.stats.totalEarned += item.price;
    state.inventory.splice(i, 1);
    showToast(`Продано за ${formatMoney(item.price)} ₽`);
    render();
}
 
function placeBid(lotId) {
    const lot = state.auction.find(l => l.id === lotId);
    const input = document.getElementById('bid' + lotId);
    const bid = parseInt(input.value);
    if (!bid || bid <= lot.currentBid) { showToast('Ставка должна быть выше текущей!'); return; }
    if (state.balance < bid) { showToast('Недостаточно средств!'); return; }
    state.balance -= bid;
    lot.currentBid = bid;
    showToast(`Ставка ${formatMoney(bid)} ₽ принята!`);
    render();
}
 
// ===== НАВИГАЦИЯ =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        render();
    });
});
 
// ===== ЗАПУСК =====
renderRegionBar();
render();
 
// Таймеры аукциона
setInterval(() => {
    state.auction.forEach(l => { if (l.timer > 0) l.timer--; });
    if (document.querySelector('.nav-item.active').dataset.tab === 'auction') render();
}, 1000);