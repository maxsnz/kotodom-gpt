import { Alert } from "@mantine/core";

type GeneralErrorsProps = {
  errors: string[];
};

export const GeneralErrors = ({ errors }: GeneralErrorsProps) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Alert color="red" mt="md">
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </Alert>
  );
};
