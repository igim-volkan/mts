/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Lead } from '../types';
import { supabase } from '../lib/supabase';

interface LeadContextType {
    leads: Lead[];
    addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => Promise<void>;
    updateLead: (id: string, lead: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const LeadContext = createContext<LeadContextType | undefined>(undefined);

export function LeadProvider({ children }: { children: ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setLeads(data as Lead[] || []);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error fetching leads:', errorMessage);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();

            if (error) throw error;
            setLeads(prev => [data as Lead, ...prev]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error adding lead:', errorMessage);
            throw err;
        }
    };

    const updateLead = async (id: string, leadData: Partial<Lead>) => {
        try {
            const { data, error } = await supabase
                .from('leads')
                .update(leadData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, ...(data as Lead) } : lead));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error updating lead:', errorMessage);
            throw err;
        }
    };

    const deleteLead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setLeads(prev => prev.filter(lead => lead.id !== id));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error deleting lead:', errorMessage);
            throw err;
        }
    };

    return (
        <LeadContext.Provider value={{ leads, addLead, updateLead, deleteLead, isLoading, error }}>
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

