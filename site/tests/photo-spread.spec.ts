import path from 'node:path';
import { expect, test } from '@playwright/test';
import { auditPhotos } from '../scripts/photo-audit.mjs';

test('built pages spread each photo once and keep runway frames on runway', ({}, info) => {
  test.skip(info.project.name !== 'desktop', 'the built HTML is the same for every project');
  const result = auditPhotos(path.resolve('dist'), path.resolve('src/assets/photos'));
  expect(result.violations, result.violations.join('\n')).toEqual([]);
});
