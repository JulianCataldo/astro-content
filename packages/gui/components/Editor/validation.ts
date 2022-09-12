import type { Monaco as MonacoType } from '@monaco-editor/react';
import type { editor as nsEd, languages } from 'monaco-editor';
/* ·········································································· */
import type { PropertyReport } from '@astro-content/types/reports';
/* —————————————————————————————————————————————————————————————————————————— */

export function validate(
  propertyReport: PropertyReport,
  model: nsEd.ITextModel,
  monaco: MonacoType,
) {
  const errorMessages: languages.ProviderResult<nsEd.IMarkerData[]> = [];

  let positions = {
    startLineNumber: 0,
    startColumn: 0,
    endLineNumber: 0,
    endColumn: 0,
  };

  if (
    propertyReport.schema?.length ||
    propertyReport.lint?.length ||
    propertyReport.prose?.length
  ) {
    [
      ...(propertyReport.schema ?? []),
      ...(propertyReport.lint ?? []),
      ...(propertyReport.prose ?? []),
    ].forEach((err) => {
      if (err.position) {
        positions = {
          startLineNumber: err.position.start.line,
          startColumn: err.position.start.column,
          endLineNumber: err.position.end.line || err.position.start.line,
          endColumn: err.position.end.column || err.position.start.column,
        };
      }
      let severity = 8;
      if ('ruleId' in err) {
        if (err.ruleId !== 'frontmatter-schema') {
          severity = 4;
        }
        if (err.ruleId?.startsWith('retext-')) {
          severity = 2;
        }
      }
      errorMessages.push({
        message: err.message ?? '',
        severity,
        code: 'ruleId' in err ? String(err.ruleId) : undefined,
        source: 'source' in err ? String(err.source) : 'Root',
        ...positions,
      });
    });
  }

  monaco.editor.setModelMarkers(model, 'owner', errorMessages);
}
