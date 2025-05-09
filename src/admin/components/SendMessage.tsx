import { RecordJSON } from "adminjs";
import { useState, FormEvent, ChangeEvent } from "react";
import styled from "styled-components";

interface SendMessageProps {
  record: RecordJSON;
}

const FormContainer = styled.div`
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
  }
`;

const SendButton = styled.button`
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1557b0;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const SendMessage = ({ record }: SendMessageProps) => {
  const chatId = record.params.id;
  const botId = record.params.bot;
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/admin/api/message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botId,
          chatId,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormContainer>
      <p>Chat ID: {chatId}</p>
      <p>Bot ID: {botId}</p>

      <StyledForm onSubmit={handleSubmit}>
        <StyledTextarea
          value={message}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setMessage(e.target.value)
          }
          placeholder="Type your message here..."
          disabled={isLoading}
        />
        <SendButton
          type="submit"
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? "Sending..." : "Send Message"}
        </SendButton>
      </StyledForm>
    </FormContainer>
  );
};

export default SendMessage;
