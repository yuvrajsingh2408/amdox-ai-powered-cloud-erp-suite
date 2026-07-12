import React, { useState, useEffect } from 'react';
import { Network, ChevronDown, ChevronRight, User, ShieldAlert, Award } from 'lucide-react';
import axios from 'axios';

interface OrgNode {
  id: string;
  firstName: string;
  lastName: string;
  designation: string;
  managerId: string | null;
  avatarUrl: string | null;
  subordinates?: OrgNode[];
}

const OrganizationChart: React.FC = () => {
  const [flatList, setFlatList] = useState<OrgNode[]>([]);
  const [treeRoots, setTreeRoots] = useState<OrgNode[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const fetchOrgChart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/org/chart');
      if (res.data.success) {
        const data: OrgNode[] = res.data.data;
        setFlatList(data);
        buildHierarchy(data);
      }
    } catch (err) {
      // Fallback mocks
      const mockData: OrgNode[] = [
        { id: '1', firstName: 'Mark', lastName: 'Taylor', designation: 'Technical Architect (CEO)', managerId: null, avatarUrl: null },
        { id: '2', firstName: 'Sarah', lastName: 'Connor', designation: 'SCM Director', managerId: '1', avatarUrl: null },
        { id: '3', firstName: 'Elena', lastName: 'Rostova', designation: 'Finance Director', managerId: '1', avatarUrl: null },
        { id: '4', firstName: 'David', lastName: 'Miller', designation: 'SCM Associate', managerId: '2', avatarUrl: null },
        { id: '5', firstName: 'Sophia', lastName: 'Loren', designation: 'Treasury Analyst', managerId: '3', avatarUrl: null },
      ];
      setFlatList(mockData);
      buildHierarchy(mockData);
    } finally {
      setLoading(false);
    }
  };

  const buildHierarchy = (nodes: OrgNode[]) => {
    const map: Record<string, OrgNode> = {};
    const roots: OrgNode[] = [];

    // Map all nodes first
    nodes.forEach(node => {
      map[node.id] = { ...node, subordinates: [] };
    });

    // Populate hierarchy
    nodes.forEach(node => {
      const mapped = map[node.id];
      if (node.managerId && map[node.managerId]) {
        map[node.managerId].subordinates?.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    setTreeRoots(roots);

    // Expand roots by default
    const expanded: Record<string, boolean> = {};
    roots.forEach(r => {
      expanded[r.id] = true;
    });
    setExpandedNodes(expanded);
  };

  useEffect(() => {
    fetchOrgChart();
  }, []);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Recursive Tree Node Renderer
  const renderNode = (node: OrgNode, level: number = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.subordinates && node.subordinates.length > 0;

    return (
      <div key={node.id} className="space-y-2">
        <div 
          className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-3.5 max-w-md transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Collapse/Expand Toggle */}
          {hasChildren ? (
            <button 
              onClick={() => toggleExpand(node.id)}
              className="p-1 hover:bg-slate-100 rounded text-slate-500"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <span className="w-6 h-6"></span>
          )}

          {/* Avatar Icon */}
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white border border-slate-700 flex items-center justify-center font-bold text-xs">
            {node.firstName[0]}{node.lastName[0]}
          </div>

          <div>
            <h5 className="font-bold text-xs text-slate-800">{node.firstName} {node.lastName}</h5>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase flex items-center gap-1 mt-0.5">
              <Award className="h-3 w-3 text-slate-500" />
              {node.designation}
            </span>
          </div>
        </div>

        {/* Child Subordinates Render */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-250 ml-6 pl-1.5 space-y-2">
            {node.subordinates?.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization Reporting Tree</h2>
        <p className="text-xs text-slate-500 font-medium">Visual hierarchical flow chart of executive and department managers</p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 border border-slate-200 rounded-lg max-w-md"></div>
          ))}
        </div>
      ) : treeRoots.length === 0 ? (
        <div className="p-6 text-center text-slate-400 font-medium bg-white border border-slate-200 shadow-sm rounded-lg max-w-md">
          No hierarchy mappings defined. Please set employee reporting managers.
        </div>
      ) : (
        <div className="space-y-4 bg-slate-50 border border-slate-200 rounded-lg p-6 shadow-inner min-h-[400px]">
          {treeRoots.map(root => renderNode(root))}
        </div>
      )}
    </div>
  );
};

export default OrganizationChart;
