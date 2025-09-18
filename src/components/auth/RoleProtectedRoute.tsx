import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getMyProfile, type AppRole } from '@/lib/profiles';

interface RoleProtectedRouteProps {
  required: AppRole | AppRole[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ required, redirectTo = '/' }: RoleProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [role, setRole] = useState<AppRole | null>(null);
  const [checking, setChecking] = useState(true);

  const requiredRoles = Array.isArray(required) ? required : [required];

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) {
        setChecking(false);
        return;
      }
      try {
        const profile = await getMyProfile();
        if (mounted) setRole((profile?.role as AppRole) ?? null);
      } finally {
        if (mounted) setChecking(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!role || !requiredRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}


