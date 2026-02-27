import { useEffect } from "react";

declare global {
  interface Window {
    instgrm?: any;
  }
}

export default function InstagramEmbed() {
  useEffect(() => {
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      window.instgrm.Embeds.process();
    }
  }, []);

  return (
    <div className="w-full flex justify-center">
      <blockquote
        className="instagram-media w-full"
        data-instgrm-permalink="https://www.instagram.com/schoolonwheelsma/"
        data-instgrm-version="14"
      />
    </div>
  );
}
