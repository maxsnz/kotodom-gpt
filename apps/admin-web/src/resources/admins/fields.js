"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminFields = void 0;
var fieldTypes_1 = require("../../types/fieldTypes");
exports.adminFields = [
    {
        key: "email",
        label: "Email",
        type: fieldTypes_1.FieldType.TEXT,
        props: { required: true },
        header: "Email",
        accessorKey: "email",
    },
    {
        key: "name",
        label: "Name",
        type: fieldTypes_1.FieldType.TEXT,
        props: { required: true },
        header: "Name",
        accessorKey: "name",
    },
];
