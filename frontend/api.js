const API_BASE = (window.VANACARE_API_BASE || 'http://localhost:5000/api');
function authToken(){ return localStorage.getItem('vc_token'); }
async function api(path,{method='GET',body,auth=false}={}) {
  const headers={}; if(body!==undefined)headers['Content-Type']='application/json';
  if(auth&&authToken())headers.Authorization='Bearer '+authToken();
  let res;
  try{res=await fetch(API_BASE+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});}
  catch(e){throw new Error('Could not reach VanaCare server. Start the backend first.');}
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||'Request failed');
  return data;
}
const Api={
 register:p=>api('/auth/register',{method:'POST',body:p}),
 login:p=>api('/auth/login',{method:'POST',body:p}),
 me:()=>api('/auth/me',{auth:true}),
 products:p=>{const q=new URLSearchParams(p||{}).toString();return api('/products'+(q?'?'+q:''));},
 cart:()=>api('/cart',{auth:true}),
 saveCart:items=>api('/cart',{method:'PUT',body:{items},auth:true}),
 createOrder:p=>api('/orders',{method:'POST',body:p,auth:true}),
 myOrders:()=>api('/orders',{auth:true}),
 order:id=>api('/orders/'+id,{auth:true}),
 uploadPrescription:p=>api('/prescriptions',{method:'POST',body:p,auth:true}),
 validateCoupon:p=>api('/coupons/validate',{method:'POST',body:p,auth:true}),
 verifyPayment:p=>api('/payments/verify',{method:'POST',body:p,auth:true}),
 addresses:()=>api('/addresses',{auth:true}),
 addAddress:p=>api('/addresses',{method:'POST',body:p,auth:true}),
 notifications:()=>api('/notifications',{auth:true}),
 adminOrders:()=>api('/admin/orders',{auth:true}),
 pendingPrescriptions:()=>api('/pharmacy/prescriptions',{auth:true}),
 reviewPrescription:(id,decision,note)=>api('/pharmacy/prescriptions/'+id,{method:'PATCH',body:{decision,note},auth:true}),
 updateStatus:(id,status,note)=>api('/orders/'+id+'/status',{method:'PATCH',body:{status,note},auth:true}),
 deliveryOrders:()=>api('/delivery/orders',{auth:true})
};
