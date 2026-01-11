import type { GetListParams, BaseRecord } from "@refinedev/core";
import { validateResponseWithType } from "./validateResponseWithType";
import { transformNestJSErrors } from "./transformNestJSErrors";

export const createGetList =
  (apiUrl: string) => async (props: GetListParams) => {
    try {
      const { pagination, filters, sorters, meta } = props;

      const resource = meta?.resource;
      if (!resource) {
        throw new Error("Resource not found");
      }

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

      const url = `${apiUrl}${resource.getApiListPath(
        meta?.resourcePathParams
      )}?${params.toString()}`;

      const response = await fetch(url);

      if (response.status < 200 || response.status > 299) throw response;

      const rawData = await response.json();

      const schema = resource.api.list?.schema;
      if (!schema) {
        throw new Error(`No list schema found for resource: ${resource.name}`);
      }
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
    } catch (error: unknown) {
      console.error(error);
      const transformedError = transformNestJSErrors(error);
      throw transformedError;
    }
  };
