import { Create, Edit, useForm } from "@refinedev/mantine";
import { TextInput, Checkbox } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useGeneralErrors } from "../hooks/useGeneralErrors";
import { GeneralErrors } from "./GeneralErrors";

type Field = {
  key: string;
  label: string;
  type: string;
  props: any;
};

const BaseForm = ({
  initialValues,
  fields,
  mode = "create",
  resource,
  id,
}: {
  initialValues: any;
  fields: Field[];
  mode?: "create" | "edit";
  resource: string;
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
      resource,
      action: mode,
      redirect: false,
      onMutationSuccess: () => {
        navigate(`/cp/${resource}`);
      },
      ...(mode === "edit" && id ? { id } : {}),
    },
  });

  // Get field keys to check for general errors
  const fieldKeys = fields.map((f) => f.key);

  // Extract general errors (errors not associated with form fields)
  const generalErrors = useGeneralErrors(errors, fieldKeys);

  const FormWrapper = mode === "edit" ? Edit : Create;

  return (
    <FormWrapper
      isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      resource={resource}
    >
      {fields.map((field: Field) => {
        const inputProps = getInputProps(field.key);
        return field.type === "checkbox" ? (
          <Checkbox
            key={field.key}
            mt="sm"
            label={field.label}
            {...inputProps}
            // getInputProps should already include error, but we can override if needed
            error={inputProps.error || errors?.[field.key]}
          />
        ) : (
          <TextInput
            key={field.key}
            mt="sm"
            label={field.label}
            {...inputProps}
            // getInputProps should already include error, but we can override if needed
            error={inputProps.error || errors?.[field.key]}
          />
        );
      })}

      <GeneralErrors errors={generalErrors} />
    </FormWrapper>
  );
};

export default BaseForm;
