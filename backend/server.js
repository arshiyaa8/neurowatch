const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const multer = require('multer');
const fs = require('fs');

const db = require('./db');
const emergencyService = require('./emergencyService');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Uploads directory setup
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// HTTP & WebSocket Server Setup
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Hospital ER Client connected.');
  ws.send(JSON.stringify({ type: 'WS_CONNECTED', message: 'Connected to NeuroWatch Hospital Alert Stream' }));
});

/* ==========================================================================
   PATIENT & PROFILE API ENDPOINTS
   ========================================================================== */

// Get Patient Profile & Saved Loved Ones
app.get('/api/patient', (req, res) => {
  db.get('SELECT * FROM patients ORDER BY id ASC LIMIT 1', (err, patient) => {
    if (err || !patient) {
      return res.status(500).json({ error: 'Failed to retrieve patient profile' });
    }
    db.all('SELECT * FROM emergency_contacts WHERE patient_id = ? ORDER BY priority ASC', [patient.id], (err, contacts) => {
      res.json({
        patient,
        emergencyContacts: contacts || []
      });
    });
  });
});

// Update Patient Profile
app.post('/api/patient', (req, res) => {
  const { name, age, phone, blood_group, medical_history, medications, allergies } = req.body;
  db.run(`
    UPDATE patients SET 
      name = ?, age = ?, phone = ?, blood_group = ?, 
      medical_history = ?, medications = ?, allergies = ?
    WHERE id = 1
  `, [name, age, phone, blood_group, medical_history, medications, allergies], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, message: 'Patient profile updated successfully' });
  });
});

