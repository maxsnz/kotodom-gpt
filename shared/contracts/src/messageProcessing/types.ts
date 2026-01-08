import { z } from "zod";
import {
  MessageProcessingFiltersSchema,
  MessageProcessingPaginationSchema,
  MessageProcessingQuerySchema,
} from "./schemas";

export type MessageProcessingFiltersDto = z.infer<typeof MessageProcessingFiltersSchema>;
export type MessageProcessingPaginationDto = z.infer<typeof MessageProcessingPaginationSchema>;
export type MessageProcessingQueryDto = z.infer<typeof MessageProcessingQuerySchema>;