
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmergencyContact {
  id: string;
  contact_name: string;
  contact_number: string;
  created_at: string;
}

export const useEmergencyContacts = (userId: string) => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContacts = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error loading contacts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (name: string, number: string) => {
    if (!userId) return;
    
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: userId,
          contact_name: name,
          contact_number: number
        });

      if (error) throw error;
      
      fetchContacts();
      toast({
        title: "Contact added",
        description: `${name} has been added to your emergency contacts.`,
      });
    } catch (error: any) {
      toast({
        title: "Error adding contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateContact = async (id: string, name: string, number: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({
          contact_name: name,
          contact_number: number,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      fetchContacts();
      toast({
        title: "Contact updated",
        description: `${name} has been updated.`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchContacts();
      toast({
        title: "Contact deleted",
        description: "Emergency contact has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting contact",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (userId) {
      fetchContacts();
    }
  }, [userId]);

  return {
    contacts,
    loading,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact
  };
};
