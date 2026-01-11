import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import BaseForm from "./BaseForm";
import type { FormValues } from "../types/fields";
import { Resource } from "../types/resource";
import { useResourcePathParams } from "../hooks/useResourcePathParams";

const BaseEditPage = ({ resource }: { resource: Resource }) => {
  const { id } = useParams<{ id: string }>();
  const resourcePathParams = useResourcePathParams(resource);

  const { query } = useOne({
    resource: resource.name,
    id,
    meta: { resourcePathParams, resource },
  });

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  const record = query.data?.data;

  const initialValues = resource.fields.reduce((acc, field) => {
    // Handle boolean fields specially to preserve false values
    if (field.type === "checkbox") {
      acc[field.key] = record?.[field.key] ?? false;
    } else if (field.type === "select") {
      // For SELECT, preserve the actual value (could be null/undefined)
      acc[field.key] = record?.[field.key] ?? null;
    } else {
      acc[field.key] = record?.[field.key] || "";
    }
    return acc;
  }, {} as FormValues);

  return (
    <BaseForm
      mode="edit"
      initialValues={initialValues}
      resource={resource}
      id={id}
    />
  );
};

export default BaseEditPage;
