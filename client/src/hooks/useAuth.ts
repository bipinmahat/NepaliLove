import { useQuery } from "@tanstack/react-query";

export interface AuthUser {
  id?: string;
  email?: string;
  profileImageUrl?: string;
  hasProfile?: boolean;     // returned by /api/auth/user
  profile?: any;
  [key: string]: any;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<AuthUser | undefined>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
