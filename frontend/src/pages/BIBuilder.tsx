import React, { useState, useEffect } from 'react';
import { 
  Plus, Layout, Save, Trash2, ArrowUpRight, 
  Settings, Layers, RefreshCw, X, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';

interface Widget {
  id: string;
  type: 'kpi' | 'bar' | 'area';
  title: string;
  w: number; // width factor
}

const BIBuilder: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'w1', type: 'kpi', title: 'Cash holdings gauge', w: 1 },
    { id: 'w2', type: 'bar', title: 'Q1 Revenue overview', w: 2 }
  ]);
  const [savedLayouts, setSavedLayouts] = useState<any[]>([]);
  const [layoutName, setLayoutName] = useState('My Custom Workspace');

  // Modal selector details
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [widgetTitle, setWidgetTitle] = useState('');
  const [widgetType, setWidgetType] = useState<'kpi' | 'bar' | 'area'>('kpi');
  const [widgetWidth, setWidgetWidth] = useState('1');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchLayouts = async () => {
    try {
      const res = await axios.get('/api/bi/dashboards');
      if (res.data.success) {
        setSavedLayouts(res.data.data);
      }
    } catch (err) {
      setSavedLayouts([{ id: 'mock1', name: 'IT Infrastructure monitoring' }]);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleAddWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!widgetTitle) return;

    const newWidget: Widget = {
      id: `w-${new Date().getTime()}`,
      type: widgetType,
      title: widgetTitle,
      w: parseInt(widgetWidth) || 1
    };

    setWidgets([...widgets, newWidget]);
    setIsModalOpen(false);
    setWidgetTitle('');
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const handleSaveLayout = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await axios.post('/api/bi/dashboards', {
        name: layoutName,
        layoutJson: JSON.stringify(widgets)
      });
      if (res.data.success) {
        setSuccess('Custom dashboard layout config saved successfully!');
        fetchLayouts();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save layout');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadLayout = (layout: any) => {
    try {
      const parsed = JSON.parse(layout.layoutJson);
      setWidgets(parsed);
      setLayoutName(layout.name);
      setSuccess(`Loaded layout: ${layout.name}`);
    } catch (err) {
      setError('Failed to parse layout details');
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Custom Dashboard Builder</h2>
          <p className="text-xs text-slate-500 font-medium">Design personalized grids, save layouts database settings, and bind charts</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => { setError(''); setSuccess(''); setIsModalOpen(true); }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </button>
          <button
            onClick={handleSaveLayout}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Save className="h-4 w-4" />
            Save Workspace
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 max-w-3xl">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2.5 text-xs text-green-700 max-w-3xl">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-green-500 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: saved layouts */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 h-fit space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Layout className="h-4 w-4 text-slate-800" />
            Saved Workspaces
          </h3>

          <div className="space-y-2">
            {savedLayouts.map(lay => (
              <div 
                key={lay.id}
                onClick={() => handleLoadLayout(lay)}
                className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
              >
                {lay.name}
              </div>
            ))}
          </div>
        </div>

        {/* Right Layout Workspace */}
        <div className="lg:col-span-3 bg-slate-50 border border-slate-250 border-dashed rounded-xl p-5 min-h-[400px] space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <input
              type="text"
              value={layoutName}
              onChange={(e) => setLayoutName(e.target.value)}
              className="bg-transparent font-bold text-sm text-slate-800 focus:outline-none border-b border-transparent focus:border-slate-400 pb-0.5 w-56"
            />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Drag & Drop Grid Workspace</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {widgets.map(w => (
              <div 
                key={w.id}
                className={`bg-white border border-slate-200 shadow-sm rounded-lg p-4 flex flex-col justify-between h-32 transition-all ${
                  w.w === 3 ? 'sm:col-span-3' : w.w === 2 ? 'sm:col-span-2' : 'sm:col-span-1'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-xs text-slate-800 block truncate">{w.title}</span>
                  <button 
                    onClick={() => handleRemoveWidget(w.id)}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>Widget Type: {w.type}</span>
                  <Settings className="h-4 w-4 text-slate-655" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Widget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg shadow-xl w-full max-w-md overflow-hidden font-sans">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Add custom Widget</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-655">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddWidget} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Widget Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q2 Expenditure balance"
                  value={widgetTitle}
                  onChange={(e) => setWidgetTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Visualization Type</label>
                  <select
                    value={widgetType}
                    onChange={(e) => setWidgetType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="kpi">KPI Card</option>
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-1 pl-0.5">Grid Column Width</label>
                  <select
                    value={widgetWidth}
                    onChange={(e) => setWidgetWidth(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="1">1 Column Width</option>
                    <option value="2">2 Columns Width</option>
                    <option value="3">Full Row Width</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors"
              >
                Insert Widget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BIBuilder;
