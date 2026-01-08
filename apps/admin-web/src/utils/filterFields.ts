import type { Field } from "../types/fields";

/**
 * Filters fields that should be visible in list view.
 * Field is visible if isVisible is undefined or isVisible.list !== false
 */
export const filterFieldsForList = (fields: Field[]): Field[] => {
  return fields.filter((field) => {
    // If isVisible is not defined, field is visible everywhere
    if (!field.isVisible) {
      return true;
    }
    return !!field.isVisible.list;
  });
};

/**
 * Filters fields that should be visible in show view.
 * Field is visible if isVisible is undefined or isVisible.show !== false
 */
export const filterFieldsForShow = (fields: Field[]): Field[] => {
  return fields.filter((field) => {
    // If isVisible is not defined, field is visible everywhere
    if (!field.isVisible) {
      return true;
    }
    return !!field.isVisible.show;
  });
};

/**
 * Filters fields that should be visible in edit form.
 * Field is visible if isVisible is undefined or (isVisible.show !== false OR isVisible.edit !== false)
 * This allows fields visible in show view to also appear in edit form
 */
export const filterFieldsForEdit = (fields: Field[]): Field[] => {
  return fields.filter((field) => {
    // If isVisible is not defined, field is visible everywhere
    if (!field.isVisible) {
      return true;
    }
    return !!field.isVisible.edit;
  });
};

/**
 * Returns fields that should be rendered as hidden inputs in edit mode.
 * These are fields that have isVisible?.edit === false but have values.
 */
export const getHiddenFieldsForEdit = (
  fields: Field[]
  // values: FormValues
): Field[] => {
  return fields.filter((field) => {
    // If isVisible is not defined, field is visible everywhere
    if (!field.isVisible) {
      return false;
    }

    return !field.isVisible.edit;
  });
};
