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

            // Log creation activity
            await supabase.from('lead_activities').insert([{
                leadId: data.id,
                type: 'created',
                details: 'Müşteri sisteme eklendi.'
            }]);

            setLeads(prev => [data as Lead, ...prev]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error('Error adding lead:', errorMessage);
            throw err;
        }
    };

    const updateLead = async (id: string, leadData: Partial<Lead>) => {
        try {
            const existingLead = leads.find(l => l.id === id);

            const { data, error } = await supabase
                .from('leads')
                .update(leadData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            if (existingLead) {
                const activities = [];
                // Compare status
                if (leadData.status && leadData.status !== existingLead.status) {
                    const statusMap: Record<string, string> = {
                        new: 'Yeni', contacted: 'İletişimde', emailed: 'E-posta Gönderilecek',
                        pending: 'Beklemede', sent: 'E-posta Gönderildi', won: 'Kazanıldı', lost: 'Kaybedildi'
                    };
                    activities.push({ leadId: id, type: 'status_change', details: `Aşama değişti: ${statusMap[leadData.status] || leadData.status}` });
                }
                // Compare notes
                if (leadData.notes !== undefined && leadData.notes !== existingLead.notes) {
                    activities.push({ leadId: id, type: 'note_added', details: 'Müşteri notu güncellendi/eklendi.' });
                }
                // Compare emailSentDate
                if (leadData.emailSentDate !== undefined && leadData.emailSentDate !== existingLead.emailSentDate) {
                    activities.push({ leadId: id, type: 'email_sent', details: 'E-posta gönderim tarihi belirlendi.' });
                }

                if (activities.length > 0) {
                    await supabase.from('lead_activities').insert(activities);
                }
            }

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

