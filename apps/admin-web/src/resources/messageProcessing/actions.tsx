import { IconRefresh } from "@tabler/icons-react";
import { ActionContext } from "@kotoadmin/types/action";

export const messageProcessingActions = [
  {
    name: "Restart Failed Job",
    action: async (record: any, context: ActionContext) => {
      const response = await fetch(
        `/api/message-processing/${record.id}/retry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to restart job: ${response.statusText}`
        );
      }

      await context.invalidate({
        resource: context.resource.name,
        invalidates: ["list", "detail"],
      });

      context.openNotification({
        type: "success",
        message: "Job restarted successfully",
      });
    },
    available: (record: any) => {
      return record.status === "FAILED"; // || record.status === "TERMINAL";
    },
    icon: <IconRefresh size={16} />,
  },
];
