'use client';

import React, { useEffect, useState } from 'react';
import { Assignment, Job, Worker } from '@/lib/types';
import { AdminLayout } from '@/components/admin-layout';
import { AdminGuard } from '@/lib/admin-guard';
import {
  createAdminRecord,
  deleteAdminRecord,
  listenToAdminCollection,
  updateAdminRecord,
} from '@/lib/admin-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Trash2, Plus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<(Assignment & { id: string })[]>([]);
  const [jobs, setJobs] = useState<Map<string, Job & { id: string }>>(new Map());
  const [workers, setWorkers] = useState<Map<string, Worker & { id: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    jobId: '',
    workerId: '',
  });

  useEffect(() => {
    const loaded = {
      assignments: false,
      jobs: false,
      workers: false,
    };
    const checkAllLoaded = () => setLoading(!(loaded.assignments && loaded.jobs && loaded.workers));

    const unsubscribeAssignments = listenToAdminCollection<Assignment>(
      'assignments',
      (records) => {
        setAssignments(records);
        loaded.assignments = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('Error loading assignments:', error);
        toast.error('Firebase blocked assignments. Using local saved assignments for now.');
        loaded.assignments = true;
        checkAllLoaded();
      }
    );

    const unsubscribeJobs = listenToAdminCollection<Job>(
      'jobs',
      (records) => {
        setJobs(new Map(records.map((record) => [record.id, record])));
        loaded.jobs = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('Error loading jobs:', error);
        toast.error('Could not load jobs. Check Firebase database access.');
        loaded.jobs = true;
        checkAllLoaded();
      }
    );

    const unsubscribeWorkers = listenToAdminCollection<Worker>(
      'workers',
      (records) => {
        setWorkers(new Map(records.map((record) => [record.id, record])));
        loaded.workers = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('Error loading workers:', error);
        toast.error('Could not load workers. Check Firebase database access.');
        loaded.workers = true;
        checkAllLoaded();
      }
    );

    return () => {
      unsubscribeAssignments();
      unsubscribeJobs();
      unsubscribeWorkers();
    };
  }, []);

  const handleAssign = async () => {
    if (!formData.jobId || !formData.workerId) {
      toast.error('Please select both job and worker');
      return;
    }

    try {
      const { source } = await createAdminRecord<Assignment>('assignments', {
        jobId: formData.jobId,
        workerId: formData.workerId,
        status: 'pending',
        assignedAt: Date.now(),
      });

      const job = jobs.get(formData.jobId);
      const assignedWorkers = Array.from(new Set([...(job?.assignedWorkers || []), formData.workerId]));
      await updateAdminRecord<Job>('jobs', formData.jobId, { assignedWorkers });

      toast.success(source === 'firebase' ? 'Worker assigned successfully' : 'Assignment saved locally');
      setIsDialogOpen(false);
      setFormData({ jobId: '', workerId: '' });
    } catch (error) {
      toast.error('Error assigning worker');
      console.error(error);
    }
  };

  const handleStatusChange = async (assignmentId: string, newStatus: Assignment['status']) => {
    try {
      const source = await updateAdminRecord<Assignment>('assignments', assignmentId, {
        status: newStatus,
        ...(newStatus === 'completed' && { completedAt: Date.now() }),
      });
      toast.success(source === 'firebase' ? 'Assignment status updated' : 'Assignment status updated locally');
    } catch (error) {
      toast.error('Error updating assignment');
      console.error(error);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      try {
        const source = await deleteAdminRecord<Assignment>('assignments', assignmentId);
        toast.success(source === 'firebase' ? 'Assignment deleted' : 'Local assignment deleted');
      } catch (error) {
        toast.error('Error deleting assignment');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Assignments</h1>
              <p className="text-muted-foreground mt-1">Assign workers to jobs and track status</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Worker
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Worker to Job</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Select Job *</label>
                    <Select value={formData.jobId} onValueChange={(value) => setFormData({ ...formData, jobId: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a job" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(jobs.values()).map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title} - {job.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Select Worker *</label>
                    <Select
                      value={formData.workerId}
                      onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose a worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(workers.values()).map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAssign}>Assign</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading assignments...</p>
              </div>
            </div>
          ) : assignments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No assignments yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const job = jobs.get(assignment.jobId);
                const worker = workers.get(assignment.workerId);
                return (
                  <Card key={assignment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Job</p>
                              <p className="font-semibold">{job?.title || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{job?.location}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Worker</p>
                              <p className="font-semibold">{worker?.name || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{worker?.email}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <Select
                                value={assignment.status}
                                onValueChange={(value) =>
                                  handleStatusChange(assignment.id, value as Assignment['status'])
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="accepted">Accepted</SelectItem>
                                  <SelectItem value="in-progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <span
                              className={`text-xs font-medium px-3 py-1 rounded ${getStatusColor(
                                assignment.status
                              )}`}
                            >
                              {assignment.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
