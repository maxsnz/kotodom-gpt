import { IconRefresh } from "@tabler/icons-react";
import { ListActionContext } from "@kotoadmin/types/action";

export const messageProcessingListActions = [
  {
    name: "Restart All Failed Jobs",
    action: async (context: ListActionContext) => {
      const response = await fetch(`/api/message-processing/retry-failed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to restart failed jobs: ${response.statusText}`
        );
      }

      const result = await response.json();

      await context.invalidate({
        resource: context.resource.name,
        invalidates: ["list"],
      });

      context.openNotification({
        type: "success",
        message: `Successfully restarted ${result.retriedCount} failed job(s)`,
      });
    },
    icon: <IconRefresh size={16} />,
    color: "blue",
    variant: "outline" as const,
  },
];
