import { useEffect, useState } from "react";
import styled from "styled-components";
import { RecordJSON } from "adminjs";

interface SendMessageProps {
  record: RecordJSON;
}

interface Message {
  id: string;
  text: string;
  createdAt: string;
  isUser: boolean;
}

interface ChatData {
  messages: Message[];
  bot: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
  };
}

const Container = styled.div`
  max-width: 800px;
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

const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageWrapper = styled.div<{ isUser: boolean }>`
  display: flex;
  justify-content: ${(props) =>
    props.isUser ? "flex-start" : "flex-end"};
  padding: 0 8px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${(props) => (props.isUser ? "white" : "#3b82f6")};
  color: ${(props) => (props.isUser ? "#2d3748" : "white")};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    bottom: 0;
    ${(props) => (props.isUser ? "left: -8px;" : "right: -8px;")}
    width: 16px;
    height: 16px;
    background: ${(props) => (props.isUser ? "white" : "#3b82f6")};
    clip-path: ${(props) =>
      props.isUser
        ? "polygon(0 0, 100% 100%, 0 100%)"
        : "polygon(100% 0, 100% 100%, 0 100%)"};
  }
`;

const SenderName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 4px;
  opacity: 0.9;
`;

const MessageText = styled.div`
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
`;

const Timestamp = styled.div`
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 4px;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

const ShowMessages = ({ record }: SendMessageProps) => {
  const chatId = record.params.id;
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/admin/api/messages/${chatId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages");
        }
        const data = await response.json();
        setChatData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!chatData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>
          Chat between {chatData.user.name} and {chatData.bot.name}
        </Title>
      </Header>

      <MessagesContainer>
        {chatData.messages
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          )
          .map((message) => (
            <MessageWrapper key={message.id} isUser={message.isUser}>
              <MessageBubble isUser={message.isUser}>
                <SenderName>
                  {message.isUser
                    ? chatData.user.name
                    : chatData.bot.name}
                </SenderName>
                <MessageText>{message.text}</MessageText>
                <Timestamp>{formatDate(message.createdAt)}</Timestamp>
              </MessageBubble>
            </MessageWrapper>
          ))}
      </MessagesContainer>
    </Container>
  );
};

export default ShowMessages;
