import { useEffect } from "react";

declare global {
  interface Window {
    FB?: any;
  }
}

export default function FacebookEmbed() {
  useEffect(() => {
    // Load SDK if not already loaded
    if (!window.FB) {
      const script = document.createElement("script");
      script.src =
        "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v25.0";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      document.body.appendChild(script);

      script.onload = () => {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      };
    } else {
      window.FB.XFBML.parse();
    }
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div
        className="fb-page"
        data-href="https://www.facebook.com/schoolonwheels/"
        data-tabs="timeline"
        data-width=""
        data-height=""
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      >
        <blockquote
          cite="https://www.facebook.com/schoolonwheels/"
          className="fb-xfbml-parse-ignore"
        >
          <a href="https://www.facebook.com/schoolonwheels/">
            School on Wheels of Massachusetts
          </a>
        </blockquote>
      </div>
    </div>
  );
}