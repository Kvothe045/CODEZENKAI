'use client';

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { XCircle, Calendar, Clock, Plus, AlertCircle, Info } from 'lucide-react';

import "react-datepicker/dist/react-datepicker.css";

export interface NewContestData {
  title: string;
  start_time: string;
  end_time: string;
  duration: number;
  problems: string[];
}

interface CreateContestFormProps {
  onCreateAction: (data: NewContestData) => void; // Renamed from onCreate to onCreateAction
  loading?: boolean;
}

export default function CreateContestForm({ onCreateAction, loading = false }: CreateContestFormProps) {
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState(120);
  const [problems, setProblems] = useState<string[]>(['']);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-calculate end time when start time or duration changes
  useEffect(() => {
    if (startTime && duration) {
      const calculatedEndTime = new Date(startTime.getTime() + duration * 60 * 1000);
      setEndTime(calculatedEndTime);
    }
  }, [startTime, duration]);

  const updateProblem = (index: number, value: string) => {
    const copy = [...problems];
    copy[index] = value;
    setProblems(copy);
  };

  const addProblem = () => {
    setProblems([...problems, '']);
  };

  const removeProblem = (index: number) => {
    if (problems.length <= 1) return;
    setProblems(problems.filter((_, i) => i !== index));
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];
    
    if (!title.trim()) {
      validationErrors.push('Contest title is required');
    }
    
    if (!startTime) {
      validationErrors.push('Start time is required');
    } else {
      // Check if start time is in the future (at least 5 minutes from now)
      const now = new Date();
      const minStartTime = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
      
      if (startTime < minStartTime) {
        validationErrors.push('Start time must be at least 5 minutes in the future');
      }
    }
    
    if (!endTime) {
      validationErrors.push('End time is required');
    }
    
    if (startTime && endTime && startTime >= endTime) {
      validationErrors.push('End time must be after start time');
    }
    
    if (duration < 30) {
      validationErrors.push('Duration must be at least 30 minutes');
    }
    
    const validProblems = problems.filter(p => p.trim() !== '');
    if (validProblems.length === 0) {
      validationErrors.push('At least one problem URL is required');
    }
    
    // Validate problem URLs
    validProblems.forEach((problem, index) => {
      if (!problem.includes('codeforces.com')) {
        validationErrors.push(`Problem ${index + 1}: Must be a valid Codeforces URL`);
      }
    });
    
    return validationErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }

    const data: NewContestData = {
      title: title.trim(),
      start_time: startTime!.toISOString(),
      end_time: endTime!.toISOString(),
      duration,
      problems: problems.filter(p => p.trim() !== ''),
    };

    onCreateAction(data); // Updated function name
  };

  const getTimeUntilStart = () => {
    if (!startTime) return '';
    
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Contest starts immediately';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  const quickDurationOptions = [30, 60, 90, 120, 150, 180];

  return (
    <div className="bg-vscode-sidebar border border-vscode-line rounded-lg p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-vscode-text mb-2 flex items-center">
          <Calendar className="h-6 w-6 mr-2 text-vscode-blue" />
          Create New Contest
        </h2>
        <p className="text-vscode-comment">Set up a new programming contest with problems from Codeforces</p>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 bg-vscode-red/10 border border-vscode-red rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-vscode-red mr-2" />
            <span className="font-medium text-vscode-red">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-vscode-red text-sm">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Contest Title */}
        <div>
          <label className="block text-vscode-text font-semibold mb-3 text-lg">
            Contest Title
          </label>
          <input
            type="text"
            placeholder="e.g., Weekly Practice Contest #1"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-vscode-editor border border-vscode-line rounded-lg px-4 py-3 text-vscode-text focus:outline-none focus:border-vscode-blue focus:ring-2 focus:ring-vscode-blue/20 transition-all"
          />
        </div>

        {/* Date and Time Section */}
        <div className="bg-vscode-editor rounded-lg p-6 border border-vscode-line">
          <h3 className="text-lg font-semibold text-vscode-text mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-vscode-green" />
            Schedule & Duration
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Start Time */}
            <div>
              <label className="block text-vscode-text font-medium mb-2">
                Start Date & Time
              </label>
              <div className="relative">
                <DatePicker
                  selected={startTime}
                  onChange={(date) => setStartTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy 'at' h:mm aa"
                  placeholderText="Choose when contest starts"
                  className="w-full bg-vscode-sidebar border border-vscode-line rounded-lg px-4 py-3 text-vscode-text focus:outline-none focus:border-vscode-blue transition-all"
                  calendarClassName="bg-vscode-sidebar border border-vscode-line"
                  minDate={new Date()}
                  minTime={new Date(new Date().setHours(0, 0, 0, 0))} // Fixed: Create proper Date object
                  maxTime={new Date(new Date().setHours(23, 59, 59, 999))} // Fixed: Create proper Date object
                />
                <Calendar className="absolute right-3 top-3 h-5 w-5 text-vscode-comment pointer-events-none" />
              </div>
              {startTime && (
                <div className="mt-2 text-sm text-vscode-green flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  {getTimeUntilStart()}
                </div>
              )}
            </div>

            {/* End Time (Auto-calculated, but editable) */}
            <div>
              <label className="block text-vscode-text font-medium mb-2">
                End Date & Time
                <span className="text-vscode-comment text-sm ml-2">(auto-calculated)</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={endTime}
                  onChange={(date) => setEndTime(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy 'at' h:mm aa"
                  placeholderText="Contest end time"
                  className="w-full bg-vscode-sidebar border border-vscode-line rounded-lg px-4 py-3 text-vscode-text focus:outline-none focus:border-vscode-blue transition-all"
                  calendarClassName="bg-vscode-sidebar border border-vscode-line"
                  minDate={startTime || new Date()}
                />
                <Clock className="absolute right-3 top-3 h-5 w-5 text-vscode-comment pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-vscode-text font-medium mb-3">
              Contest Duration
            </label>
            
            {/* Quick Duration Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickDurationOptions.map(mins => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDuration(mins)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    duration === mins
                      ? 'bg-vscode-blue text-white'
                      : 'bg-vscode-line text-vscode-text hover:bg-vscode-blue/20'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Custom Duration Input */}
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min={30}
                max={600}
                value={duration}
                onChange={e => setDuration(parseInt(e.target.value) || 120)}
                className="w-24 bg-vscode-sidebar border border-vscode-line rounded-lg px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue"
              />
              <span className="text-vscode-text">minutes</span>
              <span className="text-vscode-comment text-sm">
                ({Math.floor(duration / 60)}h {duration % 60}m)
              </span>
            </div>
          </div>
        </div>

        {/* Problems Section */}
        <div className="bg-vscode-editor rounded-lg p-6 border border-vscode-line">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-vscode-text flex items-center">
              <Plus className="h-5 w-5 mr-2 text-vscode-yellow" />
              Contest Problems
            </h3>
            <button
              type="button"
              onClick={addProblem}
              className="bg-vscode-green text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-400 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Problem
            </button>
          </div>
          
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {problems.map((problem, index) => (
              <div key={index} className="flex items-center space-x-3 bg-vscode-sidebar rounded-lg p-3 border border-vscode-line">
                <div className="flex-shrink-0 w-8 h-8 bg-vscode-blue text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + index)}
                </div>
                <input
                  type="url"
                  placeholder="https://codeforces.com/contest/1234/problem/A"
                  value={problem}
                  onChange={e => updateProblem(index, e.target.value)}
                  className="flex-1 bg-vscode-editor border border-vscode-line rounded-lg px-3 py-2 text-vscode-text focus:outline-none focus:border-vscode-blue transition-all"
                />
                {problems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProblem(index)}
                    className="bg-vscode-red text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                    aria-label={`Remove problem ${index + 1}`}
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-vscode-comment bg-vscode-bg rounded-lg p-3">
            <strong>Tips:</strong> Use Codeforces problem URLs. Problems will be labeled A, B, C, etc. in the order you add them.
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-vscode-line">
          <button
            type="button"
            onClick={() => {
              setTitle('');
              setStartTime(null);
              setEndTime(null);
              setDuration(120);
              setProblems(['']);
              setErrors([]);
            }}
            className="px-6 py-3 border border-vscode-line text-vscode-text rounded-lg hover:bg-vscode-line transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-vscode-blue text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Creating Contest...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Create Contest
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
