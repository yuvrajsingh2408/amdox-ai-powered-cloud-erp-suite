import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  GitBranch, ArrowLeft, Plus, Trash2, CheckCircle2, 
  Loader2, AlertCircle, Save, Clock, UserCheck, Shield 
} from 'lucide-react';

interface Step {
  name: string;
  stepOrder: number;
  approverType: string;
  approverValue: string;
  conditionType: string;
  conditionValue: string;
  slaHours: number;
}

const WorkflowBuilder: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state as any;

  // Form configurations
  const [isEdit, setIsEdit] = useState(false);
  const [workflowId, setWorkflowId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [triggerType, setTriggerType] = useState('LEAVE');
  const [steps, setSteps] = useState<Step[]>([]);
  
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      const res = await axios.get('/api/rbac/roles').catch(() => ({ data: { data: [] } }));
      setRoles(res.data?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoles();

    if (stateData?.workflow) {
      const wf = stateData.workflow;
      setIsEdit(true);
      setWorkflowId(wf.id);
      setName(wf.name);
      setDescription(wf.description || '');
      setTriggerType(wf.triggerType);
      
      const mappedSteps = (wf.steps || []).map((s: any) => ({
        name: s.name,
        stepOrder: s.stepOrder,
        approverType: s.approverType,
        approverValue: s.approverValue,
        conditionType: s.conditionType || 'NONE',
        conditionValue: s.conditionValue || '',
        slaHours: s.slaHours || 24,
      }));
      setSteps(mappedSteps.sort((a: any, b: any) => a.stepOrder - b.stepOrder));
    }
  }, [stateData]);

  const handleAddStep = () => {
    const nextOrder = steps.length + 1;
    const newStep: Step = {
      name: `Step ${nextOrder} review`,
      stepOrder: nextOrder,
      approverType: 'ROLE',
      approverValue: 'ADMIN',
      conditionType: 'NONE',
      conditionValue: '',
      slaHours: 24,
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    // Recalculate order indices
    const updated = filtered.map((s, idx) => ({ ...s, stepOrder: idx + 1 }));
    setSteps(updated);
  };

  const handleStepChange = (index: number, field: keyof Step, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (steps.length === 0) {
      setError('Please configure at least 1 approval step stage.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (isEdit) {
        await axios.put(`/api/workflows/${workflowId}`, {
          name,
          description,
          steps,
        });
        setSuccess('Workflow changes saved and version incremented.');
      } else {
        await axios.post('/api/workflows', {
          name,
          description,
          triggerType,
          steps,
        });
        setSuccess('Workflow rules created successfully.');
        // Reset form
        setName('');
        setDescription('');
        setSteps([]);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to save workflow definition.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-slate-100 space-y-6 font-sans">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-slate-900 pb-5 justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/workflows')} className="p-1 hover:bg-slate-900 rounded text-slate-400">
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Workflow Design Canvas</h1>
            <p className="text-slate-400 text-xs mt-0.5">Map custom validation nodes, conditions logic, and SLA thresholds.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-900/30 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side settings configuration */}
        <div className="bg-[#0F172A] border border-slate-900 rounded-2xl p-5 space-y-4 h-fit text-xs">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-900 pb-2 flex items-center gap-1">
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Workflow Header info</span>
          </h2>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Workflow Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Leave Approval Policy"
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details on rules condition mappings..."
              rows={3}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 text-[10px] font-bold uppercase">Trigger Trigger Type</label>
            <select
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              disabled={isEdit}
              className="w-full px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-200 focus:outline-none"
            >
              <option value="LEAVE">Leave Request Submission</option>
              <option value="EXPENSE">Expense Account Claim</option>
              <option value="PURCHASE_REQUISITION">SCM Purchase Requisition</option>
              <option value="PURCHASE_ORDER">Purchase Order Approval</option>
              <option value="INVOICE">Accounts Payable Invoice</option>
              <option value="VENDOR">Supplier Registry Registration</option>
              <option value="EMPLOYEE">New Employee Onboarding</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Workflow Design</span>
          </button>
        </div>

        {/* Right Side node stages ordering (Col span 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Approval Steps Flow</h2>
            <button
              type="button"
              onClick={handleAddStep}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-lg text-xs font-bold text-indigo-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Stage Node</span>
            </button>
          </div>

          {steps.length === 0 ? (
            <div className="text-center py-20 text-slate-600 text-xs border border-dashed border-slate-850 rounded-2xl">
              No approval nodes defined. Add step stages above.
            </div>
          ) : (
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="text-xs font-bold text-slate-200">Stage #{step.stepOrder}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] uppercase font-bold">Stage Title</label>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) => handleStepChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] uppercase font-bold">SLA Limit (Hours)</label>
                      <input
                        type="number"
                        value={step.slaHours}
                        onChange={(e) => handleStepChange(idx, 'slaHours', parseInt(e.target.value))}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] uppercase font-bold">Approver Group Type</label>
                      <select
                        value={step.approverType}
                        onChange={(e) => handleStepChange(idx, 'approverType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                      >
                        <option value="ROLE">Specific Role Mapping</option>
                        <option value="MANAGER">Direct Supervisor Manager</option>
                        <option value="USER">Individual User ID</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] uppercase font-bold">Approver Role/Value</label>
                      <select
                        value={step.approverValue}
                        onChange={(e) => handleStepChange(idx, 'approverValue', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="HR_MANAGER">HR MANAGER</option>
                        <option value="FINANCE_MANAGER">FINANCE MANAGER</option>
                        <option value="SCM_MANAGER">SCM MANAGER</option>
                        <option value="SUPERVISOR">DIRECT MANAGER</option>
                      </select>
                    </div>

                    {/* Conditionals */}
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] uppercase font-bold">Condition rule</label>
                      <select
                        value={step.conditionType}
                        onChange={(e) => handleStepChange(idx, 'conditionType', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                      >
                        <option value="NONE">No Condition branch</option>
                        <option value="AMOUNT_GREATER_THAN">Amount limit holds higher than</option>
                      </select>
                    </div>

                    {step.conditionType !== 'NONE' && (
                      <div className="space-y-1.5">
                        <label className="text-slate-500 text-[10px] uppercase font-bold">Condition Threshold Value</label>
                        <input
                          type="text"
                          value={step.conditionValue}
                          onChange={(e) => handleStepChange(idx, 'conditionValue', e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </form>

    </div>
  );
};

export default WorkflowBuilder;
export { WorkflowBuilder };
