import type { Field, FormValues } from "../types/fields";
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
  }, {} as FormValues);

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
