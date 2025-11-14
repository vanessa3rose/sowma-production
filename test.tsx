import React, { useState } from "react";

export default function Test() {
  const [isPressed, setIsPressed] = useState("first");

  return (
    <div>
      <button
        className={`${isPressed === "first" ? "bg-blue-50" : "bg-white"}`}
        onClick={() => setIsPressed("first")}
      >
        first
      </button>

      <button
        className={`${isPressed === "second" ? "bg-blue-50" : "bg-white"}`}
        onClick={() => setIsPressed("second")}
      >
        second
      </button>
    </div>
  );
}
