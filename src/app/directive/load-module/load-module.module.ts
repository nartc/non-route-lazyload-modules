import { NgModule } from "@angular/core";
import { LoadModuleDirective } from "./load-module.directive";

@NgModule({
  declarations: [LoadModuleDirective],
  exports: [LoadModuleDirective]
})
export class LoadModuleModule {}
