import { useEffect, useState } from "react";

export default function FacebookEmbed() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Inject CSS to force width constraint on the widget's internals
    const styleId = "sk-override-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        .sk-ww-facebook-page-posts,
        .sk-ww-facebook-page-posts * ,
        [class*="sociablekit"],
        [class*="sk-"] iframe,
        [class*="sk-"] > div {
          max-width: 100% !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Mark as mounted so the div is in the DOM before script runs
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Remove any existing script
    const existing = document.getElementById("sk-facebook-script");
    if (existing) existing.remove();

    // Wait a tick for React to flush the div to the real DOM
    const timer = setTimeout(() => {
      const script = document.createElement("script");
      script.id = "sk-facebook-script";
      script.src =
        "https://widgets.sociablekit.com/facebook-page-posts/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }, 50);

    return () => clearTimeout(timer);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div style={{ width: "100%", maxWidth: "100%", overflowX: "hidden" }}>
      <div
        className="sk-ww-facebook-page-posts"
        data-embed-id="25667963"
      />
    </div>
  );
}