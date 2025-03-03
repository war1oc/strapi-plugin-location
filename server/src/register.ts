import { Core } from "@strapi/strapi";

import pluginId from "../../admin/src/pluginId";

interface PluginConfig {
  enabled: boolean;
}

class LocationPlugin {
  private strapi: Core.Strapi;
  public config: PluginConfig = { enabled: true };

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  async initialize(): Promise<void> {
    if (!this.isPostgresDatabase()) {
      this.disablePlugin("Only postgres client type is supported!");
      return;
    }

    if (!(await this.isPostgisAvailable())) {
      this.disablePlugin("Error accessing POSTGIS");
      return;
    }

    this.registerCustomField();
  }

  private isPostgresDatabase(): boolean {
    return this.strapi.config.get("database.connection.client") === "postgres";
  }

  private async isPostgisAvailable(): Promise<boolean> {
    let postgisVersion = await this.getPostgisVersion();
    if (!postgisVersion) {
      await this.createPgExtension();
      postgisVersion = await this.getPostgisVersion();
    }
    return postgisVersion !== undefined;
  }

  private async getPostgisVersion(): Promise<string | undefined> {
    try {
      const result = await this.strapi.db.connection.raw(
        "SELECT PostGIS_version();",
      );
      return result.rows[0].postgis_version;
    } catch (err) {
      this.strapi.log.error(`Error getting PostGIS version: ${err.message}`);
      return undefined;
    }
  }

  private async createPgExtension(): Promise<boolean> {
    try {
      await this.strapi.db.connection.raw(
        "CREATE EXTENSION IF NOT EXISTS postgis;",
      );
      return true;
    } catch (err) {
      this.strapi.log.error(`Error Enabling PostGIS: ${err.message}`);
      return false;
    }
  }

  private disablePlugin(reason: string): void {
    this.strapi.log.info(reason);
    this.config.enabled = false;
  }

  private registerCustomField(): void {
    this.strapi.customFields.register({
      name: "location",
      plugin: pluginId,
      type: "json",
      inputSize: {
        default: 4,
        isResizable: true,
      },
    });
  }
}

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const plugin = new LocationPlugin(strapi);
  await plugin.initialize();
  strapi.plugin("location-plugin").enabled = plugin.config.enabled;
};
