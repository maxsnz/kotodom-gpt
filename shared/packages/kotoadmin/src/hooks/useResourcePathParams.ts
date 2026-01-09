import { useParams } from "react-router-dom";
import { Resource } from "../types/resource";

export const useResourcePathParams = (
  resource: Resource
): Map<string, string> => {
  const params = useParams();
  const result = new Map();
  Object.keys(params || {})
    .filter((key) => resource.api.list?.includes(`:${key}`))
    .forEach((key) => {
      result.set(key, params?.[key]);
    });
  return result;
};
