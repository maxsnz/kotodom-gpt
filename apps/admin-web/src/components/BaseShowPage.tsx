import { useShow } from "@refinedev/core";
import {
  Show,
  NumberField,
  EmailField,
  TextField,
  DateField,
} from "@refinedev/mantine";
import { Title } from "@mantine/core";
import type { MRT_ColumnDef, MRT_RowData } from "mantine-react-table";
import { Fragment } from "react/jsx-runtime";
import {
  FieldType,
  type FieldType as FieldTypeType,
} from "../types/fieldTypes";

type Props<T extends MRT_RowData> = {
  resource: string;
  fields: (MRT_ColumnDef<T> & { type: FieldTypeType })[];
};

const BaseShow = <T extends { id: string | number } & MRT_RowData>({
  resource,
  fields: columns,
}: Props<T>) => {
  const {
    result: record,
    query: { isLoading },
  } = useShow<T>({ resource });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!record) {
    return <div>Record not found</div>;
  }

  return (
    <Show isLoading={isLoading}>
      <Title my="xs" order={5}>
        Id
      </Title>
      <NumberField value={record?.id ?? ""} />
      {columns.map((column) => (
        <Fragment key={column.accessorKey}>
          <Title my="xs" order={5}>
            {column.header}
          </Title>
          {column.type === FieldType.EMAIL && (
            <EmailField value={record[column.accessorKey as keyof T]} />
          )}
          {column.type === FieldType.TEXT && (
            <TextField value={record[column.accessorKey as keyof T]} />
          )}
          {column.type === FieldType.DATE && (
            <DateField value={record[column.accessorKey as keyof T]} />
          )}
        </Fragment>
      ))}
      <Title my="xs" order={5}>
        Created At
      </Title>
      <DateField value={record?.createdAt} />
      <Title my="xs" order={5}>
        Updated At
      </Title>
      <DateField value={record?.updatedAt} />
    </Show>
  );
};

export default BaseShow;
