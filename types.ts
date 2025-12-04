export interface TimelineEvent {
  timeOrPhase: string;
  description: string;
}

export interface ScriptSection {
  sectionName: string; // e.g., "Hook", "Body", "Climax"
  contentProposal: string;
  psychologicalTrigger: string; // Why this works (e.g., "Create curiosity")
}

export interface Character {
  name: string;
  age?: string;
  location?: string;
  occupation?: string;
  description?: string;
}

export interface AnalysisResult {
  timeline: TimelineEvent[];
  hooks: string[];
  scriptStructure: ScriptSection[];
  characters: Character[];
  viralScore: number; // 0-100 score estimation
  tips: string[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ScriptInput {
  id: string;
  title: string;
  content: string;
  source: 'text' | 'file';
  fileName?: string;
}