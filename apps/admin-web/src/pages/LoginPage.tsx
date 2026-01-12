import { useState, useEffect } from "react";
import { useLogin, useIsAuthenticated } from "@refinedev/core";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Alert,
  Center,
  Stack,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { config } from "@/config";

export const LoginPage = () => {
  const { mutate: login } = useLogin();
  const { data: isAuthenticated } = useIsAuthenticated();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return null;
      },
      password: (value) => {
        if (!value) return "Password is required";
        return null;
      },
    },
  });

  // Redirect to admin panel if already authenticated
  useEffect(() => {
    if (isAuthenticated?.authenticated) {
      navigate(config.basePath);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError(null);
    setIsLoading(true);

    login(values, {
      onSuccess: () => {
        setIsLoading(false);
        // Navigation is handled by authProvider
      },
      onError: (error: any) => {
        setIsLoading(false);
        const errorMessage =
          error?.message || error?.error?.message || "Login failed";
        setError(errorMessage);
        form.setErrors({
          email: true,
          password: true,
        });
      },
    });
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Paper shadow="md" p="xl" w={400} radius="md">
        <Stack gap="lg">
          <Box ta="center">
            <Title order={2} mb="xs">
              KotoAdmin
            </Title>
            <Text size="sm" c="dimmed">
              Sign in to your account
            </Text>
          </Box>

          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Login Failed"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                {...form.getInputProps("email")}
                required
                disabled={isLoading}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                {...form.getInputProps("password")}
                required
                disabled={isLoading}
              />

              <Button type="submit" fullWidth loading={isLoading} size="md">
                Sign In
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Center>
  );
};
