import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Replace style={styles.xxx} with className="xxx" style={styles.xxx}
  // Only if className="xxx" doesn't already exist right before it (to avoid duplicates)
  
  content = content.replace(/(?<!className="[^"]*"\s*)style=\{styles\.([a-zA-Z0-9_]+)\}/g, 'className="$1" style={styles.$1}');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const files = [
  '../src/pages/Home.jsx',
  '../src/pages/Verify.jsx',
  '../src/pages/History.jsx',
  '../src/components/UploadBox.jsx',
  '../src/components/VerificationCard.jsx',
  '../src/components/CameraScanner.jsx',
  '../src/components/ResultBadge.jsx',
  '../src/App.jsx'
].map(f => path.join(process.cwd(), f));

files.forEach(f => {
  if (fs.existsSync(f)) {
    processFile(f);
  }
});
