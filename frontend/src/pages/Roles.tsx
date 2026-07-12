import React, { useState, useEffect } from 'react';
import { Shield, Check, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface RoleItem {
  id: string;
  name: string;
  description: string | null;
  permissions: { permission: Permission }[];
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleItem | null>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]); // Array of permissionIds

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const rolesRes = await axios.get('/api/rbac/roles');
      const permRes = await axios.get('/api/rbac/permissions');

      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
        if (rolesRes.data.data.length > 0) {
          selectRole(rolesRes.data.data[0]);
        }
      }
      if (permRes.data.success) {
        setPermissions(permRes.data.data);
      }
    } catch (err) {
      // Fallback mocks
      const mockPerms = [
        { id: 'p1', name: 'READ_USERS', description: 'Can view user lists' },
        { id: 'p2', name: 'WRITE_USERS', description: 'Can invite or edit users' },
        { id: 'p3', name: 'PROCESS_PAYROLL', description: 'Can compile monthly salary runs' },
        { id: 'p4', name: 'APPROVE_LEAVES', description: 'Can authorize employee leaves' }
      ];
      setPermissions(mockPerms);
      setRoles([
        { id: 'r1', name: 'ADMIN', description: 'Full system capabilities', permissions: [{ permission: mockPerms[0] }, { permission: mockPerms[1] }] },
        { id: 'r2', name: 'HR_MANAGER', description: 'HR and Leaves administration', permissions: [{ permission: mockPerms[0] }, { permission: mockPerms[3] }] },
        { id: 'r3', name: 'EMPLOYEE', description: 'General workspace dashboard access', permissions: [{ permission: mockPerms[0] }] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: RoleItem) => {
    setSelectedRole(role);
    setRolePermissions(role.permissions.map(p => p.permission.id));
    setSuccess('');
    setError('');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCheckboxToggle = (permId: string) => {
    if (rolePermissions.includes(permId)) {
      setRolePermissions(rolePermissions.filter(id => id !== permId));
    } else {
      setRolePermissions([...rolePermissions, permId]);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/rbac/assign-permissions', {
        roleId: selectedRole.id,
        permissionIds: rolePermissions
      });
      if (res.data.success) {
        setSuccess(`Permissions configured successfully for ${selectedRole.name}!`);
        // Refresh roles
        const rolesRes = await axios.get('/api/rbac/roles');
        if (rolesRes.data.success) {
          setRoles(rolesRes.data.data);
          const updatedRole = rolesRes.data.data.find((r: any) => r.id === selectedRole.id);
          if (updatedRole) setSelectedRole(updatedRole);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save role permissions.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Roles & Permissions Management</h2>
        <p className="text-xs text-slate-500 font-medium">Map granular capabilities directly to system user roles</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-800" />
            Roles Catalog
          </h3>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse w-full"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => selectRole(role)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${
                    selectedRole?.id === role.id
                      ? 'bg-slate-950 border-slate-950 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <span>{role.name.replace('_', ' ')}</span>
                    <p className={`text-[10px] font-medium block ${selectedRole?.id === role.id ? 'text-slate-400' : 'text-slate-400'}`}>
                      {role.description || 'Access role'}
                    </p>
                  </div>
                  {selectedRole?.id === role.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Permissions Configuration Mapping */}
        <div className="md:col-span-2 bg-white border border-slate-200 shadow-sm rounded-lg p-5">
          {selectedRole ? (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Configure: {selectedRole.name.replace('_', ' ')}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">Select matching scopes for this role mapping</p>
                </div>
                <button
                  onClick={handleSavePermissions}
                  disabled={saveLoading}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {saveLoading ? (
                    <span className="inline-block animate-spin rounded-full h-3 w-3 border-t-2 border-white border-r-2"></span>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50/50 cursor-pointer select-none transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={rolePermissions.includes(perm.id)}
                      onChange={() => handleCheckboxToggle(perm.id)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 font-mono">{perm.name}</span>
                      <p className="text-[10px] text-slate-400 font-medium">{perm.description || 'System operation'}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              Please select a role from the left list to configure mappings.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roles;
