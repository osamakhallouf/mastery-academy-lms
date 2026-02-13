/**
 * Profile with Date fields serialized to ISO strings for client-safe usage.
 */
export type SafeProfile = {
  id: string;
  userId: string;
  name: string | null;
  imageUrl: string | null;
  email: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
};
