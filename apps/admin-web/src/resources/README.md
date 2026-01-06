# Resources

This directory contains all resource definitions for the admin panel.

## Structure

Each resource should have its own folder with a `fields.ts` file:

```
resources/
  users/
    fields.ts
  admins/
    fields.ts
  products/
    fields.ts
```

## Adding a New Resource

1. **Create the resource folder and fields file:**

   ```bash
   mkdir resources/myresource
   touch resources/myresource/fields.ts
   ```

2. **Define fields in `fields.ts`:**

   ```typescript
   import { FieldType } from "../../types/fieldTypes";

   export const myResourceFields = [
     {
       key: "name",
       label: "Name",
       type: FieldType.TEXT,
       props: { required: true },
       header: "Name",
       accessorKey: "name",
     },
     // ... more fields
   ];
   ```

3. **Register the resource in `resources/index.ts`:**

   ```typescript
   import { myResourceFields } from "./myresource/fields";

   export const resources = {
     // ... existing resources
     myresource: {
       name: "myresource",
       fields: myResourceFields,
     },
   } as const;
   ```

That's it! The routes and Refine resources will be automatically generated.
