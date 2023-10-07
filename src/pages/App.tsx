import RootLayout from "@/layout";
import React, { useState } from "react";

export default function App() {
  let [count, setCount] = useState(0);
  return (
    <>
      <React.StrictMode>
        <RootLayout>
          <h1>~~ Hi ~~</h1>
          <hr />
          <h2>Check if React works at client:</h2>
          <p>{count}</p>
          <p><button onClick={() => setCount(count + 1)}>Add</button></p>
          <p><button onClick={() => setCount(count - 1)}>Substract</button></p>
        </RootLayout>
      </React.StrictMode>
    </>
  );
}
