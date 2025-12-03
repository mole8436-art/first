export interface TimelineEvent {
  timeOrPhase: string;
  description: string;
}

export interface ScriptSection {
  sectionName: string; // e.g., "Hook", "Body", "Climax"
  contentProposal: string;
  psychologicalTrigger: string; // Why this works (e.g., "Create curiosity")
}

export interface AnalysisResult {
  timeline: TimelineEvent[];
  hooks: string[];
  scriptStructure: ScriptSection[];
  viralScore: number; // 0-100 score estimation
  tips: string[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}