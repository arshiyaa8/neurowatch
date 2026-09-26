# NeuroWatch AI Pro — Passive Continuous Monitoring & Emergency Network

NeuroWatch AI is a full-stack, B2C medical emergency application built around the motto **"Time is brain"**. It operates as a **passive continuous monitoring system** that assumes no manual user interaction is possible after camera launch. It automatically detects facial asymmetry, hand/arm movement, and speech signals in real time, aggregating risk scores to trigger emergency workflows when confirmed.

---

## 🌟 Passive Continuous Pipeline Architecture

### 1. Zero-Interaction Camera Pipeline
- As soon as the camera starts, the system continuously analyzes incoming frames via `requestAnimationFrame`.
- **Face Detection**: Automatically detects face presence, measuring facial landmark symmetry index (`Face: 78% detected`, `Face Asymmetry: 84%`).
- **Hand / Arm Detection**: Automatically activates when hands/arms are visible in frame, monitoring elevation & movement asymmetry (`Hand: 60% detected`, `Arm Movement: 82%`).
- **Speech Signal Autodiscovery**: Continuously monitors background speech and audio articulation in parallel.

### 2. Live Detection Dashboard Side Panel
Displays real-time diagnostic values updated frame-by-frame:
```
NEUROWATCH AI
Emergency Monitoring

FACE
Facial Asymmetry     78%
Confidence           91%

HAND / ARM
Movement             60%
Confidence           87%

SPEECH / OTHER
Status               Monitoring

OVERALL RISK
████████████░░ 78%

SYSTEM STATUS
● Monitoring
```

### 3. Automatic 90%+ Risk Threshold & 3-Second Confirmation Hold
- **Configurable Threshold**: `CONFIG_EMERGENCY_THRESHOLD = 90%`
- **Confirmation Hold**: `CONFIG_CONFIRMATION_HOLD_MS = 3000ms` (3 seconds)
- **False Positive Mitigation**: Uses a 15-frame rolling window buffer (`frameRiskHistory`) to calculate smoothed risk. Isolated single-frame spikes do NOT trigger false alarms.
- **Confirmation Logic**:
  - If smoothed risk reaches `>= 90%`, a 3-second confirmation timer begins (`🚨 POSSIBLE STROKE DETECTED (94%)`).
  - If risk remains `>= 90%` for 3 seconds continuously, `trigger_emergency_response()` is executed.
  - If risk drops below 90% before 3 seconds, the confirmation timer is reset.

### 4. Configurable Emergency Action (`trigger_emergency_response`)
- Handler: `trigger_emergency_response(reason, riskScore)`
- Safe Demo Mode: `CONFIG_ENABLE_REAL_CALL = false` (prevents accidental live 108 emergency service calls during testing).
- Plays audio alarm, opens emergency modal with patient EHR & GPS link, alerts saved loved ones with continuous buzzing, and notifies hospital ER desks.

### 5. Medical & Safety Disclaimer
- *NeuroWatch AI is a prototype screening aid, not a diagnostic medical device. It uses language such as "Possible stroke detected — emergency response recommended" rather than claiming a definitive medical diagnosis.*

---

## 🚀 How to Run Locally

1. **Open project directory**:
   ```bash
   cd C:\Users\INTEL\.gemini\antigravity\scratch\neurowatch-ai
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🐙 Push to GitHub Repository

To push all updated files directly to your GitHub repository [`https://github.com/arshiyaa8/neurowatch`](https://github.com/arshiyaa8/neurowatch):

```bash
git add .
git commit -m "Refactor state machine into passive continuous monitoring pipeline with live dashboard and 90% 3s confirmation hold"
git push -u origin main
```
