require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const connectDB = require('./db');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/cart');
const Order = require('./models/Order');
const Prescription = require('./models/Prescription');
const Coupon = require('./models/Coupon');
const Notification = require('./models/Notification');
const Pharmacy = require('./models/Pharmacy');
const DeliveryPartner = require('./models/DeliveryPartner');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN ? process.env.FRONTEND_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '12mb' }));
const PORT = process.env.PORT || 5000;
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const DELIVERY_FEE = Math.max(0, Number(process.env.DELIVERY_FEE || 29));
const TAX_RATE = Math.max(0, Number(process.env.TAX_RATE || 0));

function tokenFor(user) {
  const payload = Buffer.from(JSON.stringify({ sub: String(user._id), role: user.role, exp: Date.now() + 7*24*60*60*1000 })).toString('base64url');
  const sig = crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload).digest('base64url');
  return payload + '.' + sig;
}
function auth(req,res,next) {
  const raw = (req.headers.authorization || '').replace(/^Bearer\s+/i,'');
  if (!raw || !process.env.JWT_SECRET) return res.status(401).json({error:'Please log in'});
  const [payload,sig] = raw.split('.');
  const expected = crypto.createHmac('sha256', process.env.JWT_SECRET).update(payload || '').digest('base64url');
  if (!sig || Buffer.byteLength(sig)!==Buffer.byteLength(expected) || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return res.status(401).json({error:'Invalid session'});
  try {
    const data = JSON.parse(Buffer.from(payload,'base64url').toString());
    if (data.exp < Date.now()) return res.status(401).json({error:'Session expired'});
    req.user = { id:data.sub, role:data.role }; next();
  } catch { return res.status(401).json({error:'Invalid session'}); }
}
const allow = (...roles) => (req,res,next) => roles.includes(req.user.role) ? next() : res.status(403).json({error:'Not authorized for this action'});
const safeUser = u => ({ id:u._id, name:u.name, email:u.email, phone:u.phone, role:u.role, addresses:u.addresses || [] });
async function notify(user,title,message,order) {
  if (user) await Notification.create({user,title,message,relatedOrder:order});
}
function asyncRoute(fn) { return (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next); }
app.get('/api/health',(req,res)=>res.json({status:'ok',service:'VanaCare API'}));

app.post('/api/auth/register',asyncRoute(async(req,res)=>{
  const {name,email,phone,password}=req.body;
  if(!name || !email || !phone || !password || String(password).length<8) return res.status(400).json({error:'Name, email, phone and password (8+ characters) are required'});
  const normalized=String(email).trim().toLowerCase();
  if(await User.findOne({email:normalized})) return res.status(409).json({error:'Email already registered'});
  const user=await User.create({name,email:normalized,phone,password,role:'customer'});
  res.status(201).json({token:tokenFor(user),user:safeUser(user)});
}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
  const user=await User.findOne({email:String(req.body.email||'').trim().toLowerCase()});
  if(!user || !(await user.comparePassword(req.body.password||''))) return res.status(401).json({error:'Incorrect email or password'});
  res.json({token:tokenFor(user),user:safeUser(user)});
}));
app.get('/api/auth/me',auth,asyncRoute(async(req,res)=>{
  const u=await User.findById(req.user.id); if(!u)return res.status(401).json({error:'Account not found'});
  res.json({user:safeUser(u)});
}));

app.get('/api/products',asyncRoute(async(req,res)=>{
  const filter={active:true};
  if(req.query.system)filter.system=req.query.system;
  if(req.query.category)filter.category=req.query.category;
  if(req.query.q)filter.$text={$search:String(req.query.q)};
  res.json(await Product.find(filter).sort({name:1}).limit(200));
}));
app.get('/api/products/:id',asyncRoute(async(req,res)=>{
  const p=await Product.findOne({$or:[{_id:req.params.id},{id:req.params.id}],active:true});
  if(!p)return res.status(404).json({error:'Medicine not found'}); res.json(p);
}));

