"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@mantine/core/styles.css");
require("@mantine/dates/styles.css"); //if using mantine date picker features
require("mantine-react-table/styles.css"); //make sure MRT styles were imported in your app root (once)
var react_1 = require("react");
var mantine_react_table_1 = require("mantine-react-table");
// import type { BaseRecord } from "@refinedev/core";
var core_1 = require("@refinedev/core");
var core_2 = require("@mantine/core");
var modals_1 = require("@mantine/modals");
var icons_react_1 = require("@tabler/icons-react");
var react_router_dom_1 = require("react-router-dom");
var BaseListPage = function (_a) {
    var _b;
    var resource = _a.resource, columns = _a.fields;
    var _c = (0, react_1.useState)({
        pageIndex: 0,
        pageSize: 10,
    }), pagination = _c[0], setPagination = _c[1];
    var open = (0, core_1.useNotification)().open;
    var _d = (0, core_1.useList)({
        resource: resource,
        pagination: {
            currentPage: pagination.pageIndex + 1,
            pageSize: pagination.pageSize,
        },
    }), result = _d.result, query = _d.query;
    var deleteRecord = (0, core_1.useDelete)().mutate;
    var data = (_b = result === null || result === void 0 ? void 0 : result.data) !== null && _b !== void 0 ? _b : [];
    var isLoading = query.isLoading;
    var openDeleteConfirmModal = (0, react_1.useCallback)(function (row) {
        return modals_1.modals.openConfirmModal({
            title: "Are you sure you want to delete this record?",
            children: (<core_2.Text>
            Are you sure you want to delete{" "}
            {row.original.name || row.original.email}? This
            action cannot be undone.
          </core_2.Text>),
            labels: { confirm: "Delete", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: function () {
                deleteRecord({
                    resource: resource,
                    id: row.original.id,
                }, {
                    onSuccess: function () {
                        open === null || open === void 0 ? void 0 : open({
                            type: "success",
                            message: "Record deleted successfully",
                        });
                    },
                });
            },
        });
    }, [resource, deleteRecord, open]);
    var tableColumns = (0, react_1.useMemo)(function () { return __spreadArray(__spreadArray([
        {
            header: "ID",
            accessorKey: "id",
            size: 80,
        }
    ], columns, true), [
        {
            header: "Created At",
            accessorKey: "createdAt",
            Cell: function (_a) {
                var cell = _a.cell;
                var date = new Date(cell.getValue());
                return date.toLocaleString();
            },
        },
        {
            header: "Updated At",
            accessorKey: "updatedAt",
            Cell: function (_a) {
                var cell = _a.cell;
                var date = new Date(cell.getValue());
                return date.toLocaleString();
            },
        },
        {
            header: "Actions",
            id: "actions",
            size: 150,
            Cell: function (_a) {
                var row = _a.row;
                return (<core_2.Flex gap="xs">
            <core_2.Tooltip label="Show">
              <core_2.ActionIcon component={react_router_dom_1.Link} to={"/admin/".concat(resource, "/").concat(row.original.id)} variant="subtle" color="gray">
                <icons_react_1.IconEye size={16}/>
              </core_2.ActionIcon>
            </core_2.Tooltip>
            <core_2.Tooltip label="Edit">
              <core_2.ActionIcon component={react_router_dom_1.Link} to={"/admin/".concat(resource, "/edit/").concat(row.original.id)} variant="subtle" color="blue">
                <icons_react_1.IconEdit size={16}/>
              </core_2.ActionIcon>
            </core_2.Tooltip>
            <core_2.Tooltip label="Delete">
              <core_2.ActionIcon color="red" variant="subtle" onClick={function () { return openDeleteConfirmModal(row); }}>
                <icons_react_1.IconTrash size={16}/>
              </core_2.ActionIcon>
            </core_2.Tooltip>
          </core_2.Flex>);
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
    ], false); }, [columns, resource, openDeleteConfirmModal]);
    var table = (0, mantine_react_table_1.useMantineReactTable)({
        columns: tableColumns,
        manualPagination: true,
        manualFiltering: true,
        data: data,
        state: {
            isLoading: isLoading,
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            },
        },
        initialState: { density: "xs" },
        enableDensityToggle: false,
        rowCount: result === null || result === void 0 ? void 0 : result.total,
        onPaginationChange: setPagination,
        mantineTableProps: {
            striped: "odd",
            withColumnBorders: true,
            withRowBorders: true,
            withTableBorder: true,
        },
        renderTopToolbarCustomActions: function () { return (<core_2.Button component={react_router_dom_1.Link} to={"/admin/".concat(resource, "/create")} leftSection={<icons_react_1.IconPlus size={16}/>}>
        Create New Record
      </core_2.Button>); },
    });
    return <mantine_react_table_1.MantineReactTable table={table}/>;
};
exports.default = BaseListPage;
