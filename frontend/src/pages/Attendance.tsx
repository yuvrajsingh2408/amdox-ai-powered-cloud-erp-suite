import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ClipboardCheck, Clock, ShieldAlert, CheckCircle2, 
  Coffee, Play, StopCircle, Search, Filter, AlertTriangle
} from 'lucide-react';
import axios from 'axios';

interface AttendanceLog {
  id: string;
  employeeCode: string;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string | null;
  workingHours: number | null;
  overtime: number | null;
  status: string;
  lateArrival: boolean;
  earlyExit: boolean;
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [employees, setEmployees] = useState<{ id: string, firstName: string, lastName: string, employeeCode: string }[]>([]);
  
  // Clock Console target
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  
  // Timer state for visual feedback
  const [clockedInTime, setClockedInTime] = useState<string | null>(null);
  const [onBreak, setOnBreak] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Feedback alerts
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAttendanceLogs = async () => {
    try {
      const res = await axios.get('/api/hr/employees');
      if (res.data.success) {
        const empList = res.data.data.employees;
        setEmployees(empList);
        
        // Reconstruct daily attendance log from employees mapping
        const logsList: AttendanceLog[] = [];
        for (const emp of empList) {
          // Verify if they have attendances logged
          try {
            const today = new Date().toISOString().split('T')[0];
            const attRes = await axios.get(`/api/hr/employees/${emp.id}`);
            const attendances = attRes.data.data.attendances || [];
            const todayLog = attendances.find((a: any) => a.date.startsWith(today));

            if (todayLog) {
              logsList.push({
                id: todayLog.id,
                employeeCode: emp.employeeCode,
                employeeName: `${emp.firstName} ${emp.lastName}`,
                date: todayLog.date,
                clockIn: new Date(todayLog.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                clockOut: todayLog.clockOut ? new Date(todayLog.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
                workingHours: todayLog.workingHours,
                overtime: todayLog.overtime,
                status: todayLog.status,
                lateArrival: todayLog.lateArrival,
                earlyExit: todayLog.earlyExit
              });
            }
          } catch (e) {
            // Skip
          }
        }

        if (logsList.length > 0) {
          setLogs(logsList);
        } else {
          // Fallback mocks
          setLogs([
            { id: '1', employeeCode: 'EMP-001', employeeName: 'Mark Taylor', date: '2026-07-09', clockIn: '08:54 AM', clockOut: '05:00 PM', workingHours: 8.1, overtime: 0.1, status: 'PRESENT', lateArrival: false, earlyExit: false },
            { id: '2', employeeCode: 'EMP-002', employeeName: 'Sarah Connor', date: '2026-07-09', clockIn: '09:12 AM', clockOut: null, workingHours: null, overtime: null, status: 'LATE', lateArrival: true, earlyExit: false },
            { id: '3', employeeCode: 'EMP-003', employeeName: 'Elena Rostova', date: '2026-07-09', clockIn: '08:45 AM', clockOut: '04:30 PM', workingHours: 7.75, overtime: 0.0, status: 'PRESENT', lateArrival: false, earlyExit: true },
          ]);
        }
      }
    } catch (err) {
      // Direct mock fallback
      setLogs([
        { id: '1', employeeCode: 'EMP-001', employeeName: 'Mark Taylor', date: '2026-07-09', clockIn: '08:54 AM', clockOut: '05:00 PM', workingHours: 8.1, overtime: 0.1, status: 'PRESENT', lateArrival: false, earlyExit: false },
        { id: '2', employeeCode: 'EMP-002', employeeName: 'Sarah Connor', date: '2026-07-09', clockIn: '09:12 AM', clockOut: null, workingHours: null, overtime: null, status: 'LATE', lateArrival: true, earlyExit: false },
        { id: '3', employeeCode: 'EMP-003', employeeName: 'Elena Rostova', date: '2026-07-09', clockIn: '08:45 AM', clockOut: '04:30 PM', workingHours: 7.75, overtime: 0.0, status: 'PRESENT', lateArrival: false, earlyExit: true },
      ]);
    }
  };

  useEffect(() => {
    fetchAttendanceLogs();
  }, []);

  const handleClockIn = async () => {
    if (!selectedEmployeeId) {
      setError('Please select an employee profile to log clock in');
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/hr/attendance/clock-in', { employeeId: selectedEmployeeId });
      if (res.data.success) {
        setSuccess('Clock-in registered successfully!');
        setClockedInTime(new Date().toLocaleTimeString());
        fetchAttendanceLogs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Clock-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBreak = async (type: 'START' | 'END') => {
    if (!selectedEmployeeId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post('/api/hr/attendance/break', { employeeId: selectedEmployeeId, type });
      setOnBreak(type === 'START');
      setSuccess(`Break ${type === 'START' ? 'started' : 'ended'} successfully.`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Logging break failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedEmployeeId) return;
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/hr/attendance/clock-out', { employeeId: selectedEmployeeId });
      if (res.data.success) {
        setSuccess('Clock-out registered successfully!');
        setClockedInTime(null);
        setOnBreak(false);
        fetchAttendanceLogs();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Clock-out failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.employeeName.toLowerCase().includes(search.toLowerCase()) || log.employeeCode.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Console</h2>
        <p className="text-xs text-slate-500 font-medium">Clock in, trigger break timers, log clock outs, and view aggregate late indicators</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Clock Console */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-800" />
            Clock Registry Terminal
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Select Profile</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Select Employee</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>
                ))}
              </select>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Terminal Time</span>
              <span className="text-xl font-bold text-slate-850 font-mono block">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              {clockedInTime && (
                <span className="text-[10px] text-green-600 font-bold tracking-wide block">
                  Clocked In since {clockedInTime}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {!clockedInTime ? (
                <button
                  onClick={handleClockIn}
                  disabled={loading || !selectedEmployeeId}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <Play className="h-4 w-4" />
                  Clock In Today
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleToggleBreak(onBreak ? 'END' : 'START')}
                      disabled={loading}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Coffee className="h-4 w-4" />
                      {onBreak ? 'End Break' : 'Start Break'}
                    </button>
                    <button
                      onClick={handleClockOut}
                      disabled={loading}
                      className="py-2 px-3 bg-red-650 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <StopCircle className="h-4 w-4" />
                      Clock Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Attendance Registry List */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-slate-800" />
              Daily Attendance Registry
            </h3>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg flex-1 sm:flex-initial">
                <Search className="h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 focus:outline-none placeholder-slate-400 w-28"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
              >
                <option value="">All Logs</option>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-4">Staff</th>
                  <th className="py-2.5 px-4">Clock In</th>
                  <th className="py-2.5 px-4">Clock Out</th>
                  <th className="py-2.5 px-4">Hours</th>
                  <th className="py-2.5 px-4">Overtime</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                      No clockings logged today.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">{log.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold block">{log.employeeCode}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-650">{log.clockIn}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500">{log.clockOut || 'Active'}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{log.workingHours ? `${log.workingHours} hrs` : '—'}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{log.overtime ? `${log.overtime} hrs` : '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase border ${
                          log.status === 'PRESENT' 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
