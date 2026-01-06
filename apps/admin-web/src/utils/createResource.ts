export const createResource = (resource: string) => {
  return {
    name: resource,
    list: `/${resource}`,
    create: `/${resource}/create`,
    edit: `/${resource}/edit/:id`,
    show: `/${resource}/:id`,
    meta: {
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canShow: true,
    },
  };
};

export default createResource;
