import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleBasedAccessProps {
  children: React.ReactNode;
  allowedRoles: Array<"USER" | "STUDENT" | "PROFESSOR" | "VERIFIER" | "ADMIN">;
  fallback?: React.ReactNode;
}

export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface StudentOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const StudentOnly: React.FC<StudentOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBasedAccess allowedRoles={["STUDENT", "PROFESSOR", "VERIFIER", "ADMIN"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

interface UserOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const UserOnly: React.FC<UserOnlyProps> = ({ children, fallback = null }) => {
  return (
    <RoleBasedAccess allowedRoles={["USER"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  );
};

interface VerifiedUserProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const VerifiedUserOnly: React.FC<VerifiedUserProps> = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || user.role === "USER" || user.userStatus !== "VERIFIED") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
