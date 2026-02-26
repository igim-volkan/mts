export type ContactDirection = 'inbound' | 'outbound';
export type LeadStatus = 'new' | 'contacted' | 'emailed' | 'won' | 'lost';

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
