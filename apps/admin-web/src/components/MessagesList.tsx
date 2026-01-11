import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Text,
  TextInput,
  Button,
  Avatar,
  Stack,
  Group,
  ScrollArea,
  Loader,
  Center,
  ActionIcon,
} from "@mantine/core";
import { IconSend, IconArrowLeft } from "@tabler/icons-react";
import { useNotification } from "@refinedev/core";
import { ChatMessagesListResponseSchema, SendMessageResponseSchema } from "@shared/contracts/messages";
import type { ChatMessagesListResponse } from "@shared/contracts/messages";

const API_URL = "/api";

// Helper function to get initials from name
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Helper function to format date and time
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (messageDate.getTime() === today.getTime()) {
    return timeStr;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${timeStr}`;
  }

  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }) + `, ${timeStr}`
  );
};

const MessagesList = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { open } = useNotification();
  const chatId = params.chatId as string;
  const [data, setData] = useState<ChatMessagesListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const viewport = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`);

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const rawData = await response.json();
      const validatedData = ChatMessagesListResponseSchema.parse(rawData);
      setData(validatedData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load messages"
      );
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]);

  // Scroll to bottom only on initial load
  const isInitialLoad = useRef(true);
  useEffect(() => {
    if (data && viewport.current && isInitialLoad.current) {
      viewport.current.scrollTo({
        top: viewport.current.scrollHeight,
        behavior: "auto",
      });
      isInitialLoad.current = false;
    }
  }, [data]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) {
      return;
    }

    const textToSend = messageText.trim();
    setMessageText("");
    setIsSending(true);

    try {
      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: textToSend }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to send message: ${response.statusText}`
        );
      }

      const rawData = await response.json();
      const validatedData = SendMessageResponseSchema.parse(rawData);

      // Optimistically add the new message to the list without full reload
      if (data) {
        const newMessage = {
          id: validatedData.message.id,
          text: validatedData.message.text,
          createdAt: validatedData.message.createdAt,
          author: {
            type: "bot" as const,
            botId: validatedData.message.botId!,
          },
        };

        // Update state optimistically
        setData({
          ...data,
          data: {
            ...data.data,
            messages: [...data.data.messages, newMessage],
          },
        });

        // Scroll to bottom smoothly after state update
        requestAnimationFrame(() => {
          if (viewport.current) {
            viewport.current.scrollTo({
              top: viewport.current.scrollHeight,
              behavior: "smooth",
            });
          }
        });
      }

      // Show success notification
      open?.({
        type: "success",
        message: "Message sent successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send message";
      
      // Show error notification
      open?.({
        type: "error",
        message: "Failed to send message",
        description: errorMessage,
      });

      // Restore message text so user can try again
      setMessageText(textToSend);
      console.error("Error sending message:", err);
    } finally {
      setIsSending(false);
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

  if (!data) {
    return (
      <Center h="100vh">
        <Text>No messages found</Text>
      </Center>
    );
  }

  const { participants, messages } = data.data;
  const bot = participants.bot;
  const user = participants.user;

  return (
    <Box h="100vh" display="flex" style={{ flexDirection: "column" }}>
      {/* Chat Header */}
      <Paper p="md" withBorder style={{ borderBottom: "1px solid #e0e0e0" }}>
        <Group>
          <ActionIcon
            variant="subtle"
            onClick={() => navigate("/cp/chats")}
            aria-label="Go back"
          >
            <IconArrowLeft size={20} />
          </ActionIcon>
          <Avatar
            size="md"
            radius="xl"
            color={bot ? "teal" : "gray"}
            style={{ backgroundColor: bot ? undefined : "#ccc" }}
          >
            {bot ? getInitials(bot.name) : "?"}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text fw={500} size="sm">
              {bot?.name || "Unknown Bot"}
            </Text>
            <Text c="dimmed" size="xs">
              {user?.firstName || user?.username || "User"}
            </Text>
          </div>
        </Group>
      </Paper>

      {/* Messages Area */}
      <ScrollArea
        viewportRef={viewport}
        style={{ flex: 1 }}
        p="md"
        type="scroll"
      >
        <Stack gap="xs">
          {messages.map((message) => {
            const isBot = message.author.type === "bot";
            const senderName = isBot
              ? bot?.name || "Bot"
              : user?.firstName || user?.username || "User";

            return (
              <Group
                key={message.id}
                align="flex-start"
                style={{
                  justifyContent: isBot ? "flex-start" : "flex-start",
                  flexDirection: isBot ? "row" : "row-reverse",
                }}
              >
                <Avatar
                  size="sm"
                  radius="xl"
                  color={isBot ? "teal" : "blue"}
                  style={{
                    backgroundColor: isBot ? undefined : undefined,
                  }}
                >
                  {getInitials(senderName)}
                </Avatar>
                <Paper
                  p="xs"
                  px="md"
                  style={{
                    maxWidth: "70%",
                    backgroundColor: isBot ? "#f1f3f5" : "#228be6",
                    color: isBot ? "inherit" : "white",
                    borderRadius: "12px",
                  }}
                >
                  <Text
                    size="sm"
                    style={{
                      color: isBot ? "inherit" : "white",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.text}
                  </Text>
                  <Text
                    size="xs"
                    c={isBot ? "dimmed" : "white"}
                    opacity={0.7}
                    mt={4}
                  >
                    {formatDateTime(message.createdAt)}
                  </Text>
                </Paper>
              </Group>
            );
          })}
        </Stack>
      </ScrollArea>

      {/* Message Input Form */}
      <Paper p="md" withBorder style={{ borderTop: "1px solid #e0e0e0" }}>
        <Group gap="xs">
          <TextInput
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (messageText.trim()) {
                  handleSendMessage();
                }
              }
            }}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
            loading={isSending}
            leftSection={<IconSend size={16} />}
          >
            Send
          </Button>
        </Group>
      </Paper>
    </Box>
  );
};

export default MessagesList;
