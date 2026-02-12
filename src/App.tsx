import { Route, Switch, useLocation } from "wouter";

import LeftSidebar from "./components/LeftSidebar";

import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import GoogleAnalyticsPage from "./pages/SocialMedia/GoogleAnalyticsPage";
import TwitterPage from "./pages/SocialMedia/TwitterPage";
import FacebookPage from "./pages/SocialMedia/FacebookPage";
import InstagramPage from "./pages/SocialMedia/InstagramPage";
import AdminPage from "./pages/AdminPage";
import GlossaryPage from "./pages/Glossary";
import { useState } from "react";
import ErrorPage from "./pages/ErrorPage";
import Newsletter from "./pages/Newsletter";

import { GlobalPageExportProvider } from "./components/export-pdf/GlobalPageExportProvider";

const App = () => {
  const [location] = useLocation();

  const currentPath = location.toLowerCase();
  const hideLayoutRoutes = ["/login"];
  const hideLayout = hideLayoutRoutes.includes(currentPath);

  const [isMobile, setisMobile] = useState(false);

  return (
    <GlobalPageExportProvider>
      <div className={`${!hideLayout && "flex min-h-screen bg-white"}`}>
        {!hideLayout && (
          <>
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <LeftSidebar />
            </div>

            {/* Mobile sidebar/making it visible only on small screens*/}
            <div className="md:hidden">
              <LeftSidebar
                mobile
                open={isMobile}
                onClose={() => setisMobile(false)}
              />
            </div>

            {/* Button to collapse the page */}
            <button
              className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-200 rounded-lg shadow"
              onClick={() => setisMobile(!isMobile)}
            >
              ☰
            </button>
          </>
        )}

        {/* Content on page */}
        <div
          className={`flex-grow flex flex-col pt-0 px-6 bg-white ${
            !hideLayout ? "md:ml-[20%]" : ""
          }`}
        >
          <Switch>
            <Route path="/" component={Homepage} />
            <Route path="/social/facebook" component={FacebookPage} />
            <Route path="/social/twitter" component={TwitterPage} />
            <Route path="/social/instagram" component={InstagramPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/social/google-analytics" component={GoogleAnalyticsPage} />
            <Route path="/admin" component={AdminPage} />
            <Route path="/glossary" component={GlossaryPage} />
            <Route path="/error/tiktok" component={ErrorPage} />
            <Route path="/error/linkedin" component={ErrorPage} />
            <Route path="/newsletter" component={Newsletter} />
            <Route>
              <p className="p-4 text-black">404: Page Not Found</p>
            </Route>
          </Switch>
        </div>
      </div>
      <div
        id="pdf-export-container"
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          width: "1000px", // fixed logical width for cards
          pointerEvents: "none",
        }}
      />
    </GlobalPageExportProvider>
  );
};

export default App;
