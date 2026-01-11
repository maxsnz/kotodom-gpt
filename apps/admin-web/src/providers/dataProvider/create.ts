import type { BaseRecord, CreateParams } from "@refinedev/core";
import { validateResponse } from "@/utils/validateResponse";
import { transformNestJSErrors } from "./transformNestJSErrors";

export const createCreate =
  (apiUrl: string) =>
  async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
    params: CreateParams<TVariables>
  ): Promise<{ data: TData }> => {
    try {
      const resource = params.meta?.resource;
      if (!resource) {
        throw new Error("Resource not found");
      }
      const url = `${apiUrl}${resource.getApiCreatePath(
        params.meta?.resourcePathParams
      )}`;

      const response = await fetch(url, {
        method: "POST",
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
        resourceSchemas && "create" in resourceSchemas
          ? resourceSchemas.create
          : undefined;
      if (schema) {
        const validatedData = validateResponse(schema, rawData);
        return {
          data: validatedData,
        };
      }

      return { data: rawData };
    } catch (error: any) {
      console.error(error);
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };
