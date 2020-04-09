/* Macro Type Signatures */

/*
  CAUTION: this code is not necessarily what you are actually running. In
  general, the macros are implemented at build time using babel, and so calls to
  these functions get compiled away before they ever run. However, this code is
  here because:

  1. It provides types to typescript users of the macros.

  2. Some macros have runtime implementations that are useful in development
     mode, in addition to their build-time implementations in babel. This lets
     us do things like produce a single build in development that works for both
     fastboot and browser, using the macros to switch between modes. For
     production, you would switch to the build-time macro implementation to get
     two optimized builds instead.
*/

export function dependencySatisfies(packageName: string, semverRange: string): boolean {
  // this has no runtime implementation, it's always evaluated at build time
  // because only at build time can we see what set of dependencies are
  // resolvable on disk, and there's really no way to change your set of
  // dependencies on the fly anyway.
  throw new Oops(packageName, semverRange);
}

export function macroCondition(predicate: boolean): boolean {
  return predicate;
}

export function each<T>(array: T[]): T[] {
  if (!Array.isArray(array)) {
    throw new Error(`the argument to the each() macro must be an array`);
  }
  return array;
}

// We would prefer to write:
//   export function importSync<T extends string>(specifier: T): typeof import(T) {
// but TS doesn't seem to support that at present.
export function importSync(specifier: string): unknown {
  throw new Oops(specifier);
}

export function getConfig<T>(packageName: string): T {
  throw new Oops(packageName);
}

export function getOwnConfig<T>(): T {
  throw new Oops();
}

export function failBuild(message: string): void {
  throw new Oops(message);
}

export function moduleExists(packageName: string): boolean {
  throw new Oops(packageName);
}

class Oops extends Error {
  params: any[];
  constructor(...params: any[]) {
    super(
      `this method is really implemented at compile time via a babel plugin. If you're seeing this exception, something went wrong`
    );
    this.params = params;
  }
}

// This is here as a compile target for `getConfig` and `getOwnConfig` when
// we're in runtime mode. This is not public API to call from your own code.
function _runtimeGetConfig<T>(packageRoot: string | undefined): T | undefined {
  if (packageRoot) {
    return runtimeConfig[packageRoot] as T;
  }
}
function _runtimeSetConfig<T>(packageRoot: string | undefined, config: T): void {
  if (packageRoot) {
    runtimeConfig[packageRoot] = config;
  }
}
getOwnConfig._runtimeGet = _runtimeGetConfig;
getOwnConfig._runtimeSet = _runtimeSetConfig;
getConfig._runtimeGet = _runtimeGetConfig;
getConfig._runtimeSet = _runtimeSetConfig;

const runtimeConfig: { [packageRoot: string]: unknown } = initializeRuntimeMacrosConfig();

// this exists to be targeted by our babel plugin in runtime mode.
function initializeRuntimeMacrosConfig() {
  return {};
}

// TODO: beyond this point should only ever be used within the build system. We
// need to guard it so it never ships in apps.

// Entrypoint for managing the macro config within Node.
export { default as MacrosConfig, Merger } from './macros-config';

// Utility for detecting our babel and AST plugins.
import { PluginItem } from '@babel/core';
export function isEmbroiderMacrosPlugin(item: PluginItem) {
  return (
    (Array.isArray(item) &&
      item.length > 1 &&
      item[1] &&
      typeof item[1] === 'object' &&
      (item[1] as any).embroiderMacrosConfigMarker) ||
    (item && typeof item === 'function' && (item as any).embroiderMacrosASTMarker)
  );
}
