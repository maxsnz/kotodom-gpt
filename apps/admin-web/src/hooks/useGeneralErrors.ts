/**
 * Hook to extract general errors (not associated with form fields) from form errors
 * @param errors - Form errors object from useForm
 * @param fieldKeys - Array of field keys that exist in the form
 * @returns Array of general error messages
 */
export const useGeneralErrors = (
  errors: Record<string, any> | undefined,
  fieldKeys: string[]
): string[] => {
  if (!errors) {
    return [];
  }

  const generalErrors: string[] = [];

  Object.entries(errors).forEach(([key, value]) => {
    // If error is for _general or for a field that doesn't exist in form
    if (key === "_general" || !fieldKeys.includes(key)) {
      if (typeof value === "string") {
        generalErrors.push(value);
      } else if (Array.isArray(value)) {
        generalErrors.push(...value.filter((v) => typeof v === "string"));
      }
    }
  });

  return generalErrors;
};
