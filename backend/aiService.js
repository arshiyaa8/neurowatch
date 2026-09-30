/**
 * backend/aiService.js
 * AI Chatbot, Symptom Triaging & Document Intelligence Engine for NeuroWatch AI
 * Powered by Google Gemini API (@google/genai) & SQLite Patient Medical Context
 *
 * Setup:
 *   1. npm install @google/genai dotenv
 *   2. Create a file named .env in the PROJECT ROOT (next to package.json):
 *        GEMINI_API_KEY=your_real_key_here
 *      (no quotes, no spaces around =)
 *   3. Restart the server after editing .env
 */

const path = require('path');
// Always load .env from the project root, no matter where the server is started from
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { GoogleGenAI } = require('@google/genai');
const db = require('./db');

// Models are tried in order. You can override the first one with GEMINI_MODEL in .env
const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest'
].filter(Boolean);

const DISCLAIMER =
  '(Note: This AI screening assistant is for informational/triage purposes and is not a substitute for professional doctor evaluation or hospital diagnosis.)';

class AIService {
  constructor() {
    this.ai = null;
    this.apiKey = '';
    this.initClient();
  }

  initClient() {
    this.apiKey = (process.env.GEMINI_API_KEY || '').trim();
    const isPlaceholder = !this.apiKey || this.apiKey.includes('your_gemini_api_key_here');

    if (isPlaceholder) {
      this.ai = null;
      return;
    }

    try {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } catch (e) {
      this.ai = null;
      console.warn('[AIService] Failed to initialize GoogleGenAI client:', e.message);
    }
  }

  /**
   * Fetch patient data from SQLite (with safe fallbacks)
   */
  getPatientData(patientId) {
    const demoPatient = {
      name: 'Rajesh Sharma',
      age: 58,
      medical_history: 'Hypertension, Type 2 Diabetes, High Cholesterol',
      medications: 'Aspirin 75mg, Amlodipine 5mg, Metformin 500mg',
      allergies: 'Penicillin'
    };

    return new Promise((resolve) => {
      db.get('SELECT * FROM patients WHERE id = ?', [patientId || 1], (err, row) => {
        if (!err && row) return resolve(row);

        db.get('SELECT * FROM patients ORDER BY id ASC LIMIT 1', (err2, fallbackRow) => {
          resolve(!err2 && fallbackRow ? fallbackRow : demoPatient);
        });
      });
    });
  }

  /**
   * Convert chat history into a format Gemini accepts:
   *  - roles must be 'user' or 'model'
   *  - must start with a 'user' turn (drops the bot's opening greeting)
   *  - consecutive turns from the same role are merged
   */
  buildContents(history, msgText) {
    const turns = [];

    if (Array.isArray(history)) {
      history.forEach((item) => {
        const isUser = item.role === 'user' || item.sender === 'user';
        const text = String(item.content || item.message || item.text || '').trim();
        if (!text) return;
        turns.push({ role: isUser ? 'user' : 'model', text });
      });
    }

    turns.push({ role: 'user', text: msgText });

    // Drop leading model turns
    while (turns.length && turns[0].role === 'model') turns.shift();

    // Merge consecutive same-role turns
    const merged = [];
    turns.forEach((t) => {
      const last = merged[merged.length - 1];
      if (last && last.role === t.role) {
        last.text += '\n' + t.text;
      } else {
        merged.push({ ...t });
      }
    });

    return merged.map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
  }

