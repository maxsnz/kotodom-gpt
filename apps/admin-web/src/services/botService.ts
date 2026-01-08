export const enableBot = async (botId: string) => {
  const response = await fetch(`/api/bots/${botId}/enable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to enable bot");
  }

  return response.json();
};

export const disableBot = async (botId: string) => {
  const response = await fetch(`/api/bots/${botId}/disable`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to disable bot");
  }

  return response.json();
};
