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
files.push(path.join(baseDir, 'index.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/MoodMitra/g, 'Spark AI');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
