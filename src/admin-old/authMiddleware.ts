import { Context, Next } from "koa";

export async function requireAdmin(ctx: Context, next: Next) {
  if (!ctx.session?.adminUser?.id) {
    ctx.status = 401;
    ctx.body = { error: "Unauthorized" };
    return;
  }

  await next();
}
