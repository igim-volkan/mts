import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Subscription, SubscriptionInsert } from '../types';

interface SubscriptionContextType {
    subscriptions: Subscription[];
    loading: boolean;
    error: string | null;
    fetchSubscriptions: () => Promise<void>;
    addSubscription: (subscription: SubscriptionInsert) => Promise<void>;
    updateSubscription: (id: string, updates: Partial<Subscription>) => Promise<void>;
    deleteSubscription: (id: string) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (err: any) {
            setError(err.message);
            console.error('Error fetching subscriptions:', err);
        } finally {
            setLoading(false);
        }
    };

    const addSubscription = async (subscription: SubscriptionInsert) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .insert([subscription]);

            if (error) throw error;
            await fetchSubscriptions();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            await fetchSubscriptions();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const deleteSubscription = async (id: string) => {
        try {
            const { error } = await supabase
                .from('subscriptions')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchSubscriptions();
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    return (
        <SubscriptionContext.Provider value={{
            subscriptions,
            loading,
            error,
            fetchSubscriptions,
            addSubscription,
            updateSubscription,
            deleteSubscription
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscriptions() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscriptions must be used within a SubscriptionProvider');
    }
    return context;
}
