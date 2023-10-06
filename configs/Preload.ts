/**
 * Add prefix to console log
 */
const prefix = '\x1b[96m[' + new Date().toLocaleString() + ']\x1b[0m -';
console.log = console.log.bind( console, prefix );
