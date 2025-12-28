import { useEffect, useState } from "react";
import styled from "styled-components";
import { RecordJSON } from "adminjs";

interface ShowUserChatsProps {
  record: RecordJSON;
}

interface Chat {
  id: string;
  name: string | null;
  createdAt: string;
  bot: {
    id: string;
    name: string;
  } | null;
  messagesCount: number;
}

interface UserChatsData {
  chats: Chat[];
  user: {
    id: string;
    username: string | null;
  };
}

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f7fb;
  min-height: 100vh;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2d3748;
  margin: 0;
  font-weight: 600;
`;

const ChatsContainer = styled.div`
  display: grid;
  gap: 16px;
`;

const ChatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ChatName = styled.h3`
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0;
  font-weight: 600;
`;

const ChatId = styled.span`
  font-size: 0.875rem;
  color: #718096;
  font-family: monospace;
  background: #f7fafc;
  padding: 4px 8px;
  border-radius: 6px;
`;

const ChatInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BotInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotName = styled.span`
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 500;
`;

const MessagesCount = styled.span`
  font-size: 0.875rem;
  color: #718096;
  background: #edf2f7;
  padding: 4px 8px;
  border-radius: 6px;
`;

const ChatDate = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  text-align: right;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;

  &::after {
    content: "";
    width: 48px;
    height: 48px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #ef4444;
  font-size: 1.125rem;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: #718096;
  font-size: 1.125rem;
`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

const ShowUserChats = ({ record }: ShowUserChatsProps) => {
  const userId = record.params.id;
  const [userChatsData, setUserChatsData] =
    useState<UserChatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserChats = async () => {
      try {
        const response = await fetch(
          `/admin/api/users/${userId}/chats`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch user chats");
        }
        const data = await response.json();
        setUserChatsData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserChats();
  }, [userId]);

  const handleChatClick = (chatId: string) => {
    // Navigate to chat resource
    window.open(
      `/admin/resources/Chat/records/${chatId}/show`,
      "_blank",
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!userChatsData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>
          Chats for user:{" "}
          {userChatsData.user.username ||
            `ID: ${userChatsData.user.id}`}
        </Title>
      </Header>

      <ChatsContainer>
        {userChatsData.chats.length === 0 ? (
          <EmptyState>
            <p>No chats found for this user.</p>
          </EmptyState>
        ) : (
          userChatsData.chats
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .map((chat) => (
              <ChatCard
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
              >
                <ChatHeader>
                  <ChatName>
                    {chat.name || `Chat ${chat.id.slice(0, 8)}...`}
                  </ChatName>
                  <ChatId>{chat.id}</ChatId>
                </ChatHeader>

                <ChatInfo>
                  <BotInfo>
                    {chat.bot ? (
                      <>
                        <span>🤖</span>
                        <BotName>{chat.bot.name}</BotName>
                      </>
                    ) : (
                      <BotName>No bot assigned</BotName>
                    )}
                  </BotInfo>
                  <MessagesCount>
                    {chat.messagesCount} messages
                  </MessagesCount>
                </ChatInfo>

                <ChatDate>{formatDate(chat.createdAt)}</ChatDate>
              </ChatCard>
            ))
        )}
      </ChatsContainer>
    </Container>
  );
};

export default ShowUserChats;

