'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Payment, Worker, Job } from '@/lib/types';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';

type PaymentFormData = {
  workerId: string;
  workerName: string;
  jobId: string;
  jobTitle: string;
  amount: string;
  status: Payment['status'];
  method: string;
  notes: string;
};

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<(Payment & { id: string })[]>([]);
  const [workers, setWorkers] = useState<Map<string, Worker & { id: string }>>(new Map());
  const [jobs, setJobs] = useState<Map<string, Job & { id: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment & { id: string } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [formData, setFormData] = useState<PaymentFormData>({
    workerId: '',
    workerName: '',
    jobId: '',
    jobTitle: '',
    amount: '',
    status: 'pending' as const,
    method: 'bank_transfer',
    notes: '',
  });

  useEffect(() => {
    const loaded = {
      payments: false,
      workers: false,
      jobs: false,
    };
    const checkAllLoaded = () => setLoading(!(loaded.payments && loaded.workers && loaded.jobs));

    const unsubscribePayments = listenToAdminCollection<Payment>(
      'payments',
      (records) => {
        setPayments(records);
        loaded.payments = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('Error loading payments:', error);
        toast.error('Firebase blocked payments. Using local saved payments for now.');
        loaded.payments = true;
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

    return () => {
      unsubscribePayments();
      unsubscribeWorkers();
      unsubscribeJobs();
    };
  }, []);

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      resetForm();
      setIsDialogOpen(true);
    }
  }, [searchParams]);

  const handleSave = async () => {
    const workerName = formData.workerId
      ? workers.get(formData.workerId)?.name
      : formData.workerName.trim();
    const jobTitle = formData.jobId ? jobs.get(formData.jobId)?.title : formData.jobTitle.trim();

    if (!workerName || !jobTitle || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const amount = Number.parseFloat(formData.amount);

      if (Number.isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid payment amount');
        return;
      }

      if (editingPayment) {
        const source = await updateAdminRecord<Payment>('payments', editingPayment.id, {
          ...formData,
          workerId: formData.workerId || `manual-worker-${workerName}`,
          workerName,
          jobId: formData.jobId || `manual-job-${jobTitle}`,
          jobTitle,
          amount,
          updatedAt: Date.now(),
        });
        toast.success(source === 'firebase' ? 'Payment updated successfully' : 'Payment updated locally');
      } else {
        const { source } = await createAdminRecord<Payment>('payments', {
          ...formData,
          workerId: formData.workerId || `manual-worker-${workerName}`,
          workerName,
          jobId: formData.jobId || `manual-job-${jobTitle}`,
          jobTitle,
          amount,
          paymentDate: Date.now(),
        });
        toast.success(source === 'firebase' ? 'Payment created successfully' : 'Payment saved locally');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error saving payment');
      console.error(error);
    }
  };

  const handleDelete = async (paymentId: string) => {
    if (confirm('Are you sure you want to delete this payment?')) {
      try {
        const source = await deleteAdminRecord<Payment>('payments', paymentId);
        toast.success(source === 'firebase' ? 'Payment deleted' : 'Local payment deleted');
      } catch (error) {
        toast.error('Error deleting payment');
      }
    }
  };

  const handleEdit = (payment: Payment & { id: string }) => {
    setEditingPayment(payment);
    setFormData({
      workerId: payment.workerId,
      workerName: payment.workerName || '',
      jobId: payment.jobId,
      jobTitle: payment.jobTitle || '',
      amount: payment.amount.toString(),
      status: payment.status,
      method: payment.method,
      notes: payment.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      workerId: '',
      workerName: '',
      jobId: '',
      jobTitle: '',
      amount: '',
      status: 'pending',
      method: 'bank_transfer',
      notes: '',
    });
    setEditingPayment(null);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPayments =
    filterStatus === 'all' ? payments : payments.filter((p) => p.status === filterStatus);

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = filteredPayments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Payments</h1>
              <p className="text-muted-foreground mt-1">Manage worker payments and track status</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingPayment ? 'Edit Payment' : 'Create New Payment'}
                  </DialogTitle>
                  <DialogDescription>
                    Log a worker payout by selecting existing records or typing manual labels.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Worker *</Label>
                      <Select
                        value={formData.workerId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, workerId: value, workerName: '' })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select worker" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(workers.values()).map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-2"
                        value={formData.workerName}
                        onChange={(e) =>
                          setFormData({ ...formData, workerId: '', workerName: e.target.value })
                        }
                        placeholder="Or type worker name"
                      />
                    </div>
                    <div>
                      <Label>Job *</Label>
                      <Select
                        value={formData.jobId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, jobId: value, jobTitle: '' })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(jobs.values()).map((job) => (
                            <SelectItem key={job.id} value={job.id}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        className="mt-2"
                        value={formData.jobTitle}
                        onChange={(e) =>
                          setFormData({ ...formData, jobId: '', jobTitle: e.target.value })
                        }
                        placeholder="Or type job title"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹) *</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <Label htmlFor="method">Payment Method</Label>
                      <Select
                        value={formData.method}
                        onValueChange={(value) => setFormData({ ...formData, method: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          status: value as 'pending' | 'approved' | 'processed' | 'failed',
                        })
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="processed">Processed</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4">
                    <Button variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      {editingPayment ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{totalAmount.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-bold text-orange-600">
                    {pendingAmount.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Payments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredPayments.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading payments...</p>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No payments found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const worker = workers.get(payment.workerId);
                const job = jobs.get(payment.jobId);
                const workerLabel = worker?.name || payment.workerName || 'Manual worker';
                const jobLabel = job?.title || payment.jobTitle || 'Manual job';
                return (
                  <Card key={payment.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Worker</p>
                              <p className="font-semibold">{workerLabel}</p>
                              <p className="text-sm text-muted-foreground">{worker?.email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Job</p>
                              <p className="font-semibold">{jobLabel}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Method</p>
                              <p className="font-medium text-sm capitalize">
                                {payment.method.replace('_', ' ')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Date</p>
                              <p className="font-medium text-sm">
                                {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded inline-block ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {payment.status}
                              </span>
                            </div>
                          </div>
                          {payment.notes && (
                            <div className="mt-3 p-2 bg-muted rounded text-sm">
                              <p className="text-xs text-muted-foreground">Notes</p>
                              <p>{payment.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(payment)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(payment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
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
