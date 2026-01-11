import type { GetOneParams, GetOneResponse, BaseRecord } from "@refinedev/core";
import { validateResponseWithType } from "./validateResponseWithType";
import { transformNestJSErrors } from "./transformNestJSErrors";
import { Resource } from "@kotoadmin/types/resource";

export const createGetOne =
  (apiUrl: string) =>
  async <TData extends BaseRecord = BaseRecord>(
    params: GetOneParams
  ): Promise<GetOneResponse<TData>> => {
    try {
      const { meta } = params;

      const resource = meta?.resource as Resource;
      if (!resource) {
        throw new Error("Resource not found");
      }

      const url = `${apiUrl}${resource.getApiItemPath(
        params.id,
        meta?.resourcePathParams
      )}`;

      const response = await fetch(url);

      if (response.status < 200 || response.status > 299) {
        const errorData = await response.json().catch(() => ({}));
        throw {
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
      }

      const rawData = await response.json();

      const schema = resource.api.item?.schema;
      if (!schema) {
        throw new Error(
          `No item schema found for resource: ${params.resource}`
        );
      }

      const validatedData = validateResponseWithType<{ data: TData }>(
        schema,
        rawData
      );
      return {
        data: validatedData.data,
      };
    } catch (error: unknown) {
      console.error(error);
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };
