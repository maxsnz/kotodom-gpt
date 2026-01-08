import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useState, useCallback } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";
// import type { BaseRecord } from "@refinedev/core";
import { useList, useDelete, useNotification } from "@refinedev/core";
import { ActionIcon, Tooltip, Flex, Text, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { MRT_Cell } from "mantine-react-table";
import { filterFieldsForList } from "@/utils/filterFields";
import { Field } from "@/types/fields";

type Props = {
  resource: string;
  fields: Field[];
};

const BaseListPage = <T extends { id: string | number }>({
  resource,
  fields: columns,
}: Props) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { open } = useNotification();
  const { result, query } = useList<T>({
    resource,
    pagination: {
      currentPage: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
    },
  });

  const { mutate: deleteRecord } = useDelete();

  const data = result?.data ?? [];
  const isLoading = query.isLoading;

  const openDeleteConfirmModal = useCallback(
    (row: MRT_Row<T>) =>
      modals.openConfirmModal({
        title: "Are you sure you want to delete this record?",
        children: (
          <Text>
            Are you sure you want to delete{" "}
            {(row.original as any).name || (row.original as any).email}? This
            action cannot be undone.
          </Text>
        ),
        labels: { confirm: "Delete", cancel: "Cancel" },
        confirmProps: { color: "red" },
        onConfirm: () => {
          deleteRecord(
            {
              resource: resource,
              id: row.original.id,
            },
            {
              onSuccess: () => {
                open?.({
                  type: "success",
                  message: "Record deleted successfully",
                });
              },
            }
          );
        },
      }),
    [resource, deleteRecord, open]
  );

  const tableColumns = useMemo<MRT_ColumnDef<T>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        size: 80,
      },
      ...filterFieldsForList(columns).map((field) => ({
        ...field,
        accessorKey: field.key,
        header: field.label,
      })),
      {
        header: "Created At",
        accessorKey: "createdAt",
        Cell: ({ cell }: { cell: MRT_Cell<T, string> }) => {
          const date = new Date(cell.getValue<string>());
          return date.toLocaleString();
        },
      },
      {
        header: "Updated At",
        accessorKey: "updatedAt",
        Cell: ({ cell }: { cell: MRT_Cell<T, string> }) => {
          const date = new Date(cell.getValue<string>());
          return date.toLocaleString();
        },
      },
      {
        header: "Actions",
        id: "actions",
        size: 150,
        Cell: ({ row }) => (
          <Flex gap="xs">
            <Tooltip label="Show">
              <ActionIcon
                component={Link}
                to={`/cp/${resource}/${row.original.id}`}
                variant="subtle"
                color="gray"
              >
                <IconEye size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Edit">
              <ActionIcon
                component={Link}
                to={`/cp/${resource}/edit/${row.original.id}`}
                variant="subtle"
                color="blue"
              >
                <IconEdit size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete">
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => openDeleteConfirmModal(row)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [columns, resource, openDeleteConfirmModal]
  );

  const table = useMantineReactTable({
    columns: tableColumns,
    manualPagination: true,
    manualFiltering: true,
    data,
    state: {
      isLoading,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    initialState: { density: "xs" },
    enableDensityToggle: false,
    rowCount: result?.total,
    onPaginationChange: setPagination,
    mantineTableProps: {
      striped: "odd",
      withColumnBorders: true,
      withRowBorders: true,
      withTableBorder: true,
    },
    renderTopToolbarCustomActions: () => (
      <Button
        component={Link}
        to={`/cp/${resource}/create`}
        leftSection={<IconPlus size={16} />}
      >
        Create New Record
      </Button>
    ),
  });

  return <MantineReactTable table={table} />;
};

export default BaseListPage;
