"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, Plus, Trash2, Calendar, Download, LogOut, Sparkles } from 'lucide-react';
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

const inputClass =
  "w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-base md:text-sm text-slate-800 shadow-sm outline-none transition focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-200";

type DisplayEntry = ReturnType<typeof buildRunningTotals>[number];

function EntryEditor({
  entry,
  onChange,
  onBlur,
  onEarnedByChange,
  onDelete,
  running,
  mobile = false,
}: {
  entry: DisplayEntry;
  onChange: (id: string, field: keyof Entry, value: string | number) => void;
  onBlur: (id: string, field: keyof Entry, value: string | number) => void;
  onEarnedByChange: (id: string, value: string) => void;
  onDelete: (id: string) => void;
  running: { runningM: number; runningT: number; runningTotal: number };
  mobile?: boolean;
}) {
  return (
    <>
      <div className={mobile ? "grid grid-cols-1 gap-3" : "contents"}>
        {mobile ? (
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">Entry</p>
              <p className="text-sm font-bold text-slate-800">{entry.earnedFrom || "New income"}</p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(entry.id)}
              className="rounded-xl bg-rose-50 p-2 text-rose-500 transition hover:bg-rose-100"
              title="Delete row"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ) : null}

        <label className={mobile ? "block" : "contents"}>
          {mobile ? <span className="mb-1 block text-xs font-semibold text-slate-500">Date</span> : null}
          <input
            type="date"
            value={entry.date || ""}
            onChange={(e) => onChange(entry.id, "date", e.target.value)}
            onBlur={(e) => onBlur(entry.id, "date", e.target.value)}
            className={inputClass}
          />
        </label>

        <label className={mobile ? "block" : "contents"}>
          {mobile ? <span className="mb-1 block text-xs font-semibold text-slate-500">Earned From</span> : null}
          <input
            type="text"
            value={entry.earnedFrom}
            onChange={(e) => onChange(entry.id, "earnedFrom", e.target.value)}
            onBlur={(e) => onBlur(entry.id, "earnedFrom", e.target.value)}
            placeholder="Salary, tuition..."
            className={inputClass}
          />
        </label>

        <div className={mobile ? "grid grid-cols-2 gap-3" : "contents"}>
          <label className={mobile ? "block" : "contents"}>
            {mobile ? <span className="mb-1 block text-xs font-semibold text-slate-500">Amount (৳)</span> : null}
            <input
              type="number"
              value={entry.amount || ""}
              onChange={(e) => onChange(entry.id, "amount", Number(e.target.value))}
              onBlur={(e) => onBlur(entry.id, "amount", Number(e.target.value))}
              placeholder="0"
              className={inputClass}
            />
          </label>

          <label className={mobile ? "block" : "contents"}>
            {mobile ? <span className="mb-1 block text-xs font-semibold text-slate-500">Earned By</span> : null}
            <select
              value={entry.earnedBy}
              onChange={(e) => onEarnedByChange(entry.id, e.target.value)}
              className={`${inputClass} bg-white`}
            >
              <option value="" disabled>
                Select...
              </option>
              <option value="Masum">Masum</option>
              <option value="Toyeeba">Toyeeba</option>
            </select>
          </label>
        </div>

        <label className={mobile ? "block" : "contents"}>
          {mobile ? <span className="mb-1 block text-xs font-semibold text-slate-500">Note</span> : null}
          <input
            type="text"
            value={entry.note}
            onChange={(e) => onChange(entry.id, "note", e.target.value)}
            onBlur={(e) => onBlur(entry.id, "note", e.target.value)}
            placeholder="Notes..."
            className={inputClass}
          />
        </label>
      </div>

      {mobile ? (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 p-3 text-center">
            <p className="text-[10px] font-bold uppercase text-violet-600">Total</p>
            <p className="mt-1 text-sm font-bold text-violet-900">৳ {running.runningTotal.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 p-3 text-center">
            <p className="text-[10px] font-bold uppercase text-blue-600">Masum</p>
            <p className="mt-1 text-sm font-bold text-blue-900">৳ {running.runningM.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 p-3 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-600">Toyeeba</p>
            <p className="mt-1 text-sm font-bold text-emerald-900">৳ {running.runningT.toLocaleString()}</p>
          </div>
        </div>
      ) : null}
    </>
  );
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

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-white/70 bg-white/90 px-8 py-6 text-center shadow-xl shadow-violet-200/40 backdrop-blur">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-fuchsia-500" />
          <p className="font-semibold text-violet-900">Syncing with cloud...</p>
        </div>
      </div>
    );
  }

  const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label ?? selectedMonth;
  const overallTotal = runningM + runningT;

  return (
    <div className="min-h-screen px-3 py-4 text-slate-800 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-[1400px] space-y-5 sm:space-y-6">
        {syncError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 shadow-sm">
            <p className="font-semibold">Database sync issue</p>
            <p className="mt-1">{syncError}</p>
            {usingLocalFallback && (
              <p className="mt-2">
                Saving locally for now. Run <code className="rounded bg-amber-100 px-1">supabase/schema.sql</code> in the Supabase SQL editor to enable cloud sync.
              </p>
            )}
          </div>
        )}

        <section className="overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-xl shadow-violet-200/30 backdrop-blur">
          <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-4 py-5 text-white sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="flex items-center gap-1 text-sm font-medium text-white/90">
                  <Sparkles size={14} />
                  Family Income Tracker
                </p>
                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Income Ledger</h1>
                <p className="mt-1 text-sm text-white/85">
                  {monthName} {selectedYear}
                  {userName ? ` · ${userName}` : ""}
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto">
                <div className="flex items-center gap-2 rounded-2xl bg-white/15 p-2 backdrop-blur">
                  <Calendar className="ml-1 shrink-0 text-white/90" size={18} />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="min-w-0 flex-1 rounded-xl bg-white/95 px-2 py-2 text-sm font-semibold text-violet-900 outline-none"
                  >
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-24 rounded-xl bg-white/95 px-2 py-2 text-sm font-semibold text-violet-900 outline-none"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  <button
                    onClick={() => downloadMonthPdf(entries, currentMonthId, selectedYear, selectedMonth)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-white"
                  >
                    <Download size={16} />
                    <span>Month PDF</span>
                  </button>
                  <button
                    onClick={() => downloadYearPdf(entries, selectedYear)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/95 px-3 py-2.5 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-white"
                  >
                    <Download size={16} />
                    <span>Year PDF</span>
                  </button>
                  <button
                    onClick={logout}
                    className="col-span-2 flex items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 sm:col-span-1"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-lg shadow-blue-300/40">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5">
                <Wallet size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-100">{monthName} · Masum</p>
                <h2 className="text-2xl font-bold">৳ {runningM.toLocaleString()}</h2>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg shadow-emerald-300/40">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5">
                <Users size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-100">{monthName} · Toyeeba</p>
                <h2 className="text-2xl font-bold">৳ {runningT.toLocaleString()}</h2>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 p-5 text-white shadow-lg shadow-fuchsia-300/40">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white/20 p-2.5">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-sm font-medium text-fuchsia-100">{monthName} · Combined</p>
                <h2 className="text-2xl font-bold">৳ {overallTotal.toLocaleString()}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-xl shadow-violet-200/30 backdrop-blur">
          <div className="border-b border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-4 py-3 sm:px-6">
            <h2 className="text-lg font-bold text-violet-900">Monthly Entries</h2>
            <p className="text-sm text-violet-600">Tap a card on mobile or edit rows on desktop</p>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {displayEntries.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 p-8 text-center text-violet-500">
                No entries for this month. Tap Add New Row to start.
              </div>
            ) : (
              displayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/40 p-4 shadow-sm"
                >
                  <EntryEditor
                    entry={entry}
                    mobile
                    running={{
                      runningM: entry.runningM,
                      runningT: entry.runningT,
                      runningTotal: entry.runningTotal,
                    }}
                    onChange={handleLocalChange}
                    onBlur={saveToCloud}
                    onEarnedByChange={(id, value) => {
                      handleLocalChange(id, "earnedBy", value);
                      saveToCloud(id, "earnedBy", value);
                    }}
                    onDelete={deleteRow}
                  />
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px] border-collapse text-left">
              <thead>
                <tr className="bg-gradient-to-r from-violet-100 to-fuchsia-100 text-xs uppercase tracking-wider text-violet-700">
                  <th className="p-3 font-bold">Date</th>
                  <th className="p-3 font-bold">Earned From</th>
                  <th className="p-3 font-bold">Amount (৳)</th>
                  <th className="p-3 font-bold">Earned By</th>
                  <th className="p-3 font-bold">Note</th>
                  <th className="bg-violet-200/50 p-3 font-bold">Total (M&T)</th>
                  <th className="bg-sky-200/50 p-3 font-bold">Total (M)</th>
                  <th className="bg-emerald-200/50 p-3 font-bold">Total (T)</th>
                  <th className="p-3 text-center font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-50">
                {displayEntries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-violet-400">
                      No entries found for this month. Click Add New Row to start.
                    </td>
                  </tr>
                ) : (
                  displayEntries.map((entry) => (
                    <tr key={entry.id} className="group transition hover:bg-violet-50/50">
                      <td className="p-2">
                        <input
                          type="date"
                          value={entry.date || ""}
                          onChange={(e) => handleLocalChange(entry.id, "date", e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, "date", e.target.value)}
                          className={inputClass}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.earnedFrom}
                          onChange={(e) => handleLocalChange(entry.id, "earnedFrom", e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, "earnedFrom", e.target.value)}
                          placeholder="Project name..."
                          className={inputClass}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={entry.amount || ""}
                          onChange={(e) => handleLocalChange(entry.id, "amount", Number(e.target.value))}
                          onBlur={(e) => saveToCloud(entry.id, "amount", Number(e.target.value))}
                          placeholder="0"
                          className={inputClass}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={entry.earnedBy}
                          onChange={(e) => {
                            handleLocalChange(entry.id, "earnedBy", e.target.value);
                            saveToCloud(entry.id, "earnedBy", e.target.value);
                          }}
                          className={`${inputClass} bg-white`}
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="Masum">Masum</option>
                          <option value="Toyeeba">Toyeeba</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.note}
                          onChange={(e) => handleLocalChange(entry.id, "note", e.target.value)}
                          onBlur={(e) => saveToCloud(entry.id, "note", e.target.value)}
                          placeholder="Notes..."
                          className={inputClass}
                        />
                      </td>
                      <td className="bg-violet-50/70 p-3 text-sm font-bold text-violet-700">
                        ৳ {entry.runningTotal.toLocaleString()}
                      </td>
                      <td className="bg-sky-50/70 p-3 text-sm font-bold text-blue-700">
                        ৳ {entry.runningM.toLocaleString()}
                      </td>
                      <td className="bg-emerald-50/70 p-3 text-sm font-bold text-emerald-700">
                        ৳ {entry.runningT.toLocaleString()}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => deleteRow(entry.id)}
                          className="rounded-xl p-2 text-rose-300 transition hover:bg-rose-50 hover:text-rose-500 md:opacity-0 md:group-hover:opacity-100"
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

          <div className="border-t border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
            <button
              onClick={addRow}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-fuchsia-300/30 transition hover:brightness-110 sm:w-auto"
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