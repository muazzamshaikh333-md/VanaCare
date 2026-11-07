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
  if (name === 'carehub') renderCareHub();
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
    if (target === 'cart' || target === 'orders' || target === 'carehub') {
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


document.getElementById('notificationsBtn')?.addEventListener('click',async()=>{if(!currentUser()){showView('login');return;}try{const ns=await Api.notifications();const unread=ns.filter(n=>!n.read);document.getElementById('notificationCount').textContent=unread.length;alert(ns.length?ns.slice(0,8).map(n=>`${n.title||'Update'}: ${n.message||''}`).join('\n\n'):'No notifications yet.');}catch(e){showToast(e.message);}});
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
const prescriptionHomeBtn = document.getElementById('prescriptionHomeBtn');
if (prescriptionHomeBtn) {
  prescriptionHomeBtn.addEventListener('click', () => {
    requireAuth(() => showView('prescription'));
  });
}
document.getElementById('prescriptionBackBtn').addEventListener('click', () => showView('categories'));

async function openCategory(catId) {
  currentCategory = catId;
  currentSearch = null;
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) { showToast('Category not found'); return; }
  const sys = SYSTEMS.find(s => s.id === cat.system);
  document.getElementById('productListTitle').textContent = `${cat.name} – Products`;
  showView('products');
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<p class=\"catalogue-loading\">Loading catalogue…</p>';
  try {
    const result = await Api.products({ category: catId, limit: 100 });
    const list = Array.isArray(result) ? result : (result.products || []);
    const merged = new Map(allProducts.map(p => [String(p._id || p.id), p]));
    list.forEach(p => merged.set(String(p._id || p.id), p));
    allProducts = Array.from(merged.values());
    renderProductGrid(list);
    if (!list.length) showToast('No active catalogue items in this category yet');
  } catch (error) {
    grid.innerHTML = `<p class=\"catalogue-error\">${error.message}</p>`;
  }
}

function runSearch(query) {
  currentSearch = query;
  currentCategory = null;
  document.getElementById('productListTitle').textContent = `Results for "${query}"`;
  const q = query.trim().toLowerCase();
  const results = allProducts.filter(p =>
    String(p.name||'').toLowerCase().includes(q) || String(p.desc||'').toLowerCase().includes(q) || String(p.brand||'').toLowerCase().includes(q) || String(p.category||'').toLowerCase().includes(q));
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
      <div class="product-visual" aria-hidden="true">${(CATEGORIES.find(c=>c.id===p.category)||{}).icon || '💊'}</div>
      <span class="potency-tag">${p.potency || p.packSize || 'Catalogue item'} · ${sys ? sys.name : p.system}</span>
      <h3>${p.name}${(p.prescriptionOnly || p.prescriptionRequired) ? '<span class="rx-tag">Prescription required</span>' : ''}</h3>
      <p class="product-brand">${p.brand || 'VanaCare catalogue'}</p>
      <p>${p.desc || p.description || 'Catalogue information pending pharmacist review.'}</p><p class="stock-label">${Number(p.stock??p.stockQuantity??0)>0?'In stock':'Out of stock'}</p>
      <div class="product-foot">
        <span class="price">₹${p.price}</span>
        <button class="btn btn-ghost" data-detail="${p._id}">Details</button><button class="btn btn-primary" data-add="${p._id}" ${Number(p.stock??p.stockQuantity??0)<=0?'disabled':''}>Add to cart</button>
      </div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.add)));
  grid.querySelectorAll('[data-detail]').forEach(btn=>btn.addEventListener('click',()=>showProductDetails(btn.dataset.detail)));
}

