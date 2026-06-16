"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, Plus, Trash2, Calendar, Download, LogOut } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  type Entry,
  MONTHS,
  YEARS,
  getLastMonthYearMonth,
  buildRunningTotals,
} from '@/lib/income';
import { downloadMonthPdf, downloadYearPdf } from '@/lib/pdf';

// Initialize Supabase Client (supports Vercel integration key name)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);
const STORAGE_KEY = 'income-entries-v3';

function formatDbError(error: { message: string; code?: string; details?: string }) {
  return [error.message, error.details, error.code].filter(Boolean).join(' — ');
}

function rowToEntry(item: Record<string, unknown>): Entry {
  return {
    id: String(item.id),
    monthId: String(item.month_id),
    date: String(item.date).slice(0, 10),
    earnedFrom: String(item.earned_from ?? ''),
    amount: Number(item.amount) || 0,
    earnedBy: (item.earned_by as Entry['earnedBy']) ?? '',
    note: String(item.note ?? ''),
  };
}

function prefilledAsEntries() {
  return PREFILLED_DATA.map((entry) => ({
    ...entry,
    id: crypto.randomUUID(),
    earnedBy: entry.earnedBy as Entry['earnedBy'],
  }));
}

const PREFILLED_DATA = [
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'School Salary', amount: 18000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Madrasa Salary', amount: 4000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 15000, earnedBy: 'Toyeeba', note: 'Raytah' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Gift', amount: 1700, earnedBy: 'Masum', note: '' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Eva' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 1700, earnedBy: 'Toyeeba', note: 'Home Tuition' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-01', date: '2025-01-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Maisha & Muntaha' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'School Salary', amount: 18000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Hospital Munafa', amount: 13200, earnedBy: 'Masum', note: '' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 15000, earnedBy: 'Toyeeba', note: 'Raytah' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Madrasa Salary', amount: 4000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Gift', amount: 3000, earnedBy: 'Masum', note: 'From Abbu Ammu' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 800, earnedBy: 'Toyeeba', note: 'Home Tuition' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Maisha & Muntaha' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Gift', amount: 500, earnedBy: 'Masum', note: 'From Ahmad Cacu' },
  { monthId: '2025-02', date: '2025-02-01', earnedFrom: 'Tuition fees', amount: 8000, earnedBy: 'Toyeeba', note: 'California Group' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Bonus', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'School Salary', amount: 24000, earnedBy: 'Toyeeba', note: 'Due Increment' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Hospital Munafa', amount: 10000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Bonus', amount: 18750, earnedBy: 'Masum', note: '' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Tuition fees', amount: 15000, earnedBy: 'Toyeeba', note: 'Raita' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Madrasa Salary', amount: 4000, earnedBy: 'Masum', note: 'Eid & Admision Bon' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-04', date: '2025-04-01', earnedFrom: 'Gift', amount: 500, earnedBy: 'Masum', note: 'Abir Father' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Hospital Munafa', amount: 10000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Eva' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 15000, earnedBy: 'Toyeeba', note: 'Raitah' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'samiun apu' },
  { monthId: '2025-05', date: '2025-05-01', earnedFrom: 'Tuition fees', amount: 8000, earnedBy: 'Toyeeba', note: 'California Group' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Bonus', amount: 19250, earnedBy: 'Masum', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Bonus', amount: 15000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Hospital Munafa', amount: 7000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Samiun Apu' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-06', date: '2025-06-01', earnedFrom: 'Bonus', amount: 3300, earnedBy: 'Masum', note: 'Madrasa Bonus & F' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Gift', amount: 5000, earnedBy: 'Masum', note: 'Gift from Abba' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Gift', amount: 5000, earnedBy: 'Masum', note: 'Gift from Sayed Mar' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Hospital Munafa', amount: 5000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: 'From Alif Attar' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Gift', amount: 20000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Samiun Apu' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-07', date: '2025-07-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Office Salary', amount: 21000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Alif Munafa', amount: 7500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Evana' },
  { monthId: '2025-08', date: '2025-08-01', earnedFrom: 'Gift', amount: 1000, earnedBy: 'Masum', note: 'Gift from Jahida kha' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Eva' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-09', date: '2025-09-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'Tuition fees', amount: 2000, earnedBy: 'Toyeeba', note: 'Eva' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-10', date: '2025-10-01', earnedFrom: 'Alif Munafa', amount: 7500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Office Salary', amount: 42000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Alif Munafa', amount: 7500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-11', date: '2025-11-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Office Salary', amount: 54000, earnedBy: 'Masum', note: '12k adjusment' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'School Salary', amount: 25000, earnedBy: 'Toyeeba', note: '' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Alif Munafa', amount: 7500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Alif Munafa', amount: 3000, earnedBy: 'Masum', note: '' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Tuition fees', amount: 5000, earnedBy: 'Toyeeba', note: 'Abrar' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Madrasa Salary', amount: 4500, earnedBy: 'Masum', note: '' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Gift', amount: 1700, earnedBy: 'Masum', note: '' },
  { monthId: '2025-12', date: '2025-12-01', earnedFrom: 'Tuition fees', amount: 1000, earnedBy: 'Toyeeba', note: 'Maisha Exam Fee' }
];

export default function Dashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [usingLocalFallback, setUsingLocalFallback] = useState(false);
  const [userName, setUserName] = useState('');

  const lastMonth = getLastMonthYearMonth();
  const [selectedYear, setSelectedYear] = useState(() => lastMonth.year);
  const [selectedMonth, setSelectedMonth] = useState(() => lastMonth.month);

  const persistLocal = (nextEntries: Entry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEntries));
  };

  useEffect(() => {
    const initDatabase = async () => {
      const { data: existingData, error: countError } = await supabase
        .from('income_entries')
        .select('id')
        .limit(1);

      if (countError) {
        const saved = localStorage.getItem(STORAGE_KEY);
        setEntries(saved ? JSON.parse(saved) : prefilledAsEntries());
        setUsingLocalFallback(true);
        setSyncError(`Cloud sync unavailable: ${formatDbError(countError)}`);
        setIsLoaded(true);
        return;
      }

      if (!existingData?.length) {
        const dbFormattedPreFill = PREFILLED_DATA.map((e) => ({
          month_id: e.monthId,
          date: e.date,
          earned_from: e.earnedFrom,
          amount: e.amount,
          earned_by: e.earnedBy,
          note: e.note,
        }));
        const { error: seedError } = await supabase
          .from('income_entries')
          .insert(dbFormattedPreFill);
        if (seedError) {
          const saved = localStorage.getItem(STORAGE_KEY);
          setEntries(saved ? JSON.parse(saved) : prefilledAsEntries());
          setUsingLocalFallback(true);
          setSyncError(`Could not seed cloud database: ${formatDbError(seedError)}`);
          setIsLoaded(true);
          return;
        }
      }

      const { data, error: fetchError } = await supabase.from('income_entries').select('*');
      if (fetchError) {
        const saved = localStorage.getItem(STORAGE_KEY);
        setEntries(saved ? JSON.parse(saved) : prefilledAsEntries());
        setUsingLocalFallback(true);
        setSyncError(`Could not load cloud data: ${formatDbError(fetchError)}`);
      } else if (data) {
        const formattedData = data.map((item) => rowToEntry(item as Record<string, unknown>));
        setEntries(formattedData);
        persistLocal(formattedData);
      }
      setIsLoaded(true);
    };

    initDatabase();
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name) setUserName(data.user.name);
      })
      .catch(() => undefined);
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const currentMonthId = `${selectedYear}-${selectedMonth}`;
  const currentViewEntries = entries.filter(entry => entry.monthId === currentMonthId);
  const displayEntries = buildRunningTotals(currentViewEntries);

  const runningM = displayEntries.length
    ? displayEntries[displayEntries.length - 1].runningM
    : 0;
  const runningT = displayEntries.length
    ? displayEntries[displayEntries.length - 1].runningT
    : 0;

  const addRow = async () => {
    const defaultDate = `${currentMonthId}-01`;

    if (usingLocalFallback) {
      const nextEntries = [
        ...entries,
        {
          id: crypto.randomUUID(),
          monthId: currentMonthId,
          date: defaultDate,
          earnedFrom: '',
          amount: 0,
          earnedBy: '' as Entry['earnedBy'],
          note: '',
        },
      ];
      setEntries(nextEntries);
      persistLocal(nextEntries);
      return;
    }

    const newDbEntry = {
      month_id: currentMonthId,
      date: defaultDate,
      earned_from: '',
      amount: 0,
      earned_by: '',
      note: '',
    };

    const { data, error } = await supabase
      .from('income_entries')
      .insert([newDbEntry])
      .select()
      .single();

    if (error || !data) {
      setSyncError(`Could not add row: ${formatDbError(error ?? { message: 'No data returned' })}`);
      return;
    }

    const nextEntries = [...entries, rowToEntry(data as Record<string, unknown>)];
    setEntries(nextEntries);
    persistLocal(nextEntries);
    setSyncError(null);
  };

  const deleteRow = async (id: string) => {
    const previous = entries;
    const nextEntries = entries.filter((entry) => entry.id !== id);
    setEntries(nextEntries);
    persistLocal(nextEntries);

    if (usingLocalFallback) return;

    const { error } = await supabase.from('income_entries').delete().eq('id', id);
    if (error) {
      setEntries(previous);
      persistLocal(previous);
      setSyncError(`Could not delete row: ${formatDbError(error)}`);
    } else {
      setSyncError(null);
    }
  };

  const handleLocalChange = (id: string, field: keyof Entry, value: string | number) => {
    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== id) return entry;
        const updatedEntry = { ...entry, [field]: value };
        if (field === 'date' && typeof value === 'string' && value.length >= 7) {
          updatedEntry.monthId = value.substring(0, 7);
        }
        return updatedEntry;
      })
    );
  };

  const saveToCloud = async (id: string, field: keyof Entry, value: string | number) => {
    const dbFieldMap: Record<string, string> = {
      earnedFrom: 'earned_from',
      amount: 'amount',
      earnedBy: 'earned_by',
      note: 'note',
      date: 'date',
      monthId: 'month_id',
    };

    const updatePayload: Record<string, string | number> = { [dbFieldMap[field]]: value };
    if (field === 'date' && typeof value === 'string' && value.length >= 7) {
      updatePayload.month_id = value.substring(0, 7);
    }

    setEntries((current) => {
      const nextEntries = current.map((entry) => {
        if (entry.id !== id) return entry;
        const updatedEntry = { ...entry, [field]: value };
        if (field === 'date' && typeof value === 'string' && value.length >= 7) {
          updatedEntry.monthId = value.substring(0, 7);
        }
        return updatedEntry;
      });
      persistLocal(nextEntries);
      return nextEntries;
    });

    if (usingLocalFallback) return;

    const { error } = await supabase.from('income_entries').update(updatePayload).eq('id', id);
    if (error) {
      setSyncError(`Could not save changes: ${formatDbError(error)}`);
    } else {
      setSyncError(null);
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center font-semibold text-lg text-blue-600">Syncing with Cloud Database...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {syncError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Database sync issue</p>
            <p className="mt-1">{syncError}</p>
            {usingLocalFallback && (
              <p className="mt-2">
                Saving locally for now. Run <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code> in the Supabase SQL editor to enable cloud sync.
              </p>
            )}
          </div>
        )}

        {/* Navigation / Page Selector */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Ledger</h1>
            <p className="text-gray-500">
              Organized by Year and Month{userName ? ` · Signed in as ${userName}` : ''}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadMonthPdf(entries, currentMonthId, selectedYear, selectedMonth)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Download size={16} />
              <span>Month PDF</span>
            </button>
            <button
              onClick={() => downloadYearPdf(entries, selectedYear)}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <Download size={16} />
              <span>Year PDF</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
            <div className="flex items-center space-x-4 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <Calendar className="text-gray-400 ml-2" size={20} />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-lg focus:outline-none cursor-pointer"
            >
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <span className="text-gray-300">/</span>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent font-medium text-lg focus:outline-none cursor-pointer pr-2"
            >
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            </div>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Wallet size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{MONTHS.find(m => m.value === selectedMonth)?.label} Total - M</p>
              <h2 className="text-2xl font-bold">৳ {runningM.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg"><Users size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{MONTHS.find(m => m.value === selectedMonth)?.label} Total - T</p>
              <h2 className="text-2xl font-bold">৳ {runningT.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><TrendingUp size={24} /></div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{MONTHS.find(m => m.value === selectedMonth)?.label} Overall Total</p>
              <h2 className="text-2xl font-bold">৳ {(runningM + runningT).toLocaleString()}</h2>
            </div>
          </div>
        </div>

        {/* Spreadsheet Data Entry Layout */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-3 border-b font-semibold w-40">Date</th>
                  <th className="p-3 border-b font-semibold min-w-[200px]">Earned From</th>
                  <th className="p-3 border-b font-semibold w-32">Amount (৳)</th>
                  <th className="p-3 border-b font-semibold w-32">Earned By</th>
                  <th className="p-3 border-b font-semibold min-w-[200px]">Note</th>
                  <th className="p-3 border-b font-semibold w-32 bg-purple-50">Total (M&T)</th>
                  <th className="p-3 border-b font-semibold w-32 bg-blue-50">Total (M)</th>
                  <th className="p-3 border-b font-semibold w-32 bg-green-50">Total (T)</th>
                  <th className="p-3 border-b font-semibold w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No entries found for this month. Click "Add New Row" to start.
                    </td>
                  </tr>
                ) : (
                  displayEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-2">
                        <input
                          type="date"
                          value={entry.date || ''}
                          onChange={(e) => handleLocalChange(entry.id, 'date', e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, 'date', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.earnedFrom}
                          onChange={(e) => handleLocalChange(entry.id, 'earnedFrom', e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, 'earnedFrom', e.target.value)}
                          placeholder="Project name..."
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={entry.amount || ''}
                          onChange={(e) => handleLocalChange(entry.id, 'amount', Number(e.target.value))}
                          onBlur={(e) => saveToCloud(entry.id, 'amount', Number(e.target.value))}
                          placeholder="0"
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={entry.earnedBy}
                          onChange={(e) => {
                            handleLocalChange(entry.id, 'earnedBy', e.target.value);
                            saveToCloud(entry.id, 'earnedBy', e.target.value);
                          }}
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                        >
                          <option value="" disabled>Select...</option>
                          <option value="Masum">Masum</option>
                          <option value="Toyeeba">Toyeeba</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.note}
                          onChange={(e) => handleLocalChange(entry.id, 'note', e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, 'note', e.target.value)}
                          placeholder="Notes..."
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-3 bg-purple-50/50 font-medium text-purple-700">৳ {entry.runningTotal.toLocaleString()}</td>
                      <td className="p-3 bg-blue-50/50 font-medium text-blue-700">৳ {entry.runningM.toLocaleString()}</td>
                      <td className="p-3 bg-green-50/50 font-medium text-green-700">৳ {entry.runningT.toLocaleString()}</td>
                      <td className="p-2 text-center">
                        <button 
                          onClick={() => deleteRow(entry.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Row"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={addRow}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>Add New Row</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}