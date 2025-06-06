
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Phone, Plus, Trash, Edit, Save, X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface EmergencyContactManagerProps {
  userId: string;
}

const EmergencyContactManager = ({ userId }: EmergencyContactManagerProps) => {
  const { contacts, loading, addContact, updateContact, deleteContact } = useEmergencyContacts(userId);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [editingContact, setEditingContact] = useState<{id: string, name: string, number: string} | null>(null);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && newNumber.trim()) {
      addContact(newName.trim(), newNumber.trim());
      setNewName('');
      setNewNumber('');
    }
  };

  const handleUpdate = () => {
    if (editingContact && editingContact.name.trim() && editingContact.number.trim()) {
      updateContact(editingContact.id, editingContact.name, editingContact.number);
      setEditingContact(null);
    }
  };

  const startEditing = (id: string, name: string, number: string) => {
    setEditingContact({ id, name, number });
  };

  return (
    <Card className="p-6 bg-white shadow-lg rounded-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Emergency Contacts</h2>
        <p className="text-gray-600">Add contacts who should be notified in case of emergency.</p>
      </div>

      <form onSubmit={handleAddContact} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="contactName" className="text-gray-700">Contact Name</Label>
            <Input
              id="contactName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name"
              className="mt-1 border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="contactNumber" className="text-gray-700">Phone Number</Label>
            <Input
              id="contactNumber"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Enter phone number"
              className="mt-1 border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>
          <div className="mt-auto">
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Contact
            </Button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-pulse flex space-x-4">
            <div className="h-12 w-12 bg-emerald-200 rounded-full"></div>
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-emerald-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-emerald-200 rounded"></div>
                <div className="h-4 bg-emerald-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Name</TableHead>
                <TableHead className="text-gray-700">Number</TableHead>
                <TableHead className="text-right text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500 py-6">
                    <Phone className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    No emergency contacts added yet
                  </TableCell>
                </TableRow>
              ) : (
                contacts.map((contact) => (
                  <TableRow key={contact.id} className="border-b border-gray-200">
                    {editingContact && editingContact.id === contact.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editingContact.name}
                            onChange={(e) => setEditingContact({...editingContact, name: e.target.value})}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editingContact.number}
                            onChange={(e) => setEditingContact({...editingContact, number: e.target.value})}
                            className="border-gray-300"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={handleUpdate}
                              size="sm" 
                              variant="outline"
                              className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => setEditingContact(null)}
                              size="sm" 
                              variant="outline"
                              className="border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium text-gray-800">{contact.contact_name}</TableCell>
                        <TableCell className="text-gray-600">{contact.contact_number}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              onClick={() => startEditing(contact.id, contact.contact_name, contact.contact_number)}
                              size="sm" 
                              variant="outline"
                              className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => deleteContact(contact.id)}
                              size="sm" 
                              variant="outline"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};

export default EmergencyContactManager;
