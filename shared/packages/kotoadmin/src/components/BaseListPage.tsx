import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; //if using mantine date picker features
import "mantine-react-table/styles.css"; //make sure MRT styles were imported in your app root (once)
import { useMemo, useCallback } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
} from "mantine-react-table";

import {
  useList,
  useDelete,
  useNotification,
  useInvalidate,
  type CrudFilter,
} from "@refinedev/core";
import { ActionIcon, Tooltip, Flex, Text, Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { filterFieldsForList } from "../utils/filterFields";
import { Resource } from "../types/resource";
import { useResourcePathParams } from "../hooks/useResourcePathParams";

type Props = {
  resource: Resource;
};

const BaseListPage = <T extends { id: string | number }>({
  resource,
}: Props) => {
  const resourcePathParams = useResourcePathParams(resource);

  const { open } = useNotification();
  const invalidate = useInvalidate();

  const { result, query } = useList<T>({
    resource: resource.name,
    filters: resource.meta.initialFilters?.map(
      (filter): CrudFilter => ({
        field: filter.field,
        operator: "eq",
        value: filter.value,
      })
    ),
    meta: { resourcePathParams, resource },
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
              resource: resource.name,
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
      ...filterFieldsForList(resource.fields).map((field) => ({
        ...field,
        accessorKey: field.key,
        header: field.label,
      })),
      {
        header: "Actions",
        id: "actions",
        size: 150,
        Cell: ({ row }) => (
          <Flex gap="xs">
            {resource.routes.show && (
              <Tooltip label="Show">
                <ActionIcon
                  component={Link}
                  to={resource.getShowPath(row.original, resourcePathParams)}
                  variant="subtle"
                  color="gray"
                >
                  <IconEye size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {resource.routes.edit && (
              <Tooltip label="Edit">
                <ActionIcon
                  component={Link}
                  to={resource.getEditPath(row.original, resourcePathParams)}
                  variant="subtle"
                  color="blue"
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {resource.meta.canDelete && (
              <Tooltip label="Delete">
                <ActionIcon
                  color="red"
                  variant="subtle"
                  onClick={() => openDeleteConfirmModal(row)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            )}
            {resource.actions
              .filter((action) => action.available(row.original))
              .map((action) => (
                <Tooltip label={action.name} key={action.name}>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={async () => {
                      try {
                        await action.action(row.original, {
                          invalidate,
                          resource,
                          openNotification: open || (() => {}),
                        });
                      } catch (error) {
                        open?.({
                          type: "error",
                          message:
                            error instanceof Error
                              ? error.message
                              : "Action failed",
                        });
                      }
                    }}
                  >
                    {action.icon}
                  </ActionIcon>
                </Tooltip>
              ))}
          </Flex>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [resource, openDeleteConfirmModal, invalidate, open]
  );

  const table = useMantineReactTable({
    columns: tableColumns,
    manualPagination: false,
    manualFiltering: false,
    data,
    state: {
      isLoading,
    },
    initialState: { density: "xs" },
    enableDensityToggle: false,
    mantineTableProps: {
      striped: "odd",
      withColumnBorders: true,
      withRowBorders: true,
      withTableBorder: true,
    },
    renderTopToolbarCustomActions: () => (
      <>
        {resource.routes.create && (
          <Button
            component={Link}
            to={resource.getCreatePath(resourcePathParams)}
            leftSection={<IconPlus size={16} />}
          >
            Create New Record
          </Button>
        )}
        {resource.listActions.map((listAction) => (
          <Button
            key={listAction.name}
            color={listAction.color || "gray"}
            variant={listAction.variant || "outline"}
            leftSection={listAction.icon}
            onClick={async () => {
              try {
                await listAction.action({
                  invalidate,
                  resource,
                  openNotification: open || (() => {}),
                });
              } catch (error) {
                open?.({
                  type: "error",
                  message:
                    error instanceof Error ? error.message : "Action failed",
                });
              }
            }}
          >
            {listAction.name}
          </Button>
        ))}
      </>
    ),
  });

  return <MantineReactTable table={table} />;
};

export default BaseListPage;
