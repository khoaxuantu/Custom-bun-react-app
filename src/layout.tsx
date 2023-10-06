import App from './App';

export default function RootLayout() {
  return(
    <html lang='en'>
      <head>
        <meta charSet='UTF-8' />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Lmao Tus</title>
        <link rel="stylesheet" href="css/style.css" />
      </head>
      <body>
        <div id="root">
          <App />
        </div>
      </body>
    </html>
  );
}
