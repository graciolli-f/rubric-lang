#!/usr/bin/env node
/**
 * Rubric .rux File Validator
 * Validates .rux files for internal consistency and architectural conflicts
 * Prevents AI from circumventing constraints through specific allows
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  reset: '\x1b[0m'
};

class RuxValidator {
  constructor() {
    this.conflicts = [];
    this.processedFiles = 0;
    this.layerHierarchy = {
      'types': 0,
      'utils': 1,
      'services': 2,
      'stores': 3,
      'hooks': 4,
      'components': 5
    };
  }

  /**
   * Main entry point - validates all .rux files in the project
   */
  async validate() {
    console.log(`${colors.blue}🔍 Rubric .rux Validator (Strict Mode)${colors.reset}`);
    console.log(`${colors.gray}Checking for architectural conflicts and constraint violations${colors.reset}`);
    console.log('=' .repeat(60));

    const ruxFiles = this.findRuxFiles(process.cwd());
    console.log(`Found ${colors.yellow}${ruxFiles.length}${colors.reset} .rux files to validate\n`);

    // Process each .rux file
    for (const ruxFile of ruxFiles) {
      this.validateRuxFile(ruxFile);
    }

    // Report results
    this.reportResults();
  }

  /**
   * Find all .rux files recursively
   */
  findRuxFiles(dir, files = []) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        this.findRuxFiles(fullPath, files);
      } else if (item.endsWith('.rux')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Validate a single .rux file
   */
  validateRuxFile(ruxPath) {
    this.processedFiles++;
    const relativePath = path.relative(process.cwd(), ruxPath);
    
    try {
      console.log(`Validating: ${colors.gray}${relativePath}${colors.reset}`);
      
      const content = fs.readFileSync(ruxPath, 'utf8');
      const rules = this.parseRuxFile(content, ruxPath);
      
      // Run all validation checks
      this.checkImportConflicts(rules, relativePath);
      this.checkLayerViolations(rules, relativePath);
      this.checkOperationConflicts(rules, relativePath);
      this.checkCircularDependencies(rules, relativePath);
      this.checkServiceBoundaries(rules, relativePath);
      this.checkUtilityConstraints(rules, relativePath);
      
    } catch (error) {
      this.addConflict(relativePath, 'parse-error', error.message, 'error');
    }
  }

  /**
   * Parse .rux file content into structured rules
   */
  parseRuxFile(content, filePath) {
    const rules = {
      moduleName: '',
      moduleType: '',
      location: '',
      allowedImports: [],
      deniedImports: [],
      allowedOperations: [],
      deniedOperations: [],
      deniedExports: [],
      isComponent: false,
      isStore: false,
      isService: false,
      isHook: false,
      isUtil: false,
      filePath: filePath
    };

    // Extract module name
    const moduleMatch = content.match(/module\s+(\w+)\s*{/);
    if (moduleMatch) rules.moduleName = moduleMatch[1];

    // Extract module type
    const typeMatch = content.match(/type:\s*"([^"]+)"/);
    if (typeMatch) rules.moduleType = typeMatch[1];

    // Extract location
    const locationMatch = content.match(/location:\s*"([^"]+)"/);
    if (locationMatch) {
      rules.location = locationMatch[1];
      
      // Determine module category based on location
      if (rules.location.includes('/components/')) rules.isComponent = true;
      if (rules.location.includes('/stores/')) rules.isStore = true;
      if (rules.location.includes('/services/')) rules.isService = true;
      if (rules.location.includes('/hooks/')) rules.isHook = true;
      if (rules.location.includes('/utils/')) rules.isUtil = true;
    }

    // Extract allowed imports with better parsing
    const importSection = content.match(/imports\s*{([^}]+)}/s);
    if (importSection) {
      const importContent = importSection[1];
      
      // Parse allow statements
      const allowMatches = importContent.matchAll(/allow\s+"([^"]+)"(?:\s+as\s+(?:{[^}]+}|\w+))?(?:\s*@\s*override="yes")?/g);
      for (const match of allowMatches) {
        const importPath = match[1];
        const hasOverride = match[0].includes('override="yes"');
        rules.allowedImports.push({
          path: importPath,
          hasOverride: hasOverride
        });
      }
    }

    // Extract constraints
    const constraintSection = content.match(/constraints\s*{([^}]+)}/s);
    if (constraintSection) {
      const constraintContent = constraintSection[1];
      
      // Parse deny import statements
      const denyImportMatches = constraintContent.matchAll(/deny\s+imports\s+\["([^"]+)"\]/g);
      for (const match of denyImportMatches) {
        rules.deniedImports.push(match[1]);
      }
      
      // Parse allow/deny operations
      const allowOpMatches = constraintContent.matchAll(/allow\s+([\w.*]+)(?:\s+@|$)/g);
      for (const match of allowOpMatches) {
        rules.allowedOperations.push(match[1]);
      }
      
      const denyOpMatches = constraintContent.matchAll(/deny\s+([\w.*]+)(?:\s+@|$)/g);
      for (const match of denyOpMatches) {
        if (!match[1].includes('imports') && !match[1].includes('exports') && !match[1].includes('file.')) {
          rules.deniedOperations.push(match[1]);
        }
      }
      
      // Parse deny export statements
      const denyExportMatches = constraintContent.matchAll(/deny\s+exports\s+\["([^"]+)"\]/g);
      for (const match of denyExportMatches) {
        rules.deniedExports.push(match[1]);
      }
    }

    return rules;
  }

  /**
   * Check for conflicts between allowed imports and denied patterns
   */
  checkImportConflicts(rules, filePath) {
    for (const allowedImport of rules.allowedImports) {
      const importPath = typeof allowedImport === 'string' ? allowedImport : allowedImport.path;
      const hasOverride = typeof allowedImport === 'object' ? allowedImport.hasOverride : false;
      
      for (const deniedPattern of rules.deniedImports) {
        if (this.matchesPattern(importPath, deniedPattern)) {
          // In strict mode, even overrides are not allowed
          this.addConflict(
            filePath,
            'import-deny-conflict',
            `Import '${importPath}' is explicitly allowed but matches denied pattern '${deniedPattern}'. ` +
            `This circumvents architectural constraints and is not permitted.${hasOverride ? ' (Override flag ignored in strict mode)' : ''}`,
            'error'
          );
        }
      }
    }
  }

  /**
   * Check for layer boundary violations
   */
  checkLayerViolations(rules, filePath) {
    if (!rules.location) return;
    
    const moduleLayer = this.getModuleLayer(rules.location);
    if (!moduleLayer) return;
    
    const moduleLayerLevel = this.layerHierarchy[moduleLayer];
    
    for (const allowedImport of rules.allowedImports) {
      const importPath = typeof allowedImport === 'string' ? allowedImport : allowedImport.path;
      
      // Skip external imports
      if (!importPath.startsWith('.')) continue;
      
      const importLayer = this.getImportLayer(importPath);
      if (!importLayer) continue;
      
      const importLayerLevel = this.layerHierarchy[importLayer];
      
      // Check if importing from a higher layer
      if (importLayerLevel > moduleLayerLevel) {
        this.addConflict(
          filePath,
          'layer-violation',
          `Module in '${moduleLayer}' layer cannot import from '${importLayer}' layer. ` +
          `Data must flow from high-level (components) to low-level (types), not the reverse.`,
          'error'
        );
      }
    }
  }

  /**
   * Check for operation conflicts (e.g., allowing specific IO when IO is denied)
   */
  checkOperationConflicts(rules, filePath) {
    // Check if any allowed operations conflict with denied operations
    for (const allowed of rules.allowedOperations) {
      for (const denied of rules.deniedOperations) {
        // Check if the allowed operation is a subset of denied
        if (denied.includes('*')) {
          const deniedBase = denied.replace('.*', '');
          if (allowed.startsWith(deniedBase)) {
            this.addConflict(
              filePath,
              'operation-conflict',
              `Operation '${allowed}' is allowed but falls under denied pattern '${denied}'.`,
              'error'
            );
          }
        }
      }
    }
  }

  /**
   * Check service boundary violations
   */
  checkServiceBoundaries(rules, filePath) {
    // Components should never import services directly
    if (rules.isComponent) {
      const serviceImports = rules.allowedImports.filter(imp => {
        const importPath = typeof imp === 'string' ? imp : imp.path;
        return importPath.includes('/services/') || importPath.includes('\\services\\');
      });
      
      if (serviceImports.length > 0) {
        const importPaths = serviceImports.map(imp => typeof imp === 'string' ? imp : imp.path);
        this.addConflict(
          filePath,
          'service-boundary-violation',
          `Component directly imports services: [${importPaths.join(', ')}]. ` +
          `Components must use stores or hooks to access service functionality.`,
          'error'
        );
      }
    }
    
    // Stores can import services but shouldn't import components
    if (rules.isStore) {
      const componentImports = rules.allowedImports.filter(imp => {
        const importPath = typeof imp === 'string' ? imp : imp.path;
        return importPath.includes('/components/');
      });
      
      if (componentImports.length > 0) {
        this.addConflict(
          filePath,
          'store-component-import',
          `Store imports components. Stores should not depend on UI components.`,
          'error'
        );
      }
    }
  }

  /**
   * Check utility module constraints
   */
  checkUtilityConstraints(rules, filePath) {
    if (rules.isUtil) {
      // Utils should only import from types or other utils
      const invalidImports = rules.allowedImports.filter(imp => {
        const importPath = typeof imp === 'string' ? imp : imp.path;
        return !importPath.includes('/types/') && 
               !importPath.includes('/utils/') &&
               importPath.startsWith('.'); // Only check internal imports
      });
      
      if (invalidImports.length > 0) {
        const importPaths = invalidImports.map(imp => typeof imp === 'string' ? imp : imp.path);
        this.addConflict(
          filePath,
          'util-purity-violation',
          `Utility module imports from non-type/util modules: [${importPaths.join(', ')}]. ` +
          `Utilities must remain pure and only depend on types or other utilities.`,
          'error'
        );
      }
    }
  }

  /**
   * Check for circular dependencies (simplified check)
   */
  checkCircularDependencies(rules, filePath) {
    // This is a simplified check - for a full implementation,
    // we'd need to build a complete dependency graph
    
    // Check if a store imports from a component that might import the store
    if (rules.isStore && rules.moduleName) {
      const storeImportsComponent = rules.allowedImports.some(imp => {
        const importPath = typeof imp === 'string' ? imp : imp.path;
        return importPath.includes('/components/');
      });
      
      if (storeImportsComponent) {
        this.addConflict(
          filePath,
          'potential-circular-dependency',
          `Store '${rules.moduleName}' imports from components layer, which typically imports stores. ` +
          `This creates a circular dependency risk.`,
          'error'
        );
      }
    }
  }

  /**
   * Helper: Determine which layer a module belongs to
   */
  getModuleLayer(location) {
    for (const layer of Object.keys(this.layerHierarchy)) {
      if (location.includes(`/${layer}/`)) {
        return layer;
      }
    }
    return null;
  }

  /**
   * Helper: Determine which layer an import path refers to
   */
  getImportLayer(importPath) {
    for (const layer of Object.keys(this.layerHierarchy)) {
      if (importPath.includes(`/${layer}/`)) {
        return layer;
      }
    }
    return null;
  }

  /**
   * Helper: Check if a path matches a pattern (with wildcard support)
   */
  matchesPattern(path, pattern) {
    // Normalize paths for comparison
    const normalizedPath = path.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\\/g, '/');

    // Handle wildcards in patterns
    if (normalizedPattern.includes('*')) {
      const regexPattern = normalizedPattern
        .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
        .replace(/\*/g, '.*');
      return new RegExp(regexPattern).test(normalizedPath);
    }

    // Check if the path contains the pattern
    return normalizedPath.includes(normalizedPattern);
  }

  /**
   * Add a conflict to the list
   */
  addConflict(file, type, message, severity = 'error') {
    this.conflicts.push({
      file,
      type,
      message,
      severity
    });
  }

  /**
   * Report validation results
   */
  reportResults() {
    console.log('\n' + '='.repeat(60));
    
    if (this.conflicts.length === 0) {
      console.log(`${colors.green}✅ All .rux files passed validation!${colors.reset}`);
      console.log(`Validated ${this.processedFiles} files with no conflicts.`);
      console.log(`\n${colors.gray}Architectural constraints are consistent and cannot be circumvented.${colors.reset}`);
      process.exit(0);
    } else {
      const errors = this.conflicts.filter(c => c.severity === 'error');
      const warnings = this.conflicts.filter(c => c.severity === 'warning');
      
      console.log(`${colors.red}❌ Found ${errors.length} errors and ${warnings.length} warnings in .rux files:${colors.reset}\n`);
      
      // Group conflicts by file
      const byFile = {};
      for (const conflict of this.conflicts) {
        if (!byFile[conflict.file]) byFile[conflict.file] = [];
        byFile[conflict.file].push(conflict);
      }
      
      // Display conflicts
      for (const [file, conflicts] of Object.entries(byFile)) {
        console.log(`${colors.yellow}${file}:${colors.reset}`);
        for (const conflict of conflicts) {
          const icon = conflict.severity === 'error' ? '✗' : '⚠';
          const color = conflict.severity === 'error' ? colors.red : colors.yellow;
          console.log(`  ${color}${icon}${colors.reset} [${conflict.type}]`);
          console.log(`    ${conflict.message}\n`);
        }
      }
      
      console.log(`${colors.red}These conflicts must be resolved before code validation.${colors.reset}`);
      console.log(`${colors.gray}The .rux files contain contradictory rules that would allow architectural violations.${colors.reset}\n`);
      
      // Provide guidance
      console.log(`${colors.blue}How to fix:${colors.reset}`);
      console.log(`1. Remove specific 'allow' statements that conflict with 'deny' patterns`);
      console.log(`2. Move business logic from components to stores or hooks`);
      console.log(`3. Ensure each layer only imports from lower layers`);
      console.log(`4. Keep utility modules pure (only import types)\n`);
      
      process.exit(2); // Exit code 2 for .rux conflicts
    }
  }
}

// Run the validator
const validator = new RuxValidator();
validator.validate().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(3);
});