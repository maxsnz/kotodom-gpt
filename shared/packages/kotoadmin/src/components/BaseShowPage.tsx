import { useCallback, Fragment } from "react";
import {
  useOne,
  useInvalidate,
  useNotification,
  useDelete,
} from "@refinedev/core";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Show, EmailField, TextField, DateField } from "@refinedev/mantine";
import { Checkbox, Title, Text, Button } from "@mantine/core";
import { FieldType } from "../types/fieldTypes";
import type { Field } from "../types/fields";
import { filterFieldsForShow } from "../utils/filterFields";
import { Resource } from "../types/resource";
import { useResourcePathParams } from "../hooks/useResourcePathParams";
import ResourceStore from "../utils/resourceStore";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { modals } from "@mantine/modals";

type Props = {
  resource: Resource;
  resourceStore: ResourceStore;
};

const getSelectDisplayValue = (field: Field, value: unknown): string => {
  if (field.type !== FieldType.SELECT) {
    return String(value || "");
  }
  const option = field.options.find((opt) => opt.value === value);
  return option ? option.label : String(value || "");
};

const BaseShow = ({ resource, resourceStore }: Props) => {
  const { id } = useParams<{ id: string }>();
  const resourcePathParams = useResourcePathParams(resource);
  const navigate = useNavigate();
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { mutate: deleteRecord } = useDelete();

  const { query } = useOne({
    resource: resource.name,
    id,
    meta: { resourcePathParams, resource },
  });

  const record = query.data?.data;

  const openDeleteConfirmModal = useCallback(() => {
    if (!record) return;
    modals.openConfirmModal({
      title: "Are you sure you want to delete this record?",
      children: (
        <Text>
          Are you sure you want to delete{" "}
          {(record as any).name || (record as any).email || record.id}? This
          action cannot be undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => {
        if (!record?.id) return;
        deleteRecord(
          {
            resource: resource.name,
            id: record.id,
          },
          {
            onSuccess: () => {
              navigate(resource.getListPath(resourcePathParams));
              open?.({
                type: "success",
                message: "Record deleted successfully",
              });
            },
          }
        );
      },
    });
  }, [record, resource, resourcePathParams, deleteRecord, navigate, open]);

  if (!record && !query.isLoading) {
    return <div>Record not found</div>;
  }

  if (!record) {
    return null;
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
    <Show
      isLoading={query.isLoading}
      resource={resource.name}
      canEdit={resource.meta.canUpdate}
      canDelete={resource.meta.canDelete}
      headerButtons={() => (
        <>
          {resource.meta.canUpdate && resource.routes.edit && (
            <Button
              component={Link}
              to={resource.getEditPath(record, resourcePathParams)}
              leftSection={<IconEdit size={16} />}
            >
              Edit
            </Button>
          )}
          {resource.meta.canDelete && (
            <Button
              color="red"
              variant="outline"
              leftSection={<IconTrash size={16} />}
              onClick={openDeleteConfirmModal}
            >
              Delete
            </Button>
          )}
          {resource.actions
            ?.filter((action) => action.available(record))
            .map((action) => (
              <Button
                color="gray"
                variant="outline"
                key={action.name}
                onClick={async () => {
                  try {
                    await action.action(record, {
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
                {action.icon && (
                  <span style={{ marginRight: 4 }}>{action.icon}</span>
                )}
                {action.name}
              </Button>
            ))}
        </>
      )}
      footerButtons={({ defaultButtons }) => (
        <>
          {defaultButtons}
          {resource.routes.show.footerButtons?.map((button) => (
            <Button
              key={button.label}
              onClick={(event) =>
                button.onClick(event, {
                  resource,
                  record,
                  navigate,
                })
              }
            >
              {button.label}
            </Button>
          ))}
        </>
      )}
    >
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
          {column.type === FieldType.TEXTAREA && (
            <TextField value={record[column.key]} />
          )}
          {column.type === FieldType.LINK && (
            <Link to={column.url}>{column.label}</Link>
          )}
          {column.type === FieldType.RECORD_LINK && (
            <Link
              to={resourceStore
                .getResource(column.resource)
                .getShowPath({ id: record[column.key] })}
            >
              {record[column.key]}
            </Link>
          )}
        </Fragment>
      ))}
    </Show>
  );
};

export default BaseShow;
