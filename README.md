# NeuroWatch AI Pro — "Time is brain" — Guided 3-Step Screening & Emergency Network

NeuroWatch AI is a full-stack, B2C medical emergency application built around the motto **"Time is brain"**. It features a guided 3-step screening wizard (Face Asymmetry, Hand Elevation, Speech Sentence Check), real-time elapsed time tracking from risk detection until ambulance call, automated Indian emergency ambulance (108/112) dispatch, emergency contact alarming, and a dual portal for Patients and Hospital ER Teams.

---

## 🌟 Key Features

1. **⏱️ Elapsed Time Stopwatch Timer (Detection ➡️ Ambulance Call)**:
   - Starts automatically the moment a symptom or risk sign is detected.
   - Counts up continuously (`00:01, 00:02, 00:03...`) tracking the golden time window ("Time is brain").
   - Runs until the **108 Emergency Ambulance is called**, locking the final elapsed duration (e.g. `Ambulance Called at 00:42 after detection`).

2. **👁️ Guided 3-Step Motion & Symptom Screening Flow**:
   - **Step 1: Facial Asymmetry Check**: Live canvas scanner analyzing facial drooping and left vs right mouth corner alignment.
   - **Step 2: Raised Hand & Arm Elevation Check**: Instructs user to raise both hands in front of them with palms up, tracking hand elevation & arm drift.
   - **Step 3: Speech Sentence Verification**: Prompts user to read aloud *"The sky is blue in Cincinnati"*, analyzing speech articulation via Web Speech API mic input.

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
   - **Patient View**: Guided 3-step scanner, AI Triage Bot, Loved ones manager, Document vault, Hospital locator.
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
git commit -m "Add guided 3-step motion screening wizard and elapsed time stopwatch timer from risk detection until ambulance call"
git push -u origin main
```