app.get('/api/cart',auth,asyncRoute(async(req,res)=>{
  const cart=await Cart.findOne({user:req.user.id}).populate('items.product');
  res.json(cart || {items:[]});
}));
app.put('/api/cart',auth,asyncRoute(async(req,res)=>{
  const input=Array.isArray(req.body.items)?req.body.items:[];
  if(input.length>50)return res.status(400).json({error:'Too many cart items'});
  const normalized=[];
  for(const item of input){
    const qty=Number(item.qty);
    if(!Number.isInteger(qty)||qty<1||qty>50)return res.status(400).json({error:'Quantity must be between 1 and 50'});
    const p=await Product.findOne({$or:[{_id:item.productId||item.product},{id:item.productId||item.product}],active:true});
    if(!p)return res.status(400).json({error:'A medicine in your cart is unavailable'});
    normalized.push({product:p._id,productId:p.id,qty});
  }
  const cart=await Cart.findOneAndUpdate({user:req.user.id},{items:normalized},{upsert:true,new:true,runValidators:true}).populate('items.product');
  res.json(cart);
}));

app.get('/api/addresses',auth,asyncRoute(async(req,res)=>{
  const u=await User.findById(req.user.id);res.json(u.addresses||[]);
}));
app.post('/api/addresses',auth,asyncRoute(async(req,res)=>{
  const {line1,city,state,pincode}=req.body;
  if(!line1||!city||!state||!pincode)return res.status(400).json({error:'Address, city, state and pincode are required'});
  const u=await User.findById(req.user.id);
  const a={...req.body}; if(a.isDefault)u.addresses.forEach(x=>x.isDefault=false);
  u.addresses.push(a);await u.save();res.status(201).json(u.addresses[u.addresses.length-1]);
}));
app.delete('/api/addresses/:id',auth,asyncRoute(async(req,res)=>{
  await User.updateOne({_id:req.user.id},{$pull:{addresses:{_id:req.params.id}}});res.json({ok:true});
}));

