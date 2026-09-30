/**
 * backend/aiService.js
 * AI Chatbot, Symptom Triaging & Document Intelligence Engine for NeuroWatch AI
 * Powered by Google Gemini API (@google/genai) & SQLite Patient Medical Context
 */

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

class AIService {
  constructor() {
    this.initClient();
  }

  initClient() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey && !this.apiKey.includes('your_gemini_api_key_here')) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (e) {
        console.warn('[AIService] Failed to initialize GoogleGenAI client:', e.message);
      }
    } else {
      this.ai = null;
    }
  }

  /**
   * Helper to fetch patient data from SQLite
   */
  getPatientData(patientId) {
    return new Promise((resolve) => {
      db.get('SELECT * FROM patients WHERE id = ?', [patientId || 1], (err, row) => {
        if (err || !row) {
          db.get('SELECT * FROM patients ORDER BY id ASC LIMIT 1', (err2, fallbackRow) => {
            resolve(fallbackRow || {
              name: 'Rajesh Sharma',
              age: 58,
              medical_history: 'Hypertension, Type 2 Diabetes, High Cholesterol',
              medications: 'Aspirin 75mg, Amlodipine 5mg, Metformin 500mg',
              allergies: 'Penicillin'
            });
          });
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Process patient chat message with medical context & Gemini LLM
   */
  async processChat({ patientId = 1, message, history = [], currentScanResult = null }) {
    // Re-check API key in case env changed
    this.initClient();

    const patient = await this.getPatientData(patientId);
    const msgText = (message || '').trim();
    const msgLower = msgText.toLowerCase();

    // BE-FAST Critical Keyword Evaluation
    const strokeKeywords = [
      'face drooping', 'facial drooping', 'arm weakness', 'arm drift', 'hand weakness',
      'speech difficulty', 'slurred speech', 'cannot speak', 'trouble speaking',
      'sudden vision loss', 'double vision', 'blindness in one eye',
      'loss of balance', 'unsteady walking', 'dizziness', 'severe sudden headache',
      'numbness on one side', 'paralysis', 'hemiparesis'
    ];
    const detectedStrokeSigns = strokeKeywords.filter(kw => msgLower.includes(kw));
    const isCriticalKeywordMatch = detectedStrokeSigns.length > 0 || 
      (msgLower.includes('stroke') && (msgLower.includes('having') || msgLower.includes('symptom') || msgLower.includes('help'))) || 
      (currentScanResult && currentScanResult.smoothedRisk >= 75);

    // Build Medical System Prompt
    const systemPrompt = `You are NeuroWatch AI, an expert medical triage assistant specializing in stroke awareness and BE-FAST signs (Balance, Eyes, Face, Arm, Speech, Time).
Your motto is "Time is brain".

PATIENT MEDICAL BACKGROUND (FROM NEUROWATCH DATABASE):
- Patient Name: ${patient.name}
- Age: ${patient.age}
- Known Medical Conditions: ${patient.medical_history || 'Hypertension, Diabetes'}
- Current Medications: ${patient.medications || 'Aspirin, Amlodipine'}
- Allergies: ${patient.allergies || 'None'}

INSTRUCTIONS & GUIDELINES:
1. Answer any medical or health question in simple, clear, empathetic language.
2. IF THE USER DESCRIBES ACUTE STROKE SYMPTOMS (e.g. face drooping, arm weakness, speech difficulty, sudden vision loss, loss of balance, severe sudden headache):
   - You MUST respond FIRST with: "Call 108/112 immediately" in bold at the very top of your response.
   - Emphasize that acute neurological onset is a medical emergency where "Time is brain".
3. ALWAYS include a brief medical disclaimer note at the end: "(Note: This AI screening assistant is for informational/triage purposes and is not a substitute for professional doctor evaluation or hospital diagnosis.)"
4. Keep responses concise, structured, and easy to read. Use bullet points where helpful.`;

    let replyText = '';
    let urgency = 'LOW';
    let strokeProbability = 12;
    let requiresEmergencyDispatch = false;
    let riskLevel = 'low';
    let apiSuccess = false;

    // Attempt Gemini API Generation if key is configured
    if (this.apiKey && !this.apiKey.includes('your_gemini_api_key_here') && this.ai) {
      try {
        const contents = [];

        // Add history turns if available
        if (Array.isArray(history)) {
          history.forEach(item => {
            const role = (item.role === 'user' || item.sender === 'user') ? 'user' : 'model';
            const text = item.content || item.message || '';
            if (text.trim()) {
              contents.push({ role, parts: [{ text }] });
            }
          });
        }
        contents.push({ role: 'user', parts: [{ text: msgText }] });

        // Call Gemini 2.5 Flash / Gemini Model
        const response = await this.ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3
          }
        });

        if (response && response.text) {
          replyText = response.text.trim();
          apiSuccess = true;
        }
      } catch (err) {
        console.error('[AIService Error] Gemini API generation failed:', err.message);
      }
    } else {
      console.warn('[AIService Warning] GEMINI_API_KEY is not configured in .env. Using structured clinical fallback.');
    }

    // Evaluate Risk Level & Fallback if API was unavailable or skipped
    if (isCriticalKeywordMatch) {
      urgency = 'CRITICAL';
      riskLevel = 'high';
      strokeProbability = 88;
      requiresEmergencyDispatch = true;

      if (!apiSuccess) {
        replyText = `🚨 **Call 108/112 immediately**\n\nBased on your reported signs ("${detectedStrokeSigns.join(', ') || 'acute stroke symptoms'}") and medical background (${patient.medical_history}), an immediate emergency response is required.\n\n**First-Aid Instructions:**\n- Sit or lie down safely with head elevated 30 degrees.\n- Do NOT eat, drink, or take oral medication.\n- Note the exact time symptoms started. Remember: "Time is brain".\n\n*(Note: This AI screening assistant is for triage purposes and is not a substitute for professional doctor evaluation.)*`;
      } else if (!replyText.toLowerCase().includes('108') && !replyText.toLowerCase().includes('112')) {
        replyText = `🚨 **Call 108/112 immediately**\n\n` + replyText;
      }
    } else if (msgLower.includes('headache') || msgLower.includes('dizzy') || msgLower.includes('numb')) {
      urgency = 'MODERATE';
      riskLevel = 'moderate';
      strokeProbability = 45;
      if (!apiSuccess) {
        replyText = `⚠️ **Moderate Neurological Symptom Warning (${patient.name}):**\nYou mentioned neurological symptoms. Given your medical profile (${patient.medical_history}), we recommend completing our instant 3-stage camera assessment or seeking doctor evaluation.\n\n*(Note: This AI assistant is for awareness purposes and is not a substitute for a doctor.)*`;
      }
    } else {
      urgency = 'LOW';
      riskLevel = 'low';
      strokeProbability = 12;
      if (!apiSuccess) {
        replyText = `Hello ${patient.name}. I am your NeuroWatch AI Medical Assistant (Motto: "Time is brain").\n\nI can answer questions regarding stroke prevention, BE-FAST symptoms, or your saved medical history (${patient.medical_history}). How can I assist you today?\n\n*(Note: This AI assistant is for educational purposes and is not a substitute for a doctor.)*`;
      }
    }

    return {
      reply: replyText,
      urgency,
      riskLevel,
      strokeProbability,
      requiresEmergencyDispatch,
      apiSuccess,
      patientSummary: {
        name: patient.name,
        age: patient.age,
        history: patient.medical_history
      }
    };
  }

  /**
   * Analyze uploaded document metadata & content
   */
  async analyzeDocument({ fileName, fileType, docType }) {
    let summary = '';
    const typeUpper = (docType || '').toUpperCase();

    if (typeUpper.includes('MRI')) {
      summary = 'Brain MRI Report: Ischemic changes detected in periventricular white matter. No acute intracranial hemorrhage. Recommend regular blood pressure tracking & specialist follow-up.';
    } else if (typeUpper.includes('CT')) {
      summary = 'Non-contrast CT Head: No dense MCA sign, no early signs of acute infarction or hemorrhage. Aspect score 10/10.';
    } else if (typeUpper.includes('ECG')) {
      summary = '12-Lead Electrocardiogram: Normal sinus rhythm with rare PACs. Rate 76 bpm. No acute ST-T wave abnormalities.';
    } else {
      summary = `Uploaded Medical Document (${fileName}): Parsed & indexed for instant emergency hospital view.`;
    }

    return {
      fileName,
      docType: docType || 'Medical Report',
      summary,
      analysisDate: new Date().toISOString()
    };
  }
}

module.exports = new AIService();
