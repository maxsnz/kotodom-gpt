import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useIsAuthenticated } from "@refinedev/core";
import { Loader, Center } from "@mantine/core";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated?.authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};
