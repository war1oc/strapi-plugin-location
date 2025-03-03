import { Core } from "@strapi/strapi";

const locationServices = ({ strapi }: { strapi: Core.Strapi }) => ({
  getLocationFields: (modelAttributes: any) => {
    return Object.entries(modelAttributes)
      .map(([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          "customField" in value &&
          value.customField === "plugin::location-plugin.location"
        ) {
          return key;
        } else {
          return false;
        }
      })
      .filter(Boolean);
  },
  getModelsWithLocation: () => {
    return Object.values(strapi.contentTypes)
      .filter(
        (contentType) =>
          (contentType.uid as string).startsWith("api::") ||
          contentType.modelType === "component" ||
          (contentType.uid as string) === "plugin::users-permissions.user",
      )
      .map((contentType) => {
        const hasLocationField = Object.values(contentType.attributes).some(
          (entry) => {
            if (
              entry &&
              typeof entry === "object" &&
              "customField" in entry &&
              entry.customField === "plugin::location-plugin.location"
            ) {
              return true;
            } else {
              return false;
            }
          },
        );
        return hasLocationField ? contentType : false;
      })
      .filter(Boolean);
  },
});
export default {
  locationServices,
};
