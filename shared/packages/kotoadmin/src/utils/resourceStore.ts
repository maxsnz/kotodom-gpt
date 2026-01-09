import { Resource, ResourceConfig } from "../types/resource";

class ResourceStore {
  public basePath: string;
  // private configs: ResourceConfig[] = [];
  private resources: Map<string, Resource> = new Map();

  constructor(configs: ResourceConfig[], basePath: string) {
    this.basePath = basePath;
    // this.configs = configs;
    this.resources = new Map(
      configs.map((config) => [config.name, new Resource(config, basePath)])
    );
  }

  getResource(name: string): Resource {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource ${name} not found`);
    }
    return resource;
  }

  getResources(): Resource[] {
    return Array.from(this.resources.values());
  }

  getRoutes(): React.ReactNode {
    return Array.from(this.resources.values()).map((resource) =>
      resource.getRouter(this)
    );
  }

  getBasePath(): string {
    return this.basePath;
  }
}

export default ResourceStore;
