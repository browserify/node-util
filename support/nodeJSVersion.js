
module.exports = function nodeJSVersion(arg) {

    if (!process || !process.version || !process.version.match(/^v(\d+)\.(\d+)/)) {
        return false;
    }
    return parseInt(process.version.split('.')[0].slice(1), 10); 
}
