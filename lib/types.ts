export type UserRole = 'admin' | 'manager' | 'finance' | 'super_admin';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  status: 'active' | 'completed' | 'cancelled';
  assignedWorkers: string[];
  createdAt: number;
  createdBy: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  status: 'active' | 'inactive';
  joinDate: number;
  totalEarnings: number;
  avatar?: string;
}

export interface Assignment {
  id: string;
  jobId: string;
  workerId: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  assignedAt: number;
  completedAt?: number;
}

export interface Attendance {
  id: string;
  workerId: string;
  jobId: string;
  date: string; // YYYY-MM-DD
  checkIn?: number;
  checkOut?: number;
  status: 'present' | 'absent' | 'late';
  hours?: number;
}

export interface Payment {
  id: string;
  workerId: string;
  jobId: string;
  workerName?: string;
  jobTitle?: string;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'failed';
  paymentDate: number;
  method: string;
  notes?: string;
}
