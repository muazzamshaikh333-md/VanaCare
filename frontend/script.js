// ---- Session + cart storage ----
// Auth now lives on the backend (JWT); cart stays client-side per user,
// since there's no Cart model yet (that's a later module).
const session = {
  token: () => localStorage.getItem('vc_token'),
  user: () => JSON.parse(localStorage.getItem('vc_user') || 'null'),
  set: (token, user) => {
    localStorage.setItem('vc_token', token);
    localStorage.setItem('vc_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
  },
};

const cartStore = {
  cart: (userId) => JSON.parse(localStorage.getItem('vc_cart_' + userId) || '[]'),
  saveCart: (userId, cart) => localStorage.setItem('vc_cart_' + userId, JSON.stringify(cart)),
};

let currentSystem = null;
let currentCategory = null;
let currentSearch = null;
let allProducts = [];      // full catalogue, fetched once at load
let pendingPrescriptionNote = null; // set when an order originates from a prescription match

function currentUser() {
  return session.user();
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---- Routing ----
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  document.getElementById('view-' + name).hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (name === 'systems') renderSystemGrid('systemGrid');
  if (name === 'categories') renderCategoriesView();
  if (name === 'prescription') renderPrescriptionView();
  if (name === 'cart') renderCart();
  if (name === 'checkout') renderCheckout();
  if (name === 'orders') renderOrders();
  updateAccountButton();
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

function updateAccountButton() {
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
  updateCartCount();
}

function updateCartCount() {
  const user = currentUser();
  const count = user ? cartStore.cart(user.id).reduce((s, i) => s + i.qty, 0) : 0;
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
  renderProductGrid(allProducts.filter(p => p.category === catId));
}

function runSearch(query) {
  currentSearch = query;
  currentCategory = null;
  document.getElementById('productListTitle').textContent = `Results for "${query}"`;
  const q = query.trim().toLowerCase();
  const results = allProducts.filter(p =>
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
      <span class="potency-tag">${p.potency} · ${sys ? sys.name : p.system}</span>
      <h3>${p.name}${p.prescriptionOnly ? '<span class="rx-tag">Rx</span>' : ''}</h3>
      <p>${p.desc}</p>
      <div class="product-foot">
        <span class="price">₹${p.price}</span>
        <button class="btn btn-ghost" data-add="${p._id}">Add to cart</button>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.add));
  });
}

// ---- Prescription-based selection ----
function renderPrescriptionView() {
  const sys = SYSTEMS.find(s => s.id === currentSystem) || SYSTEMS[0];
  document.getElementById('prescriptionTitle').textContent = `Order from a prescription — ${sys.name}`;
  document.getElementById('prescriptionResults').innerHTML = '<p class="muted">Matches will appear here once you submit.</p>';
}

document.getElementById('prescriptionForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = new FormData(e.target).get('rx') || '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const resultsEl = document.getElementById('prescriptionResults');
  if (lines.length === 0) {
    resultsEl.innerHTML = '<p class="muted">Add at least one medicine name above.</p>';
    return;
  }
  const pool = allProducts.filter(p => p.system === currentSystem);
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
          <input type="checkbox" id="rxm${i}" data-pid="${m.product._id}" checked>
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
      requireAuth(() => {
        const user = currentUser();
        const cart = cartStore.cart(user.id);
        resultsEl.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const pid = cb.dataset.pid;
          const existing = cart.find(i => i.id === pid);
          if (existing) existing.qty += 1;
          else cart.push({ id: pid, qty: 1 });
        });
        cartStore.saveCart(user.id, cart);
        pendingPrescriptionNote = raw; // carried through to the order if this cart is checked out
        updateCartCount();
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
  requireAuth(() => {
    const user = currentUser();
    const cart = cartStore.cart(user.id);
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    cartStore.saveCart(user.id, cart);
    updateCartCount();
    showToast('Added to cart');
  });
}

