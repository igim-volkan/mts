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
    createdAt: string; // ISO Date String
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
