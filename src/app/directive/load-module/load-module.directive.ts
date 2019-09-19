import {
  Compiler,
  Directive,
  Inject,
  Injector,
  Input,
  isDevMode,
  NgModuleRef,
  OnInit,
  Type,
  ViewContainerRef
} from "@angular/core";
import { LAZY_MODULES_MAP, LazyNonRoutableModules } from "./load-module-map";
import { LoadModuleService } from "./load-module.service";

type ModuleWithRoot = Type<any> & { rootComponent: Type<any> };

@Directive({
  selector: "[loadModule]"
})
export class LoadModuleDirective implements OnInit {
  @Input("loadModule") moduleName: keyof LazyNonRoutableModules;

  constructor(
    private _vcr: ViewContainerRef,
    private _injector: Injector,
    private _compiler: Compiler,
    private _loadModuleService: LoadModuleService,
    @Inject(LAZY_MODULES_MAP) private modulesMap: LazyNonRoutableModules
  ) {}

  ngOnInit(): void {
    let moduleRef: NgModuleRef<any> = this._loadModuleService.moduleRefs[
      this.moduleName
    ];
    (this.modulesMap[this.moduleName]() as Promise<any>).then(async module => {
      if (!moduleRef) {
        moduleRef = isDevMode()
          ? (await this._compiler.compileModuleAndAllComponentsAsync(module)).ngModuleFactory.create(
              this._injector
            )
          : module.create(this._injector);
        this._loadModuleService.updateModuleRefs(prev => ({
          ...prev,
          [this.moduleName]: moduleRef
        }));
      }

      const rootComponent = (module as ModuleWithRoot).rootComponent;
        const factory = moduleRef.componentFactoryResolver.resolveComponentFactory(
          rootComponent
        );
        this._vcr.createComponent(factory);
    });
  }
}
