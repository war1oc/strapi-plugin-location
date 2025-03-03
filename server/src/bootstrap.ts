import { Core } from "@strapi/strapi";
import _ from "lodash";
import createSubscriber from "./utils/lifecycles";
import createFilterMiddleware from "./utils/middleware";
import pluginId from "../../admin/src/pluginId";

const locationServiceUid = `plugin::${pluginId}.locationServices`;

class LocationPluginBootstrap {
  private strapi: Core.Strapi;

  constructor(strapi: Core.Strapi) {
    this.strapi = strapi;
  }

  async initialize(): Promise<void> {
    if (!this.isPluginEnabled()) {
      this.strapi.log.info("Location plugin is disabled");
      return;
    }

    const modelsWithLocation = this.getModelsWithLocation();
    await this.setupGeographyColumns(modelsWithLocation);
    this.setupSubscriber(modelsWithLocation);
    this.setupMiddleware();
  }

  private isPluginEnabled(): boolean {
    return this.strapi.plugin(pluginId).enabled;
  }

  private getModelsWithLocation(): any[] {
    return this.strapi.services[locationServiceUid].getModelsWithLocation();
  }

  private async setupGeographyColumns(models: any[]): Promise<void> {
    const db = this.strapi.db.connection;

    for (const model of models) {
      const tableName = this.getTableName(model);
      if (!tableName) {
        this.strapi.log.warn(`Table name not found for model: ${model.uid}`);
        continue;
      }

      this.strapi.log.info(
        `Setting up geography columns for table: ${tableName}`,
      );

      const locationFields = this.getLocationFields(model);
      this.strapi.log.info(
        `Location fields found: ${locationFields.join(", ")}`,
      );

      for (const locationField of locationFields) {
        await this.addGeographyColumn(db, tableName, locationField);
        await this.updateGeographyColumn(db, tableName, locationField);
      }
    }
  }

  private getTableName(model: any): string | undefined {
    return model.tableName || model.collectionName;
  }

  private getLocationFields(model: any): string[] {
    return this.strapi.services[locationServiceUid].getLocationFields(
      model.attributes,
    );
  }

  private async addGeographyColumn(
    db: any,
    tableName: string,
    locationField: string,
  ): Promise<void> {
    const columnName = `${_.snakeCase(locationField)}_geom`;
    const hasColumn = await db.schema.hasColumn(tableName, columnName);

    if (!hasColumn) {
      const sql = `ALTER TABLE ${tableName} ADD COLUMN ${columnName} GEOGRAPHY(Point, 4326);`;
      this.strapi.log.info(`Adding geography column with SQL: ${sql}`);
      await db.schema.raw(sql);
    }
  }

  private async updateGeographyColumn(
    db: any,
    tableName: string,
    locationField: string,
  ): Promise<void> {
    const columnName = `${_.snakeCase(locationField)}_geom`;
    const jsonColumnName = _.snakeCase(locationField);

    await db.raw(`
      UPDATE ${tableName}
      SET ${columnName} = ST_SetSRID(ST_MakePoint(
        (${jsonColumnName}->>'longitude')::float,
        (${jsonColumnName}->>'latitude')::float
      ), 4326)
      WHERE ${jsonColumnName} IS NOT NULL
        AND ${jsonColumnName}->>'longitude' IS NOT NULL
        AND ${jsonColumnName}->>'latitude' IS NOT NULL
        AND ${columnName} IS NULL;
    `);
  }

  private setupSubscriber(models: any[]): void {
    const subscriber = createSubscriber(this.strapi, models);
    strapi.documents.use(subscriber);
  }

  private setupMiddleware(): void {
    this.strapi.server.use(createFilterMiddleware(this.strapi));
  }
}

export default async ({ strapi }: { strapi: Core.Strapi }) => {
  const bootstrap = new LocationPluginBootstrap(strapi);
  await bootstrap.initialize();
};
