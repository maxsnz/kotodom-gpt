import { AuthUser } from "../users/types";
import { Bot } from "./Bot";

/**
 * Policy class for bot access control decisions
 */
export class BotPolicy {
  /**
   * Check if user can manage (view/update/delete) a bot
   * ADMIN/MANAGER: can manage all bots
   * USER: can only manage own bots
   */
  static canManage(user: AuthUser, bot: Bot): boolean {
    // ADMIN and MANAGER have full access
    if (user.role === "ADMIN" || user.role === "MANAGER") {
      return true;
    }

    // USER can only manage their own bots
    return bot.ownerUserId === user.id;
  }

  /**
   * Check if user can view a bot
   * Same rules as canManage for now
   */
  static canView(user: AuthUser, bot: Bot): boolean {
    return BotPolicy.canManage(user, bot);
  }
}

