declare namespace panel {
  export function plugin(name: string, plugin: any): void;
  export namespace app {
    export namespace $helper {
      export const object: any;
    }
  }
}

declare interface ImportMeta {
  glob: (pattern: string, options: { eager?: boolean, as?: string}) => any;
}