function showProductDetails(id){const p=allProducts.find(x=>String(x._id)===String(id)||String(x.id)===String(id));if(!p)return;const box=document.getElementById('detailDialog');document.getElementById('detailContent').innerHTML=`<span class="potency-tag">${p.system||'Healthcare'} · ${p.potency||''}</span><h2>${p.name}</h2><p>${p.desc||p.description||''}</p><p><strong>₹${p.price}</strong> · ${Number(p.stock??p.stockQuantity??0)>0?'In stock':'Out of stock'}</p><p>${p.prescriptionOnly?'Prescription required':'No prescription flag on this listing'}</p><button class="btn btn-primary" id="detailAdd" ${Number(p.stock??p.stockQuantity??0)<=0?'disabled':''}>Add to cart</button>`;box.hidden=false;document.getElementById('detailAdd').onclick=()=>{addToCart(p._id);box.hidden=true;};}
document.getElementById('closeDetail').addEventListener('click',()=>document.getElementById('detailDialog').hidden=true);
document.getElementById('detailDialog').addEventListener('click',e=>{if(e.target.id==='detailDialog')e.currentTarget.hidden=true;});

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
  const user=currentUser(), cart=user?cartStore.cart(user.id):[];
  const wrap=document.getElementById('cartItems'), empty=document.getElementById('cartEmpty'), summary=document.getElementById('cartSummary');
  const valid=cart.map(i=>({...i, product:allProducts.find(p=>String(p._id)===String(i.id)||String(p.id)===String(i.id))})).filter(i=>i.product);
  if(!valid.length){wrap.innerHTML='';empty.hidden=false;summary.hidden=true;return;}
  empty.hidden=true;summary.hidden=false;let subtotal=0;
  wrap.innerHTML=valid.map(({id,qty,product:p})=>{subtotal+=Number(p.price||0)*qty;return `<article class="cart-product"><div class="cart-product-art">${p.image?`<img src="${p.image}" alt="${p.name}">`:'<span>✚</span>'}</div><div class="cart-product-info"><span class="potency-tag">${p.potency||p.packSize||'Medicine'} · ${p.system||'Healthcare'}</span><h3>${p.name}</h3><p>${p.brand||'VanaCare pharmacy partner'}</p><strong>₹${p.price}</strong><small class="stock-label">${Number(p.stock??p.stockQuantity??0)>0?'In stock':'Out of stock'}</small></div><div class="cart-product-actions"><div class="qty-controls"><button data-dec="${id}" aria-label="Decrease quantity">−</button><span>${qty}</span><button data-inc="${id}" aria-label="Increase quantity" ${Number(p.stock??99)<=qty?'disabled':''}>+</button></div><button class="remove-btn" data-remove="${id}">Remove</button></div></article>`}).join('');
  const delivery=subtotal>=499?0:29;document.getElementById('cartSubtotal').textContent='₹'+subtotal;document.getElementById('cartTotal').textContent='₹'+(subtotal+delivery);document.querySelector('#cartSummary .row:nth-child(2) span:last-child').textContent=delivery?'₹'+delivery:'FREE';
  wrap.querySelectorAll('[data-inc]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.inc,1)));wrap.querySelectorAll('[data-dec]').forEach(b=>b.addEventListener('click',()=>changeQty(b.dataset.dec,-1)));wrap.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>removeFromCart(b.dataset.remove)));
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
      dateOfBirth: form.get('dateOfBirth'),
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
    const response = await Api.products(); allProducts = Array.isArray(response) ? response : (response.products || []); if(!allProducts.length) showToast('Catalogue is empty. Check MongoDB seed data.');
  } catch (err) {
    showToast('Could not reach the VanaCare server — is the backend running?');
  }
}
init();
setInterval(() => {
  const ordersView=document.getElementById('view-orders');
  if(ordersView && !ordersView.hidden && currentUser()) renderOrders();
}, 15000);

