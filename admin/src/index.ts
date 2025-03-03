import pluginPkg from "../../package.json";
import pluginId from "./pluginId";
import Initializer from "./components/Initializer";

const name = pluginPkg.strapi.name;

export default {
  register(app: any) {
    const plugin = {
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    };

    app.registerPlugin(plugin);

    app.customFields.register({
      name: "location",
      pluginId: pluginId, // the custom field is created by a color-picker plugin
      type: "json", // the color will be stored as a string
      intlLabel: {
        id: `${pluginId}.location.label`,
        defaultMessage: "Location",
      },
      intlDescription: {
        id: `${pluginId}.location.description`,
        defaultMessage: "Select any location",
      },
      components: {
        Input: async () =>
          import(
            /* webpackChunkName: "input-component" */ "./components/LocationInput"
          ),
      },
      options: {
        // declare options here
      },
    });
  },

  bootstrap() {},

  async registerTrads(app: any) {
    const { locales } = app;

    const importedTrads = await Promise.all(
      (locales as any[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: Object.keys(data).reduce(
                (acc, key) => {
                  acc[`${pluginId}.${key}`] = data[key];
                  return acc;
                },
                {} as Record<string, string>,
              ),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      }),
    );

    return Promise.resolve(importedTrads);
  },
};
