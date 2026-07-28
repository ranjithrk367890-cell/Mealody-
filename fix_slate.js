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

    // Replace text-slate-* with text-text-muted or main
    content = content.replace(/text-slate-300/g, 'text-text-muted');
    content = content.replace(/text-slate-200/g, 'text-text-main');
    content = content.replace(/text-slate-100/g, 'text-text-main');
    
    // Replace text-cyan-200 with text-cyan since cyan-200 is too light for light mode
    content = content.replace(/text-cyan-200/g, 'text-cyan');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed', file);
    }
});
