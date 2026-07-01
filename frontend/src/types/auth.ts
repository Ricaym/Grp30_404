export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface AuthState {
  user: User;
  isAuthenticated: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur / Formateur',
  student: 'Étudiant',
};

export const MOCK_USERS: Record<UserRole, User> = {
  admin: {
    id: 'user-admin-1',
    name: 'Marie Dupont',
    email: 'marie.dupont@estiam.fr',
    role: 'admin',
  },
  student: {
    id: 'user-student-1',
    name: 'Lucas Martin',
    email: 'lucas.martin@estiam.fr',
    role: 'student',
  },
};
