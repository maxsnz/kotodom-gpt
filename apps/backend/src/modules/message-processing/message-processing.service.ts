import { Injectable, Inject } from "@nestjs/common";

import { MessageProcessingRepository } from "../../domain/message-processing/MessageProcessingRepository";
import {
  MessageProcessing,
  MessageProcessingStatus,
} from "../../domain/message-processing/MessageProcessing";

@Injectable()
export class MessageProcessingService {
  constructor(
    @Inject(MessageProcessingRepository)
    private readonly messageProcessingRepository: MessageProcessingRepository
  ) {}

  /**
   * Get all message processing records with optional filters and pagination
   */
  async findAll(
    filters?: {
      status?: MessageProcessingStatus;
      userMessageId?: number;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<MessageProcessing[]> {
    const skip =
      pagination?.page && pagination?.limit
        ? (pagination.page - 1) * pagination.limit
        : undefined;

    return this.messageProcessingRepository.findAll(filters, {
      skip,
      take: pagination?.limit,
    });
  }

  /**
   * Get message processing record by ID
   */
  async findById(id: number): Promise<MessageProcessing | null> {
    return this.messageProcessingRepository.findById(id);
  }
}
