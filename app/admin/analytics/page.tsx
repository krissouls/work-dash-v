'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts';
import { AdminGuard } from '@/lib/admin-guard';
import { AdminLayout } from '@/components/admin-layout';
import { listenToAdminCollection } from '@/lib/admin-store';
import type { Job, Payment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { IndianRupee, RefreshCw, TrendingUp, WalletCards } from 'lucide-react';
import { toast } from 'sonner';

type SheetRow = {
  date: string;
  worker: string;
  job: string;
  revenue: number;
  payout: number;
};

type MonthRow = {
  month: string;
  revenue: number;
  payout: number;
  profit: number;
};

const SHEET_URL_KEY = 'workdash-admin:google-sheet-url';

const chartConfig = {
  revenue: { label: 'Revenue', color: '#22c55e' },
  payout: { label: 'Payouts', color: '#f97316' },
  profit: { label: 'Profit', color: '#3533cd' },
} satisfies ChartConfig;

function money(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const cleaned = value.replace(/[₹,\s]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      cell += '"';
      index++;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function parseSheetCsv(csv: string): SheetRow[] {
  const lines = csv.split(/\r?\n/).filter(Boolean);
  const headers = splitCsvLine(lines[0] || '').map((header) => header.toLowerCase());

  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const value = (...names: string[]) => {
      const index = headers.findIndex((header) => names.some((name) => header.includes(name)));
      return index === -1 ? '' : cells[index] || '';
    };

    return {
      date: value('date', 'day', 'month') || new Date().toISOString(),
      worker: value('worker', 'name'),
      job: value('job', 'gig', 'work'),
      revenue: parseNumber(value('revenue', 'income', 'earned', 'received', 'amount')),
      payout: parseNumber(value('payout', 'payment', 'paid', 'cost', 'expense')),
    };
  });
}

function monthKey(dateValue: string | number | undefined) {
  const date = dateValue ? new Date(dateValue) : new Date();

  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
}

function groupByMonth(rows: SheetRow[]) {
  const months = new Map<string, MonthRow>();

  rows.forEach((row) => {
    const month = monthKey(row.date);
    const current = months.get(month) || { month, revenue: 0, payout: 0, profit: 0 };
    current.revenue += row.revenue;
    current.payout += row.payout;
    current.profit = current.revenue - current.payout;
    months.set(month, current);
  });

  return Array.from(months.values());
}

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<(Job & { id: string })[]>([]);
  const [payments, setPayments] = useState<(Payment & { id: string })[]>([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetRows, setSheetRows] = useState<SheetRow[]>([]);
  const [loadingSheet, setLoadingSheet] = useState(false);

  useEffect(() => {
    setSheetUrl(
      window.localStorage.getItem(SHEET_URL_KEY) ||
        process.env.NEXT_PUBLIC_WORKDASH_GOOGLE_SHEET_CSV_URL ||
        ''
    );

    const unsubscribeJobs = listenToAdminCollection<Job>('jobs', setJobs);
    const unsubscribePayments = listenToAdminCollection<Payment>('payments', setPayments);

    return () => {
      unsubscribeJobs();
      unsubscribePayments();
    };
  }, []);

  const loadSheet = async () => {
    if (!sheetUrl.trim()) {
      toast.error('Paste a Google Sheets CSV export URL first');
      return;
    }

    setLoadingSheet(true);

    try {
      const response = await fetch(sheetUrl.trim());

      if (!response.ok) {
        throw new Error(`Sheet returned ${response.status}`);
      }

      const csv = await response.text();
      const rows = parseSheetCsv(csv);
      setSheetRows(rows);
      window.localStorage.setItem(SHEET_URL_KEY, sheetUrl.trim());
      toast.success(`Loaded ${rows.length} work log rows`);
    } catch (error) {
      console.error('Error loading Google Sheet:', error);
      toast.error('Could not load that sheet. Use a published CSV/export link.');
    } finally {
      setLoadingSheet(false);
    }
  };

  const appRows = useMemo<SheetRow[]>(() => {
    const jobRows = jobs.map((job) => ({
      date: String(job.createdAt || Date.now()),
      worker: '',
      job: job.title,
      revenue: job.status === 'cancelled' ? 0 : job.budget || 0,
      payout: 0,
    }));

    const paymentRows = payments.map((payment) => ({
      date: String(payment.paymentDate || Date.now()),
      worker: payment.workerName || payment.workerId,
      job: payment.jobTitle || payment.jobId,
      revenue: 0,
      payout: payment.amount || 0,
    }));

    return [...jobRows, ...paymentRows];
  }, [jobs, payments]);

  const rows = sheetRows.length ? sheetRows : appRows;
  const monthly = groupByMonth(rows);
  const totals = monthly.reduce(
    (sum, row) => ({
      revenue: sum.revenue + row.revenue,
      payout: sum.payout + row.payout,
      profit: sum.profit + row.profit,
    }),
    { revenue: 0, payout: 0, profit: 0 }
  );

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track revenue, worker payouts, and profit from WorkDash records or Google Sheets.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Google Sheets Connection</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <Label htmlFor="sheet-url">Published CSV / export URL</Label>
                <Input
                  id="sheet-url"
                  value={sheetUrl}
                  onChange={(event) => setSheetUrl(event.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
                  className="mt-1"
                />
              </div>
              <Button onClick={loadSheet} disabled={loadingSheet}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {loadingSheet ? 'Loading' : 'Sync Sheet'}
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{money(totals.revenue)}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Worker Payouts</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <WalletCards className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{money(totals.payout)}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Estimated Profit</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{money(totals.profit)}</span>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Money Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[320px] w-full">
                  <BarChart data={monthly}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                    <Bar dataKey="payout" fill="var(--color-payout)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[320px] w-full">
                  <LineChart data={monthly}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="var(--color-profit)"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
