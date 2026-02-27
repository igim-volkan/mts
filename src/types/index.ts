export type ContactDirection = 'inbound' | 'outbound';
export type LeadStatus = 'new' | 'contacted' | 'emailed' | 'pending' | 'sent' | 'won' | 'lost';

export interface Lead {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    sectors: string[];
    lastContactDate: string; // ISO Date String
    contactDirection: ContactDirection;
    notes?: string;
    status: LeadStatus;
    emailSentDate?: string; // ISO Date String
    lossReason?: string;
    createdAt: string; // ISO Date String
}

export type ActivityType = 'status_change' | 'note_added' | 'email_sent' | 'call_made' | 'created';

export interface LeadActivity {
    id: string;
    leadId: string;
    type: ActivityType;
    details: string;
    createdAt: string;
}

export interface Task {
    id: string;
    leadId: string | null;
    title: string;
    dueDate: string;
    isCompleted: boolean;
    createdAt: string;
}

export interface EmailTemplate {
    id: string;
    title: string;
    subject: string;
    content: string;
    createdAt: string;
}

export const SECTORS = [
    'E-commerce',
    'Software',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Education',
    'Manufacturing',
    'Retail',
    'Automotive',
    'Other' // Diğer 
];

export interface Contract {
    id: string;
    customerName: string;
    customerLogo?: string;
    hasFrontend: boolean;
    hasBackend: boolean;
    hasSocialMedia: boolean;
    hasPrintMedia: boolean;
    contractDate: string;
    monthlyPayment: number;
    assignees: string[]; // ['Çiğdem', 'Volkan', 'Elif']
    createdAt: string;
}

