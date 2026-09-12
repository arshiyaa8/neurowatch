const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'neurowatch.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_code TEXT UNIQUE,
      name TEXT DEFAULT 'Anonymous Patient',
      age INTEGER DEFAULT 45,
      phone TEXT DEFAULT '',
      blood_group TEXT DEFAULT 'O+',
      medical_history TEXT DEFAULT 'Hypertension, High Cholesterol',
      medications TEXT DEFAULT 'Aspirin, Amlodipine',
      allergies TEXT DEFAULT 'Penicillin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emergency contacts table (Loved Ones)
  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      name TEXT NOT NULL,
      relation TEXT,
      phone TEXT NOT NULL,
      priority INTEGER DEFAULT 1,
      FOREIGN KEY(patient_id) REFERENCES patients(id)
    )
  `);

  // Assessment History
  db.run(`
    CREATE TABLE IF NOT EXISTS assessment_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER DEFAULT 1,
      face_result TEXT,
      arm_result TEXT,
      speech_result TEXT,
      speech_transcript TEXT,
      stroke_probability REAL,
      urgency_level TEXT,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Medical Documents
  db.run(`
    CREATE TABLE IF NOT EXISTS medical_documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER DEFAULT 1,
      file_name TEXT,
      file_path TEXT,
      doc_type TEXT,
      summary TEXT,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emergency Incidents
  db.run(`
    CREATE TABLE IF NOT EXISTS emergency_incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER DEFAULT 1,
      patient_name TEXT,
      status TEXT DEFAULT 'DISPATCHED',
      ambulance_status TEXT DEFAULT '108 Ambulance Unit Assigned',
      loved_ones_notified INTEGER DEFAULT 0,
      bystanders_notified INTEGER DEFAULT 0,
      assigned_hospital_name TEXT,
      assigned_hospital_phone TEXT,
      latitude REAL,
      longitude REAL,
      stroke_score REAL,
      eta_minutes INTEGER DEFAULT 12,
      triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Hospitals
  db.run(`
    CREATE TABLE IF NOT EXISTS hospitals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city TEXT,
      phone TEXT,
      emergency_desk TEXT,
      cath_lab_ready INTEGER DEFAULT 1,
      stroke_beds_available INTEGER DEFAULT 4,
      latitude REAL,
      longitude REAL
    )
  `);

  // Seed default patient if empty
  db.get("SELECT COUNT(*) AS count FROM patients", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO patients (patient_code, name, age, phone, blood_group, medical_history, medications, allergies)
        VALUES ('NW-PAT-108', 'Rajesh Sharma', 58, '+91 98765 43210', 'B+', 'Hypertension, Type 2 Diabetes, Past TIA (2024)', 'Aspirin 75mg, Metformin 500mg, Telmisartan 40mg', 'None')
      `, function(err) {
        if (!err) {
          const defaultPatientId = this.lastID;
          // Seed emergency contacts
          db.run(`
            INSERT INTO emergency_contacts (patient_id, name, relation, phone, priority) VALUES
            (${defaultPatientId}, 'Priya Sharma', 'Spouse', '+91 98123 45678', 1),
            (${defaultPatientId}, 'Amit Sharma', 'Son', '+91 98765 99887', 2)
          `);

          // Seed default mock medical documents
          db.run(`
            INSERT INTO medical_documents (patient_id, file_name, file_path, doc_type, summary) VALUES
            (${defaultPatientId}, 'Brain_MRI_Angiography.pdf', '/uploads/sample_mri.pdf', 'MRI Scan', 'Mild ischemic microvascular changes. No acute intracranial hemorrhage.'),
            (${defaultPatientId}, 'ECG_Report_July2026.pdf', '/uploads/sample_ecg.pdf', 'ECG', 'Normal sinus rhythm. HR 74 bpm. No ST elevation.'),
            (${defaultPatientId}, 'Discharge_Summary_Fortis.pdf', '/uploads/sample_discharge.pdf', 'Discharge Summary', 'Admitted for TIA event. Managed conservatively with antiplatelets.')
          `);
        }
      });
    }
  });

  // Seed Indian Hospitals if empty
  db.get("SELECT COUNT(*) AS count FROM hospitals", (err, row) => {
    if (!err && row.count === 0) {
      db.run(`
        INSERT INTO hospitals (name, city, phone, emergency_desk, cath_lab_ready, stroke_beds_available, latitude, longitude) VALUES
        ('AIIMS Emergency & Stroke Center', 'New Delhi', '011-26588500', '108 / 011-26594700', 1, 5, 28.5672, 77.2100),
        ('Fortis Escorts Comprehensive Stroke Care', 'New Delhi / NCR', '011-47135000', '+91 99100 22334', 1, 3, 28.5413, 77.2831),
        ('Apollo Hospitals Emergency Care', 'Bengaluru / Delhi', '1066', '1066', 1, 6, 12.9348, 77.6062),
        ('Max Super Speciality Hospital (Neuro Emergency)', 'New Delhi', '011-26515050', '011-40554055', 1, 4, 28.5284, 77.2119),
        ('NIMHANS Neuro Emergency Unit', 'Bengaluru', '080-26995000', '080-26995555', 1, 8, 12.9416, 77.5971)
      `);
    }
  });
});

module.exports = db;
