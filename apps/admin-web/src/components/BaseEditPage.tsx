import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import BaseForm from "./BaseForm";
import type { Field } from "../types/fields";

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

  const user = query.data?.data;

  const initialValues = fields.reduce((acc, field) => {
    // Handle boolean fields specially to preserve false values
    if (field.type === "checkbox") {
      acc[field.key] = user?.[field.key] ?? false;
    } else {
      acc[field.key] = user?.[field.key] || "";
    }
    return acc;
  }, {} as Record<string, any>);

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
