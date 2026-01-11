import type { BaseRecord, UpdateParams } from "@refinedev/core";
import { transformNestJSErrors } from "./transformNestJSErrors";
import { Resource } from "@kotoadmin/types/resource";
import { validateResponseWithType } from "./validateResponseWithType";

export const createUpdate =
  (apiUrl: string) =>
  async <TData extends BaseRecord = BaseRecord, TVariables = {}>(
    params: UpdateParams<TVariables>
  ): Promise<{ data: TData }> => {
    try {
      const resource = params.meta?.resource as Resource;
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

      const schema = resource.api.update?.schema;
      if (!schema) {
        throw new Error(
          `No update schema found for resource: ${resource.name}`
        );
      }
      const validatedData = validateResponseWithType<{ data: TData }>(
        schema,
        rawData
      );
      return validatedData;
    } catch (error: unknown) {
      console.error(error);
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };
