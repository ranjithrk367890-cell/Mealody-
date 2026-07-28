const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace text-gray-* with text-text-muted
    content = content.replace(/text-gray-[2345]00/g, 'text-text-muted');
    
    // Replace text-white with text-text-main EXCEPT when it's on a button or gradient that needs to stay white.
    // A simple heuristic: if the line has "bg-gradient", we might want to keep text-white. 
    // We can do this with a replacement function line by line.
    
    let lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (!line.includes('bg-gradient') && !line.includes('from-primary')) {
            line = line.replace(/text-white/g, 'text-text-main');
            // Also replace bg-white/5 with bg-white/5 dark:bg-white/5 etc?
            // Wait, we just want to fix text visibility.
            
            // replace border-white/ with border-text-main/ to make borders visible in light mode
            line = line.replace(/border-white\/(10|20|30)/g, 'border-text-main/$1');
            line = line.replace(/bg-white\/(5|10|20)/g, 'bg-text-main/$1');
        }
        lines[i] = line;
    }
    
    content = lines.join('\n');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
