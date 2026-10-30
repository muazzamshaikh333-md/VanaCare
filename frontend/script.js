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
  saveCart: (userId, cart) => { localStorage.setItem('vc_cart_' + userId, JSON.stringify(cart)); if (session.token()) Api.saveCart(cart.map(i => ({productId:i.id,qty:i.qty}))).catch(err => console.warn('Cart sync:', err.message)); },
};

let currentSystem = null;
let currentCategory = null;
let currentSearch = null;
let allProducts = [];      // full catalogue, fetched once at load
let pendingPrescriptionNote = null;
let pendingPrescriptionIds = [];

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
  if (name === 'operations') renderOperations();
  if (name === 'delivery') renderDelivery();
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
  const ops=document.getElementById('opsBtn'), delivery=document.getElementById('deliveryBtn');
  if(ops) ops.hidden=!(user && ['admin','pharmacist'].includes(user.role));
  if(delivery) delivery.hidden=!(user && user.role==='delivery');
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

document.getElementById('prescriptionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = new FormData(e.target).get('rx') || '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const resultsEl = document.getElementById('prescriptionResults');
  if (!currentUser()) { showToast('Please log in first'); showView('login'); return; }
  const file = e.target.elements.rxImage.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) { showToast('Prescription must be under 5 MB'); return; }
    const dataUrl = await new Promise((resolve,reject) => { const reader=new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=reject; reader.readAsDataURL(file); });
    try {
      const uploaded = await Api.uploadPrescription({fileName:file.name,mimeType:file.type,data:dataUrl});
      pendingPrescriptionIds = [uploaded.id];
      showToast('Prescription uploaded for pharmacist review');
    } catch(err) { showToast(err.message); return; }
  }
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
        pendingPrescriptionNote = raw;
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
  if (!cart.length) { showView('cart'); return; }
  let subtotal=0;
  const lines=cart.map(item=>{const p=allProducts.find(x=>x._id===item.id);if(!p)return '';subtotal+=p.price*item.qty;return `<div class="row"><span>${p.name} × ${item.qty}</span><span>₹${p.price*item.qty}</span></div>`;}).join('');
  document.getElementById('checkoutSummary').innerHTML=lines+
    `<div class="row"><span>Delivery</span><span>₹29</span></div><div class="row"><strong>Subtotal</strong><strong>₹${subtotal}</strong></div><div class="row"><strong>Final total calculated by server at order placement</strong></div>`;
  const store=document.getElementById('storeCard');
  store.textContent='Orders are routed to an available pharmacy by the operations team.';
}

document.querySelectorAll('input[name="payment"]').forEach(r => {
  r.addEventListener('change', () => {
    const online=document.getElementById('onlineFields');
    if(online) online.hidden=document.querySelector('input[name="payment"]:checked').value!=='razorpay';
  });
});
document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user=currentUser(); if(!user){showView('login');return;}
  const form=new FormData(e.target), cart=cartStore.cart(user.id);
  if(!cart.length){showToast('Your cart is empty');showView('cart');return;}
  const submitBtn=e.target.querySelector('button[type="submit"]');
  const address={line1:String(form.get('address')||'').trim(),landmark:String(form.get('landmark')||'').trim(),city:String(form.get('city')||'').trim(),state:String(form.get('state')||'').trim(),pincode:String(form.get('pincode')||'').trim(),phone:String(form.get('phone')||user.phone||'').trim()};
  if(!address.line1||!address.city||!address.state||!address.pincode){showToast('Complete your delivery address');return;}
  submitBtn.disabled=true;submitBtn.textContent='Creating secure order…';
  try{
    const paymentMethod=form.get('payment')==='razorpay'?'razorpay':'cod';
    const result=await Api.createOrder({items:cart.map(i=>({productId:i.id,qty:i.qty})),address,paymentMethod,couponCode:form.get('couponCode')||undefined,prescriptionIds:pendingPrescriptionIds});
    // The backend has created the order; clear the local cart to prevent duplicate submissions.
    cartStore.saveCart(user.id,[]); updateCartCount();
    if(paymentMethod==='razorpay'){
      if(!result.razorpay)throw new Error('Payment gateway setup is incomplete. Contact support before retrying.');
      if(!window.Razorpay)throw new Error('Razorpay Checkout could not load. Refresh and try again.');
      const checkout=new Razorpay({
        key:result.razorpay.keyId,order_id:result.razorpay.orderId,amount:result.razorpay.amount,currency:result.razorpay.currency,
        name:'VanaCare',description:'Medicine order '+result.order.orderCode,
        prefill:{name:user.name,email:user.email,contact:user.phone},
        handler:async response=>{
          try{await Api.verifyPayment({orderId:result.order._id,...response});pendingPrescriptionIds=[];pendingPrescriptionNote=null;showToast('Payment verified and order updated');showView('orders');}
          catch(err){showToast('Payment verification pending: '+err.message);showView('orders');}
        },
        modal:{ondismiss:()=>{showToast('Payment window closed. Order payment remains pending.');showView('orders');}}
      });
      checkout.open();
    } else {
      pendingPrescriptionIds=[];pendingPrescriptionNote=null;showToast('Order placed successfully');showView('orders');
    }
  }catch(err){showToast(err.message);}
  finally{submitBtn.disabled=false;submitBtn.textContent='Place order';}
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
    const storeName = o.pharmacy ? o.pharmacy.name : 'Pharmacy assignment pending';
    return `
    <div class="order-card">
      <div class="order-head">
        <h3 style="margin:0">Order ${o._id.slice(-8).toUpperCase()}</h3>
        <span class="order-status">${String(o.status || 'placed').replaceAll('_',' ')}</span>
      </div>
      <div class="progress-track">
        ${['placed','confirmed','pharmacy_accepted','prescription_verified','preparing','packed','picked_up','out_for_delivery','delivered'].map(st => `<div class="${(o.statusHistory||[]).some(h=>h.status===st) || o.status===st ? 'done' : ''}"></div>`).join('')}
      </div>
      <div class="progress-labels">${['Placed','Confirmed','Pharmacy','Prescription','Preparing','Packed','Picked up','Out for delivery','Delivered'].map(l => `<span>${l}</span>`).join('')}</div>
      <p class="eta-note">${storeName} • ₹${o.total} • ${o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Online payment: '+o.paymentStatus}
        • placed ${placed.toLocaleString()}
        ${o.status !== 'delivered' ? ` • estimated ${o.estimatedDeliveryMinutes || 60} min` : ' • delivered'}</p>
    </div>`;
  }).join('');
}

