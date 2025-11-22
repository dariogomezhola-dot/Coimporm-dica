
export enum ModuleType {
  CRM = 'CRM',
  WIKI = 'WIKI',
  CAMPAIGNS = 'CAMPAIGNS',
  RESOURCES = 'RESOURCES',
  REPORTS = 'REPORTS',
  PLANNER = 'PLANNER',
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  interest: string; // Product of interest
  status: 'NEW' | 'CONTACTED' | 'NEGOTIATION' | 'CLOSED' | 'LOST';
  notes: string;
  createdAt: string;
  assignedTo?: string;
  lastAction?: string;
  campaignId?: string; // Link to a specific campaign
  
  // New Metrics
  qualification?: 'Suspect' | 'MQL' | 'SQL' | 'Opportunity';
  temperature?: 'Hot' | 'Warm' | 'Cold'; 
  responseTime?: number; // in minutes
}

export interface SubTask {
  id: string;
  title: string;
  description?: string; // New field for subtask details
  completed: boolean;
}

export interface PlannerTask {
  id: string;
  title: string;
  description: string;
  status: 'TODO' | 'DOING' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
  assignee: string; // Name or Email
  labels: string[]; // e.g. ["Design", "Copy", "Strategy"]
  createdAt: string;
  subtasks?: SubTask[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isSender: boolean;
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
        content: string | string[];
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
  description?: string; // New field for file description
  type: 'PDF' | 'JPG' | 'PNG' | 'DOC' | 'FILE';
  category: 'Logo' | 'Identity' | 'Legal' | 'Campaign';
  size: string;
  url?: string;
}

export interface PitchData {
  title?: string; // Editable name of the pitch (e.g. "Intro Video" instead of just "Pitch A")
  text: string;
  assets: Asset[];
  observations?: string; // General technical observations for the pitch assets
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Paused';
  lastUpdated: string;
  pitches: {
    [key: string]: PitchData;
  };
}

export interface Metric {
  name: string;
  value: number;
  change: number;
}