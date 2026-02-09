import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type Lead = Tables<'leads'>;

export function useLeadNotifications(profileId: string | undefined) {
  const { toast } = useToast();
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (!profileId) return;

    // Skip notifications for initial load
    const timer = setTimeout(() => {
      initialLoadRef.current = false;
    }, 2000);

    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
          filter: `profile_id=eq.${profileId}`,
        },
        (payload) => {
          if (initialLoadRef.current) return;
          
          const newLead = payload.new as Lead;
          const leadName = newLead.name || 'Novo visitante';
          const serviceType = newLead.service_type || newLead.interest_category || '';
          
          toast({
            title: '🔔 Novo lead capturado!',
            description: serviceType 
              ? `${leadName} - Interesse: ${serviceType}`
              : leadName,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [profileId, toast]);
}
