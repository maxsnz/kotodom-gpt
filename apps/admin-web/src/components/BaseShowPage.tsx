import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Show, EmailField, TextField, DateField } from "@refinedev/mantine";
import { Checkbox, Title } from "@mantine/core";
import { Fragment } from "react/jsx-runtime";
import { FieldType } from "../types/fieldTypes";
import type { Field } from "../types/fields";
import { filterFieldsForShow } from "../utils/filterFields";
import { Resource } from "@/types/resource";

type Props = {
  resource: Resource;
};

const getSelectDisplayValue = (field: Field, value: unknown): string => {
  if (field.type !== FieldType.SELECT) {
    return String(value || "");
  }
  const option = field.options.find((opt) => opt.value === value);
  return option ? option.label : String(value || "");
};

const BaseShow = ({ resource }: Props) => {
  const { id } = useParams<{ id: string }>();

  const { query } = useOne({
    resource: resource.name,
    id,
  });

  const record = query.data?.data;

  if (!record) {
    return <div>Record not found</div>;
  }

  // Filter fields for show view
  // Note: filterFieldsForShow returns Field[], but we need FieldWithHeaderAndAccessorKey[]
  // Since FieldWithHeaderAndAccessorKey extends Field, we filter and then map to preserve header/accessorKey
  const visibleColumns = filterFieldsForShow(resource.fields).map((field) => {
    // Find original field to preserve header and accessorKey
    const originalField = resource.fields.find((col) => col.key === field.key);
    return originalField || (field as Field);
  });

  return (
    <Show isLoading={query.isLoading}>
      <TextField value={record?.id ?? ""} />
      {visibleColumns.map((column) => (
        <Fragment key={column.key}>
          <Title my="xs" order={5}>
            {column.label}
          </Title>
          {column.type === FieldType.EMAIL && (
            <EmailField value={record[column.key]} />
          )}
          {column.type === FieldType.TEXT && (
            <TextField value={record[column.key]} />
          )}
          {column.type === FieldType.DATE && (
            <DateField value={record[column.key]} />
          )}
          {column.type === FieldType.BOOLEAN && (
            <Checkbox checked={record[column.key]} disabled />
          )}
          {column.type === FieldType.SELECT && (
            <TextField
              value={getSelectDisplayValue(column, record[column.key])}
            />
          )}
        </Fragment>
      ))}
    </Show>
  );
};

export default BaseShow;
