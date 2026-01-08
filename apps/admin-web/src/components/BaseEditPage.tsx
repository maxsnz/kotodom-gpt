import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import BaseForm from "./BaseForm";
import type { Field, FormValues } from "../types/fields";

const BaseEditPage = ({
  resource,
  fields,
}: {
  resource: string;
  fields: Field[];
}) => {
  const { id } = useParams<{ id: string }>();

  const { query } = useOne({
    resource,
    id,
  });

  if (query.isLoading) {
    return <div>Loading...</div>;
  }

  const record = query.data?.data;

  const initialValues = fields.reduce((acc, field) => {
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
      fields={fields}
      resource={resource}
      id={id}
    />
  );
};

export default BaseEditPage;
