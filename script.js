// ---- Storage helpers (localStorage stands in for a backend) ----
const db = {
  users: () => JSON.parse(localStorage.getItem('vc_users') || '[]'),
  saveUsers: (u) => localStorage.setItem('vc_users', JSON.stringify(u)),
  session: () => localStorage.getItem('vc_session'),
  setSession: (email) => localStorage.setItem('vc_session', email),
  clearSession: () => localStorage.removeItem('vc_session'),
  cart: (email) => JSON.parse(localStorage.getItem('vc_cart_' + email) || '[]'),
  saveCart: (email, cart) => localStorage.setItem('vc_cart_' + email, JSON.stringify(cart)),
  orders: (email) => JSON.parse(localStorage.getItem('vc_orders_' + email) || '[]'),
  saveOrders: (email, orders) => localStorage.setItem('vc_orders_' + email, JSON.stringify(orders)),
};

let currentSystem = null;
let currentCategory = null;
let currentSearch = null;

function currentUser() {
  const email = db.session();
  if (!email) return null;
  return db.users().find(u => u.email === email) || null;
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
        db.clearSession();
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
  const count = user ? db.cart(user.email).reduce((s, i) => s + i.qty, 0) : 0;
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
  const pool = PRODUCTS.filter(p => p.system === currentSystem);
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
      requireAuth(() => {
        const user = currentUser();
        const cart = db.cart(user.email);
        resultsEl.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const pid = cb.dataset.pid;
          const existing = cart.find(i => i.id === pid);
          if (existing) existing.qty += 1;
          else cart.push({ id: pid, qty: 1 });
        });
        db.saveCart(user.email, cart);
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
    const cart = db.cart(user.email);
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.qty += 1;
    else cart.push({ id: productId, qty: 1 });
    db.saveCart(user.email, cart);
    updateCartCount();
    showToast('Added to cart');
  });
}

function renderCart() {
  const user = currentUser();
  const cart = db.cart(user.email);
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

function changeQty(id, delta) {
  const user = currentUser();
  const cart = db.cart(user.email);
  const item = cart.find(i => i.id === id);
  item.qty += delta;
  const finalCart = item.qty <= 0 ? cart.filter(i => i.id !== id) : cart;
  db.saveCart(user.email, finalCart);
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  const user = currentUser();
  const cart = db.cart(user.email).filter(i => i.id !== id);
  db.saveCart(user.email, cart);
  renderCart();
  updateCartCount();
}

document.getElementById('toCheckoutBtn').addEventListener('click', () => showView('checkout'));

// ---- Checkout ----
let checkoutStore = null;

function renderCheckout() {
  const user = currentUser();
  const cart = db.cart(user.email);
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

document.getElementById('checkoutForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = currentUser();
  const form = new FormData(e.target);
  const payment = form.get('payment');
  if (payment === 'online' && !form.get('paymentRef')) {
    showToast('Add a UPI ID or card number to pay online');
    return;
  }
  const cart = db.cart(user.email);
  const subtotal = cart.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.id).price * i.qty, 0);
  const order = {
    id: 'VC' + Date.now().toString().slice(-8),
    items: cart,
    total: subtotal + 29,
    address: form.get('address'),
    landmark: form.get('landmark'),
    payment,
    store: checkoutStore,
    placedAt: Date.now(),
    etaMin: checkoutStore.etaMin,
    stage: 0, // 0 placed, 1 packed, 2 out for delivery, 3 delivered
  };
  const orders = db.orders(user.email);
  orders.unshift(order);
  db.saveOrders(user.email, orders);
  db.saveCart(user.email, []);
  updateCartCount();
  e.target.reset();
  showToast('Order placed — tracking it now');
  showView('orders');
});

// ---- Orders / tracking ----
const STAGE_LABELS = ['Placed', 'Packed', 'Out for delivery', 'Delivered'];

function renderOrders() {
  const user = currentUser();
  const orders = db.orders(user.email);
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
        <h3 style="margin:0">Order ${o.id}</h3>
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

// Simulate an order progressing toward delivery over real time.
setInterval(() => {
  const user = currentUser();
  if (!user) return;
  const orders = db.orders(user.email);
  let changed = false;
  orders.forEach(o => {
    const minsSince = (Date.now() - o.placedAt) / 60000;
    const targetStage = minsSince > o.etaMin ? 3 : minsSince > o.etaMin * 0.6 ? 2 : minsSince > o.etaMin * 0.15 ? 1 : 0;
    if (targetStage > o.stage) { o.stage = targetStage; changed = true; }
  });
  if (changed) {
    db.saveOrders(user.email, orders);
    if (!document.getElementById('view-orders').hidden) renderOrders();
  }
}, 15000);

// ---- Auth ----
document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const email = form.get('email').trim().toLowerCase();
  const users = db.users();
  const errEl = document.getElementById('registerError');
  if (users.some(u => u.email === email)) {
    errEl.textContent = 'An account with this email already exists.';
    return;
  }
  users.push({
    name: form.get('name').trim(),
    email,
    phone: form.get('phone').trim(),
    password: form.get('password'),
  });
  db.saveUsers(users);
  db.setSession(email);
  errEl.textContent = '';
  e.target.reset();
  showToast('Welcome to VanaCare, ' + form.get('name').split(' ')[0]);
  showView('categories');
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const email = form.get('email').trim().toLowerCase();
  const password = form.get('password');
  const user = db.users().find(u => u.email === email && u.password === password);
  const errEl = document.getElementById('loginError');
  if (!user) {
    errEl.textContent = 'Incorrect email or password.';
    return;
  }
  db.setSession(email);
  errEl.textContent = '';
  e.target.reset();
  showToast('Welcome back, ' + user.name.split(' ')[0]);
  showView('categories');
});

// ---- Init ----
renderSystemGrid('systemGridHome');
updateAccountButton();
showView('home');
