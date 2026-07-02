import { Scene } from "./types";

export const SCENES: Scene[] = [
  {
    id: 1,
    timeStart: 0,
    timeEnd: 12,
    title: "The Golden Age of Food",
    visualDirection: "Grandmother's warm hands stirring a pot of steaming soup, rising steam, close-up details. A family dining table filled with laughter, vibrant colors, street food stalls blooming with life.",
    imageSrc: "/src/assets/images/memory_hands_soup_1780422926198.png",
    voiceOver: "We used to gather around food. It was never just about eating. It was about who made it. Who it was made for. What it meant.",
    colorGrade: "Warm Amber, saturated, nostalgic, soft-grain film, candlelit highlights.",
    audioDescriptor: "A gentle ambient pad representing comfort. Soft wind-chime harmonics and warm cello resonance."
  },
  {
    id: 2,
    timeStart: 12,
    timeEnd: 24,
    title: "The Great Desolation",
    visualDirection: "Cracked soil, desolated brown earth, empty supermarket steel cages, desperate flashing news broadcasts under dark heavy rains that never water the soil.",
    imageSrc: "/src/assets/images/crisis_dry_farmland_1780422940424.png",
    voiceOver: "Then the land stopped giving. The rains stopped coming. Two billion people went hungry. And the world panicked.",
    colorGrade: "Desaturated steel, dark grey, stark contrast, cold fluorescent overcast lights.",
    audioDescriptor: "The score deepens. A discordant, low-frequency rumble is introduced, mirroring global anxiety."
  },
  {
    id: 3,
    timeStart: 24,
    timeEnd: 36,
    title: "Sanctuary: NORA Corp",
    visualDirection: "Robot arms spinning precision capsules, lab coat scientists watching modern monitors, an glowing neon white \"NORA\" emblem, immaculate clean surfaces.",
    imageSrc: "/src/assets/images/nora_laboratory_capsules_1780422955446.png",
    voiceOver: "NORA had the answer. One capsule. Every morning. Everything your body needs. Perfectly personalized. Scientifically guaranteed. The end of hunger. Forever.",
    colorGrade: "Sterile white and corporate cyan. Extremely high-key exposure, clinical steel-cold gradients.",
    audioDescriptor: "Subtle electronic sequencer pulses enter the mix. Precise, rhythmic, clinical synth bleeps."
  },
  {
    id: 4,
    timeStart: 36,
    timeEnd: 48,
    title: "The Erasure",
    visualDirection: "Government padlock notices on wooden shuttered restaurant doors, old family mixers and ranges thrown in dumpsters, bulldozers on overgrown farms, family swallowing pills.",
    imageSrc: "/src/assets/images/family_swallowing_capsule_1780422974232.png",
    voiceOver: "By 2038, growing food was illegal. By 2041, the last restaurant closed. The smell of cooking four hundred thousand years of human history gone within a decade.",
    colorGrade: "Heavy industrial cyan-grey, shadows crushed, high contrast shadows.",
    audioDescriptor: "The sequencer pulses slow down and distort. Higher, tense, pitch-bending drones reflect social collapse."
  },
  {
    id: 5,
    timeStart: 48,
    timeEnd: 60,
    title: "The Child of 2040",
    visualDirection: "Extreme close up of a small, cold hand holding a sterile white capsule. A young girl sits alone in an empty concrete apartment at a bare table. She swallows it. Slow fade to absolute pitch black.",
    imageSrc: "/src/assets/images/child_with_capsule_1780423007000.png",
    voiceOver: "She has never tasted food. She never will. Every morning she takes her capsule. It keeps her alive. But someone decided what was in it. And no one ever asked them why.",
    colorGrade: "Desaturated, monolithic concrete grey, singular point lighting, stark empty framing.",
    audioDescriptor: "Synthesizer drops to a razor-thin high note. The score starts to fade out altogether, leading to a silent vacuum."
  }
];
