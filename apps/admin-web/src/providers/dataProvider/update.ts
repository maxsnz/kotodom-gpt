import type { BaseRecord, UpdateParams } from "@refinedev/core";
import { validateResponse } from "@/utils/validateResponse";
import { transformNestJSErrors } from "./transformNestJSErrors";

export const createUpdate =
  (apiUrl: string) =>
  async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
    params: UpdateParams<TVariables>
  ): Promise<{ data: TData }> => {
    try {
      const resource = params.meta?.resource;
      if (!resource) {
        throw new Error("Resource not found");
      }

      const url = `${apiUrl}${resource.getApiUpdatePath(
        params.id,
        params.meta?.resourcePathParams
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params.variables),
      });

      if (response.status < 200 || response.status > 299) {
        const errorData = await response.json();
        const error: any = {
          statusCode: response.status,
          status: response.status,
          statusText: response.statusText,
          response: {
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          },
          data: errorData,
        };
        throw error;
      }

      const rawData = await response.json();

      const resourceSchemas = resource.schemas;
      const schema =
        resourceSchemas && "update" in resourceSchemas
          ? resourceSchemas.update
          : undefined;
      if (schema) {
        const validatedData = validateResponse(schema, rawData);
        return {
          data: validatedData,
        };
      }

      return { data: rawData };
    } catch (error: unknown) {
      console.error(error);
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };
