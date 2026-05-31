'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Job } from '@/lib/types';
import { AdminLayout } from '@/components/admin-layout';
import { AdminGuard } from '@/lib/admin-guard';
import { useAuth } from '@/lib/auth-context';
import {
  createAdminRecord,
  deleteAdminRecord,
  listenToAdminCollection,
  updateAdminRecord,
} from '@/lib/admin-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

type JobFormData = {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
  status: Job['status'];
};

function JobsPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<(Job & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job & { id: string } | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: '',
    status: 'active' as const,
  });

  useEffect(() => {
    const unsubscribe = listenToAdminCollection<Job>(
      'jobs',
      (records) => {
        setJobs(records);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading jobs:', error);
        toast.error('Firebase blocked jobs. Using local saved jobs for now.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      resetForm();
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const handleSave = async () => {
    if (!formData.title || !formData.category || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const budget = Number.parseInt(formData.budget || '0', 10);

      if (Number.isNaN(budget) || budget < 0) {
        toast.error('Please enter a valid budget');
        return;
      }

      if (editingJob) {
        const source = await updateAdminRecord<Job>('jobs', editingJob.id, {
          ...formData,
          budget,
          updatedAt: Date.now(),
        });
        toast.success(source === 'firebase' ? 'Job updated successfully' : 'Job updated locally');
      } else {
        const { source } = await createAdminRecord<Job>('jobs', {
          ...formData,
          budget,
          assignedWorkers: [],
          createdAt: Date.now(),
          createdBy: user?.uid || 'admin',
        });
        toast.success(source === 'firebase' ? 'Job created successfully' : 'Job saved locally');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error saving job');
      console.error(error);
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job?')) {
      try {
        const source = await deleteAdminRecord<Job>('jobs', jobId);
        toast.success(source === 'firebase' ? 'Job deleted successfully' : 'Local job deleted');
      } catch (error) {
        toast.error('Error deleting job');
      }
    }
  };

  const handleEdit = (job: Job & { id: string }) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      budget: job.budget.toString(),
      status: job.status,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      location: '',
      budget: '',
      status: 'active',
    });
    setEditingJob(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Jobs</h1>
              <p className="text-muted-foreground mt-1">Manage job postings and assignments</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</DialogTitle>
                  <DialogDescription>
                    Add the job details, budget, and current status.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Web Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Job description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Remote, Delhi"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget">Budget (₹)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            status: value as 'active' | 'completed' | 'cancelled',
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingJob ? 'Update' : 'Create'}
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
                <p className="mt-4 text-muted-foreground">Loading jobs...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No jobs yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job) => (
                <Card key={job.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                        <div className="flex flex-wrap gap-4 mt-3">
                          <span className="text-sm">
                            <strong>Category:</strong> {job.category}
                          </span>
                          <span className="text-sm">
                            <strong>Location:</strong> {job.location}
                          </span>
                          <span className="text-sm">
                            <strong>Budget:</strong> ₹{job.budget}
                          </span>
                          <span className="text-sm">
                            <strong>Status:</strong>{' '}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                job.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : job.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {job.status}
                            </span>
                          </span>
                          <span className="text-sm">
                            <strong>Assigned:</strong> {job.assignedWorkers?.length || 0} workers
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(job)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600"
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

export default function JobsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobsPageContent />
    </Suspense>
  );
}
