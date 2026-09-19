// ---- Backend API base URL ----
// Agar backend kisi aur server/port pe deploy karo, sirf yeh line badalni hai.
const API_BASE = 'http://localhost:5000/api';

// ---- Session (login state) — sirf email/name yaha local rehta hai,          ----
// ---- password kabhi bhi browser me store nahi hota, sab MongoDB me hai     ----
const session = {
  get: () => JSON.parse(localStorage.getItem('vc_session') || 'null'),
  set: (user) => localStorage.setItem('vc_session', JSON.stringify(user)),
  clear: () => localStorage.removeItem('vc_session'),
};

// ---- Backend helpers ----
async function apiGet(path) {
  const res = await fetch(API_BASE + path);
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed');
  return res.json();
}
async function apiPost(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
async function apiPut(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}
async function apiPatch(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function getCart(email) {
  try { return await apiGet('/cart/' + encodeURIComponent(email)); }
  catch { return []; }
}
async function saveCart(email, items) {
  await apiPut('/cart/' + encodeURIComponent(email), { items });
}
async function getOrders(email) {
  try { return await apiGet('/orders/' + encodeURIComponent(email)); }
  catch { return []; }
}

let currentSystem = null;
let currentCategory = null;
let currentSearch = null;

function currentUser() {
  return session.get();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---- Routing ----
async function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  document.getElementById('view-' + name).hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'systems') renderSystemGrid('systemGrid');
  if (name === 'categories') renderCategoriesView();
  if (name === 'prescription') renderPrescriptionView();
  if (name === 'cart') await renderCart();
  if (name === 'checkout') await renderCheckout();
  if (name === 'orders') await renderOrders();
  await updateAccountButton();
}

function requireAuth(next) {
  if (!currentUser()) {
    showToast('Please log in first');
    showView('login');
    return false;
  }
  next();
  return true;
}

document.querySelectorAll('[data-nav]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const target = el.getAttribute('data-nav');
    if (target === 'cart' || target === 'orders') {
      requireAuth(() => showView(target));
    } else {
      showView(target);
    }
  });
});

async function updateAccountButton() {
  const btn = document.getElementById('accountBtn');
  const user = currentUser();
  if (user) {
    btn.textContent = user.name.split(' ')[0] + ' ▾';
    btn.onclick = (e) => {
      e.preventDefault();
      if (confirm('Log out of VanaCare?')) {
        session.clear();
        showToast('Logged out');
        showView('home');
      }
    };
  } else {
    btn.textContent = 'Account';
    btn.onclick = (e) => { e.preventDefault(); showView('login'); };
  }
  await updateCartCount();
}

async function updateCartCount() {
  const user = currentUser();
  const cart = user ? await getCart(user.email) : [];
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartCount').textContent = count;
}

// ---- Systems (compartments) & Categories ----
function renderSystemGrid(elId) {
  const grid = document.getElementById(elId);
  grid.innerHTML = SYSTEMS.map(s => `
    <button class="category-card" data-sys="${s.id}">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.blurb}</p>
    </button>`).join('');
  grid.querySelectorAll('[data-sys]').forEach(btn => {
    btn.addEventListener('click', () => openSystem(btn.dataset.sys));
  });
}

function openSystem(sysId) {
  currentSystem = sysId;
  showView('categories');
}

function renderCategoriesView() {
  const sys = SYSTEMS.find(s => s.id === currentSystem) || SYSTEMS[0];
  currentSystem = sys.id;
  document.getElementById('categoriesTitle').textContent = sys.name + ' — choose a category';
  const grid = document.getElementById('categoryGridFull');
  const cats = CATEGORIES.filter(c => c.system === sys.id);
  grid.innerHTML = cats.map(c => `
    <button class="category-card" data-cat="${c.id}">
      <div class="icon">${c.icon}</div>
      <h3>${c.name}</h3>
      <p>${c.blurb}</p>
    </button>`).join('');
  grid.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => openCategory(btn.dataset.cat));
  });
}

document.getElementById('prescriptionLinkBtn').addEventListener('click', () => {
  requireAuth(() => showView('prescription'));
});
document.getElementById('prescriptionBackBtn').addEventListener('click', () => showView('categories'));

