"use client";

import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Users, Plus, Trash2, Calendar } from 'lucide-react';

type Entry = {
  id: string;
  monthId: string;
  date: string;
  earnedFrom: string;
  amount: number;
  earnedBy: 'Masum' | 'Toyeeba' | '';
  note: string;
};

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' }
];

const YEARS = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

// Converted 2025 Data (You can add the missing ones manually in the UI later!)
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
  
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedMonth, setSelectedMonth] = useState('01');

  useEffect(() => {
    const saved = localStorage.getItem('income-entries-v3'); 
    if (saved) {
      setEntries(JSON.parse(saved));
    } else {
      const initializedData = PREFILLED_DATA.map((entry) => ({
        ...entry,
        id: crypto.randomUUID(),
        earnedBy: entry.earnedBy as 'Masum' | 'Toyeeba' | ''
      }));
      setEntries(initializedData);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('income-entries-v3', JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const currentMonthId = `${selectedYear}-${selectedMonth}`;
  const currentViewEntries = entries.filter(entry => entry.monthId === currentMonthId);
  const sortedEntries = [...currentViewEntries].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  let runningM = 0;
  let runningT = 0;
  
  const displayEntries = sortedEntries.map(entry => {
    const amount = Number(entry.amount) || 0;
    if (entry.earnedBy === 'Masum') runningM += amount;
    if (entry.earnedBy === 'Toyeeba') runningT += amount;

    return {
      ...entry,
      runningM,
      runningT,
      runningTotal: runningM + runningT
    };
  });

  const addRow = () => {
    const defaultDate = `${currentMonthId}-01`;
    setEntries([
      ...entries, 
      { id: crypto.randomUUID(), monthId: currentMonthId, date: defaultDate, earnedFrom: '', amount: 0, earnedBy: '', note: '' }
    ]);
  };

  const deleteRow = (id: string) => setEntries(entries.filter(entry => entry.id !== id));

  const updateEntry = (id: string, field: keyof Entry, value: string | number) => {
    setEntries(entries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // --- THIS IS THE MAGIC TRICK ---
        // If the date is changed, automatically update the hidden monthId!
        if (field === 'date' && typeof value === 'string' && value.length >= 7) {
          updatedEntry.monthId = value.substring(0, 7);
        }
        
        return updatedEntry;
      }
      return entry;
    }));
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* Navigation / Page Selector */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Income Ledger</h1>
            <p className="text-gray-500">Organized by Year and Month</p>
          </div>
          
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
                          onChange={(e) => updateEntry(entry.id, 'date', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={entry.earnedFrom}
                          onChange={(e) => updateEntry(entry.id, 'earnedFrom', e.target.value)}
                          placeholder="Project name..."
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={entry.amount || ''}
                          onChange={(e) => updateEntry(entry.id, 'amount', Number(e.target.value))}
                          placeholder="0"
                          className="w-full p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={entry.earnedBy}
                          onChange={(e) => updateEntry(entry.id, 'earnedBy', e.target.value)}
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
                          onChange={(e) => updateEntry(entry.id, 'note', e.target.value)}
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