ck.pathEntries = [
    {name: 'oygo', path: ['oy','go','rw','br'], r:'gy', l:'bw'},
    {name: 'gooy', path: ['go','oy','br','rw'], r:'bw', l:'gy'},
    {name: 'oygy', path: ['oy','gy','rw','bw'], r:'br', l:'go'},
    {name: 'gyoy', path: ['gy','oy','bw','rw'], r:'go', l:'br'},
    {name: 'gygo', path: ['gy','go','bw','br'], r:'rw', l:'oy'},
    {name: 'gogy', path: ['go','gy','br','bw'], r:'oy', l:'rw'}
];
function refinePaths() {
    for (let entry of ck.pathEntries) {
        if (!entry.stringPath) {
            let path = JSON.parse(JSON.stringify(entry.path));
            path.push(path[0]);
            entry.stringPath = path.join('');
            console.log(entry);
        }
    }
}
function findPath(xx, yy) {
    refinePaths();
    let result = ck.pathEntries.find(e => e.stringPath.match(xx+yy));
    return result.path.join(',');
}
function sanityPath() {
    for (let entry of ck.pathEntries) {
        for (let xx of entry.path) {
            console.log(`${xx} to (right) ${entry.r} is ${findPath(xx, entry.r)}`);
            console.log(`${xx} to (left) ${entry.l} is ${findPath(xx, entry.l)}`);
        }
    }
}








