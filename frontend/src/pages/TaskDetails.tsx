import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageSquare, Paperclip, ClipboardList, 
  Send, ShieldAlert, CheckCircle2, User, Clock 
} from 'lucide-react';
import axios from 'axios';

interface Comment {
  id: string;
  comment: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface Activity {
  id: string;
  action: string;
  createdAt: string;
  performedById: string;
}

interface TaskInfo {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  comments: Comment[];
  activities: Activity[];
}

const TaskDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskInfo | null>(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTaskDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/projects/tasks/${id}`);
      if (res.data.success) {
        setTask(res.data.data);
      }
    } catch (err) {
      // Mock fallbacks
      setTask({
        id: id || 't1',
        name: 'Mount A1 steel racks',
        description: 'Verify shelf limits and bolt racks tightly to Texas facility floors.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        comments: [
          { id: 'c1', comment: 'Racks arrived safely from vendor.', createdAt: '2026-07-08T10:00:00Z', user: { firstName: 'Alice', lastName: 'Smith' } }
        ],
        activities: [
          { id: 'act1', action: 'Task status changed to IN_PROGRESS', createdAt: '2026-07-09T08:00:00Z', performedById: 'Alice Smith' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;

    try {
      const res = await axios.post(`/api/projects/tasks/${id}/comments`, { comment: newComment });
      if (res.data.success) {
        setNewComment('');
        fetchTaskDetails();
      }
    } catch (err) {
      if (task) {
        setTask({
          ...task,
          comments: [
            ...task.comments,
            {
              id: `c-${new Date().getTime()}`,
              comment: newComment,
              createdAt: new Date().toISOString(),
              user: { firstName: 'Current', lastName: 'User' }
            }
          ]
        });
        setNewComment('');
      }
    }
  };

  if (loading || !task) {
    return <div className="text-center py-20 text-slate-400 font-medium">Loading task inspector...</div>;
  }

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
        <Link to="/projects" className="hover:text-slate-650 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-4">
        <div>
          <span className="text-[9px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {task.priority} Priority
          </span>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-2">{task.name}</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">{task.description}</p>
        </div>

        <div className="border-t border-slate-100 pt-4 flex gap-4 text-xs font-semibold text-slate-500">
          <span>Status: <span className="text-slate-800 font-bold uppercase">{task.status}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comments Feed */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-slate-850" />
            Comments & Discussion
          </h3>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {task.comments.map(c => (
              <div key={c.id} className="p-3 bg-slate-50 border border-slate-150 rounded-lg space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span>{c.user.firstName} {c.user.lastName}</span>
                  <span className="font-mono">{c.createdAt.substring(11, 16)}</span>
                </div>
                <p className="text-xs font-medium text-slate-700">{c.comment}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handlePostComment} className="flex gap-2 border-t border-slate-100 pt-3">
            <input
              type="text"
              placeholder="Add details about task progress..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-bold transition-all duration-150"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

        {/* Activity history logs */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ClipboardList className="h-4.5 w-4.5 text-slate-850" />
            Activity Timeline
          </h3>

          <div className="space-y-3">
            {task.activities.map(act => (
              <div key={act.id} className="flex gap-2 items-start text-xs font-medium">
                <Clock className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-850 block">{act.action}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">by {act.performedById}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
