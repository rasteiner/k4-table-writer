declare namespace panel {
  export function plugin(name: string, plugin: any): void;
  export namespace app {
    export namespace $helper {
      export const object: any;
    }
  }
}
