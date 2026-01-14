import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Paper,
  Text,
  Table,
  Loader,
  Center,
  ActionIcon,
  Anchor,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { ChatResponseSchema } from "@shared/contracts/chats";
import type { ChatResponse } from "@shared/contracts/chats";
import { createListResponseSchema } from "@/utils/responseSchemas";
import { config } from "@/config";

type ChatsListResponse = {
  data: ChatResponse[];
};

const ChatsList = () => {
  const params = useParams();
  const navigate = useNavigate();
  const tgUserId = params.tgUserId as string;
  const [data, setData] = useState<ChatResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `${config.apiUrl}/tg-users/${tgUserId}/chats`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch chats: ${response.statusText}`);
      }

      const rawData = await response.json();
      const schema = createListResponseSchema(ChatResponseSchema);
      const validatedData = schema.parse(rawData) as ChatsListResponse;
      setData(validatedData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
      console.error("Error fetching chats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tgUserId) {
      fetchChats();
    }
  }, [tgUserId]);

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
      <Paper p="md" withBorder mb="md">
        <ActionIcon
          variant="subtle"
          onClick={() => navigate(`${config.basePath}/tg-users`)}
          aria-label="Go back"
          mb="md"
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Text fw={500} size="lg" mb="md">
          Chats for User {tgUserId}
        </Text>
      </Paper>

      <Paper withBorder>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Bot ID</Table.Th>
              <Table.Th>Created At</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center p="md">
                    <Text c="dimmed">No chats found</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.map((chat) => (
                <Table.Tr key={chat.id}>
                  <Table.Td>{chat.id}</Table.Td>
                  <Table.Td>{chat.name || "-"}</Table.Td>
                  <Table.Td>{chat.botId || "-"}</Table.Td>
                  <Table.Td>
                    {new Date(chat.createdAt).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    <Anchor
                      component={Link}
                      to={`${config.basePath}/chats/${chat.id}/messages`}
                    >
                      View Messages
                    </Anchor>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Box>
  );
};

export default ChatsList;
