const { exec } = require('child_process');
const path = require('path');

function runFontMatcher(query) {
  const executablePath = path.join(__dirname, 'dist', 'font_matcher');
  exec(`"${executablePath}" "${query}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing font matcher: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Font matcher error: ${stderr}`);
      return;
    }

    try {
      const candidates = JSON.parse(stdout);
      console.log(`Font candidates for "${query}":`, candidates);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
}

// Example usage
runFontMatcher('brush-script');
