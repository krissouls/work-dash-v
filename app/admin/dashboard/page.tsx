'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, GitBranch, CreditCard, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/components/admin-layout';
import { AdminGuard } from '@/lib/admin-guard';
import { Job, Worker, Assignment, Payment } from '@/lib/types';
import { listenToAdminCollection } from '@/lib/admin-store';
import { toast } from 'sonner';

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalWorkers: number;
  activeWorkers: number;
  totalAssignments: number;
  pendingAssignments: number;
  pendingPayments: number;
  pendingPaymentsAmount: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  subtext,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtext?: string;
  color?: 'primary' | 'green' | 'orange' | 'red';
}) => {
  const colorClasses = {
    primary: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-300',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-300',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  );
};

function DashboardContent() {
  const [stats, setStats] = useState<Stats>({
    totalJobs: 0,
    activeJobs: 0,
    totalWorkers: 0,
    activeWorkers: 0,
    totalAssignments: 0,
    pendingAssignments: 0,
    pendingPayments: 0,
    pendingPaymentsAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const unsubscribeJobs = listenToAdminCollection<Job>(
          'jobs',
          (jobsArray) => {
            const activeJobs = jobsArray.filter((j) => j.status === 'active').length;
            setStats((prev) => ({
              ...prev,
              totalJobs: jobsArray.length,
              activeJobs,
            }));
          },
          (error) => {
            console.error('Error loading job stats:', error);
            toast.error('Firebase blocked job stats. Using local data for now.');
            setLoading(false);
          }
        );

        const unsubscribeWorkers = listenToAdminCollection<Worker>(
          'workers',
          (workersArray) => {
            const activeWorkers = workersArray.filter((w) => w.status === 'active').length;
            setStats((prev) => ({
              ...prev,
              totalWorkers: workersArray.length,
              activeWorkers,
            }));
          },
          (error) => {
            console.error('Error loading worker stats:', error);
            toast.error('Could not load worker stats. Check Firebase database access.');
            setLoading(false);
          }
        );

        const unsubscribeAssignments = listenToAdminCollection<Assignment>(
          'assignments',
          (assignmentsArray) => {
            const pendingAssignments = assignmentsArray.filter((a) => a.status === 'pending').length;
            setStats((prev) => ({
              ...prev,
              totalAssignments: assignmentsArray.length,
              pendingAssignments,
            }));
          },
          (error) => {
            console.error('Error loading assignment stats:', error);
            toast.error('Could not load assignment stats. Check Firebase database access.');
            setLoading(false);
          }
        );

        const unsubscribePayments = listenToAdminCollection<Payment>(
          'payments',
          (paymentsArray) => {
            const pending = paymentsArray.filter((p) => p.status === 'pending');
            const pendingAmount = pending.reduce((sum, p) => sum + (p.amount || 0), 0);
            setStats((prev) => ({
              ...prev,
              pendingPayments: pending.length,
              pendingPaymentsAmount: pendingAmount,
            }));
          },
          (error) => {
            console.error('Error loading payment stats:', error);
            toast.error('Could not load payment stats. Check Firebase database access.');
            setLoading(false);
          }
        );

        setLoading(false);
        return () => {
          unsubscribeJobs();
          unsubscribeWorkers();
          unsubscribeAssignments();
          unsubscribePayments();
        };
      } catch (error) {
        console.error('Error fetching stats:', error);
        setLoading(false);
      }
    };

    let cleanup: void | (() => void);

    const setup = async () => {
      cleanup = await fetchStats();
    };

    setup();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-4 text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Jobs"
                value={stats.totalJobs}
                icon={Briefcase}
                subtext={`${stats.activeJobs} active`}
                color="primary"
              />
              <StatCard
                title="Workers"
                value={stats.totalWorkers}
                icon={Users}
                subtext={`${stats.activeWorkers} active`}
                color="green"
              />
              <StatCard
                title="Assignments"
                value={stats.totalAssignments}
                icon={GitBranch}
                subtext={`${stats.pendingAssignments} pending`}
                color="orange"
              />
              <StatCard
                title="Pending Payments"
                value={`₹${stats.pendingPaymentsAmount.toLocaleString()}`}
                icon={CreditCard}
                subtext={`${stats.pendingPayments} payments`}
                color="red"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a
                    href="/admin/jobs?action=create"
                    className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    <Briefcase className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="font-medium">Create Job</p>
                  </a>
                  <a
                    href="/admin/workers?action=add"
                    className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="font-medium">Add Worker</p>
                  </a>
                  <a
                    href="/admin/assignments"
                    className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
                  >
                    <GitBranch className="w-6 h-6 mx-auto mb-2 text-orange-600" />
                    <p className="font-medium">Assign Worker</p>
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <span className="text-sm font-medium">Firebase Connection</span>
                    <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-1 rounded">
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <span className="text-sm font-medium">Real-time Sync</span>
                    <span className="text-xs bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default function DashboardPage() {
  return (
    <AdminGuard>
      <DashboardContent />
    </AdminGuard>
  );
}
