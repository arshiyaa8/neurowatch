# NeuroWatch AI Pro — Stroke Warning System, Medical AI Bot & Indian Emergency Dispatch Engine

NeuroWatch AI is a full-stack, B2C medical emergency application designed for early detection of acute stroke using BE-FAST (Balance, Eyes, Face, Arms, Speech, Time) screening, AI health triaging, automated Indian emergency ambulance (108/112) dispatch, emergency contact alerting, and a dual portal for both Patients and Hospital ER Teams.

---

## 🌟 Key Features

1. **BE-FAST Camera & Speech AI Screen**:
   - Analyzes facial symmetry, arm drift, and speech dysarthria in real-time.
   - On-device voice guide via `voice-guide.js` (Web Speech API).

2. **Medical AI Assistant & Triage Bot**:
   - Interactive medical AI chatbot.
   - Evaluates symptoms against saved patient medical background (hypertension, diabetes, past TIA/stroke).
   - Computes stroke probability and automatically triggers emergency dispatch if risk is high.

3. **Emergency Dispatch Engine (Indian Context)**:
   - **Indian Emergency Services (108 / 112)**: Automated emergency call simulation & GPS payload transmission.
   - **Saved Loved Ones Alert**: Multi-channel Voice Call + SMS notification to saved emergency contact numbers with live GPS location link.
   - **Hospital Desk Alert**: Geolocation finder for nearby stroke-ready centers (AIIMS, Fortis, Apollo, Max, NIMHANS) with automated ER desk pre-alerts.
   - **Nearby Bystander Broadcast**: Alerts registered community helpers within radius.

4. **B2C Dual Portal (Patient & Hospital ER)**:
   - **Patient View**: FAST visual check, AI Chatbot, Emergency contact manager, Medical document vault.
   - **Hospital ER View**: Real-time incoming emergency dashboard, live GPS patient tracking, instant medical record & scan access for doctors, and 1-click Stroke Cath Lab team activation.

5. **Backend Data Persistence**:
   - SQLite database (`data/neurowatch.db`) storing patient profiles, loved ones' numbers, document vault index, assessment logs, and emergency incidents.

---

## 🚀 How to Run in VS Code & Locally

1. **Open the project in VS Code**:
   ```bash
   cd C:\Users\INTEL\.gemini\antigravity\scratch\neurowatch-ai
   code .
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Platform Server**:
   ```bash
   npm start
   ```

4. **Access the Application**:
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🐙 How to Push to GitHub (`arshiyaa8/neurowatch`)

To push your latest code to your GitHub repository `https://github.com/arshiyaa8/neurowatch`:

```bash
git init
git add .
git commit -m "Add backend SQLite storage, AI Triage Bot, 108 Emergency Dispatch & Dual Hospital-Patient Portal"
git branch -M main
git remote add origin https://github.com/arshiyaa8/neurowatch.git
git push -u origin main --force
```

---

## 📁 Repository Structure

```
neurowatch-ai/
├── backend/
│   ├── db.js                # SQLite database models & query handlers
│   ├── emergencyService.js  # 108 Ambulance, Loved Ones & Hospital Dispatch Engine
│   ├── aiService.js         # AI Triage & Document Analysis Engine
│   └── server.js            # Express API endpoints & WebSocket ER Broadcast Server
├── public/
│   ├── index.html           # Dual B2C Portal UI (Patient View + Hospital ER View)
│   ├── voice-guide.js       # Voice assistant module
│   └── uploads/             # Patient medical documents storage directory
├── data/
│   └── neurowatch.db        # SQLite database file (generated automatically)
├── package.json
└── README.md
```
