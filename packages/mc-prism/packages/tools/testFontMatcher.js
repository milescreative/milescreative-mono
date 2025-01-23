const { exec } = require('child_process');

function testFontMatcher(query) {
  exec(`python font_matcher.py "${query}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing Python script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Python script error: ${stderr}`);
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
testFontMatcher('brush-script');
