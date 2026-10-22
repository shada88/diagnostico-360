export interface ValidatedUser {
  id: string;
  email: string;
  name: string;
  isProfileComplete: boolean;
  userRoles: Array<{ role: { name: string } }>;
}
