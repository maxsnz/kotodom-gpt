import { api } from "../../shared/api/client";

export type FailedJob = {
  id: string;
  name: string;
  data: {
    botId?: string;
    telegramUpdateId?: number;
    chatId?: number;
    text?: string;
    kind?: string;
  };
  createdOn: string;
  completedOn: string | null;
  output: unknown;
};

export type GetFailedJobsResponse = {
  jobs: FailedJob[];
};

export type RetryFailedJobsResponse = {
  retriedCount: number;
  jobIds: string[];
};

export const jobsApi = {
  getFailedJobs: (limit?: number) =>
    api.get<GetFailedJobsResponse>(
      `/admin/jobs/failed${limit ? `?limit=${limit}` : ""}`
    ),

  retryFailedJobs: (limit?: number) =>
    api.post<RetryFailedJobsResponse>(
      `/admin/jobs/retry-failed${limit ? `?limit=${limit}` : ""}`
    ),
};



