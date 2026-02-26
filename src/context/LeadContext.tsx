import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Lead } from '../types';

interface LeadContextType {
    leads: Lead[];
    addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
    updateLead: (id: string, lead: Partial<Lead>) => void;
    deleteLead: (id: string) => void;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'leadTrackerData';

export function LeadProvider({ children }: { children: ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>(() => {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse leads from local storage", e);
            }
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
    }, [leads]);

    const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
        const newLead: Lead = {
            ...leadData,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        setLeads(prev => [newLead, ...prev]);
    };

    const updateLead = (id: string, leadData: Partial<Lead>) => {
        setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...leadData } : lead));
    };

    const deleteLead = (id: string) => {
        setLeads(prev => prev.filter(lead => lead.id !== id));
    };

    return (
        <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead }}>
            {children}
        </LeadContext.Provider>
    );
}

export function useLeads() {
    const context = useContext(LeadContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadProvider');
    }
    return context;
}
