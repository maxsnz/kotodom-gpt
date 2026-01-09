import type { FormValues } from "../types/fields";
import BaseForm from "./BaseForm";
import { Resource } from "../types/resource";

const BaseCreatePage = ({ resource }: { resource: Resource }) => {
  const initialValues = resource.fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {} as FormValues);

  return (
    <BaseForm initialValues={initialValues} resource={resource} mode="create" />
  );
};

export default BaseCreatePage;
