const fs = require('fs');
const path = require('path');

const diagrams = [
  { name: 'system_architecture', file: 'diagrams/system_architecture.mmd' },
  { name: 'er_diagram', file: 'diagrams/er_diagram.mmd' },
  { name: 'component_hierarchy', file: 'diagrams/component_hierarchy.mmd' },
  { name: 'sequence_diagram', file: 'diagrams/sequence_diagram.mmd' }
];

console.log('Mermaid diagram files are ready in the diagrams/ directory.');
console.log('To convert them manually:');
console.log('1. Visit https://mermaid.live/');
console.log('2. Copy the content of each .mmd file');
console.log('3. Paste into Mermaid Live Editor');
console.log('4. Export as PNG/SVG');
console.log('5. Insert into your DOCX document');