  /**
   * Call Gemini, trying each model until one works
   */
  async callGemini(contents, systemPrompt) {
    let lastError = null;

    for (const model of MODEL_CANDIDATES) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.3
          }
        });

        const text = response && response.text ? String(response.text).trim() : '';
        if (text) return { text, model };

        lastError = new Error(`Model ${model} returned an empty response`);
      } catch (err) {
        lastError = err;
        console.error(`[AIService Error] Model "${model}" failed:`, err.message);

        const msg = String(err.message || '').toLowerCase();
        // These errors will not be fixed by switching models, so stop early
        if (msg.includes('api key') || msg.includes('permission') || msg.includes('unauthenticated')) {
          break;
        }
      }
    }

    throw lastError || new Error('Unknown Gemini error');
  }

  /**
   * Process patient chat message with medical context & Gemini LLM
   */
  async processChat({ patientId = 1, message, history = [], currentScanResult = null }) {
    // Re-check API key in case env changed
    this.initClient();

    const patient = await this.getPatientData(patientId);
    const msgText = String(message || '').trim();
    const msgLower = msgText.toLowerCase();

    if (!msgText) {
      return {
        reply: 'Please type a question or describe your symptoms.',
        urgency: 'LOW',
        riskLevel: 'low',
        strokeProbability: 0,
        requiresEmergencyDispatch: false,
        apiSuccess: false,
        apiError: 'Empty message',
        modelUsed: null,
        patientSummary: { name: patient.name, age: patient.age, history: patient.medical_history }
      };
    }

    // ---------- BE-FAST keyword evaluation ----------
    // Strong signs: any one of these is treated as an emergency
    const strongStrokeKeywords = [
      'face drooping', 'facial drooping', 'face is drooping', 'drooping face',
      'arm weakness', 'arm drift', 'weak arm', 'hand weakness',
      'speech difficulty', 'slurred speech', 'slurring', 'cannot speak', "can't speak",
      'trouble speaking', 'sudden vision loss', 'double vision', 'blindness in one eye',
      'numbness on one side', 'one side of my body', 'paralysis', 'hemiparesis',
      'severe sudden headache', 'worst headache of my life'
    ];
    // Weak signs: only urgent when combined with another sign
    const weakStrokeKeywords = ['dizziness', 'dizzy', 'loss of balance', 'unsteady walking', 'lost my balance', 'numb', 'headache'];

    const detectedStrong = strongStrokeKeywords.filter((kw) => msgLower.includes(kw));
    const detectedWeak = weakStrokeKeywords.filter((kw) => msgLower.includes(kw));

    const saysHavingStroke = /(having|had|think .*having|might be having) (a )?stroke/.test(msgLower);
    const scanIsCritical = !!(currentScanResult && Number(currentScanResult.smoothedRisk) >= 75);

    const isCritical =
      detectedStrong.length > 0 ||
      saysHavingStroke ||
      scanIsCritical ||
      detectedWeak.length >= 2;

    const isModerate = !isCritical && detectedWeak.length === 1;

    const detectedSigns = [...detectedStrong, ...(detectedWeak.length >= 2 ? detectedWeak : [])];

    // ---------- System prompt ----------
    const systemPrompt = `You are NeuroWatch AI, an expert medical triage assistant specializing in stroke awareness and BE-FAST signs (Balance, Eyes, Face, Arm, Speech, Time).
Your motto is "Time is brain".

PATIENT MEDICAL BACKGROUND (FROM NEUROWATCH DATABASE):
- Patient Name: ${patient.name}
- Age: ${patient.age}
- Known Medical Conditions: ${patient.medical_history || 'Not recorded'}
- Current Medications: ${patient.medications || 'Not recorded'}
- Allergies: ${patient.allergies || 'None recorded'}

INSTRUCTIONS & GUIDELINES:
1. Answer any medical or health question in simple, clear, empathetic language.
2. IF THE USER DESCRIBES ACUTE STROKE SYMPTOMS (e.g. face drooping, arm weakness, speech difficulty, sudden vision loss, loss of balance, severe sudden headache):
   - You MUST respond FIRST with: "**Call 108/112 immediately**" in bold at the very top of your response.
   - Emphasize that acute neurological onset is a medical emergency where "Time is brain".
3. ALWAYS include a brief medical disclaimer at the end: "${DISCLAIMER}"
4. Keep responses concise, structured, and easy to read. Use bullet points where helpful.`;

    let replyText = '';
    let apiSuccess = false;
    let apiError = null;
    let modelUsed = null;

    // ---------- Gemini call ----------
    if (!this.apiKey || !this.ai) {
      apiError = 'GEMINI_API_KEY is missing or still a placeholder. Check your .env file in the project root and restart the server.';
      console.warn('[AIService Warning]', apiError);
    } else {
      try {
        const contents = this.buildContents(history, msgText);
        const result = await this.callGemini(contents, systemPrompt);
        replyText = result.text;
        modelUsed = result.model;
        apiSuccess = true;
      } catch (err) {
        apiError = err.message;
        console.error('[AIService Error] Gemini API generation failed:', err.message);
      }
    }

    // ---------- Risk level + fallback replies ----------
    let urgency = 'LOW';
    let riskLevel = 'low';
    let strokeProbability = 12;
    let requiresEmergencyDispatch = false;

    if (isCritical) {
      urgency = 'CRITICAL';
      riskLevel = 'high';
      strokeProbability = 88;
      requiresEmergencyDispatch = true;

      if (!apiSuccess) {
        replyText =
          `🚨 **Call 108/112 immediately**\n\n` +
          `Based on your reported signs ("${detectedSigns.join(', ') || 'acute stroke symptoms'}") and medical background (${patient.medical_history}), an immediate emergency response is required.\n\n` +
          `**First-Aid Instructions:**\n` +
          `- Sit or lie down safely with head elevated 30 degrees.\n` +
          `- Do NOT eat, drink, or take oral medication.\n` +
          `- Note the exact time symptoms started. Remember: "Time is brain".\n\n` +
          `*${DISCLAIMER}*`;
      } else if (!/\b(108|112)\b/.test(replyText)) {
        replyText = `🚨 **Call 108/112 immediately**\n\n` + replyText;
      }
    } else if (isModerate) {
      urgency = 'MODERATE';
      riskLevel = 'moderate';
      strokeProbability = 45;

      if (!apiSuccess) {
        replyText =
          `⚠️ **Moderate Neurological Symptom Warning (${patient.name}):**\n` +
          `You mentioned a neurological symptom. Given your medical profile (${patient.medical_history}), we recommend completing our instant 3-stage camera assessment or seeking doctor evaluation. If symptoms get worse or new ones appear (face drooping, arm weakness, speech trouble), call 108/112 immediately.\n\n` +
          `*${DISCLAIMER}*`;
      }
    } else if (!apiSuccess) {
      replyText =
        `⚠️ The AI service is currently unavailable, so this is an automatic reply.\n\n` +
        `I can normally answer questions about stroke prevention, BE-FAST symptoms, or your saved medical history (${patient.medical_history}).\n\n` +
        `If you have any emergency symptoms, call 108/112 immediately.\n\n` +
        `*${DISCLAIMER}*`;
    }

    // Make sure the disclaimer is always present on real AI replies
    if (apiSuccess && !replyText.includes('not a substitute')) {
      replyText += `\n\n*${DISCLAIMER}*`;
    }

    return {
      reply: replyText,
      urgency,
      riskLevel,
      strokeProbability,
      requiresEmergencyDispatch,
      apiSuccess,
      apiError, // null when everything worked; otherwise the real reason
      modelUsed,
      patientSummary: {
        name: patient.name,
        age: patient.age,
        history: patient.medical_history
      }
    };
  }

  /**
   * Document handling (DEMO).
   * NOTE: This does NOT read the file contents. It only labels the document
   * based on the type the user picked, so it never claims medical findings.
   */
  async analyzeDocument({ fileName, fileType, docType }) {
    const typeUpper = String(docType || '').toUpperCase();
    let label = 'Medical Report';

    if (typeUpper.includes('MRI')) label = 'Brain MRI Report';
    else if (typeUpper.includes('CT')) label = 'CT Head Scan';
    else if (typeUpper.includes('ECG')) label = '12-Lead ECG';
    else if (docType) label = docType;

    return {
      fileName,
      fileType,
      docType: label,
      summary: `${label} ("${fileName}") uploaded and indexed for quick access by the hospital ER team. Automated content analysis has not been performed. A doctor must review the original document.`,
      isAutomatedAnalysis: false,
      analysisDate: new Date().toISOString()
    };
  }
}

module.exports = new AIService();