// ---- VanaCare 2.0: care hub, customer records and assistant ----
const featureRequest = (path, method='GET', body) => Api.feature(path,{method,body});
const safeText = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function renderCareHub(){
  if(!currentUser()){showView('login');return;}
  const reminderList=document.getElementById('reminderList'),petList=document.getElementById('petList');
  try{
    const [reminders,pets,rewards,prescriptions]=await Promise.all([Api.reminders(),Api.pets(),Api.rewards(),Api.prescriptions()]);
    reminderList.innerHTML=reminders.length?reminders.map(r=>`<div class="feature-row"><div><strong>${safeText(r.medicineName)}</strong><small>${safeText(r.instructions)} · ${safeText((r.times||[]).join(', ')||'No time set')}</small></div><button class="btn btn-ghost" data-reminder-done="${r._id}" type="button">Done today</button></div>`).join(''):'<p class="muted">No reminders added yet.</p>';
    reminderList.querySelectorAll('[data-reminder-done]').forEach(b=>b.addEventListener('click',async()=>{try{await featureRequest('/reminders/'+b.dataset.reminderDone+'/log','POST',{status:'completed'});showToast('Reminder marked completed');renderCareHub();}catch(e){showToast(e.message);}}));
    petList.innerHTML=pets.length?pets.map(p=>`<div class="feature-row"><div><strong>${safeText(p.name)}</strong><small>${safeText(p.animalType)}${p.breed?' · '+safeText(p.breed):''}</small></div><span><button class="btn btn-ghost" data-vaccine="${p._id}" type="button">Add vaccine</button> <button class="btn btn-ghost" data-appointment="${p._id}" type="button">Request visit</button></span></div>`).join(''):'<p class="muted">No pet profiles added yet.</p>';
    petList.querySelectorAll('[data-vaccine]').forEach(b=>b.addEventListener('click',async()=>{const vaccine=prompt('Vaccine name');if(!vaccine)return;const nextDueAt=prompt('Next due date (YYYY-MM-DD, optional)')||undefined;try{await featureRequest('/pets/'+b.dataset.vaccine+'/vaccinations','POST',{vaccine,nextDueAt});showToast('Vaccination record saved');}catch(e){showToast(e.message);}}));
    petList.querySelectorAll('[data-appointment]').forEach(b=>b.addEventListener('click',async()=>{const reason=prompt('Reason for veterinary appointment');if(!reason)return;const requestedAt=prompt('Requested date and time (YYYY-MM-DDTHH:mm)');if(!requestedAt)return;try{await featureRequest('/pets/'+b.dataset.appointment+'/appointments','POST',{reason,requestedAt});showToast('Appointment request submitted');}catch(e){showToast(e.message);}}));
    document.getElementById('rewardsSummary').innerHTML=`<div class="metric-grid"><div class="metric-tile"><strong>${rewards.balance}</strong><span>Available points</span></div><div class="metric-tile"><strong>${safeText(rewards.membership)}</strong><span>Membership</span></div></div>`;
    document.getElementById('rewardHistory').innerHTML=(rewards.history||[]).slice(0,5).map(t=>`<div class="feature-row"><span>${safeText(t.description||t.kind)}</span><strong>${t.points>0?'+':''}${t.points}</strong></div>`).join('')||'<p class="muted">Your reward activity will appear here.</p>';
    document.getElementById('prescriptionHistory').innerHTML=prescriptions.length?prescriptions.map(p=>`<div class="feature-row"><div><strong>${safeText(p.fileName||'Prescription')}</strong><small>${new Date(p.createdAt).toLocaleDateString()} · ${safeText(p._id)}</small></div><span class="status-pill">${safeText(p.status)}</span><button class="btn btn-ghost" data-rx-open="${p._id}" type="button">View</button></div>`).join(''):'<p class="muted">No uploaded prescriptions found.</p>';
    document.getElementById('prescriptionHistory').querySelectorAll('[data-rx-open]').forEach(b=>b.addEventListener('click',async()=>{try{const r=await fetch(API_BASE+'/prescriptions/'+b.dataset.rxOpen+'/file',{headers:{Authorization:'Bearer '+session.token()}});if(!r.ok)throw new Error('Unable to open prescription');const url=URL.createObjectURL(await r.blob());window.open(url,'_blank','noopener');}catch(e){showToast(e.message);}}));
    const user=currentUser(),isOps=['admin','pharmacist'].includes(user.role);document.getElementById('adminCareCard').hidden=!isOps;
    if(isOps){
      if(user.role==='admin'){
        const d=await featureRequest('/admin/dashboard');document.getElementById('adminMetrics').innerHTML=[['Customers',d.customers],['Orders',d.orders],['Revenue','₹'+Number(d.revenue).toLocaleString('en-IN')],['Medicines',d.medicines],['Pending orders',d.pendingOrders],['Low stock',d.lowStock]].map(([k,v])=>`<div class="metric-tile"><strong>${safeText(v)}</strong><span>${k}</span></div>`).join('');
      }else{document.getElementById('adminMetrics').innerHTML='<p class="muted">Admin-only business analytics are hidden for pharmacist accounts.</p>';}
      const ph=await featureRequest('/pharmacy/dashboard');document.getElementById('pharmacyMetrics').innerHTML=`<div class="feature-row">Open orders <strong>${ph.assignedOrders}</strong></div><div class="feature-row">Prescription queue <strong>${ph.prescriptionQueue}</strong></div><div class="feature-row">Low-stock products <strong>${ph.lowStock}</strong></div><div class="feature-row">Expiry alerts (30 days) <strong>${ph.expiringSoon}</strong></div>`;
    }
  }catch(e){showToast(e.message);}
}
document.getElementById('reminderForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);try{await featureRequest('/reminders','POST',{medicineName:f.get('medicineName'),instructions:f.get('instructions'),times:String(f.get('times')||'').split(',').map(x=>x.trim()).filter(Boolean),startDate:f.get('startDate'),endDate:f.get('endDate')||undefined,frequency:'as_directed'});e.target.reset();showToast('Reminder saved');renderCareHub();}catch(err){showToast(err.message);}});
document.getElementById('petForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);try{await featureRequest('/pets','POST',Object.fromEntries(f.entries()));e.target.reset();showToast('Pet profile created');renderCareHub();}catch(err){showToast(err.message);}});
document.getElementById('redeemForm')?.addEventListener('submit',async e=>{e.preventDefault();const f=new FormData(e.target);try{await featureRequest('/rewards/redeem','POST',{points:Number(f.get('points'))});e.target.reset();showToast('Points redeemed');renderCareHub();}catch(err){showToast(err.message);}});
document.getElementById('auditRefresh')?.addEventListener('click',async()=>{try{const rows=await featureRequest('/admin/audit-logs');document.getElementById('auditList').innerHTML=rows.map(r=>`<div class="feature-row"><div><strong>${safeText(r.action)}</strong><small>${safeText(r.actor?.name||'System')} · ${new Date(r.createdAt).toLocaleString()}</small></div></div>`).join('')||'<p class="muted">No audit activity.</p>';}catch(e){showToast(e.message);}});

const assistantPanel=document.getElementById('assistantPanel'),assistantMessages=document.getElementById('assistantMessages');
document.getElementById('assistantToggle')?.addEventListener('click',()=>{assistantPanel.hidden=!assistantPanel.hidden;if(!currentUser()){assistantMessages.insertAdjacentHTML('beforeend','<p class="assistant-bubble">Sign in to save your conversation history.</p>');}});
document.getElementById('assistantClose')?.addEventListener('click',()=>assistantPanel.hidden=true);
document.getElementById('assistantForm')?.addEventListener('submit',async e=>{e.preventDefault();if(!currentUser()){showView('login');return;}const input=e.target.elements.message,message=input.value.trim();if(!message)return;assistantMessages.insertAdjacentHTML('beforeend',`<p class="assistant-bubble user">${safeText(message)}</p>`);input.value='';const loading=document.createElement('p');loading.className='assistant-bubble';loading.textContent='Thinking…';assistantMessages.appendChild(loading);assistantMessages.scrollTop=assistantMessages.scrollHeight;try{const result=await featureRequest('/assistant/chat','POST',{message});loading.textContent=result.reply;document.getElementById('assistantMode').textContent=result.mode==='demo'?'Demo mode · General guidance only':'AI assistant · General guidance only';}catch(err){loading.textContent=err.message;}assistantMessages.scrollTop=assistantMessages.scrollHeight;});
