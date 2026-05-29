'use client';

import React, { useEffect, useState } from 'react';
import { Attendance, Worker, Job } from '@/lib/types';
import { AdminLayout } from '@/components/admin-layout';
import { AdminGuard } from '@/lib/admin-guard';
import {
  createAdminRecord,
  deleteAdminRecord,
  listenToAdminCollection,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';

type AttendanceFormData = {
  workerId: string;
  jobId: string;
  status: Attendance['status'];
  checkInTime: string;
  checkOutTime: string;
};

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<(Attendance & { id: string })[]>([]);
  const [workers, setWorkers] = useState<Map<string, Worker & { id: string }>>(new Map());
  const [jobs, setJobs] = useState<Map<string, Job & { id: string }>>(new Map());
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState<AttendanceFormData>({
    workerId: '',
    jobId: '',
    status: 'present' as const,
    checkInTime: '',
    checkOutTime: '',
  });

  useEffect(() => {
    const loaded = {
      attendance: false,
      workers: false,
      jobs: false,
    };
    const checkAllLoaded = () => setLoading(!(loaded.attendance && loaded.workers && loaded.jobs));

    const unsubscribeAttendance = listenToAdminCollection<Attendance>(
      'attendance',
      (records) => {
        setAttendance(records);
        loaded.attendance = true;
        checkAllLoaded();
      },
      (error) => {
        console.error('Error loading attendance:', error);
        toast.error('Firebase blocked attendance. Using local saved attendance for now.');
        loaded.attendance = true;
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
      unsubscribeAttendance();
      unsubscribeWorkers();
      unsubscribeJobs();
    };
  }, []);

  const handleMarkAttendance = async () => {
    if (!formData.workerId || !formData.jobId) {
      toast.error('Please select worker and job');
      return;
    }

    try {
      const checkInTime = formData.checkInTime
        ? new Date(`${selectedDate}T${formData.checkInTime}`).getTime()
        : undefined;
      const checkOutTime = formData.checkOutTime
        ? new Date(`${selectedDate}T${formData.checkOutTime}`).getTime()
        : undefined;

      const hours =
        checkInTime && checkOutTime ? (checkOutTime - checkInTime) / (1000 * 60 * 60) : undefined;

      if (hours !== undefined && hours < 0) {
        toast.error('Check-out time must be after check-in time');
        return;
      }

      const { source } = await createAdminRecord<Attendance>('attendance', {
        workerId: formData.workerId,
        jobId: formData.jobId,
        date: selectedDate,
        status: formData.status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        hours: hours ? Math.round(hours * 2) / 2 : undefined, // Round to 0.5 hours
        markedAt: Date.now(),
      });
      toast.success(source === 'firebase' ? 'Attendance marked successfully' : 'Attendance saved locally');
      setIsDialogOpen(false);
      setFormData({
        workerId: '',
        jobId: '',
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
      });
    } catch (error) {
      toast.error('Error marking attendance');
      console.error(error);
    }
  };

  const handleDelete = async (attendanceId: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        const source = await deleteAdminRecord<Attendance>('attendance', attendanceId);
        toast.success(source === 'firebase' ? 'Record deleted' : 'Local record deleted');
      } catch (error) {
        toast.error('Error deleting record');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const todayAttendance = attendance.filter((a) => a.date === selectedDate);

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Attendance</h1>
              <p className="text-muted-foreground mt-1">Mark and track worker attendance</p>
            </div>
            <div className="flex gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Attendance</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Worker *</Label>
                      <Select
                        value={formData.workerId}
                        onValueChange={(value) => setFormData({ ...formData, workerId: value })}
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
                    </div>
                    <div>
                      <Label>Job *</Label>
                      <Select
                        value={formData.jobId}
                        onValueChange={(value) => setFormData({ ...formData, jobId: value })}
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
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            status: value as 'present' | 'absent' | 'late',
                          })
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.status !== 'absent' && (
                      <>
                        <div>
                          <Label>Check-in Time</Label>
                          <Input
                            type="time"
                            value={formData.checkInTime}
                            onChange={(e) =>
                              setFormData({ ...formData, checkInTime: e.target.value })
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Check-out Time</Label>
                          <Input
                            type="time"
                            value={formData.checkOutTime}
                            onChange={(e) =>
                              setFormData({ ...formData, checkOutTime: e.target.value })
                            }
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-2 justify-end pt-4">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleMarkAttendance}>Mark</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading attendance...</p>
              </div>
            </div>
          ) : todayAttendance.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-40">
                <p className="text-muted-foreground">No attendance records for this date</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayAttendance.map((record) => {
                const worker = workers.get(record.workerId);
                const job = jobs.get(record.jobId);
                return (
                  <Card key={record.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Worker</p>
                              <p className="font-semibold">{worker?.name || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Job</p>
                              <p className="font-semibold">{job?.title || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Check-in</p>
                              <p className="font-medium">
                                {record.checkIn
                                  ? new Date(record.checkIn).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Check-out</p>
                              <p className="font-medium">
                                {record.checkOut
                                  ? new Date(record.checkOut).toLocaleTimeString('en-IN', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Hours</p>
                              <p className="font-medium flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {record.hours || '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded inline-block ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
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
