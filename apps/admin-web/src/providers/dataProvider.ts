import dataProviderBase from "@refinedev/nestjsx-crud";
import type {
  DataProvider,
  GetOneParams,
  GetOneResponse,
  BaseRecord,
} from "@refinedev/core";
import { validateResponse } from "@/utils/validateResponse";
import { Resource } from "@kotoadmin/types/resource";
import { z } from "zod";

// Helper function to validate response with proper typing
function validateResponseWithType<T>(
  schema: z.ZodTypeAny | undefined,
  data: unknown
): T {
  if (!schema) {
    throw new Error("Schema is required");
  }
  return validateResponse(schema, data) as T;
}

// Transform NestJS validation errors to Refine format
// Now NestJS returns errors in structured format: { errors: { field: [messages] } }
const transformNestJSErrors = (error: any): any => {
  // Handle different error structures (axios vs fetch vs direct object)
  // @refinedev/nestjsx-crud may return error directly as object, not in response.data
  const responseData = error?.response?.data || error?.data || error;

  if (!responseData || typeof responseData !== "object") {
    return error;
  }

  // If server already returns structured errors, use them directly
  if (responseData.errors && typeof responseData.errors === "object") {
    // Refine/Mantine expects errors in format: { field: string } or { field: string[] }
    // Convert arrays to first message string for Mantine form compatibility
    const formattedErrors: Record<string, string> = {};
    Object.entries(responseData.errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        formattedErrors[field] = messages[0];
      } else if (typeof messages === "string") {
        formattedErrors[field] = messages;
      }
    });

    // Ensure errors object is in the correct format for Refine
    // Refine's useForm looks for errors in error.response.data.errors
    // Remove message to prevent Refine from using it as a general error
    const { message, errors: _, ...dataWithoutMessage } = responseData;

    const transformedError: any = {
      ...error,
      // Remove message from error to prevent Refine from using it
      message: undefined,
      // Add errors at top level for Refine
      errors: formattedErrors,
      response: error.response
        ? {
            ...error.response,
            data: {
              ...dataWithoutMessage,
              errors: formattedErrors,
            },
          }
        : {
            status: error.status || error.statusCode || 400,
            statusText: error.statusText || "Bad Request",
            data: {
              ...dataWithoutMessage,
              errors: formattedErrors,
            },
          },
    };

    return transformedError;
  }

  // Fallback: if errors object doesn't exist but message does, create errors object
  if (responseData.message) {
    const errors: Record<string, string[]> = {};

    if (Array.isArray(responseData.message)) {
      // Multiple messages - try to extract field names
      responseData.message.forEach((msg: string) => {
        if (typeof msg !== "string") return;

        const fieldMatch = msg.match(
          /^(?:property\s+)?(\w+)\s+(?:should|must|is|has)/i
        );
        const field = fieldMatch ? fieldMatch[1].toLowerCase() : "_general";

        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(msg);
      });
    } else if (typeof responseData.message === "string") {
      // Single message
      errors["_general"] = [responseData.message];
    }

    // Convert arrays to strings for Mantine form
    const formattedErrors: Record<string, string> = {};
    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        formattedErrors[field] = messages[0];
      }
    });

    // Add errors at top level for Refine
    const transformedError: any = {
      ...error,
      errors: formattedErrors,
      response: error.response
        ? {
            ...error.response,
            data: {
              ...responseData,
              errors: formattedErrors,
            },
          }
        : {
            status: error.status || 400,
            statusText: error.statusText || "Bad Request",
            data: {
              ...responseData,
              errors: formattedErrors,
            },
          },
    };

    return transformedError;
  }

  return error;
};

// Transform form data to ensure proper types
// const transformDataForAPI = (data: any, resource: string): any => {
//   if (resource === "bots") {
//     const transformed = { ...data };
//     // Ensure boolean fields are properly typed
//     if (transformed.enabled !== undefined) {
//       transformed.enabled = Boolean(transformed.enabled);
//     }
//     return transformed;
//   }
//   return data;
// };

export const dataProvider = (
  apiUrl: string,
  resources: Resource[]
): DataProvider => {
  const baseDataProvider = dataProviderBase(apiUrl);

  // Custom create method to intercept HTTP response before nestjsx-crud processes it
  const createWithDirectFetch = async (params: any) => {
    // const dataToSend = transformDataForAPI(
    //   params.variables?.data || params.variables || params.data,
    //   params.resource
    // );

    try {
      const response = await fetch(`${apiUrl}/${params.resource}`, {
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

      const resource = resources.find(
        (resource) => resource.name === params.resource
      );
      if (!resource) {
        throw new Error(`Resource not found: ${params.resource}`);
      }

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
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };

  // Custom update method to intercept HTTP response before nestjsx-crud processes it
  const updateWithDirectFetch = async (params: any) => {
    // const dataToSend = transformDataForAPI(
    //   params.variables?.data || params.variables || params.data,
    //   params.resource
    // );

    try {
      const response = await fetch(
        `${apiUrl}/${params.resource}/${params.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params.variables),
        }
      );

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

      const resource = resources.find(
        (resource) => resource.name === params.resource
      );
      if (!resource) {
        throw new Error(`Resource not found: ${params.resource}`);
      }

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
    } catch (error: any) {
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };

  return {
    ...baseDataProvider,
    create: createWithDirectFetch,
    update: updateWithDirectFetch,
    getOne: async <TData extends BaseRecord = BaseRecord>(
      params: GetOneParams
    ): Promise<GetOneResponse<TData>> => {
      try {
        const response = await fetch(
          `${apiUrl}/${params.resource}/${params.id}`
        );

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

        const resource = resources.find(
          (resource) => resource.name === params.resource
        );
        if (!resource) {
          throw new Error(`Resource not found: ${params.resource}`);
        }

        const resourceSchemas = resource.schemas;
        const schema =
          resourceSchemas && "item" in resourceSchemas
            ? resourceSchemas.item
            : undefined;
        if (!schema) {
          throw new Error(`No schema found for resource: ${params.resource}`);
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
    },
    getList: async (props) => {
      const { resource: resourceName, pagination, filters, sorters } = props;
      const params = new URLSearchParams();
      if (pagination && pagination.currentPage && pagination.pageSize) {
        params.set("page", pagination.currentPage.toString());
        params.set("limit", pagination.pageSize.toString());
      }
      if (filters) {
        filters.forEach((filter) => {
          if ("field" in filter) {
            params.set(filter.field, filter.value.toString());
          }
        });
      }
      if (sorters) {
        sorters.forEach((sorter) => {
          params.set(sorter.field, sorter.order.toString());
        });
      }
      const response = await fetch(`/api/${resourceName}?${params.toString()}`);

      if (response.status < 200 || response.status > 299) throw response;

      const rawData = await response.json();

      const resource = resources.find(
        (resource) => resource.name === resourceName
      );
      if (!resource) {
        throw new Error(`Resource not found: ${resourceName}`);
      }

      const resourceSchemas = resource.schemas;
      const schema =
        resourceSchemas && "list" in resourceSchemas
          ? resourceSchemas.list
          : undefined;
      if (schema) {
        const validatedData = validateResponseWithType<{
          data: BaseRecord[];
          total?: number;
          meta?: Record<string, unknown>;
        }>(schema, rawData);
        return {
          data: validatedData.data,
          total: validatedData.total ?? validatedData.data.length,
          meta: validatedData.meta,
        };
      }

      return {
        data: rawData.data || [],
        total: Number(rawData.meta?.total) || (rawData.data?.length ?? 0),
        meta: rawData.meta,
      };
    },
  };
};
