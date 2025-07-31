#!/usr/bin/env node

// Test the specific ExpenseForm.rux parsing issue

const testContent = `module ExpenseForm {
    imports {
      allow "../services/receipt-service" as {processReceiptFile}
    }
    
    constraints {
      deny imports ["../services/*", "../data/*"]   @ "Use store for data operations"
    }
  }`;
  
  // Simple parser to extract the key parts
  function parseTestRux(content) {
    const rules = {
      allowedImports: [],
      deniedImports: []
    };
    
    // Extract imports section
    const importSection = content.match(/imports\s*{([^}]+)}/s);
    if (importSection) {
      const importContent = importSection[1];
      console.log('Import section content:', importContent);
      
      // Parse allow statements
      const allowMatches = importContent.matchAll(/allow\s+"([^"]+)"/g);
      for (const match of allowMatches) {
        rules.allowedImports.push(match[1]);
        console.log('Found allowed import:', match[1]);
      }
    }
    
    // Extract constraints section
    const constraintSection = content.match(/constraints\s*{([^}]+)}/s);
    if (constraintSection) {
      const constraintContent = constraintSection[1];
      console.log('\nConstraint section content:', constraintContent);
      
      // Parse deny imports
      const denyMatch = constraintContent.match(/deny\s+imports\s+(\[[^\]]+\])/);
      if (denyMatch) {
        console.log('Deny match found:', denyMatch[0]);
        console.log('Array portion:', denyMatch[1]);
        
        // Try to parse as JSON
        try {
          const patterns = JSON.parse(denyMatch[1]);
          rules.deniedImports.push(...patterns);
          console.log('Parsed patterns:', patterns);
        } catch (e) {
          console.log('JSON parse failed:', e.message);
          // Fallback to regex
          const patterns = denyMatch[1].matchAll(/"([^"]+)"/g);
          for (const pattern of patterns) {
            rules.deniedImports.push(pattern[1]);
            console.log('Regex extracted pattern:', pattern[1]);
          }
        }
      }
    }
    
    return rules;
  }
  
  // Test pattern matching
  function testPatternMatch(path, pattern) {
    // Normalize paths
    const normalizedPath = path.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\\/g, '/');
    
    console.log(`\nTesting: "${normalizedPath}" against "${normalizedPattern}"`);
    
    if (normalizedPattern.includes('*')) {
      // Split by * and escape each part
      const parts = normalizedPattern.split('*');
      console.log('Pattern parts:', parts);
      
      const escapedParts = parts.map(part => 
        part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      );
      console.log('Escaped parts:', escapedParts);
      
      const regexPattern = escapedParts.join('.*');
      const regex = new RegExp('^' + regexPattern + '$');
      
      console.log('Regex:', regex);
      console.log('Test result:', regex.test(normalizedPath));
      
      return regex.test(normalizedPath);
    }
    
    return normalizedPath === normalizedPattern;
  }
  
  // Run the test
  console.log('=== Testing ExpenseForm.rux Parsing ===\n');
  
  const rules = parseTestRux(testContent);
  
  console.log('\n=== Parsed Rules ===');
  console.log('Allowed imports:', rules.allowedImports);
  console.log('Denied imports:', rules.deniedImports);
  
  console.log('\n=== Testing Pattern Matching ===');
  
  // Test if allowed import matches denied pattern
  for (const allowed of rules.allowedImports) {
    for (const denied of rules.deniedImports) {
      const matches = testPatternMatch(allowed, denied);
      if (matches) {
        console.log(`\n❌ CONFLICT FOUND!`);
        console.log(`   Allowed: "${allowed}"`);
        console.log(`   Denied: "${denied}"`);
        console.log(`   This should trigger a validation error!`);
      }
    }
  }
  
  console.log('\n=== Additional Pattern Tests ===');
  const tests = [
    { path: '../services/receipt-service', pattern: '../services/*' },
    { path: '../services/auth-service', pattern: '../services/*' },
    { path: '../stores/expense-store', pattern: '../services/*' },
    { path: '../data/users', pattern: '../data/*' },
  ];
  
  for (const test of tests) {
    const result = testPatternMatch(test.path, test.pattern);
    console.log(`${result ? '✓' : '✗'} Match`);
  }