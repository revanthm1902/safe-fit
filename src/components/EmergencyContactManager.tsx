
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Phone, User } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { motion } from 'framer-motion';

export interface EmergencyContact {
  id: string;
  contact_name: string;
  contact_number: string;
  created_at: string;
}

const EmergencyContactManager = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentContact, setCurrentContact] = useState<EmergencyContact | null>(null);
  const [name, setName] = useState<string>('');
  const [number, setNumber] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { toast } = useToast();
  const { isSubscribed, checkFeatureAccess } = useSubscription();
  
  const hasAccess = checkFeatureAccess('emergency-contacts');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('emergency_contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
  };

  const saveContacts = (updatedContacts: EmergencyContact[]) => {
    localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const handleOpenDialog = (contact?: EmergencyContact) => {
    if (!hasAccess) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your plan to manage emergency contacts",
        variant: "destructive"
      });
      return;
    }

    if (contact) {
      setName(contact.contact_name);
      setNumber(contact.contact_number);
      setCurrentContact(contact);
      setIsEditing(true);
    } else {
      setName('');
      setNumber('');
      setCurrentContact(null);
      setIsEditing(false);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setName('');
    setNumber('');
    setCurrentContact(null);
  };

  const handleOpenDeleteDialog = (contact: EmergencyContact) => {
    if (!hasAccess) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade your plan to manage emergency contacts",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveContact = () => {
    if (!name.trim() || !number.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && currentContact) {
      const updatedContacts = contacts.map(c => 
        c.id === currentContact.id ? { ...c, contact_name: name, contact_number: number } : c
      );
      saveContacts(updatedContacts);
      toast({
        title: "Contact updated",
        description: `${name} has been updated successfully`
      });
    } else {
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        contact_name: name,
        contact_number: number,
        created_at: new Date().toISOString()
      };
      const updatedContacts = [...contacts, newContact];
      saveContacts(updatedContacts);
      toast({
        title: "Contact added",
        description: `${name} has been added as an emergency contact`
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteContact = () => {
    if (currentContact) {
      const filteredContacts = contacts.filter(c => c.id !== currentContact.id);
      saveContacts(filteredContacts);
      toast({
        title: "Contact deleted",
        description: `${currentContact.contact_name} has been removed from your emergency contacts`
      });
      setIsDeleteDialogOpen(false);
      setCurrentContact(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-safefit-dark">Emergency Contacts</h3>
        <Button 
          onClick={() => handleOpenDialog()} 
          disabled={!hasAccess}
          className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
        >
          <Plus size={16} className="mr-2" /> Add Contact
        </Button>
      </div>

      {!isSubscribed && (
        <Card className="p-4 border-dashed border-2 border-safefit-highlight/50 bg-gray-50 mb-4">
          <div className="text-center py-3">
            <p className="text-safefit-dark font-medium mb-2">Premium Feature</p>
            <p className="text-gray-600 text-sm mb-3">
              Subscribe to manage emergency contacts
            </p>
            <Button 
              className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
              size="sm"
            >
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {contacts.length > 0 ? contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 bg-white border border-gray-200 ${!hasAccess ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-safefit-primary/10 flex items-center justify-center">
                    <User className="text-safefit-primary" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-safefit-dark">{contact.contact_name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone size={14} className="mr-1" />
                      {contact.contact_number}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDialog(contact)}
                    disabled={!hasAccess}
                    className="text-safefit-primary hover:text-safefit-highlight hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDeleteDialog(contact)}
                    disabled={!hasAccess}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <div className="text-center py-8 text-gray-500">
            <p>No emergency contacts added yet.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-safefit-dark">
              {isEditing ? 'Edit Contact' : 'Add Emergency Contact'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing ? 'Update the contact information below.' : 'Add someone who will be notified in case of emergency.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-safefit-dark">Contact Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter contact name"
                className="border-gray-300 focus:border-safefit-highlight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-safefit-dark">Phone Number</Label>
              <Input
                id="phone"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="Enter phone number"
                className="border-gray-300 focus:border-safefit-highlight"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button onClick={handleSaveContact} className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white">
              {isEditing ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-safefit-dark">Delete Emergency Contact</DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete {currentContact?.contact_name} from your emergency contacts?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteContact}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContactManager;
