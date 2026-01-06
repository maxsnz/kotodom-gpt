import type { Field } from "../types/fields";
import BaseForm from "./BaseForm";

const BaseCreatePage = ({
  resource,
  fields,
}: {
  resource: string;
  fields: Field[];
}) => {
  const initialValues = fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as Record<string, any>);

  return (
    <BaseForm
      initialValues={initialValues}
      resource={resource}
      fields={fields}
      mode="create"
    />
  );
};

export default BaseCreatePage;
