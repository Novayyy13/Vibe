# Vibe — Chat & Calls

Real-time chat, audio calling, video calling, and screen sharing app.

## Deploy to Render (Free)

### Option 1 — GitHub (recommended)
1. Create a free account at [github.com](https://github.com)
2. Create a new repository and upload all these files
3. Go to [render.com](https://render.com) and sign up for free
4. Click **New → Web Service**
5. Connect your GitHub repo
6. Render auto-detects the settings from `render.yaml`
7. Click **Create Web Service** — done!

### Option 2 — Manual on Render
1. Sign up at [render.com](https://render.com)
2. Click **New → Web Service**
3. Choose **Deploy from a public Git URL** or upload manually
4. Set:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Deploy!

## How it works
- Open the Render URL in multiple browser tabs or on different devices
- Each person enters their name and joins
- Everyone online appears in the contacts list
- Click someone to chat or call them
- Real-time with WebSocket (Socket.io) + WebRTC for calls

## Features
- ✅ Real-time messaging
- ✅ Audio calls (WebRTC)
- ✅ Video calls (WebRTC)
- ✅ Screen sharing
- ✅ Typing indicators
- ✅ Online/away status
- ✅ Works across devices on the same URL
