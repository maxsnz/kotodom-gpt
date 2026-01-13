import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { useResourcePathParams } from "@kotoadmin/hooks/useResourcePathParams";

import { resourceStore } from "@/resources";

const ChatShowView = () => {
  const resource = resourceStore.getResource("chats");
  const { id } = useParams<{ id: string }>();
  const resourcePathParams = useResourcePathParams(resource);

  const { query } = useOne({
    resource: "chats",
    id,
    meta: { resourcePathParams, resource },
  });

  const record = query.data?.data;

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <Show isLoading={query.isLoading}>
      <TextField value={record.name} />
      <TextField value={record.telegramChatId} />
      <TextField value={record.botId} />
      <TextField value={record.tgUserId} />
      <DateField value={record.createdAt} />
      <DateField value={record.updatedAt} />
    </Show>
  );
};

export default ChatShowView;
