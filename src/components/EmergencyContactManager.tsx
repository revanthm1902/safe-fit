
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
import { Plus, Trash2, Edit, Phone, User, Users } from 'lucide-react';
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

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const savedContacts = localStorage.getItem('emergency_contacts');
    if (savedContacts) {
      try {
        const parsedContacts = JSON.parse(savedContacts);
        setContacts(Array.isArray(parsedContacts) ? parsedContacts : []);
      } catch (error) {
        console.error('Error parsing contacts:', error);
        setContacts([]);
      }
    }
  };

  const saveContacts = (updatedContacts: EmergencyContact[]) => {
    localStorage.setItem('emergency_contacts', JSON.stringify(updatedContacts));
    setContacts(updatedContacts);
  };

  const handleOpenDialog = (contact?: EmergencyContact) => {
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
    setIsEditing(false);
  };

  const handleOpenDeleteDialog = (contact: EmergencyContact) => {
    setCurrentContact(contact);
    setIsDeleteDialogOpen(true);
  };

  const validatePhoneNumber = (phone: string) => {
    // Basic phone number validation - allows various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const handleSaveContact = () => {
    if (!name.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a contact name",
        variant: "destructive"
      });
      return;
    }

    if (!number.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a phone number",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhoneNumber(number.trim())) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (isEditing && currentContact) {
      const updatedContacts = contacts.map(c => 
        c.id === currentContact.id 
          ? { ...c, contact_name: name.trim(), contact_number: number.trim() } 
          : c
      );
      saveContacts(updatedContacts);
      toast({
        title: "Contact updated",
        description: `${name.trim()} has been updated successfully`
      });
    } else {
      // Check if contact already exists
      const existingContact = contacts.find(c => 
        c.contact_name.toLowerCase() === name.trim().toLowerCase() ||
        c.contact_number === number.trim()
      );

      if (existingContact) {
        toast({
          title: "Contact already exists",
          description: "A contact with this name or number already exists",
          variant: "destructive"
        });
        return;
      }

      const newContact: EmergencyContact = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        contact_name: name.trim(),
        contact_number: number.trim(),
        created_at: new Date().toISOString()
      };
      const updatedContacts = [...contacts, newContact];
      saveContacts(updatedContacts);
      toast({
        title: "Contact added",
        description: `${name.trim()} has been added as an emergency contact`
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-safefit-highlight" />
          <h3 className="text-xl font-bold text-safefit-dark">Emergency Contacts</h3>
        </div>
        <Button 
          onClick={() => handleOpenDialog()} 
          className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
        >
          <Plus size={16} className="mr-2" /> Add Contact
        </Button>
      </div>

      <div className="space-y-3">
        {contacts.length > 0 ? contacts.map((contact, index) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 bg-white border border-gray-200 hover:border-safefit-highlight/50 hover:shadow-md transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-safefit-primary to-safefit-highlight flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-safefit-dark text-lg">{contact.contact_name}</p>
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
                    className="text-safefit-primary hover:text-safefit-highlight hover:bg-gray-100"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDeleteDialog(contact)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )) : (
          <Card className="p-8 border-dashed border-2 border-gray-300 bg-gray-50">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-medium mb-2">No emergency contacts added yet</p>
              <p className="text-gray-500 text-sm mb-4">Add people who should be notified in case of emergency</p>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
              >
                <Plus size={16} className="mr-2" />
                Add Your First Contact
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="name" className="text-safefit-dark font-medium">Contact Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                className="border-gray-300 focus:border-safefit-highlight focus:ring-safefit-highlight"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-safefit-dark font-medium">Phone Number</Label>
              <Input
                id="phone"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="border-gray-300 focus:border-safefit-highlight focus:ring-safefit-highlight"
              />
              <p className="text-xs text-gray-500">Include country code for international numbers</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} className="border-gray-300 text-gray-700">
              Cancel
            </Button>
            <Button onClick={handleSaveContact} className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white">
              {isEditing ? 'Update Contact' : 'Save Contact'}
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
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyContactManager;