function openCategory(catId) {
  currentCategory = catId;
  currentSearch = null;
  const cat = CATEGORIES.find(c => c.id === catId);
  const sys = SYSTEMS.find(s => s.id === cat.system);
  document.getElementById('productListTitle').textContent = `${sys.name} — ${cat.name}`;
  showView('products');
  renderProductGrid(PRODUCTS.filter(p => p.category === catId));
}

function runSearch(query) {
  currentSearch = query;
  currentCategory = null;
  document.getElementById('productListTitle').textContent = `Results for "${query}"`;
  const q = query.trim().toLowerCase();
  const results = PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  showView('products');
  renderProductGrid(results);
}

function renderProductGrid(list) {
  const grid = document.getElementById('productGrid');
  const empty = document.getElementById('productEmpty');
  empty.hidden = list.length !== 0;
  grid.innerHTML = list.map(p => {
    const sys = SYSTEMS.find(s => s.id === p.system);
    return `
    <div class="product-card">
      <span class="potency-tag">${p.potency} · ${sys.name}</span>
      <h3>${p.name}${p.prescriptionOnly ? '<span class="rx-tag">Rx</span>' : ''}</h3>
      <p>${p.desc}</p>
      <div class="product-foot">
        <span class="price">₹${p.price}</span>
        <button class="btn btn-ghost" data-add="${p.id}">Add to cart</button>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add));
  });
}

// ---- Prescription-based selection ----
function renderPrescriptionView() {
  const sys = currentSystem ? SYSTEMS.find(s => s.id === currentSystem) : null;
  document.getElementById('prescriptionTitle').textContent = sys
    ? `Order from a prescription — ${sys.name}`
    : 'Order from a prescription — any medicine';
  document.getElementById('prescriptionResults').innerHTML = '<p class="muted">Matches will appear here once you submit.</p>';
}

let lastPrescriptionText = '';
let lastPrescriptionImage = null;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document.getElementById('prescriptionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const raw = form.get('rx') || '';
  lastPrescriptionText = raw;

  const imageFile = form.get('rxImage');
  lastPrescriptionImage = (imageFile && imageFile.size > 0) ? await readFileAsDataURL(imageFile) : null;

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const resultsEl = document.getElementById('prescriptionResults');

  if (lines.length === 0) {
    if (lastPrescriptionImage) {
      resultsEl.innerHTML = '<p class="muted">Photo received. Type the medicine names above too so we can add them to your cart — the pharmacist will double-check against the photo before dispatch.</p>';
    } else {
      resultsEl.innerHTML = '<p class="muted">Add at least one medicine name above, or attach a photo.</p>';
    }
    return;
  }
  const pool = currentSystem ? PRODUCTS.filter(p => p.system === currentSystem) : PRODUCTS;
  const matches = [];
  const unmatched = [];
  lines.forEach(line => {
    const q = line.toLowerCase();
    const hit = pool.find(p => q.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(q.split(' ')[0]));
    if (hit) matches.push({ line, product: hit });
    else unmatched.push(line);
  });

  resultsEl.innerHTML =
    (matches.length ? `<h3 style="margin-top:0">Matched in this store</h3>` +
      matches.map((m, i) => `
        <div class="rx-match-row">
          <input type="checkbox" id="rxm${i}" data-pid="${m.product.id}" checked>
          <label for="rxm${i}">
            <strong>${m.product.name}</strong> ${m.product.potency}
            ${m.product.prescriptionOnly ? '<span class="rx-tag">Rx</span>' : ''} — ₹${m.product.price}
            <div class="rx-line">from your line: "${m.line}"</div>
          </label>
        </div>`).join('')
      : '<p class="muted">Nothing from your list matched this store\'s catalogue.</p>') +
    (unmatched.length ? `<p class="rx-unmatched">Not found here — ask the pharmacist: ${unmatched.join(', ')}</p>` : '') +
    (matches.length ? `<button class="btn btn-primary btn-block" id="addRxBtn" type="button">Add selected to cart</button>` : '');

  const addBtn = document.getElementById('addRxBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      requireAuth(async () => {
        const user = currentUser();
        const cart = await getCart(user.email);
        resultsEl.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const pid = cb.dataset.pid;
          const existing = cart.find(i => i.id === pid);
          if (existing) existing.qty += 1;
          else cart.push({ id: pid, qty: 1 });
        });
        await saveCart(user.email, cart);
        await updateCartCount();
        showToast('Added matched medicines to cart');
        showView('cart');
      });
    });
  }
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const q = document.getElementById('searchInput').value.trim();
  if (q) runSearch(q);
});
document.getElementById('searchInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('searchBtn').click();
});

// ---- Cart ----
function addToCart(productId) {
  requireAuth(async () => {
    const user = currentUser();
    const cart = await getCart(user.email);
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    await saveCart(user.email, cart);
    await updateCartCount();
    showToast('Added to cart');
  });
}

async function renderCart() {
  const user = currentUser();
  const cart = await getCart(user.email);
  const wrap = document.getElementById('cartItems');
  const empty = document.getElementById('cartEmpty');
  const summary = document.getElementById('cartSummary');
  if (cart.length === 0) {
    wrap.innerHTML = '';
    empty.hidden = false;
    summary.hidden = true;
    return;
  }
  empty.hidden = true;
  summary.hidden = false;
  let subtotal = 0;
  wrap.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    subtotal += p.price * item.qty;
    return `
      <div class="cart-row">
        <div>
          <strong>${p.name}</strong> <span class="potency-tag">${p.potency}</span>
          <div class="meta">₹${p.price} each</div>
        </div>
        <div class="qty-controls">
          <button data-dec="${item.id}">−</button>
          <span>${item.qty}</span>
          <button data-inc="${item.id}">+</button>
        </div>
        <button class="remove-btn" data-remove="${item.id}">Remove</button>
      </div>`;
  }).join('');
  document.getElementById('cartSubtotal').textContent = '₹' + subtotal;
  document.getElementById('cartTotal').textContent = '₹' + (subtotal + 29);

  wrap.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.inc, 1)));
  wrap.querySelectorAll('[data-dec]').forEach(b => b.addEventListener('click', () => changeQty(b.dataset.dec, -1)));
  wrap.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => removeFromCart(b.dataset.remove)));
}

async function changeQty(id, delta) {
  const user = currentUser();
  const cart = await getCart(user.email);
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  const finalCart = item.qty <= 0 ? cart.filter(i => i.id !== id) : cart;
  await saveCart(user.email, finalCart);
  await renderCart();
  await updateCartCount();
}

async function removeFromCart(id) {
  const user = currentUser();
  const cart = (await getCart(user.email)).filter(i => i.id !== id);
  await saveCart(user.email, cart);
  await renderCart();
  await updateCartCount();
}

document.getElementById('toCheckoutBtn').addEventListener('click', () => showView('checkout'));

// ---- Checkout ----
let checkoutStore = null;

async function renderCheckout() {
  const user = currentUser();
  const cart = await getCart(user.email);
  if (cart.length === 0) { showView('cart'); return; }
  checkoutStore = pickNearestStore();
  document.getElementById('storeCard').innerHTML =
    `<strong>${checkoutStore.name}</strong><br>${checkoutStore.distanceKm} km away — arrives in about ${checkoutStore.etaMin} min`;

  let subtotal = 0;
  const lines = cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    subtotal += p.price * item.qty;
    return `<div class="row"><span>${p.name} × ${item.qty}</span><span>₹${p.price * item.qty}</span></div>`;
  }).join('');
  document.getElementById('checkoutSummary').innerHTML = lines +
    `<div class="row"><span>Delivery</span><span>₹29</span></div>
     <div class="row" style="font-weight:600;border-top:1px solid var(--line);padding-top:8px;margin-top:8px;">
       <span>Total</span><span>₹${subtotal + 29}</span></div>`;
}

document.querySelectorAll('input[name="payment"]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('onlineFields').hidden = document.querySelector('input[name="payment"]:checked').value !== 'online';
  });
});

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = currentUser();
  const form = new FormData(e.target);
  const payment = form.get('payment');
  if (payment === 'online' && !form.get('paymentRef')) {
    showToast('Add a UPI ID or card number to pay online');
    return;
  }
  const cart = await getCart(user.email);
  const subtotal = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
  const order = {
    orderCode: 'VC' + Date.now().toString().slice(-8),
    userEmail: user.email,
    items: cart,
    total: subtotal + 29,
    address: form.get('address'),
    landmark: form.get('landmark'),
    payment,
    store: checkoutStore,
    placedAt: Date.now(),
    etaMin: checkoutStore.etaMin,
    stage: 0, // 0 placed, 1 packed, 2 out for delivery, 3 delivered
    prescriptionText: lastPrescriptionText || undefined,
    prescriptionImage: lastPrescriptionImage || undefined,
  };
  try {
    await apiPost('/orders', order);
    await saveCart(user.email, []);
    await updateCartCount();
    e.target.reset();
    showToast('Order placed — tracking it now');
    showView('orders');
  } catch (err) {
    showToast('Order place nahi ho paya: ' + err.message);
  }
});

// ---- Orders / tracking ----
const STAGE_LABELS = ['Placed', 'Packed', 'Out for delivery', 'Delivered'];

async function renderOrders() {
  const user = currentUser();
  const orders = await getOrders(user.email);
  const wrap = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  if (orders.length === 0) {
    wrap.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.innerHTML = orders.map(o => {
    const minsAgo = Math.floor((Date.now() - o.placedAt) / 60000);
    return `
    <div class="order-card">
      <div class="order-head">
        <h3 style="margin:0">Order ${o.orderCode}</h3>
        <span class="order-status">${STAGE_LABELS[o.stage]}</span>
      </div>
      <div class="progress-track">
        ${STAGE_LABELS.map((_, i) => `<div class="${i <= o.stage ? 'done' : ''}"></div>`).join('')}
      </div>
      <div class="progress-labels">${STAGE_LABELS.map(l => `<span>${l}</span>`).join('')}</div>
      <p class="eta-note">${o.store.name} • ₹${o.total} • ${o.payment === 'cod' ? 'Cash on delivery' : 'Paid online'}
        ${o.stage < 3 ? ` • arriving within ${Math.max(o.etaMin - minsAgo, 5)} min` : ' • delivered'}</p>
    </div>`;
  }).join('');
}

// Simulate an order progressing toward delivery over real time,
// aur MongoDB me stage update karte rehna.
setInterval(async () => {
  const user = currentUser();
  if (!user) return;
  const orders = await getOrders(user.email);
  let changed = false;
  for (const o of orders) {
    const minsSince = (Date.now() - o.placedAt) / 60000;
    const targetStage = minsSince > o.etaMin ? 3 : minsSince > o.etaMin * 0.6 ? 2 : minsSince > o.etaMin * 0.15 ? 1 : 0;
    if (targetStage > o.stage) {
      await apiPatch('/orders/' + o.orderCode + '/stage', { stage: targetStage });
      changed = true;
    }
  }
  if (changed && !document.getElementById('view-orders').hidden) renderOrders();
}, 15000);

// ---- Auth ----
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const errEl = document.getElementById('registerError');
  try {
    const user = await apiPost('/signup', {
      name: form.get('name').trim(),
      email: form.get('email').trim().toLowerCase(),
      phone: form.get('phone').trim(),
      password: form.get('password'),
    });
    session.set(user);
    errEl.textContent = '';
    e.target.reset();
    showToast('Welcome to VanaCare, ' + user.name.split(' ')[0]);
    showView('categories');
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const errEl = document.getElementById('loginError');
  try {
    const user = await apiPost('/login', {
      email: form.get('email').trim().toLowerCase(),
      password: form.get('password'),
    });
    session.set(user);
    errEl.textContent = '';
    e.target.reset();
    showToast('Welcome back, ' + user.name.split(' ')[0]);
    showView('categories');
  } catch (err) {
    errEl.textContent = err.message;
  }
});

// ---- Home page: direct search / prescription without picking a system ----
document.getElementById('homeQuickSearchBtn').addEventListener('click', () => {
  const q = document.getElementById('homeQuickSearch').value.trim();
  if (q) runSearch(q);
});
document.getElementById('homeQuickSearch').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('homeQuickSearchBtn').click();
});
document.getElementById('homePrescriptionBtn').addEventListener('click', () => {
  currentSystem = null; // no system chosen — match against the full catalogue
  requireAuth(() => showView('prescription'));
});

// ---- Init ----
// data.js ke hardcoded PRODUCTS ko fallback rakhte hue, backend se live data laane ki koshish karo.
// PRODUCTS 'const' hai isliye reassign nahi karte, uski content ko replace karte hain.
(async function loadProductsFromBackend() {
  try {
    const live = await apiGet('/products');
    if (Array.isArray(live) && live.length) {
      PRODUCTS.length = 0;
      PRODUCTS.push(...live);
    }
  } catch (err) {
    console.warn('Backend se products nahi mil paye, data.js wale fallback products use ho rahe hain.', err.message);
  }
})();

renderSystemGrid('systemGridHome');
updateAccountButton();
showView('home');
