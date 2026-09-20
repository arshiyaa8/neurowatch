# NeuroWatch AI Pro — "Time is brain" — Early Bystander Screening & Emergency Network

NeuroWatch AI is a full-stack, B2C medical emergency application built around the motto **"Time is brain"**. It automates early BE-FAST (Balance, Eyes, Face, Arms, Speech, Time) bystander screening, medical AI triaging, automated Indian emergency ambulance (108/112) dispatch, emergency contact alarming, and a dual portal for Patients and Hospital ER Teams.

---

## 🌟 Key Features

1. **💚 Green Instant Emergency SOS Button**:
   - Prominent green button (`💚 I FEEL UNWELL / CALL 108 & LOVED ONES`) on screen for immediate emergency trigger.
   - Automatically dials/dispatches Indian National Ambulance (108) and alerts saved loved ones.
   - Activates a **continuous Web Audio API buzzing alarm** on loved ones' view until manually stopped.

2. **App Motto & Peer-Reviewed Research Page (`ℹ️ About Us`)**:
   - Slogan: **"Time is brain"** — every minute of delay destroys millions of neurons.
   - Peer-Reviewed Academic Research Paper:
     - **Title**: *NeuroWatch AI: A Rule-Based, Explainable Bystander Screening System for Early Stroke Sign Recognition in Low-Resource and Rural Settings*
     - **Author**: Muskan Bharti (Jaypee Institute of Information Technology)
     - **DOI & Publication Link**: [Zenodo Record 10.5281/zenodo.22854369](https://zenodo.org/records/22854369?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6ImRkMTM1ZGYwLTRlODQtNGJhYy1iMTNmLTZiMDdjZjQwMTFjNiIsImRhdGEiOnt9LCJyYW5kb20iOiI0NmY0M2JiN2ExMDI5YTNhNDI0NjcwMTRkZTQ1OWViZCJ9.6Q7zpZyr8HMAvVyobRxGMV--V3S-2nnuv5Fh_2HALFz9sOfXYfvQWyX9PHOknj42MC0E6056A0mJUdw6eYxfnw)
     - Highlights bystander recognition bottlenecks in rural and low-resource settings, explainable facial/arm landmark comparison, and the critical 4.5-hour thrombolysis window.

3. **Refined Medical Terminology & Risk Display**:
   - Replaced "detected X% stroke" with clear, precise risk level indicators (e.g. `88% Risk Level Detected`, `Critical Risk Level`).

4. **Live Landmark Camera Scanner**:
   - HTML5 Canvas overlay engine rendering facial bounding boxes, landmark grid targets, eye/mouth symmetry crosshairs, and live webcam metrics.

5. **Medical AI Assistant & Triage Bot**:
   - Interactive conversational assistant incorporating patient medical profile (hypertension, diabetes, past TIA/stroke) and uploaded medical documents.

6. **B2C Dual Portal (Patient & Hospital ER)**:
   - **Patient View**: Camera scanner, AI Triage Bot, Loved ones manager, Document vault, Hospital locator.
   - **Hospital ER View**: Real-time incoming emergency incident command center, live GPS patient tracking, instant medical document access for doctors, and 1-click Stroke Cath Lab team activation.

---

## 🚀 How to Run Locally

1. **Open project directory**:
   ```bash
   cd C:\Users\INTEL\.gemini\antigravity\scratch\neurowatch-ai
   ```

2. **Start the application server**:
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your web browser.

---

## 🐙 Push to GitHub Repository

To push all updated files directly to your GitHub repository [`https://github.com/arshiyaa8/neurowatch`](https://github.com/arshiyaa8/neurowatch):

```bash
git add .
git commit -m "Add Green Emergency SOS button, 'Time is brain' motto, research paper section, live camera scanner, and continuous alarm buzzing"
git push -u origin main
```
