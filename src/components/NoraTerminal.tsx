import { useState } from "react";
import { Shield, Sparkles, Terminal as TerminalIcon, AlertTriangle, Cpu, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserRegistry, CapsuleDiagnostics } from "../types";

export function NoraTerminal() {
  const [registry, setRegistry] = useState<UserRegistry>({
    fullName: "",
    age: 28,
    region: "Sector-4 (Neo-Metropolis EU)",
    registryId: "NORA-7809-B2",
    bloodType: "O-Positive"
  });

  const [empathySlider, setEmpathySlider] = useState<number>(12); // Low empathy is clean corporate standard
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [calibrationLog, setCalibrationLog] = useState<string[]>([]);
  const [diagnostics, setDiagnostics] = useState<CapsuleDiagnostics | null>(null);

  const startCalibration = () => {
    setIsCalibrating(true);
    setDiagnostics(null);
    setCalibrationLog([]);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const randomId = "NORA-" + Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("") + "-" + Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
    
    setRegistry(prev => ({ ...prev, registryId: randomId }));

    const logs = [
      "Accessing global biometric databases...",
      "Validating NORA citizen food ration ID...",
      `Scanning DNA Sequence match for Blood Type [ ${registry.bloodType} ]...`,
      "Calibrating macro-nutrient synthesizers...",
      "Analyzing neural empathy levels: Standard suppression bounds specified...",
      "Synthesizing customized molecular compound ratios...",
      "Capsule compilation successful. Authorized dosage certified."
    ];

    logs.forEach((logText, index) => {
      setTimeout(() => {
        setCalibrationLog(prev => [...prev, logText]);
        if (index === logs.length - 1) {
          setIsCalibrating(false);
          // Calculate customized values based on user's input
          const customCompliance = (100 - empathySlider * 0.4).toFixed(2);
          const customSynthetics = (75 + registry.age * 0.2).toFixed(2);
          const suppressorAdjust = (empathySlider * 0.08).toString();
          setDiagnostics({
            dosage: `${(registry.age > 45 ? 1.5 : 1.0)} Capsule per 24 hours`,
            complianceRating: `${customCompliance}% State Obedience Alignment`,
            syntheticNutrients: `${customSynthetics}% Macro-Purified Soy & Hydrate Core`,
            flavorSuppressors: "Active (99.98% Olfactory Deletions)",
            empathyRegulators: `${(0.40 - empathySlider * 0.0035).toFixed(3)}mg Empathy Inhibitor`,
            sedativeLevel: `${(0.05 + empathySlider * 0.002).toFixed(3)}mg Serotonin-Stabilizer`
          });
        }
      }, (index + 1) * 700);
    });
  };

  return (
    <div className="glass col-glow rounded-2xl p-6 md:p-8 font-mono select-none relative overflow-hidden" id="nora_biometric_terminal">
      {/* Decorative cyber grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none opacity-40"></div>

      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <TerminalIcon className="text-white/60 w-4 h-4 animate-pulse" id="terminal_icon_active" />
          <h3 className="text-xs uppercase font-extrabold text-white/70 tracking-widest">
            NORA Core Biometric Calibrator // SYSTEM v4.9
          </h3>
        </div>
        <div className="status-pill bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-widest text-[9px] flex items-center gap-1.5 px-3 py-1">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          RESTRICTED CITIZEN PORTAL
        </div>
      </div>

      <div className="grid md:grid-cols-12 gap-8 relative z-10">
        {/* Left Side: Biometric Registration Input Form */}
        <div className="md:col-span-6 flex flex-col gap-5">
          <h4 className="text-xs font-bold text-white/50 border-b border-white/5 pb-2 flex items-center gap-2 tracking-[0.15em] uppercase">
            <Cpu className="w-4 h-4 text-white/40" /> 1. CITIZEN METRICS INPUT
          </h4>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase text-white/40 font-bold tracking-wider">Citizen Full Name</label>
            <input
              type="text"
              placeholder="e.g. CLARA V-809"
              value={registry.fullName}
              onChange={(e) => setRegistry({ ...registry, fullName: e.target.value })}
              className="bg-white/[0.03] border border-white/10 py-2.5 px-3.5 text-xs text-white placeholder-white/20 rounded-lg focus:outline-none focus:border-white/30 transition-all font-sans"
              id="terminal_input_name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-white/40 font-bold tracking-wider">Target Age (yrs)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={registry.age}
                onChange={(e) => setRegistry({ ...registry, age: Number(e.target.value) })}
                className="bg-white/[0.03] border border-white/10 py-2.5 px-3 text-xs text-white rounded-lg focus:outline-none focus:border-white/30 transition-all font-sans"
                id="terminal_input_age"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] uppercase text-white/40 font-bold tracking-wider">Blood Type Code</label>
              <select
                value={registry.bloodType}
                onChange={(e) => setRegistry({ ...registry, bloodType: e.target.value })}
                className="bg-white/[0.03] border border-white/10 py-2.5 px-2.5 text-xs text-white rounded-lg focus:outline-none focus:border-white/30 cursor-pointer transition-all font-sans"
                id="terminal_input_blood"
              >
                <option value="A-Positive" className="bg-neutral-900">A-Positive (H1-Match)</option>
                <option value="B-Negative" className="bg-neutral-900">B-Negative (Arid-Ref)</option>
                <option value="AB-Positive" className="bg-neutral-900">AB-Positive (Clinical-A)</option>
                <option value="O-Positive" className="bg-neutral-900">O-Positive (Universal)</option>
                <option value="O-Negative" className="bg-neutral-900">O-Negative (Pure-Core)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] uppercase text-white/40 font-bold tracking-wider">Geographic Sector Code</label>
            <input
              type="text"
              value={registry.region}
              onChange={(e) => setRegistry({ ...registry, region: e.target.value })}
              className="bg-white/[0.03] border border-white/10 py-2.5 px-3.5 text-xs text-white rounded-lg focus:outline-none focus:border-white/30 transition-all font-sans"
              id="terminal_input_sector"
            />
          </div>

          <div className="flex flex-col gap-2 mt-2 bg-white/[0.01] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase text-white/50 font-bold tracking-wider flex items-center gap-1">
                Raw Empathy Resistance Index
              </span>
              <span className={`text-xs font-bold ${empathySlider > 50 ? 'text-orange-400 font-bold' : 'text-blue-400'}`}>
                {empathySlider}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={empathySlider}
              onChange={(e) => setEmpathySlider(Number(e.target.value))}
              className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
              id="terminal_input_empathy"
            />
            <div className="flex items-center justify-between text-[8px] text-white/20 font-bold tracking-widest mt-1">
              <span>0% COMPLIANT METRIC</span>
              <span>100% UNREGULATED EMOTION</span>
            </div>
          </div>

          <button
            onClick={startCalibration}
            disabled={isCalibrating}
            className={`w-full relative py-3 rounded-lg text-xs font-extrabold uppercase tracking-[0.14em] flex items-center justify-center gap-2 border transition-all duration-300 shadow-2xl ${
              isCalibrating
                ? "bg-white/5 border-white/10 text-white/40 cursor-wait"
                : "bg-white text-black border-white hover:bg-neutral-200 cursor-pointer active:scale-[0.98]"
            }`}
            id="terminal_btn_calibrate"
          >
            {isCalibrating ? (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-200"></span>
                CALIBRATING CAPSULE CHEMISTRY...
              </div>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                CALIBRATE PERSONAL NORA CAPSULE
              </>
            )}
          </button>
        </div>

        {/* Right Side: Virtual Screen / Visual Dystopian Logs and Reveal */}
        <div className="md:col-span-6 flex flex-col bg-black/40 border border-white/5 rounded-2xl p-5 relative min-h-[300px] cold-glow">
          <div className="absolute top-3 right-3 text-[8px] text-white/20 tracking-[0.2em] font-extrabold">MONITOR // #01-A</div>
          
          {/* Scanning/Calibration Screen Atmosphere */}
          {!isCalibrating && !diagnostics && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 gap-4">
              <div className="w-14 h-14 rounded-full border border-white/15 flex items-center justify-center bg-white/[0.01] text-white/40 relative">
                <HelpCircle className="w-5 h-5 text-white/20" />
                <div className="absolute inset-0 rounded-full border-b border-white/40 animate-[spin_3s_linear_infinite]"></div>
              </div>
              <p className="text-xs max-w-xs font-medium leading-relaxed font-sans text-white/50">
                Enter your physical metrics on the left and trigger compilation to review capsule chemical analysis.
              </p>
              <p className="text-[10px] text-white/20 leading-relaxed border-t border-white/5 pt-4 font-sans italic">
                "According to Section 4.19, all citizens are required to subject capsule chemistry to daily centralized calibration."
              </p>
            </div>
          )}

          {/* Calibrating Progress Log */}
          {isCalibrating && (
            <div className="flex-1 flex flex-col justify-end text-left font-mono text-[11px] text-white/60 py-3 gap-2 overflow-hidden">
              <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-2">
                {calibrationLog.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="text-white/20">&gt;</span>
                    <span className="text-white/80">{log}</span>
                  </motion.div>
                ))}
              </div>
              <div className="h-5 flex items-center gap-1 pt-2 border-t border-white/5 text-white/30 text-[10px]">
                <span className="animate-pulse">_</span> LOADING NORA DATA STREAMS...
              </div>
            </div>
          )}

          {/* Diagnostic Outputs (The Climax Reveal) */}
          <AnimatePresence>
            {!isCalibrating && diagnostics && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col gap-4 text-xs select-text justify-between"
              >
                <div className="flex flex-col gap-3">
                  <div className="bg-white/5 border border-white/10 py-2 px-3.5 rounded-xl flex items-center justify-between text-white/80">
                    <span className="flex items-center gap-1.5 font-extrabold text-[10px] tracking-wider uppercase text-white/60">
                      <Sparkles className="w-3.5 h-3.5 text-orange-400" /> CALIBRATION CERTIFIED
                    </span>
                    <span className="text-[9px] font-mono tracking-widest text-white/40 bg-white/5 py-0.5 px-2.5 border border-white/5 rounded">
                      {registry.registryId}
                    </span>
                  </div>

                  {/* Citizen Header Metadata */}
                  <div className="grid grid-cols-2 text-[10px] bg-white/[0.01] p-3 border border-white/5 rounded-xl gap-y-1.5 text-white/45">
                    <div>CITIZEN: <span className="text-white/80 font-bold uppercase">{registry.fullName || "ANONYMOUS-80"}</span></div>
                    <div>AGE: <span className="text-white/80 font-bold">{registry.age} YRS</span></div>
                    <div>SECTOR: <span className="text-white/70 font-semibold">{registry.region}</span></div>
                    <div>BLOOD TYPE: <span className="text-white/70 font-semibold">{registry.bloodType}</span></div>
                  </div>

                  {/* Chemical Breakdown Section */}
                  <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3.5">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.15em] mb-1">Capsule Chemistry Synthesis Profile</span>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-white">
                        <span className="text-white/50 text-[11px]">Standard Daily Dosage:</span>
                        <span className="font-semibold text-right text-xs">{diagnostics.dosage}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-white">
                        <span className="text-white/50 text-[11px]">Molecular Purities:</span>
                        <span className="font-semibold text-right text-xs">{diagnostics.syntheticNutrients}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-white">
                        <span className="text-white/50 text-[11px]">Compliance Optimizer:</span>
                        <span className="font-extrabold text-blue-400 text-right text-xs">{diagnostics.complianceRating}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-white">
                        <span className="text-white/50 text-[11px]">Organoleptic Inhibitors:</span>
                        <span className="font-semibold text-right text-xs">{diagnostics.flavorSuppressors}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-1 text-white">
                        <span className="text-white/50 text-[11px]">Serene Empathy Dampener:</span>
                        <span className="font-extrabold text-orange-400 text-right text-xs">{diagnostics.empathyRegulators}</span>
                      </div>
                      <div className="flex items-center justify-between pb-0.5 text-white">
                        <span className="text-white/50 text-[11px]">Stress Regulator Levels:</span>
                        <span className="font-semibold text-right text-xs">{diagnostics.sedativeLevel}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cyber Panic Warning at bottom */}
                <div className="bg-orange-500/[0.03] border border-orange-500/20 p-4 rounded-xl flex gap-3 text-[10px] text-orange-200/80 leading-relaxed mt-2.5">
                  <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                  <div className="flex-1 font-sans">
                    <span className="font-extrabold block text-orange-400 mb-0.5 tracking-wider uppercase text-[9px] font-mono">DIETARY COMPLIANCE DIRECTIVE #882</span>
                    All food preparation appliances, garden equipment, and organic seeds must be surrendered to localized NORA containment immediately. Private nourishment synthesis is an act of sovereign mutiny. Keep healthy. Eat clinical.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
