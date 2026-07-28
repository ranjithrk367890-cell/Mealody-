const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'frontend');
const srcDir = path.join(baseDir, 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
}

let files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace the specific string from LandingPage
    content = content.replace(/Powered by Gemini 1\.5 &amp; Supabase/g, 'Powered by Spark AI');
    // Replace the other one in AIRecommender just in case
    content = content.replace(/Empowered by Gemini AI/g, 'Powered by Spark AI');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed powered by text in', file);
    }
});
