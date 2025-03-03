import { Core } from "@strapi/strapi";

import register from "./register";
import bootstrap from "./bootstrap";
import destroy from "./destroy";
import config from "./config";
import contentTypes from "./content-types";
import middlewares from "./middlewares";
import policies from "./policies";
import services from "./services";

interface PluginModule {
  register: any;
  bootstrap: any;
  destroy: any;
  config: any; // You might want to type this more specifically
  services: any; // You might want to type this more specifically
  contentTypes: any; // You might want to type this more specifically
  policies: any; // You might want to type this more specifically
  middlewares: any; // You might want to type this more specifically
}

const plugin: PluginModule = {
  register,
  bootstrap,
  destroy,
  config,
  services,
  contentTypes,
  policies,
  middlewares,
};

export default plugin;
