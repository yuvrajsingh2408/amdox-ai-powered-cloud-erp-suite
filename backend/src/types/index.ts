import { Request } from 'express';

export type RoleName =
  | 'ADMIN'
  | 'HR_MANAGER'
  | 'FINANCE_MANAGER'
  | 'SCM_MANAGER'
  | 'PROJECT_MANAGER'
  | 'EMPLOYEE';

export interface AuthUser {
  id: string;
  email: string;
  role: RoleName;
  roles: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  tenantId?: string;
}