// Upload prescription as base64 JSON. Private files are never served as public static assets.
app.post('/api/prescriptions',auth,asyncRoute(async(req,res)=>{
  const {fileName,mimeType,data}=req.body;
  if(!['application/pdf','image/jpeg','image/png','image/webp'].includes(mimeType))return res.status(400).json({error:'Upload a PDF, JPG, PNG or WEBP prescription'});
  const match=String(data||'').match(/^data:(application\/pdf|image\/jpeg|image\/png|image\/webp);base64,(.+)$/);
  if(!match)return res.status(400).json({error:'Invalid file data'});
  const buffer=Buffer.from(match[2],'base64');
  if(!buffer.length||buffer.length>5*1024*1024)return res.status(400).json({error:'Prescription must be under 5 MB'});
  const ext={ 'application/pdf':'pdf','image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mimeType];
  const filename=crypto.randomUUID()+'.'+ext;
  fs.writeFileSync(path.join(uploadDir,filename),buffer,{flag:'wx'});
  const doc=await Prescription.create({customer:req.user.id,fileName:String(fileName||filename).slice(0,150),mimeType,storagePath:filename});
  res.status(201).json({id:doc._id,fileName:doc.fileName,status:doc.status});
}));
app.get('/api/prescriptions/:id/file',auth,asyncRoute(async(req,res)=>{
  const p=await Prescription.findById(req.params.id);
  if(!p)return res.status(404).json({error:'Prescription not found'});
  if(req.user.role==='customer'&&String(p.customer)!==req.user.id)return res.status(403).json({error:'Not authorized'});
  res.type(p.mimeType).sendFile(path.join(uploadDir,p.storagePath));
}));
app.get('/api/pharmacy/prescriptions',auth,allow('admin','pharmacist'),asyncRoute(async(req,res)=>{
  res.json(await Prescription.find({status:'pending'}).populate('customer','name email phone').sort({createdAt:1}));
}));
app.patch('/api/pharmacy/prescriptions/:id',auth,allow('admin','pharmacist'),asyncRoute(async(req,res)=>{
  const {decision,note}=req.body;
  if(!['approved','rejected','more_info'].includes(decision))return res.status(400).json({error:'Invalid prescription decision'});
  const p=await Prescription.findById(req.params.id);if(!p)return res.status(404).json({error:'Prescription not found'});
  p.status=decision;p.pharmacist=req.user.id;p.reviewNote=String(note||'').slice(0,500);p.reviewedAt=new Date();await p.save();
  await notify(p.customer,'Prescription '+decision, p.reviewNote||('Your prescription was '+decision+'.'),p.order);
  res.json(p);
}));

app.post('/api/coupons/validate',auth,asyncRoute(async(req,res)=>{
  const code=String(req.body.code||'').trim().toUpperCase(),subtotal=Number(req.body.subtotal);
  const c=await Coupon.findOne({code,active:true});
  if(!c|| (c.expiresAt&&c.expiresAt<new Date()) || subtotal<c.minOrder)return res.status(400).json({error:'Coupon is invalid or does not meet minimum order value'});
  let discount=c.type==='percent'?subtotal*c.value/100:c.value;
  if(c.maxDiscount!=null)discount=Math.min(discount,c.maxDiscount);
  res.json({code:c.code,discount:Math.min(Math.round(discount*100)/100,subtotal)});
}));

app.post('/api/orders',auth,asyncRoute(async(req,res)=>{
  const {items,address,paymentMethod='cod',couponCode,prescriptionIds=[]}=req.body;
  if(!Array.isArray(items)||!items.length)return res.status(400).json({error:'Your cart is empty'});
  if(!address||!address.line1)return res.status(400).json({error:'Select a complete delivery address'});
  if(!['cod','razorpay'].includes(paymentMethod))return res.status(400).json({error:'Unsupported payment method'});
  if(paymentMethod==='razorpay'&&(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET))return res.status(503).json({error:'Online payment is not configured. Use Cash on Delivery or configure Razorpay test keys.'});
  if(!Array.isArray(prescriptionIds))return res.status(400).json({error:'Invalid prescription list'});
  const ids=[...new Set(items.map(x=>String(x.productId||x.product||'')))];
  const products=await Product.find({$or:[{_id:{$in:ids.filter(x=>/^[a-f\d]{24}$/i.test(x))}},{id:{$in:ids}}],active:true});
  const byId=new Map();products.forEach(p=>{byId.set(String(p._id),p);byId.set(p.id,p);});
  const orderItems=[];let subtotal=0;
  for(const item of items){
    const p=byId.get(String(item.productId||item.product));const qty=Number(item.qty);
    if(!p||!Number.isInteger(qty)||qty<1||qty>20)return res.status(400).json({error:'Invalid or unavailable cart item'});
    if(p.stock<qty)return res.status(409).json({error:p.name+' is out of stock'});
    subtotal+=p.price*qty;orderItems.push({product:p._id,productId:p.id,name:p.name,potency:p.potency,qty,unitPrice:p.price,prescriptionRequired:p.prescriptionOnly});
  }
  const required=orderItems.some(i=>i.prescriptionRequired);
  const rxDocs=prescriptionIds.length?await Prescription.find({_id:{$in:prescriptionIds},customer:req.user.id}):[];
  if(required&&(!rxDocs.length||rxDocs.some(p=>p.status!=='approved'))) {
    // Keep order in prescription_pending, but do not permit pharmacy preparation/dispatch until approval.
  }
  let discount=0,coupon=null;
  if(couponCode){
    coupon=await Coupon.findOne({code:String(couponCode).toUpperCase(),active:true});
    if(coupon&&( !coupon.expiresAt||coupon.expiresAt>new Date())&&subtotal>=coupon.minOrder){
      discount=coupon.type==='percent'?subtotal*coupon.value/100:coupon.value;
      if(coupon.maxDiscount!=null)discount=Math.min(discount,coupon.maxDiscount);
      discount=Math.min(Math.round(discount*100)/100,subtotal);
    } else return res.status(400).json({error:'Coupon is invalid'});
  }
  const tax=Math.round((subtotal-discount)*TAX_RATE*100)/100;
  const total=Math.max(0,subtotal-discount+DELIVERY_FEE+tax);
  // Reserve stock atomically; restore earlier reservations if any item fails.
  const reserved=[];
  try {
    for(const item of orderItems){
      const p=await Product.findOneAndUpdate({_id:item.product,stock:{$gte:item.qty}},{$inc:{stock:-item.qty}},{new:true});
      if(!p)throw new Error(item.name+' stock changed. Please review your cart.');
      reserved.push(item);
    }
  } catch(err) {
    for(const item of reserved)await Product.updateOne({_id:item.product},{$inc:{stock:item.qty}});
    return res.status(409).json({error:err.message});
  }
  let order;
  try {
    order=await Order.create({
      orderCode:'VC'+crypto.randomBytes(5).toString('hex').toUpperCase(),customer:req.user.id,items:orderItems,
      subtotal,deliveryFee:DELIVERY_FEE,discount,tax,total,couponCode:coupon?.code,address,
      paymentMethod,paymentStatus:paymentMethod==='cod'?'pending':'pending',
      status:required&&(!rxDocs.length||rxDocs.some(p=>p.status!=='approved'))?'prescription_pending':'placed',
      statusHistory:[{status:required&&(!rxDocs.length||rxDocs.some(p=>p.status!=='approved'))?'prescription_pending':'placed',note:'Order submitted',by:req.user.id}],
      prescriptionIds:rxDocs.map(p=>p._id),estimatedDeliveryMinutes:Number(process.env.ESTIMATED_DELIVERY_MINUTES||60)
    });
    await Prescription.updateMany({_id:{$in:rxDocs.map(p=>p._id)}},{$set:{order:order._id}});
    await Cart.updateOne({user:req.user.id},{$set:{items:[]}});
    await notify(req.user.id,'Order placed','Your order '+order.orderCode+' has been received.',order._id);
  } catch(err) {
    for(const item of reserved)await Product.updateOne({_id:item.product},{$inc:{stock:item.qty}});
    throw err;
  }
  if(paymentMethod==='razorpay'){
    if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({error:'Online payment is not configured. Order is saved; contact support before paying.',order});
    const authHeader='Basic '+Buffer.from(process.env.RAZORPAY_KEY_ID+':'+process.env.RAZORPAY_KEY_SECRET).toString('base64');
    const rp=await fetch('https://api.razorpay.com/v1/orders',{method:'POST',headers:{Authorization:authHeader,'Content-Type':'application/json'},body:JSON.stringify({amount:Math.round(total*100),currency:'INR',receipt:order.orderCode,notes:{orderId:String(order._id)}})});
    const data=await rp.json();
    if(!rp.ok){await Order.updateOne({_id:order._id},{$set:{paymentStatus:'failed'}});return res.status(502).json({error:'Payment gateway could not create an order',orderId:order._id});}
    order.razorpayOrderId=data.id;await order.save();
    return res.status(201).json({order,razorpay:{keyId:process.env.RAZORPAY_KEY_ID,orderId:data.id,amount:data.amount,currency:data.currency}});
  }
  res.status(201).json({order});
}));
app.post('/api/payments/verify',auth,asyncRoute(async(req,res)=>{
  const {orderId,razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
  const order=await Order.findOne({_id:orderId,customer:req.user.id});
  if(!order||order.razorpayOrderId!==razorpay_order_id)return res.status(404).json({error:'Payment order not found'});
  const expected=crypto.createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(razorpay_order_id+'|'+razorpay_payment_id).digest('hex');
  const a=Buffer.from(expected),b=Buffer.from(String(razorpay_signature||''));
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b)){order.paymentStatus='failed';await order.save();return res.status(400).json({error:'Payment signature verification failed'});}
  order.paymentStatus='paid';order.razorpayPaymentId=razorpay_payment_id;
  if(order.status==='placed')order.status='confirmed';
  order.statusHistory.push({status:order.status,note:'Razorpay payment verified',by:req.user.id});
  await order.save();await notify(req.user.id,'Payment successful','Payment received for '+order.orderCode,order._id);
  res.json({ok:true,order});
}));
app.get('/api/orders',auth,asyncRoute(async(req,res)=>{
  const filter=req.user.role==='customer'?{customer:req.user.id}:{};
  res.json(await Order.find(filter).populate('pharmacy','name').populate('deliveryPartner','name phone').sort({createdAt:-1}));
}));
app.get('/api/orders/:id',auth,asyncRoute(async(req,res)=>{
  const o=await Order.findById(req.params.id).populate('pharmacy','name').populate('deliveryPartner','name phone');
  if(!o)return res.status(404).json({error:'Order not found'});
  if(req.user.role==='customer'&&String(o.customer)!==req.user.id)return res.status(403).json({error:'Not authorized'});
  res.json(o);
}));
const transitions={
  admin:['confirmed','pharmacy_accepted','preparing','packed','picked_up','out_for_delivery','delivered','cancelled','rejected'],
  pharmacist:['pharmacy_accepted','prescription_verified','preparing','packed','rejected'],
  delivery:['picked_up','out_for_delivery','delivered']
};
app.patch('/api/orders/:id/status',auth,asyncRoute(async(req,res)=>{
  const {status,note}=req.body;
  if(!(transitions[req.user.role]||[]).includes(status))return res.status(403).json({error:'Your role cannot set this status'});
  const order=await Order.findById(req.params.id);if(!order)return res.status(404).json({error:'Order not found'});
  if(req.user.role==='delivery'&&String(order.deliveryPartner)!==req.user.id)return res.status(403).json({error:'This order is not assigned to you'});
  if(['preparing','packed','picked_up','out_for_delivery','delivered'].includes(status)){
    const pendingRx=await Prescription.exists({_id:{$in:order.prescriptionIds},status:{$ne:'approved'}});
    if(pendingRx||order.items.some(i=>i.prescriptionRequired)&&!order.prescriptionIds.length)return res.status(409).json({error:'Required prescription must be approved before preparation or dispatch'});
  }
  if(['picked_up','out_for_delivery','delivered'].includes(status)&&order.paymentMethod==='razorpay'&&order.paymentStatus!=='paid')return res.status(409).json({error:'Online payment is not verified'});
  order.status=status;order.statusHistory.push({status,note:String(note||'').slice(0,300),by:req.user.id});await order.save();
  await notify(order.customer,'Order update',`Your order ${order.orderCode}: ${status.replaceAll('_',' ')}.`,order._id);
  res.json(order);
}));
app.get('/api/admin/orders',auth,allow('admin','pharmacist'),asyncRoute(async(req,res)=>{
  const filter={};if(req.query.status)filter.status=req.query.status;
  res.json(await Order.find(filter).populate('customer','name email phone').sort({createdAt:1}));
}));
app.patch('/api/admin/orders/:id/assign-delivery',auth,allow('admin'),asyncRoute(async(req,res)=>{
  const partner=await User.findOne({_id:req.body.deliveryPartnerId,role:'delivery'});
  if(!partner)return res.status(400).json({error:'Delivery partner not found'});
  const order=await Order.findByIdAndUpdate(req.params.id,{deliveryPartner:partner._id},{new:true});
  if(!order)return res.status(404).json({error:'Order not found'});
  await notify(partner._id,'New delivery assigned','Order '+order.orderCode+' has been assigned to you.',order._id);
  res.json(order);
}));
app.get('/api/delivery/orders',auth,allow('delivery'),asyncRoute(async(req,res)=>{
  res.json(await Order.find({deliveryPartner:req.user.id}).sort({createdAt:-1}));
}));
app.get('/api/notifications',auth,asyncRoute(async(req,res)=>{
  res.json(await Notification.find({user:req.user.id}).sort({createdAt:-1}).limit(50));
}));
app.patch('/api/notifications/:id/read',auth,asyncRoute(async(req,res)=>{
  const n=await Notification.findOneAndUpdate({_id:req.params.id,user:req.user.id},{readAt:new Date()},{new:true});
  if(!n)return res.status(404).json({error:'Notification not found'});res.json(n);
}));
app.get('/api/pharmacies',asyncRoute(async(req,res)=>res.json(await Pharmacy.find({active:true}).select('name address city supportedSystems'))));

app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Server error. Please try again.'});});
connectDB().then(()=>app.listen(PORT,()=>console.log(`VanaCare API running on http://localhost:${PORT}`))).catch(err=>{console.error('Database connection failed:',err.message);process.exit(1);});