// Add Emergency Contact (Loved One)
app.post('/api/patient/contact', (req, res) => {
  const { name, relation, phone, priority } = req.body;
  db.run(`
    INSERT INTO emergency_contacts (patient_id, name, relation, phone, priority)
    VALUES (1, ?, ?, ?, ?)
  `, [name, relation, phone, priority || 1], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

// Delete Emergency Contact
app.delete('/api/patient/contact/:id', (req, res) => {
  db.run('DELETE FROM emergency_contacts WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

/* ==========================================================================
   FAST CHECKS & ASSESSMENT HISTORY
   ========================================================================== */

// Get Past Checks History
app.get('/api/checks', (req, res) => {
  db.all('SELECT * FROM assessment_history ORDER BY id DESC LIMIT 50', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows || []);
  });
});

// Save New FAST Check Result
app.post('/api/checks', async (req, res) => {
  const { face_result, arm_result, speech_result, speech_transcript, stroke_probability, urgency_level, latitude, longitude } = req.body;

  const score = stroke_probability !== undefined ? stroke_probability : (face_result?.includes('asymmetry') ? 85 : 10);
  const urgency = urgency_level || (score > 50 ? 'HIGH' : 'LOW');

  db.run(`
    INSERT INTO assessment_history 
    (patient_id, face_result, arm_result, speech_result, speech_transcript, stroke_probability, urgency_level, latitude, longitude)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [face_result, arm_result, speech_result, speech_transcript, score, urgency, latitude || 28.5672, longitude || 77.2100], async function(err) {
    if (err) return res.status(500).json({ error: err.message });

    let emergencyTriggered = false;
    let emergencyPayload = null;

    // Auto-trigger emergency dispatch if stroke probability is HIGH (>50%)
    if (score >= 50) {
      emergencyPayload = await emergencyService.triggerEmergencyResponse({
        patientId: 1,
        strokeScore: score,
        latitude: latitude || 28.5672,
        longitude: longitude || 77.2100,
        customReason: `Automated BE-FAST Screening Detected Stroke Risk (${score}%)`
      }, wss);
      emergencyTriggered = true;
    }

    res.json({
      success: true,
      checkId: this.lastID,
      strokeProbability: score,
      urgency,
      emergencyTriggered,
      emergencyPayload
    });
  });
});

/* ==========================================================================
   AI CHATBOT & CLINICAL TRIAGE API
   ========================================================================== */

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, currentScanResult } = req.body;
    const aiResult = await aiService.processChat({ patientId: 1, message, currentScanResult });

    // If AI detects critical urgency, trigger emergency response
    let emergencyPayload = null;
    if (aiResult.requiresEmergencyDispatch) {
      emergencyPayload = await emergencyService.triggerEmergencyResponse({
        patientId: 1,
        strokeScore: aiResult.strokeProbability,
        latitude: 28.5672,
        longitude: 77.2100,
        customReason: `AI Chatbot Triaging Identified Acute Stroke Risk (${aiResult.strokeProbability}%)`
      }, wss);
    }

    res.json({
      reply: aiResult.reply,
      urgency: aiResult.urgency,
      strokeProbability: aiResult.strokeProbability,
      emergencyTriggered: aiResult.requiresEmergencyDispatch,
      emergencyPayload
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ==========================================================================
   MEDICAL DOCUMENTS VAULT API
   ========================================================================== */

// Get Medical Documents List
app.get('/api/documents', (req, res) => {
  db.all('SELECT * FROM medical_documents ORDER BY id DESC', (err, docs) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(docs || []);
  });
});

// Upload Medical Document
app.post('/api/documents/upload', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { doc_type } = req.body;
  const fileName = req.file.originalname;
  const filePath = '/uploads/' + req.file.filename;

  const analysis = await aiService.analyzeDocument({ fileName, docType: doc_type });

  db.run(`
    INSERT INTO medical_documents (patient_id, file_name, file_path, doc_type, summary)
    VALUES (1, ?, ?, ?, ?)
  `, [fileName, filePath, doc_type || 'Medical Report', analysis.summary], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({
      success: true,
      document: {
        id: this.lastID,
        file_name: fileName,
        file_path: filePath,
        doc_type: doc_type || 'Medical Report',
        summary: analysis.summary,
        uploaded_at: new Date().toISOString()
      }
    });
  });
});

/* ==========================================================================
   EMERGENCY DISPATCH & SOS API (108 Ambulance / Loved Ones / Hospitals)
   ========================================================================== */

app.post('/api/emergency/trigger', async (req, res) => {
  try {
    const { strokeScore, latitude, longitude, reason } = req.body;
    const emergencyPayload = await emergencyService.triggerEmergencyResponse({
      patientId: 1,
      strokeScore: strokeScore || 90,
      latitude: latitude || 28.5672,
      longitude: longitude || 77.2100,
      customReason: reason || 'Manual Emergency SOS Button Pressed'
    }, wss);

    res.json(emergencyPayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Nearby Hospitals List
app.get('/api/hospitals', (req, res) => {
  db.all('SELECT * FROM hospitals', (err, hospitals) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(hospitals || []);
  });
});

/* ==========================================================================
   HOSPITAL ER PORTAL API (B2C Access to Patient History & Incidents)
   ========================================================================== */

app.get('/api/hospital/incidents', (req, res) => {
  db.all('SELECT * FROM emergency_incidents ORDER BY id DESC', (err, incidents) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Also attach patient medical profile and documents for ER doctors
    db.get('SELECT * FROM patients WHERE id = 1', (err, patient) => {
      db.all('SELECT * FROM medical_documents WHERE patient_id = 1', (err, docs) => {
        db.all('SELECT * FROM emergency_contacts WHERE patient_id = 1', (err, contacts) => {
          res.json({
            incidents: incidents || [],
            patientRecords: {
              patient,
              documents: docs || [],
              emergencyContacts: contacts || []
            }
          });
        });
      });
    });
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  NeuroWatch AI Platform Server Running at:`);
  console.log(`  👉 http://localhost:${PORT}`);
  console.log(`  Patient Portal & Hospital ER Portal Live`);
  console.log(`=======================================================`);
});
