import { Create, Edit, useForm } from "@refinedev/mantine";
import { TextInput, Checkbox, Select } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useGeneralErrors } from "../hooks/useGeneralErrors";
import { GeneralErrors } from "./GeneralErrors";
import type { Field, FormValues } from "../types/fields";
import { FieldType } from "../types/fieldTypes";
import {
  filterFieldsForEdit,
  getHiddenFieldsForEdit,
} from "../utils/filterFields";
import { Resource } from "@/types/resource";

const BaseForm = ({
  initialValues,
  mode = "create",
  resource,
  id,
}: {
  initialValues: FormValues;
  mode?: "create" | "edit";
  resource: Resource;
  id?: string;
}) => {
  const navigate = useNavigate();

  const {
    getInputProps,
    saveButtonProps,
    refineCore: { formLoading },
    errors,
  } = useForm({
    initialValues,
    refineCoreProps: {
      resource: resource.name,
      action: mode,
      redirect: false,
      onMutationSuccess: () => {
        navigate(`/cp/${resource}`);
      },
      ...(mode === "edit" && id ? { id } : {}),
    },
  });

  // Get field keys to check for general errors
  const fieldKeys = resource.fields.map((f) => f.key);

  // Extract general errors (errors not associated with form fields)
  const generalErrors = useGeneralErrors(errors, fieldKeys);

  const FormWrapper = mode === "edit" ? Edit : Create;

  const getFieldError = (fieldKey: string) => {
    const inputProps = getInputProps(fieldKey);
    return inputProps.error || errors?.[fieldKey];
  };

  const getCommonFieldProps = (field: Field) => ({
    key: field.key,
    mt: "sm" as const,
    label: field.label,
    error: getFieldError(field.key),
  });

  const visibleFields = filterFieldsForEdit(resource.fields);

  // Get hidden fields for edit mode (only in edit mode)
  const hiddenFields =
    mode === "edit"
      ? getHiddenFieldsForEdit(resource.fields /*, initialValues*/)
      : [];

  return (
    <FormWrapper
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      resource={resource.name}
    >
      {visibleFields.map((field: Field) => {
        const inputProps = getInputProps(field.key);
        if (field.type === "checkbox") {
          return (
            <Checkbox
              {...getCommonFieldProps(field)}
              {...inputProps}
              checked={inputProps.value}
              key={field.key}
            />
          );
        } else if (field.type === FieldType.SELECT) {
          return (
            <Select
              {...getCommonFieldProps(field)}
              data={field.options}
              {...inputProps}
              key={field.key}
            />
          );
        } else {
          return (
            <TextInput
              {...getCommonFieldProps(field)}
              {...inputProps}
              key={field.key}
            />
          );
        }
      })}

      {/* Render hidden inputs for non-visible fields in edit mode */}
      {hiddenFields.map((field) => {
        const inputProps = getInputProps(field.key);
        const value = inputProps.value;

        // Handle different field types for hidden inputs
        // Use getInputProps to ensure proper form integration with Mantine
        if (field.type === "checkbox") {
          // For checkbox, convert boolean to string for hidden input
          return (
            <input
              key={field.key}
              type="hidden"
              name={field.key}
              value={value ? "true" : "false"}
            />
          );
        } else {
          // For other types, use the value from inputProps
          return (
            <input
              key={field.key}
              type="hidden"
              name={field.key}
              value={value ?? ""}
            />
          );
        }
      })}

      <GeneralErrors errors={generalErrors} />
    </FormWrapper>
  );
};

export default BaseForm;
