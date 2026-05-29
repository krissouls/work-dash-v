'use client';

import React, { useEffect, useState } from 'react';
import { Worker } from '@/lib/types';
import { AdminLayout } from '@/components/admin-layout';
import { AdminGuard } from '@/lib/admin-guard';
import {
  createAdminRecord,
  deleteAdminRecord,
  listenToAdminCollection,
  updateAdminRecord,
} from '@/lib/admin-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const SKILLS_OPTIONS = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Data Analysis',
  'Project Management',
  'Sales',
  'Customer Support',
  'Content Writing',
  'Digital Marketing',
  'DevOps',
];

type WorkerFormData = {
  name: string;
  email: string;
  phone: string;
  status: Worker['status'];
};

export default function WorkersPage() {
  const [workers, setWorkers] = useState<(Worker & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker & { id: string } | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [formData, setFormData] = useState<WorkerFormData>({
    name: '',
    email: '',
    phone: '',
    status: 'active' as const,
  });

  useEffect(() => {
    const unsubscribe = listenToAdminCollection<Worker>(
      'workers',
      (records) => {
        setWorkers(records);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading workers:', error);
        toast.error('Firebase blocked workers. Using local saved workers for now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      if (editingWorker) {
        const source = await updateAdminRecord<Worker>('workers', editingWorker.id, {
          ...formData,
          skills: selectedSkills,
          updatedAt: Date.now(),
        });
        toast.success(source === 'firebase' ? 'Worker updated successfully' : 'Worker updated locally');
      } else {
        const { source } = await createAdminRecord<Worker>('workers', {
          ...formData,
          skills: selectedSkills,
          totalEarnings: 0,
          joinDate: Date.now(),
        });
        toast.success(source === 'firebase' ? 'Worker added successfully' : 'Worker saved locally');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error saving worker');
      console.error(error);
    }
  };

  const handleDelete = async (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      try {
        const source = await deleteAdminRecord<Worker>('workers', workerId);
        toast.success(source === 'firebase' ? 'Worker deleted successfully' : 'Local worker deleted');
      } catch (error) {
        toast.error('Error deleting worker');
      }
    }
  };

  const handleEdit = (worker: Worker & { id: string }) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      email: worker.email,
      phone: worker.phone,
      status: worker.status,
    });
    setSelectedSkills(worker.skills || []);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'active',
    });
    setSelectedSkills([]);
    setEditingWorker(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Workers</h1>
              <p className="text-muted-foreground mt-1">Manage your worker database</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Worker
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingWorker ? 'Edit Worker' : 'Add New Worker'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Worker name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Skills</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {SKILLS_OPTIONS.map((skill) => (
                        <label
                          key={skill}
                          className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSkills.includes(skill)}
                            onChange={() => toggleSkill(skill)}
                            className="rounded"
                          />
                          <span className="text-sm">{skill}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as 'active' | 'inactive',
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingWorker ? 'Update' : 'Add'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading workers...</p>
              </div>
            </div>
          ) : workers.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No workers yet. Add one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {workers.map((worker) => (
                <Card key={worker.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg">{worker.name}</h3>
                        <p className="text-sm text-muted-foreground">{worker.email}</p>
                        <p className="text-sm text-muted-foreground">{worker.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {worker.skills && worker.skills.length > 0 ? (
                            worker.skills.map((skill) => (
                              <span
                                key={skill}
                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No skills</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            worker.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {worker.status}
                        </span>
                        <span className="text-sm font-semibold">
                          ₹{worker.totalEarnings || 0}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(worker)}
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(worker.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
