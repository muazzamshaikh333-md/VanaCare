# VanaCare Backend — MongoDB Connection Setup

Tera frontend (`index.html`, `script.js`, `data.js`) abhi tak sab kuch browser ke
`localStorage` me store kar raha tha. MongoDB browser se directly connect nahi ho
sakta (security reason), isliye ek chhota Node.js + Express backend banaya gaya
hai jo MongoDB se connect karta hai aur API deta hai.

## Steps

### 1. Node.js install karo
Agar nahi hai to https://nodejs.org se LTS version install kar lo.
Check karo: `node -v` aur `npm -v`

### 2. MongoDB ready karo (2 options)

**Option A — MongoDB Atlas (cloud, sabse aasan, free tier hai)**
1. https://www.mongodb.com/cloud/atlas/register par account banao
2. Ek free cluster create karo
3. "Database Access" me ek user banao (username/password)
4. "Network Access" me apna IP allow karo (ya `0.0.0.0/0` for testing)
5. "Connect" > "Drivers" se connection string copy karo — kuch aisi dikhegi:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

**Option B — Local MongoDB**
1. https://www.mongodb.com/try/download/community se install karo
2. `mongod` command se local server start karo
3. Connection string: `mongodb://127.0.0.1:27017/vanacare`

### 3. Backend dependencies install karo
```bash
cd backend
npm install
```

### 4. `.env` file banao
`.env.example` ko copy karke `.env` banao aur apna real `MONGODB_URI` daalo:
```bash
cp .env.example .env
```
Fir `.env` file open karke `MONGODB_URI` me apni connection string paste kar do
(Atlas wali me `<username>`, `<password>` apne actual values se replace karna,
aur end me `/vanacare` daalna taki database ka naam "vanacare" set ho jaye).

### 5. Products seed karo (data.js → MongoDB)
```bash
npm run seed
```
Isse `data.js` ke saare products MongoDB ke `products` collection me chale jayenge.

### 6. Server start karo
```bash
npm start
```
Agar sab sahi hua to terminal me dikhega:
```
✅ MongoDB se connect ho gaya: vanacare
🚀 Server chal raha hai: http://localhost:5000
```

### 7. Test karo
Browser me ya Postman me kholo:
- `http://localhost:5000/api/health` → `{"status":"ok"}`
- `http://localhost:5000/api/products` → saare products ki list

## Ab frontend ko backend se connect kaise karein?

Abhi `script.js` sab kuch `localStorage` se karta hai. Isko MongoDB backend se
jodne ke liye `data.js`/`script.js` me jaha `localStorage` ya `PRODUCTS` array
use ho raha hai, waha `fetch('http://localhost:5000/api/...')` calls use karni
hongi. Yeh ek alag, bada step hai (poora data flow rewire karna padega) — agar
chaho to yeh bhi kar deta hoon, bas bolo.

## Files kya karte hain

| File | Kaam |
|---|---|
| `db.js` | MongoDB se connect karta hai (Mongoose) |
| `server.js` | Express server + API routes (`/api/products`, `/api/signup`, `/api/login`, `/api/orders`) |
| `models/Product.js` | Product ka schema |
| `models/User.js` | User ka schema |
| `models/Order.js` | Order ka schema |
| `productsData.js` | `data.js` se copy kiye gaye products (seeding ke liye) |
| `seed.js` | Products ko MongoDB me daalne ka script |
| `.env.example` | Connection string ka template — copy karke `.env` banao |
