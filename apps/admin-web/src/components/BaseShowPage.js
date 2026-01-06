"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@refinedev/core");
var mantine_1 = require("@refinedev/mantine");
var core_2 = require("@mantine/core");
var jsx_runtime_1 = require("react/jsx-runtime");
var fieldTypes_1 = require("../types/fieldTypes");
var BaseShow = function (_a) {
    var _b;
    var resource = _a.resource, columns = _a.fields;
    var _c = (0, core_1.useShow)({ resource: resource }), record = _c.result, isLoading = _c.query.isLoading;
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!record) {
        return <div>Record not found</div>;
    }
    return (<mantine_1.Show isLoading={isLoading}>
      <core_2.Title my="xs" order={5}>
        Id
      </core_2.Title>
      <mantine_1.NumberField value={(_b = record === null || record === void 0 ? void 0 : record.id) !== null && _b !== void 0 ? _b : ""}/>
      {columns.map(function (column) { return (<jsx_runtime_1.Fragment key={column.accessorKey}>
          <core_2.Title my="xs" order={5}>
            {column.header}
          </core_2.Title>
          {column.type === fieldTypes_1.FieldType.EMAIL && (<mantine_1.EmailField value={record[column.accessorKey]}/>)}
          {column.type === fieldTypes_1.FieldType.TEXT && (<mantine_1.TextField value={record[column.accessorKey]}/>)}
          {column.type === fieldTypes_1.FieldType.DATE && (<mantine_1.DateField value={record[column.accessorKey]}/>)}
        </jsx_runtime_1.Fragment>); })}
      <core_2.Title my="xs" order={5}>
        Created At
      </core_2.Title>
      <mantine_1.DateField value={record === null || record === void 0 ? void 0 : record.createdAt}/>
      <core_2.Title my="xs" order={5}>
        Updated At
      </core_2.Title>
      <mantine_1.DateField value={record === null || record === void 0 ? void 0 : record.updatedAt}/>
    </mantine_1.Show>);
};
exports.default = BaseShow;
