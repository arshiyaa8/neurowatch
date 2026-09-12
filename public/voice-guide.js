/**
 * voice-guide.js
 * ------------------------------------------------------------------
 * Drop-in voice bot for NeuroWatch's FAST bystander screen.
 * On-device Web Speech API.
 * ------------------------------------------------------------------
 */

const VoiceGuide = (() => {
  const synth = window.speechSynthesis;
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  let recognizer = null;
  let listening = false;
  let currentStep = null;
  const stepOrder = ['face', 'arm', 'speech', 'time'];

  const STEP_PROMPTS = {
    face: "Checking your face now. Hold still and look straight at the camera.",
    arm: "Now checking your arms. Raise both arms out in front of you, palms up.",
    speech: "Now checking your speech. Say a short sentence clearly when prompted.",
    time: "If anything looked wrong, note the time symptoms started, and call for help now."
  };

  const RESULT_PHRASES = {
    ok: "looks normal",
    normal: "looks normal",
    unclear: "was unclear — worth checking again",
  };

  function phraseFor(result) {
    if (!result) return "could not be checked";
    const key = String(result).toLowerCase();
    return RESULT_PHRASES[key] || result;
  }

  function say(text, { onEnd } = {}) {
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.pitch = 1.0;
    utter.onend = onEnd || null;
    synth.speak(utter);
  }

  function startListening() {
    if (!SpeechRecognition || listening) return;
    try {
      recognizer = new SpeechRecognition();
      recognizer.continuous = true;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const heard = last[0].transcript.trim().toLowerCase();
        handleCommand(heard);
      };

      recognizer.onerror = () => {};
      recognizer.onend = () => {
        if (listening) recognizer.start();
      };

      listening = true;
      recognizer.start();
    } catch (e) {
      console.warn("Speech recognition not initialized:", e);
    }
  }

  function stopListening() {
    listening = false;
    if (recognizer) {
      try { recognizer.stop(); } catch(e){}
    }
  }

  function handleCommand(heard) {
    if (heard.includes('call') && (heard.includes('emergency') || heard.includes('108') || heard.includes('911') || heard.includes('help'))) {
      say("Calling emergency services now.");
      VoiceGuide.onEmergencyCommand && VoiceGuide.onEmergencyCommand();
      return;
    }
    if (heard.includes('repeat')) {
      if (currentStep) say(STEP_PROMPTS[currentStep]);
      return;
    }
    if (heard.includes('next') || heard.includes('skip')) {
      VoiceGuide.onNextCommand && VoiceGuide.onNextCommand(currentStep);
      return;
    }
  }

  return {
    start() {
      say(
        "Starting the screen. I'll talk you through each step. " +
        "Say 'repeat' any time, or 'call emergency' if you need to stop and call for help.",
        { onEnd: () => startListening() }
      );
    },

    announceStep(step) {
      currentStep = step;
      if (STEP_PROMPTS[step]) say(STEP_PROMPTS[step]);
    },

    reportStep(step, result) {
      const idx = stepOrder.indexOf(step);
      const isLast = idx === stepOrder.length - 1;
      const phrase = `${step} ${phraseFor(result)}.`;
      say(phrase, {
        onEnd: () => {
          if (!isLast) {
            const next = stepOrder[idx + 1];
            this.announceStep(next);
          }
        }
      });
    },

    finish(summary) {
      stopListening();
      const anyFlag = Object.values(summary).some(
        (r) => r && !['ok', 'normal'].includes(String(r).toLowerCase())
      );
      const verdict = anyFlag
        ? "Something looked off. Treat this as an emergency, note the time, and call for help now."
        : "No signs stood out, but a clear result never rules out a stroke. If in doubt, call anyway.";
      say(`Screen complete. ${verdict}`);
    },

    speak(text) {
      say(text);
    },

    stop() {
      stopListening();
      if (synth) synth.cancel();
    },

    onEmergencyCommand: null,
    onNextCommand: null,
  };
})();
