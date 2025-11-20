export enum ModuleType {
  MANUAL = 'MANUAL',
  CAMPAIGNS = 'CAMPAIGNS',
  LIBRARY = 'LIBRARY',
  REPORTS = 'REPORTS',
}

export interface ChatMessage {
  id: string;
  text: string;
  isSender: boolean; // true = outgoing (green), false = incoming (gray)
  timestamp?: string;
  type?: 'text' | 'image' | 'audio' | 'file';
  metadata?: {
    fileName?: string;
    fileSize?: string;
    fileType?: string;
  };
  style?: 'default' | 'system' | 'highlight';
}

export interface SlideContentData {
    type: 'grid-cards' | 'text-list' | 'text-card' | 'checklist' | 'mixed';
    text?: string;
    cards?: {
        title: string;
        titleColor?: string;
        content: string | string[]; // string for paragraph, array for list
        listOrdered?: boolean;
        type?: 'list' | 'text' | 'mixed';
    }[];
    quote?: string;
}

export interface Slide {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  contentData: SlideContentData;
  chatScenario: ChatMessage[];
  chatContactName: string;
  chatContactStatus?: string;
  chatAvatarSeed?: number;
}

export interface Asset {
  id: string;
  name: string;
  type: 'PDF' | 'JPG' | 'PNG' | 'DOC';
  category: 'Logo' | 'Identity' | 'Legal' | 'Campaign';
  size: string;
}

export interface PitchData {
  text: string;
  assets: Asset[];
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Paused';
  lastUpdated: string;
  // Changed structure: Each pitch key maps to an object with text AND assets
  pitches: {
    [key: string]: PitchData; // Keys: A, B, C, D, E
  };
}

export interface Metric {
  name: string;
  value: number;
  change: number; // percentage
}