import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TextInput,
  Button,
  Stack,
  Group,
  Loader,
  Center,
  ActionIcon,
  Text,
} from "@mantine/core";
import { IconCheck, IconX, IconTrash } from "@tabler/icons-react";
import { useNotification } from "@refinedev/core";
import { SettingItemSchema } from "@shared/contracts/settings";
import { createListResponseSchema } from "@/utils/responseSchemas";
import { config } from "@/config";

const SettingsListResponseSchema = createListResponseSchema(SettingItemSchema);

type SettingStatus = "idle" | "loading" | "success" | "error";

interface SettingState {
  value: string;
  status: SettingStatus;
  originalValue: string;
}

const SettingsList = () => {
  const { open } = useNotification();
  const [settings, setSettings] = useState<
    Array<{ id: string; value: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingStates, setSettingStates] = useState<
    Record<string, SettingState>
  >({});
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Create form state
  const [newSettingId, setNewSettingId] = useState("");
  const [newSettingValue, setNewSettingValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${config.apiUrl}/settings`);

      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = SettingsListResponseSchema.parse(rawData);

      setSettings(validatedData.data);

      // Initialize states for all settings
      const states: Record<string, SettingState> = {};
      validatedData.data.forEach((setting) => {
        states[setting.id] = {
          value: setting.value,
          status: "idle",
          originalValue: setting.value,
        };
      });
      setSettingStates(states);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load settings";
      setError(errorMessage);
      console.error("Error fetching settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInputChange = (id: string, newValue: string) => {
    setSettingStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        value: newValue,
      },
    }));
  };

  const handleInputBlur = async (id: string) => {
    const state = settingStates[id];
    if (!state || state.value === state.originalValue) {
      return;
    }

    // Set loading state
    setSettingStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: "loading",
      },
    }));

    try {
      const response = await fetch(`${config.apiUrl}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [id]: state.value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to update setting: ${response.statusText}`
        );
      }

      const rawData = await response.json();
      const validatedData = SettingsListResponseSchema.parse(rawData);

      // Update settings list
      setSettings(validatedData.data);

      // Set success state
      setSettingStates((prev) => ({
        ...prev,
        [id]: {
          value: state.value,
          status: "success",
          originalValue: state.value,
        },
      }));

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSettingStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: "idle",
          },
        }));
      }, 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update setting";

      // Rollback to original value
      setSettingStates((prev) => ({
        ...prev,
        [id]: {
          value: state.originalValue,
          status: "error",
          originalValue: state.originalValue,
        },
      }));

      open?.({
        type: "error",
        message: "Failed to update setting",
        description: errorMessage,
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSettingStates((prev) => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: "idle",
          },
        }));
      }, 3000);

      console.error("Error updating setting:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete setting "${id}"?`)) {
      return;
    }

    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`${config.apiUrl}/settings/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to delete setting: ${response.statusText}`
        );
      }

      // Remove from local state
      setSettings((prev) => prev.filter((setting) => setting.id !== id));
      setSettingStates((prev) => {
        const newStates = { ...prev };
        delete newStates[id];
        return newStates;
      });

      open?.({
        type: "success",
        message: "Setting deleted successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete setting";

      open?.({
        type: "error",
        message: "Failed to delete setting",
        description: errorMessage,
      });

      console.error("Error deleting setting:", err);
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleCreate = async () => {
    if (!newSettingId.trim() || !newSettingValue.trim() || isCreating) {
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${config.apiUrl}/settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [newSettingId.trim()]: newSettingValue.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to create setting: ${response.statusText}`
        );
      }

      const rawData = await response.json();
      const validatedData = SettingsListResponseSchema.parse(rawData);

      // Update settings list
      setSettings(validatedData.data);

      // Initialize state for new setting
      setSettingStates((prev) => ({
        ...prev,
        [newSettingId.trim()]: {
          value: newSettingValue.trim(),
          status: "idle",
          originalValue: newSettingValue.trim(),
        },
      }));

      // Clear form
      setNewSettingId("");
      setNewSettingValue("");

      open?.({
        type: "success",
        message: "Setting created successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create setting";

      open?.({
        type: "error",
        message: "Failed to create setting",
        description: errorMessage,
      });

      console.error("Error creating setting:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = (status: SettingStatus) => {
    switch (status) {
      case "loading":
        return <Loader size={16} />;
      case "success":
        return <IconCheck size={16} color="green" />;
      case "error":
        return <IconX size={16} color="red" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <Text c="red">Error: {error}</Text>
      </Center>
    );
  }

  return (
    <Box p="md">
      <Stack gap="md">
        <Paper p="md" withBorder>
          <Table style={{ tableLayout: "fixed" }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "200px" }}>ID</Table.Th>
                <Table.Th style={{ width: "auto" }}>Value</Table.Th>
                <Table.Th style={{ width: "80px" }}>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {settings.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Center py="xl">
                      <Text c="dimmed">No settings found</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                settings.map((setting, index) => {
                  const state = settingStates[setting.id];
                  return (
                    <Table.Tr
                      key={setting.id}
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? "transparent"
                            : "var(--mantine-color-gray-0)",
                      }}
                    >
                      <Table.Td style={{ width: "200px" }}>
                        <Text fw={500} style={{ wordBreak: "break-word" }}>
                          {setting.id}
                        </Text>
                      </Table.Td>
                      <Table.Td style={{ width: "auto" }}>
                        <TextInput
                          value={state?.value ?? setting.value}
                          onChange={(e) =>
                            handleInputChange(setting.id, e.target.value)
                          }
                          onBlur={() => handleInputBlur(setting.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.currentTarget.blur();
                              handleInputBlur(setting.id);
                            }
                          }}
                          rightSection={getStatusIcon(state?.status ?? "idle")}
                          style={{ width: "100%" }}
                        />
                      </Table.Td>
                      <Table.Td style={{ width: "80px" }}>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDelete(setting.id)}
                          loading={deletingIds.has(setting.id)}
                          aria-label={`Delete setting ${setting.id}`}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper p="md" withBorder>
          <Text fw={500} mb="md">
            Create New Setting
          </Text>
          <Group gap="md" align="flex-end">
            <TextInput
              label="ID"
              placeholder="Enter setting ID"
              value={newSettingId}
              onChange={(e) => setNewSettingId(e.target.value)}
              style={{ flex: 1 }}
            />
            <TextInput
              label="Value"
              placeholder="Enter setting value"
              value={newSettingValue}
              onChange={(e) => setNewSettingValue(e.target.value)}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newSettingId.trim() &&
                  newSettingValue.trim()
                ) {
                  handleCreate();
                }
              }}
            />
            <Button
              onClick={handleCreate}
              loading={isCreating}
              disabled={!newSettingId.trim() || !newSettingValue.trim()}
            >
              Create
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Box>
  );
};

export default SettingsList;
