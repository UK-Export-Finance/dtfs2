import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Recalculates Subresource Integrity (SRI) hashes for locally built UI assets.
 *
 * Workflow:
 * 1. Each UI build writes browser assets to `<ui>/public`.
 * 2. This script scans Nunjucks templates for script or link tags containing an
 *    `integrity="sha512-..."` attribute.
 * 3. The tag's `/assets/...` or `/gef/assets/...` URL is mapped to the matching
 *    file below that UI's `public` directory.
 * 4. A SHA-512 hash is calculated from the exact built file bytes and written
 *    back to the template only when it differs from the existing value.
 * 5. Component tests contain the same integrity strings as assertions. After a
 *    template hash changes, matching old values in that UI's component tests
 *    are replaced with the new value.
 *
 * The script is intentionally synchronous. It runs after the UI builds, deals
 * with a small number of files, and must complete each read/write operation in
 * a predictable order. It is also idempotent: running it twice without another
 * build produces no changes on the second run.
 *
 * Run from the repository root with `npm run integrity:update`, or build all UI
 * assets and update their hashes together with `npm run build:ui`.
 */

const repositoryRoot = process.cwd();
const uiDirectories = ['gef-ui', 'portal-ui', 'trade-finance-manager-ui'];
const integrityPattern = /integrity=(['"])(sha512-[A-Za-z0-9+/=]+)\1/;
const assetAttributePattern = /(?:src|href)=(['"])(\/[^'"]+)\1/;
const tagPattern = /<(?:script|link)\b[\s\S]*?>/g;

/**
 * Recursively finds files whose extension is in the supplied set.
 *
 * @param {string} directory - Absolute directory to search.
 * @param {Set<string>} extensions - Extensions to include, including the dot.
 * @returns {string[]} Absolute paths for matching files.
 */
const findFiles = (directory, extensions) => {
  const files = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...findFiles(entryPath, extensions));
    } else if (extensions.has(path.extname(entry.name))) {
      files.push(entryPath);
    }
  }

  return files;
};

/**
 * Writes transformed content only when it differs from the existing file.
 * Avoiding unnecessary writes keeps repeated runs idempotent and prevents
 * unrelated timestamp or formatter churn.
 *
 * @param {string} filePath - Absolute path to read and potentially update.
 * @param {(content: string) => string} transform - Content transformation.
 * @returns {boolean} Whether the file was changed.
 */
const updateFile = (filePath, transform) => {
  const originalContent = fs.readFileSync(filePath, 'utf8');
  const updatedContent = transform(originalContent);

  if (updatedContent === originalContent) {
    return false;
  }

  fs.writeFileSync(filePath, updatedContent);
  return true;
};

/**
 * Calculates an SRI-compatible SHA-512 digest from the built file bytes.
 *
 * @param {string} assetPath - Absolute path to a generated browser asset.
 * @returns {string} Integrity value in the `sha512-<base64 digest>` format.
 */
const calculateIntegrity = (assetPath) => `sha512-${crypto.createHash('sha512').update(fs.readFileSync(assetPath)).digest('base64')}`;

/**
 * Maps a public URL used by a template to its generated file on disk.
 * GEF's shared `/assets/...` files are built and served by portal-ui; its
 * `/gef/assets/...` files belong to the GEF build itself. Other UIs map their
 * `/assets/...` files to their own `public` directory.
 * Query strings and fragments are excluded because they are not part of the
 * filesystem path or the bytes protected by SRI.
 *
 * @param {string} uiDirectory - UI workspace containing the asset.
 * @param {string} assetUrl - Local URL from a template's src or href attribute.
 * @returns {string | null} Absolute generated asset path, or null if unsupported.
 */
const getPublicAssetPath = (uiDirectory, assetUrl) => {
  const assetPathMatch = assetUrl.match(/^\/(gef\/)?assets\/(.+?)(?:[?#].*)?$/);

  if (!assetPathMatch) {
    return null;
  }

  const assetOwner = uiDirectory === 'gef-ui' && !assetPathMatch[1] ? 'portal-ui' : uiDirectory;
  return path.join(repositoryRoot, assetOwner, 'public', assetPathMatch[2]);
};

/**
 * Recalculates the integrity value for one script or link tag.
 *
 * Missing built files are reported and skipped. This currently exposes legacy
 * GEF template references that its Webpack configuration does not generate,
 * while still allowing valid generated assets to be updated. Unsupported URLs,
 * malformed protected tags, and one old hash mapping to different new hashes
 * are treated as errors because continuing could write an incorrect assertion.
 *
 * @param {object} params - Tag update context.
 * @param {string} params.tag - Complete script or link tag.
 * @param {string} params.templatePath - Template containing the tag.
 * @param {string} params.uiDirectory - Owning UI workspace.
 * @param {Map<string, string>} params.replacements - Old-to-new hash mapping.
 * @param {{ checked: number, skipped: number }} params.counts - Run counters.
 * @returns {string} Original tag or tag containing the current integrity value.
 */
const updateTagIntegrity = ({ tag, templatePath, uiDirectory, replacements, counts }) => {
  const integrityMatch = tag.match(integrityPattern);

  if (!integrityMatch) {
    return tag;
  }

  const assetAttributeMatch = tag.match(assetAttributePattern);

  if (!assetAttributeMatch) {
    throw new Error(`Could not find a local src or href for an integrity attribute in ${templatePath}`);
  }

  const assetUrl = assetAttributeMatch[2];
  const publicAssetPath = getPublicAssetPath(uiDirectory, assetUrl);

  if (!publicAssetPath) {
    throw new Error(`Unsupported integrity asset URL '${assetUrl}' in ${templatePath}`);
  }

  if (!fs.existsSync(publicAssetPath)) {
    console.warn("%s: skipping '%s' because the built asset does not exist", uiDirectory, assetUrl);
    counts.skipped += 1;
    return tag;
  }

  const oldIntegrity = integrityMatch[2];
  const newIntegrity = calculateIntegrity(publicAssetPath);
  const existingReplacement = replacements.get(oldIntegrity);

  if (existingReplacement && existingReplacement !== newIntegrity) {
    throw new Error(`Integrity '${oldIntegrity}' maps to multiple generated assets in ${uiDirectory}`);
  }

  replacements.set(oldIntegrity, newIntegrity);
  counts.checked += 1;

  return tag.replace(oldIntegrity, newIntegrity);
};

/**
 * Updates every integrity-protected local asset referenced by one UI's Nunjucks
 * templates and records hash replacements for its component tests.
 *
 * @param {string} uiDirectory - UI workspace to process.
 * @returns {{ replacements: Map<string, string>, updated: number, checked: number, skipped: number }} Run results.
 */
const updateTemplateIntegrities = (uiDirectory) => {
  const templatesDirectory = path.join(repositoryRoot, uiDirectory, 'templates');
  const replacements = new Map();
  const counts = { checked: 0, skipped: 0 };
  let updated = 0;

  for (const templatePath of findFiles(templatesDirectory, new Set(['.njk']))) {
    const changed = updateFile(templatePath, (content) =>
      content.replace(tagPattern, (tag) => updateTagIntegrity({ tag, templatePath, uiDirectory, replacements, counts })),
    );
    updated += Number(changed);
  }

  return { replacements, updated, ...counts };
};

/**
 * Synchronizes literal integrity assertions after template hashes change.
 * Replacements are scoped to the owning UI's component tests. The collision
 * guard in `updateTagIntegrity` guarantees that each old value has one meaning.
 *
 * @param {string} uiDirectory - UI workspace whose tests should be updated.
 * @param {Map<string, string>} replacements - Old-to-new integrity values.
 * @returns {number} Number of component test files changed.
 */
const updateIntegrityAssertions = (uiDirectory, replacements) => {
  const componentTestsDirectory = path.join(repositoryRoot, uiDirectory, 'component-tests');
  let updated = 0;

  for (const testPath of findFiles(componentTestsDirectory, new Set(['.js', '.ts']))) {
    const changed = updateFile(testPath, (content) =>
      [...replacements].reduce((updatedContent, [oldIntegrity, newIntegrity]) => {
        return updatedContent.split(oldIntegrity).join(newIntegrity);
      }, content),
    );
    updated += Number(changed);
  }

  return updated;
};

for (const uiDirectory of uiDirectories) {
  const { replacements, updated: updatedTemplateCount, checked: assetCount, skipped: skippedAssetCount } = updateTemplateIntegrities(uiDirectory);
  const updatedTestCount = updateIntegrityAssertions(uiDirectory, replacements);

  console.info(
    '%s: checked %d assets, skipped %d missing assets, updated %d templates and %d component test files',
    uiDirectory,
    assetCount,
    skippedAssetCount,
    updatedTemplateCount,
    updatedTestCount,
  );
}
