const prefix = '\x1b[96m[' + new Date().toLocaleString() + ']\x1b[0m -';
console.log = console.log.bind( console, prefix );

/**
 * A welcome log. It will display whenever the project is compiled successfully
 */
export function hiConsole(port: string | number) {
  console.log("\x1b[92mCompiled successfully!\x1b[0m");
  console.log(`

Now you can view the project in your browser:

  Local       :   \x1b[96mhttp://localhost:${port}\x1b[0m
  IP Address  :   \x1b[96mhttp://127.0.0.1:${port}\x1b[0m

🚀🚀🚀 Have fun ~

  `);
}
