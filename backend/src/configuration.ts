import {
  CommonJSFileDetector,
  Configuration,
  IMidwayContainer,
  ILifeCycle,
} from "@midwayjs/core";
import * as koa from "@midwayjs/koa";
import * as typeorm from "@midwayjs/typeorm";
import { join } from "node:path";
import { SeedService } from "./seed/seed.service";

@Configuration({
  imports: [koa, typeorm],
  importConfigs: [join(__dirname, "./config")],
  detector: new CommonJSFileDetector(),
})
export class MainConfiguration implements ILifeCycle {
  async onReady(container: IMidwayContainer): Promise<void> {
    const seedService = await container.getAsync(SeedService);
    await seedService.initialize();
  }
}
