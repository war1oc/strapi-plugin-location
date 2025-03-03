import { Core } from "@strapi/strapi";
import _ from "lodash";

import pluginId from "../../../admin/src/pluginId";

const createSubscriber = (strapi: Core.Strapi, models: any[]) => {
  const db = strapi.db.connection;
  const locationServices = strapi.plugin(pluginId).service("locationServices");

  return async (context, next) => {
    const { contentType, params } = context;

    if (!contentType) {
      return next();
    }

    const result = await next();
    if (!result) {
      return next();
    }

    if (["create", "update"].includes(context.action)) {
      const locationFields = locationServices.getLocationFields(
        contentType.attributes,
      );
      if (!locationFields.length) {
        return result;
      }

      await Promise.all(
        locationFields.map(async (locationField) => {
          const data = JSON.parse(params.data[locationField]);
          if (!data?.lng || !data?.lat) return;

          await db.raw(`
            UPDATE ${contentType.collectionName}
            SET ${_.snakeCase(locationField)}_geom = ST_SetSRID(ST_MakePoint(
            ${data.lng}, ${data.lat}), 4326)
            WHERE id = ${result.id};
          `);
        }),
      );
    }

    return result;
  };
};

export default createSubscriber;