// ---- Role-based operations dashboards ----
async function renderOperations() {
  const ordersEl=document.getElementById('adminOrdersList'), rxEl=document.getElementById('pendingRxList');
  ordersEl.innerHTML='<p class="muted">Loading orders…</p>'; rxEl.innerHTML='<p class="muted">Loading prescriptions…</p>';
  try {
    const [orders, prescriptions]=await Promise.all([Api.adminOrders(),Api.pendingPrescriptions()]);
    ordersEl.innerHTML=orders.length?orders.map(o=>`<article class="order-card">
      <div class="order-head"><strong>${o.orderCode}</strong><span>${String(o.status).replaceAll('_',' ')}</span></div>
      <p>${o.customer?.name||'Customer'} · ₹${o.total} · ${o.paymentStatus}</p>
      <p>${(o.items||[]).map(i=>`${i.name} × ${i.qty}`).join(', ')}</p>
      <div class="dashboard-actions">
      ${['pharmacy_accepted','preparing','packed'].map(st=>`<button class="btn btn-ghost" data-order="${o._id}" data-status="${st}">${st.replaceAll('_',' ')}</button>`).join('')}
      </div></article>`).join(''):'<p class="muted">No incoming orders.</p>';
    rxEl.innerHTML=prescriptions.length?prescriptions.map(p=>`<article class="order-card">
      <strong>${p.fileName||'Prescription'}</strong><p>${p.customer?.name||'Customer'} · ${new Date(p.createdAt).toLocaleString()}</p>
      <button class="btn btn-ghost" data-rx-file="${p._id}">View file</button>
      <button class="btn btn-primary" data-rx="${p._id}" data-decision="approved">Approve</button>
      <button class="btn btn-ghost" data-rx="${p._id}" data-decision="rejected">Reject</button>
      </article>`).join(''):'<p class="muted">No pending prescriptions.</p>';
    ordersEl.querySelectorAll('[data-order]').forEach(b=>b.addEventListener('click',async()=>{try{await Api.updateStatus(b.dataset.order,b.dataset.status);showToast('Order status updated');renderOperations();}catch(e){showToast(e.message);}}));
    rxEl.querySelectorAll('[data-rx]').forEach(b=>b.addEventListener('click',async()=>{try{await Api.reviewPrescription(b.dataset.rx,b.dataset.decision,'Reviewed by pharmacist');showToast('Prescription '+b.dataset.decision);renderOperations();}catch(e){showToast(e.message);}}));
    rxEl.querySelectorAll('[data-rx-file]').forEach(b=>b.addEventListener('click',async()=>{try{const response=await fetch(API_BASE+'/prescriptions/'+b.dataset.rx+'/file',{headers:{Authorization:'Bearer '+session.token()}});if(!response.ok)throw new Error('Unable to open prescription');const blob=await response.blob();const url=URL.createObjectURL(blob);window.open(url,'_blank','noopener');}catch(e){showToast(e.message);}}));
  } catch(e) {ordersEl.innerHTML='<p class="form-error">'+e.message+'</p>';rxEl.innerHTML='';}
}
async function renderDelivery() {
  const el=document.getElementById('deliveryOrdersList');el.innerHTML='<p class="muted">Loading assigned deliveries…</p>';
  try {
    const orders=await Api.deliveryOrders();
    el.innerHTML=orders.length?orders.map(o=>`<article class="order-card"><strong>${o.orderCode}</strong><p>${(o.items||[]).map(i=>`${i.name} × ${i.qty}`).join(', ')}</p><p>${o.address?.line1||''}, ${o.address?.city||''} ${o.address?.pincode||''}</p><p>Status: ${String(o.status).replaceAll('_',' ')}</p>
    ${['picked_up','out_for_delivery','delivered'].map(st=>`<button class="btn btn-ghost" data-delivery-order="${o._id}" data-delivery-status="${st}">${st.replaceAll('_',' ')}</button>`).join('')}</article>`).join(''):'<p class="muted">No deliveries assigned yet.</p>';
    el.querySelectorAll('[data-delivery-order]').forEach(b=>b.addEventListener('click',async()=>{try{await Api.updateStatus(b.dataset.deliveryOrder,b.dataset.deliveryStatus);showToast('Delivery status updated');renderDelivery();}catch(e){showToast(e.message);}}));
  }catch(e){el.innerHTML='<p class="form-error">'+e.message+'</p>';}
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
setInterval(() => {
  const ordersView=document.getElementById('view-orders');
  if(ordersView && !ordersView.hidden && currentUser()) renderOrders();
}, 15000);