function renderCart() {
  const user = currentUser();
  const cart = cartStore.cart(user.id);
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
    const p = allProducts.find(pr => pr._id === item.id);
    if (!p) return '';
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

function changeQty(id, delta) {
  const user = currentUser();
  const cart = cartStore.cart(user.id);
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  const finalCart = item.qty <= 0 ? cart.filter(i => i.id !== id) : cart;
  cartStore.saveCart(user.id, finalCart);
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  const user = currentUser();
  const cart = cartStore.cart(user.id).filter(i => i.id !== id);
  cartStore.saveCart(user.id, cart);
  renderCart();
  updateCartCount();
}

document.getElementById('toCheckoutBtn').addEventListener('click', () => showView('checkout'));

// ---- Checkout ----
let checkoutStore = null;

async function renderCheckout() {
  const user = currentUser();
  const cart = cartStore.cart(user.id);
  if (cart.length === 0) { showView('cart'); return; }

  document.getElementById('storeCard').innerHTML = 'Finding the nearest store…';
  try {
    checkoutStore = await Api.nearestStore(currentSystem || 'homeo');
  } catch (err) {
    document.getElementById('storeCard').innerHTML = 'Could not find a store right now.';
    showToast(err.message);
    return;
  }
  document.getElementById('storeCard').innerHTML =
    `<strong>${checkoutStore.name}</strong><br>Estimated delivery: about ${checkoutStore.baseEtaMin} min`;

  let subtotal = 0;
  const lines = cart.map(item => {
    const p = allProducts.find(pr => pr._id === item.id);
    if (!p) return '';
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
  if (!checkoutStore) {
    showToast('Still finding a store — try again in a moment');
    return;
  }
  const cart = cartStore.cart(user.id);
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing order…';
  try {
    await Api.createOrder({
      items: cart.map(i => ({ productId: i.id, qty: i.qty })),
      storeId: checkoutStore._id,
      address: form.get('address'),
      landmark: form.get('landmark'),
      payment,
      paymentRef: form.get('paymentRef') || undefined,
      prescriptionNote: pendingPrescriptionNote || undefined,
    });
    cartStore.saveCart(user.id, []);
    pendingPrescriptionNote = null;
    updateCartCount();
    e.target.reset();
    showToast('Order placed — tracking it now');
    showView('orders');
  } catch (err) {
    showToast(err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place order';
  }
});

// ---- Orders / tracking ----
// Stage labels and numbers come from the backend via each order's `stage`
// field; STAGES here (data.js) must match backend/config/orderStages.js.
// No client-side timer: a stage only changes when a delivery partner (or,
// in a later module, the pharmacy) actually advances it on the server.
async function renderOrders() {
  const wrap = document.getElementById('ordersList');
  const empty = document.getElementById('ordersEmpty');
  wrap.innerHTML = '<p class="muted">Loading your orders…</p>';
  empty.hidden = true;

  let orders;
  try {
    orders = await Api.myOrders();
  } catch (err) {
    wrap.innerHTML = '';
    showToast(err.message);
    empty.hidden = false;
    document.getElementById('ordersEmpty').textContent = 'Could not load your orders.';
    return;
  }

  if (orders.length === 0) {
    wrap.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  wrap.innerHTML = orders.map(o => {
    const placed = new Date(o.createdAt);
    const storeName = o.store ? o.store.name : 'Store';
    return `
    <div class="order-card">
      <div class="order-head">
        <h3 style="margin:0">Order ${o._id.slice(-8).toUpperCase()}</h3>
        <span class="order-status">${STAGES[o.stage]}</span>
      </div>
      <div class="progress-track">
        ${STAGES.map((_, i) => `<div class="${i <= o.stage ? 'done' : ''}"></div>`).join('')}
      </div>
      <div class="progress-labels">${STAGES.map(l => `<span>${l}</span>`).join('')}</div>
      <p class="eta-note">${storeName} • ₹${o.total} • ${o.payment === 'cod' ? 'Cash on delivery' : 'Paid online'}
        • placed ${placed.toLocaleString()}
        ${o.stage < STAGES.length - 1 ? ` • estimated ${o.etaMin} min from placement` : ' • delivered'}</p>
    </div>`;
  }).join('');
}

// ---- Auth ----
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const errEl = document.getElementById('registerError');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const { token, user } = await Api.register({
      name: form.get('name').trim(),
      email: form.get('email').trim().toLowerCase(),
      phone: form.get('phone').trim(),
      password: form.get('password'),
    });
    session.set(token, user);
    errEl.textContent = '';
    e.target.reset();
    showToast('Welcome to VanaCare, ' + user.name.split(' ')[0]);
    showView('categories');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const errEl = document.getElementById('loginError');
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  try {
    const { token, user } = await Api.login({
      email: form.get('email').trim().toLowerCase(),
      password: form.get('password'),
    });
    session.set(token, user);
    errEl.textContent = '';
    e.target.reset();
    showToast('Welcome back, ' + user.name.split(' ')[0]);
    showView('categories');
  } catch (err) {
    errEl.textContent = err.message;
  } finally {
    submitBtn.disabled = false;
  }
});

// ---- Init ----
async function init() {
  renderSystemGrid('systemGridHome');
  updateAccountButton();
  showView('home');
  try {
    allProducts = await Api.products();
  } catch (err) {
    showToast('Could not reach the VanaCare server — is the backend running?');
  }
}
init();
