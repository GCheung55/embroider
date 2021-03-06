import type { loader } from 'webpack';
import { getOptions } from 'loader-utils';
import { applyVariantToTemplateCompiler, Variant } from '@embroider/core';

export interface HbsLoaderConfig {
  templateCompilerFile: string;
  variant: Variant;
}

export default function hbsLoader(this: loader.LoaderContext, templateContent: string) {
  let { templateCompilerFile, variant } = getOptions(this);

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  let templateCompiler = applyVariantToTemplateCompiler(variant, require(templateCompilerFile)).compile;

  try {
    return templateCompiler(this.resourcePath, templateContent);
  } catch (error) {
    error.type = 'Template Compiler Error';
    error.file = this.resourcePath;
    this.emitError(error);
    return '';
  }
}
