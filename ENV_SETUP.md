# GeoTag Photo Logger - Setup

## 1) Backend env

Your current `MONGO_URI` is MongoDB Atlas. The server error means **your IP is not whitelisted** in Atlas.

### Option A: MongoDB Atlas (recommended if you already made cluster)
- Atlas → **Network Access** → **Add IP Address**
  - Add your current IP, or use `0.0.0.0/0` for quick testing (not recommended for production).
- Atlas → **Database** → **Connect** → get connection string and ensure it includes a database name, e.g.:
  - `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/geotag`

Your `.env` must contain:
- `MONGO_URI=...`
- `JWT_SECRET=...`

### Option B: Local MongoDB
- Install MongoDB Community
- Use:
  - `MONGO_URI=mongodb://127.0.0.1:27017/geotag`

## 2) Run backend

From `geotag-backend`:
- `npm run dev`

Backend serves uploaded images from:
- `/uploads/<filename>`

## 3) Expo API URL (important)

If you run on a real phone, `localhost` won't work. The app auto-detects your LAN IP in most cases.

If it doesn't, set:
- `EXPO_PUBLIC_API_URL=http://<YOUR_PC_IP>:5000/api`

Then restart Expo:
- `npm run start`

## 4) App flow to test

- Register → Login
- Capture photo → Fetch Location → Upload
- Home: pull-to-refresh + delete

