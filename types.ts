
export enum UserRole {
  Teacher = 'teacher',
  Student = 'student',
}

export enum EducationLevel {
  Elementary = 'elementary',
  MiddleSchool = 'middle_school',
  HighSchool = 'high_school',
  Undergrad = 'undergrad',
  Graduate = 'graduate',
  Mixed = 'mixed',
}

export enum ActionType {
  Explain = 'explain',
  Quiz = 'quiz',
  Summary = 'summary',
  Examples = 'examples',
  Flashcards = 'flashcards',
  Socratic = 'socratic',
  Simplify = 'simplify',
  RealWorld = 'real_world', // Project based
  Debate = 'debate', // Critical thinking
  CrossLink = 'cross_link', // Interdisciplinary
  MindMap = 'mind_map', // Structural
  Diagram = 'diagram' // Visual SVG
}

export enum Persona {
  Standard = 'standard',
  Einstein = 'einstein',
  Shakespeare = 'shakespeare',
  Cyber = 'cyber',
  Motivational = 'motivational'
}

export enum FeedbackType {
  Positive = 'positive',
  Negative = 'negative'
}

export interface AccessibilitySettings {
  dyslexiaFont: boolean;
  highContrast: boolean;
  readingRuler: boolean;
  textSize: 'normal' | 'large' | 'xlarge';
  colorFilter: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ClassroomStats {
  studentCount: number;
  activeStudents: number;
  avgEngagement: EngagementState;
  confusedCount: number;
  lessonTimeRemaining: number;
}

export interface AppState {
  role: UserRole;
  level: EducationLevel;
  action: ActionType;
  persona: Persona;
  language: string;
  prompt: string;
  images: string[]; // Array of Base64 strings
  focusedImageIndex: number;
  isLoading: boolean;
  result: string | null;
  groundingData: GroundingChunk[] | null;
  error: string | null;
  xp: number;
  levelNum: number;
  isTtsActive: boolean;
  feedback: FeedbackType | null;
  feedbackHistory: string[];
  accessibility: AccessibilitySettings;
  isClassroomMode: boolean;
  // P2P Real State
  peerId: string | null;
  connectedPeers: number;
}

export interface GenerateContentRequest {
  images: string[]; // Array of Base64
  role: UserRole;
  level: EducationLevel;
  action: ActionType;
  persona: Persona;
  language: string;
  userPrompt: string;
  feedbackContext?: string;
}

export enum EngagementState {
  Focused = 'Focused',
  Distracted = 'Distracted',
  Confused = 'Confused',
  Bored = 'Bored',
  Neutral = 'Neutral'
}

export interface ConcentrationEntry {
  timestamp: Date;
  state: EngagementState;
  observation: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

// P2P Message Types
export interface P2PMessage {
  type: 'SYNC_STATE' | 'ENGAGEMENT_UPDATE';
  payload: any;
}

export interface SyncStatePayload {
  images: string[];
  focusedIndex: number;
  result: string | null;
}

export interface EngagementUpdatePayload {
  state: EngagementState;
}
