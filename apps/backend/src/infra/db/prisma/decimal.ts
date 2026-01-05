import type { Prisma } from "./generated/client";

type DecimalCtor = new (value: any) => Prisma.Decimal;

let cachedDecimalCtor: DecimalCtor | null = null;

function resolveDecimalCtor(): DecimalCtor {
  if (cachedDecimalCtor) return cachedDecimalCtor;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Decimal } = require("@prisma/client/runtime/library");
    cachedDecimalCtor = Decimal as DecimalCtor;
    return cachedDecimalCtor;
  } catch {
    class FallbackDecimal {
      constructor(private readonly value: any) {}
      toString() {
        return String(this.value);
      }
      toJSON() {
        return this.value;
      }
      valueOf() {
        return this.value as any;
      }
    }

    cachedDecimalCtor = FallbackDecimal as unknown as DecimalCtor;
    return cachedDecimalCtor;
  }
}

export function createDecimal(value: any): Prisma.Decimal {
  const Decimal = resolveDecimalCtor();
  return new Decimal(value);
}

