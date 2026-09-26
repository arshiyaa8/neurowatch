# NeuroWatch AI Pro — "Time is brain" — Early Bystander Screening & Emergency Network

NeuroWatch AI is a full-stack, B2C medical emergency application built around the motto **"Time is brain"**. It automates early BE-FAST (Balance, Eyes, Face, Arms, Speech, Time) bystander screening, real-time motion & facial asymmetry detection, medical AI triaging, automated Indian emergency ambulance (108/112) dispatch, emergency contact alarming, and a dual portal for Patients and Hospital ER Teams.

---

## 🌟 Key Features

1. **👁️ Real-Time Motion & Asymmetry Landmark Scanner**:
   - HTML5 Canvas frame-by-frame optical motion vector analyzer.
   - Evaluates left vs right facial motion intensity and symmetry in real time on webcam streams.

2. **⏱️ 10-Second Emergency Dispatch Countdown**:
   - When a high risk level is identified (or Green Emergency button pressed), initiates a 10-second countdown (`10, 9, 8... 1`).
   - User options: **Cancel Dispatch (False Alarm)** or **Dispatch Ambulance Immediately**.

3. **💚 Green Instant Emergency SOS Button**:
   - Prominent green button (`💚 I FEEL UNWELL / CALL 108 & LOVED ONES`).
   - Automatically dispatches 108 Ambulance and alerts saved loved ones.
   - Activates a **continuous Web Audio API buzzing alarm** on loved ones' view until manually stopped.

4. **🧠 Motto Slogan & Peer-Reviewed Academic Research Page (`ℹ️ About Us`)**:
   - Slogan: **"Time is brain"**
   - Contact Email: **neurowatch0@gmail.com**
   - Peer-Reviewed Academic Research Paper:
     - **Title**: *NeuroWatch AI: A Rule-Based, Explainable Bystander Screening System for Early Stroke Sign Recognition in Low-Resource and Rural Settings*
     - **Author**: Muskan Bharti (Jaypee Institute of Information Technology)
     - **DOI & Zenodo Publication Link**: [Zenodo Record 10.5281/zenodo.22857781](https://zenodo.org/records/22857781?token=eyJhbGciOiJIUzUxMiJ9.eyJpZCI6IjYxYjIxZDMwLWVmMmQtNDllZS1hM2I0LWVlYWM0MGI2OTFiYSIsImRhdGEiOnt9LCJyYW5kb20iOiIxOWExYjQ3MGM0ZDQyZTk3NDk0MWZkYTU1YjcwNjc3ZiJ9.GN0qHDBFygQ5s61XaNLzpBW_sY2sKEwCT8hf_KfXFLIPU6XPeV0CPtiCt1Kg2DPqczGWbI_XkKBvMDhgjC0k9w)

5. **Medical AI Assistant & Triage Bot**:
   - Interactive conversational assistant incorporating patient medical profile (hypertension, diabetes, past TIA) and uploaded medical documents.

6. **B2C Dual Portal (Patient & Hospital ER)**:
   - **Patient View**: Motion & Asymmetry Camera scanner, AI Triage Bot, Loved ones manager, Document vault, Hospital locator.
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
git commit -m "Add real-time motion detection engine, 10s emergency dispatch countdown, neurowatch0@gmail.com email, and updated Zenodo paper link"
git push -u origin main
```
