export type AttackOutcome = "gelukt" | "geblokkeerd" | "gedeeltelijk" | "theoretisch";
export type QuantumStatus = "kwetsbaar" | "hybride" | "resistent" | "niet-van-toepassing";
export type BindingLevel = "geen" | "sessie" | "apparaat" | "origin" | "continu";

export type AttackStep = {
  n: number;
  actor: "aanvaller" | "slachtoffer" | "idp" | "proxy" | "apparaat" | "lab";
  title: string;
  body: string;
  terminal?: string;
  note?: string;
};

export type Demo = {
  start: string;
  tools: string[];
  steps: AttackStep[];
  outcome: AttackOutcome;
  result: string;
  blockers?: string;
  theory?: string;
};

export type ScoreBreakdown = {
  phishing: number;
  token: number;
  binding: number;
  quantum: number;
  operationeel: number;
  totaal: number;
};

export type Protocol = {
  id: string;
  code: string;
  name: string;
  fullName: string;
  summary: string;
  how: string[];
  weaknesses: { title: string; body: string; cve?: string }[];
  poc: { title: string; body: string; commands?: string }[];
  quantum: QuantumStatus;
  quantumNote: string;
  mitigations: string[];
};

export type MfaMethod = {
  id: string;
  code: string;
  name: string;
  aka: string;
  category: "phishable" | "phishing-resistant" | "hybride";
  summary: string;
  theory: string[];
  attacks: { title: string; body: string }[];
  demo: Demo;
  defenses: { blocks: string[]; fails: string[] };
  quantum: QuantumStatus;
  quantumNote: string;
  score: ScoreBreakdown;
  motivation: string[];
  primaryFinding: string;
};

export type ScoreCell = {
  protocolId: string;
  mfaId: string;
  finding: string;
  blocked: boolean | "deels";
  quantum: QuantumStatus;
  score: number;
  ref: string;
};
