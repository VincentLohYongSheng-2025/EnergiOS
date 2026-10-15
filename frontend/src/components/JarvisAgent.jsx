import React, { useState, useEffect, useRef } from 'react';
import { TOWNSHIP_SUMMARY, BUILDINGS_DATA, TNB_TARIFF } from '../data/townshipData';

export default function JarvisAgent({
  selectedBuildingId,
  selectedFloorId,
  onSelectBuilding,
  onSelectFloor,
  onResetView,
  isNightMode,
  setIsNightMode,
  showEnergyFlow,
  setShowEnergyFlow,
  wireframeMode,
  setWireframeMode
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTouring, setIsTouring] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'jarvis',
      text: 'Good day. I am J.A.R.V.I.S., your EnergiOS Township Core Intelligence. I have full supervisory control over microgrid telemetry, 3D spatial navigation, building substations, and anomaly triage. What would you like me to execute?',
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef(null);
  const tourTimeoutRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech synthesis helper
  const speakText = (text) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#]/g, '').replace(/tCO₂e/g, 'tonnes of C O 2 equivalent');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Jarvis Command Execution Engine
  const executeCommand = (rawText) => {
    const text = rawText.toLowerCase().trim();
    let reply = '';
    let actionExecuted = false;

    // 1. Township Guided Tour
    if (text.includes('tour') || text.includes('walkthrough') || text.includes('show around')) {
      startGuidedTour();
      reply = "Initiating the autonomous 3D guided township tour. Sit back as I inspect the solar farm, BESS storage substation, and commercial towers.";
      actionExecuted = true;
    }
    // Floor level commands
    else if (text.includes('view all floors') || text.includes('all floors')) {
      onSelectFloor(null);
      reply = "Returning camera to the exploded building stack view. All floor levels are visible.";
      actionExecuted = true;
    }
    else if (text.includes('roof') || text.includes('solar')) {
      onSelectFloor('roof');
      reply = "Swooping camera into the Rooftop Solar PV & Chiller Plant level. Displaying array telemetry and HVAC cooling towers.";
      actionExecuted = true;
    }
    else if (text.includes('level 3') || text.includes('floor 3') || text.includes('l3')) {
      onSelectFloor('l3');
      reply = "Zooming directly onto Level 3. Inspecting VAV terminal units and executive daylight harvesting lighting circuits.";
      actionExecuted = true;
    }
    else if (text.includes('level 2') || text.includes('floor 2') || text.includes('l2')) {
      onSelectFloor('l2');
      reply = "Focusing directly on Level 2 interior floor plate. Revealing office zones, AHU-04 mechanical enclosure, and sensor telemetry.";
      actionExecuted = true;
    }
    else if (text.includes('level 1') || text.includes('floor 1') || text.includes('l1')) {
      onSelectFloor('l1');
      reply = "Zooming onto Level 1. Displaying retail boutiques, tenant submeters, and lighting circuits.";
      actionExecuted = true;
    }
    else if (text.includes('ground') || text.includes('concourse') || text.includes('lobby')) {
      onSelectFloor('g');
      reply = "Focusing onto Ground Concourse & F&B Promenade. Showing entrance air curtain and main service switchboards.";
      actionExecuted = true;
    }
    // 1b. Air Conditioning & HVAC System Inspection
    else if (text.includes('air cond') || text.includes('aircond') || text.includes('ac') || text.includes('hvac') || text.includes('cooling') || text.includes('ventilation') || text.includes('diffuser') || text.includes('duct')) {
      onSelectBuilding('commercial-mall');
      onSelectFloor('l2');
      reply = "Zooming directly into Commercial Mall Level 2 to inspect the Smart Air Conditioning (AHU) system. Overhead galvanized ducts, 4-way ceiling diffusers, chilled water supply (6.8°C), and active cooling airflow are simulated in real-time.";
      actionExecuted = true;
    }
    // 2. Navigation to Commercial Mall (Bull Tower)
    else if (text.includes('mall') || text.includes('bull') || text.includes('commercial')) {
      onSelectBuilding('commercial-mall');
      reply = "Focusing 3D camera on Commercial Mall (Bull Tower). Multi-level floor stack exploded. Click any floor to inspect its interior layout and telemetry.";
      actionExecuted = true;
    }
    // 3. Navigation to Innovation Hub (Bear Complex)
    else if (text.includes('innovation') || text.includes('bear') || text.includes('lab') || text.includes('cleantech')) {
      onSelectBuilding('innovation-hub');
      reply = "Focusing 3D camera on CleanTech Innovation Hub (Bear Complex). Click any floor level to inspect cleanrooms and R&D computing loads.";
      actionExecuted = true;
    }
    // 4. Navigation to Community Center (Fox Hub)
    else if (text.includes('community') || text.includes('fox') || text.includes('culture') || text.includes('civic')) {
      onSelectBuilding('community-center');
      reply = "Focusing 3D camera on Township Community Hub (Fox Center). Inspecting civic auditorium and rooftop solar pergola.";
      actionExecuted = true;
    }
    // 5. Navigation to Sports Arena (Hog Hall)
    else if (text.includes('sport') || text.includes('arena') || text.includes('hog') || text.includes('pool') || text.includes('aquatic')) {
      onSelectBuilding('sports-arena');
      reply = "Focusing 3D camera on Township Sports & Aquatic Arena (Hog Hall). Olympic pool filtration and court lighting active.";
      actionExecuted = true;
    }
    // 6. Reset / Return to Township
    else if (text.includes('reset') || text.includes('township') || text.includes('overview') || text.includes('zoom out') || text.includes('macro')) {
      onResetView();
      reply = "Resetting 3D camera to Township Aerial Macro view. All 4 commercial sectors and municipal assets are synchronized.";
      actionExecuted = true;
    }
    // 7. Day / Night mode
    else if (text.includes('night') || text.includes('dark')) {
      setIsNightMode(true);
      reply = "Switching scene to Night Telemetry mode. Ambient lighting dimmed; building beacons and luminaire accents illuminated.";
      actionExecuted = true;
    } else if (text.includes('day') || text.includes('bright') || text.includes('light')) {
      setIsNightMode(false);
      reply = "Restoring Natural Daylight environment. Directional solar angles aligned to 840 W/m² irradiance.";
      actionExecuted = true;
    }
    // 8. Wireframe / X-Ray Mode
    else if (text.includes('wireframe') || text.includes('x-ray') || text.includes('xray')) {
      setWireframeMode(!wireframeMode);
      reply = `Wireframe architectural mode ${!wireframeMode ? 'engaged' : 'disengaged'}.`;
      actionExecuted = true;
    }
    // 9. Energy Flow Lines
    else if (text.includes('conduit') || text.includes('flow') || text.includes('lines') || text.includes('electricity flow')) {
      setShowEnergyFlow(!showEnergyFlow);
      reply = `Energy flow conduit telemetry ${!showEnergyFlow ? 'activated' : 'hidden'}.`;
      actionExecuted = true;
    }
    // 10. Query: Total Energy Consumed
    else if (text.includes('total energy') || text.includes('how much energy') || text.includes('consumption')) {
      reply = `Total township energy consumed today is ${TOWNSHIP_SUMMARY.totalEnergyUsedKwh.toLocaleString()} kWh (${TOWNSHIP_SUMMARY.totalEnergyUsedMwh} MWh). Our on-site solar generated ${TOWNSHIP_SUMMARY.solarGenMwh} MWh, achieving a 49.3% clean self-sufficiency ratio.`;
    }
    // 11. Query: Electricity Bill & Cost
    else if (text.includes('cost') || text.includes('bill') || text.includes('tariff') || text.includes('money') || text.includes('rm')) {
      reply = `Estimated electricity cost today is RM ${TOWNSHIP_SUMMARY.totalCostMyr.toLocaleString(undefined, { minimumFractionDigits: 2 })} under TNB Commercial C1 tariff. We have avoided RM ${TOWNSHIP_SUMMARY.costAvoidedMyr.toLocaleString(undefined, { minimumFractionDigits: 2 })} through BESS storage and solar peak shaving.`;
    }
    // 12. Query: Carbon Emissions & ESG
    else if (text.includes('carbon') || text.includes('emission') || text.includes('co2') || text.includes('gbi')) {
      reply = `Township Scope 2 carbon emissions are currently ${TOWNSHIP_SUMMARY.totalCarbonTonnes} tonnes CO₂e (based on Peninsular Malaysia factor of 0.658 kg/kWh). Clean solar generation has offset 7.30 tonnes of CO₂ today.`;
    }
    // 13. Query: Anomalies & Alerts
    else if (text.includes('anomaly') || text.includes('alert') || text.includes('issue') || text.includes('spike')) {
      reply = "There are currently 3 detected anomalies in the triage log: 1) Bull Tower AHU-04 (+61.7% surge at 02:00), 2) Bear Complex Chiller-02 short-cycling (+32.6%), 3) Hog Hall Arena lighting drift (+26.1%). Would you like me to inspect Bull Tower?";
    }
    // 14. BESS Storage Status
    else if (text.includes('battery') || text.includes('bess') || text.includes('storage') || text.includes('soc')) {
      reply = `Township BESS Substation is at ${TOWNSHIP_SUMMARY.bessSocPercent}% State of Charge (${TOWNSHIP_SUMMARY.bessStoredMwh} MWh stored in 5.0 MWh capacity). Prepared to discharge 2.5 MW during the 13:30–17:00 TNB Peak Tariff window.`;
    }
    // Default fallback
    else {
      reply = `Command received: "${rawText}". I have analyzed our microgrid telemetry. You can ask me to navigate to any building ("Zoom to Mall", "Show Innovation Hub"), switch environments ("Night Mode"), or inspect metrics ("Total Cost", "Explain Anomalies").`;
    }

    // Add user message & Jarvis reply
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: rawText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const jarvisMsg = {
      id: (Date.now() + 1).toString(),
      sender: 'jarvis',
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg, jarvisMsg]);
    speakText(reply);
  };

  // Autonomous Guided 3D Tour
  const startGuidedTour = () => {
    setIsTouring(true);
    if (tourTimeoutRef.current) clearTimeout(tourTimeoutRef.current);

    // Step 1: Aerial Overview
    onResetView();

    // Step 2: Commercial Mall
    tourTimeoutRef.current = setTimeout(() => {
      onSelectBuilding('commercial-mall');
      onSelectFloor('roof');

      // Step 3: Innovation Hub
      tourTimeoutRef.current = setTimeout(() => {
        onSelectBuilding('innovation-hub');
        onSelectFloor('l2');

        // Step 4: Sports Arena
        tourTimeoutRef.current = setTimeout(() => {
          onSelectBuilding('sports-arena');
          onSelectFloor('g');

          // Step 5: Return Home
          tourTimeoutRef.current = setTimeout(() => {
            onResetView();
            setIsTouring(false);
          }, 4500);
        }, 4500);
      }, 4500);
    }, 2500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    executeCommand(inputVal);
    setInputVal('');
  };

  return (
    <>
      {/* Floating J.A.R.V.I.S. Orb / Button (Bottom-Right or Top-Right) */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 pointer-events-auto">
        {!isOpen && (
          <div className="glass-panel px-3 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-mono text-slate-800 hidden md:flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>J.A.R.V.I.S. Ready</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl relative group cursor-pointer ${
            isOpen
              ? 'bg-slate-900 text-white scale-105'
              : 'bg-emerald-700 text-white hover:bg-emerald-600 hover:scale-110'
          }`}
          title="Open J.A.R.V.I.S. AI Control Center"
          type="button"
        >
          {/* Animated pulsing outer halo */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-75"></span>

          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <span className="material-symbols-outlined text-[26px]">close</span>
            ) : (
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            )}
          </div>
        </button>
      </div>

      {/* J.A.R.V.I.S. Full-Featured Control Console Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[94vw] sm:w-[450px] max-h-[82vh] z-50 glass-panel rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col font-sans transition-all animate-in zoom-in-95 duration-200 pointer-events-auto">
          {/* Header Bar */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-sm tracking-wide text-white">
                    J.A.R.V.I.S. Core
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500 text-slate-950">
                    SUPERVISORY AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Full 3D & Telemetry Control Interface
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Voice Readout Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  isVoiceEnabled ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isVoiceEnabled ? "Mute Voice Readout" : "Enable Voice Readout"}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isVoiceEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          </div>

          {/* Hologram Soundwave / Activity Status Strip */}
          <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>SCADA & 3D Bus: ONLINE</span>
            </div>
            {isTouring && (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                Tour in Progress
              </span>
            )}
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px] bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'jarvis' && (
                  <div className="w-6 h-6 rounded-md bg-slate-900 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 text-[11px] font-bold">
                    J
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white font-medium'
                      : 'bg-white border border-slate-200 text-slate-800'
                  }`}
                >
                  <p>{m.text}</p>
                  <span className={`block text-[9px] mt-1 text-right font-mono ${
                    m.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice / Control Action Chips */}
          <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {[
              { label: '🚀 Tour Township', cmd: 'Tour the township' },
              { label: '❄️ Inspect Air Cond', cmd: 'Inspect air conditioning system' },
              { label: '🏢 Zoom Bull Mall', cmd: 'Zoom to Commercial Mall' },
              { label: '🔬 Innovation Hub', cmd: 'Go to Innovation Hub' },
              { label: '💰 Check Bill', cmd: 'What is our electricity bill?' },
              { label: '⚠️ Active Anomalies', cmd: 'Show active anomalies' },
              { label: '🌙 Night Mode', cmd: 'Switch to night mode' },
              { label: '☀️ Day Mode', cmd: 'Switch to day mode' },
              { label: '🌐 Reset View', cmd: 'Reset to township overview' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => executeCommand(chip.cmd)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all shrink-0 cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Command Input Form */}
          <form
            onSubmit={handleSend}
            className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask Jarvis to zoom, inspect, or explain..."
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <button
              type="submit"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
            >
              <span>Execute</span>
              <span className="material-symbols-outlined text-[15px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
