export type Role = 'client' | 'admin' | null;

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}
