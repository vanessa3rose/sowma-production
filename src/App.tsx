import { Route, Switch, useLocation } from "wouter";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react"; // ✅ add

import LeftSidebar from "./components/LeftSidebar";

import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import GoogleAnalyticsPage from "./pages/SocialMedia/GoogleAnalyticsPage";
import TwitterPage from "./pages/SocialMedia/TwitterPage";
import FacebookPage from "./pages/SocialMedia/FacebookPage";
import InstagramPage from "./pages/SocialMedia/InstagramPage";
import AdminPage from "./pages/AdminPage";
import GlossaryPage from "./pages/Glossary";
import ErrorPage from "./pages/ErrorPage";
import Newsletter from "./pages/Newsletter";

import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { AdminRoute } from "./components/routes/AdminRoute";
import AdminRejection from "./pages/AdminRejection";

// ⭐ Correct import
import { GlobalPageExportProvider } from "./components/export-pdf/GlobalPageExportProvider";

const App = () => {
  const { isLoaded, isSignedIn } = useUser(); // ✅ add
  const [location] = useLocation();

  const currentPath = location.toLowerCase();
const hideLayoutRoutes = ["/signup", "/login"];
const hideLayout =
  hideLayoutRoutes.includes(currentPath) || !isLoaded || !isSignedIn;

  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobile, setisMobile] = useState(false);

  return (
    <GlobalPageExportProvider>
      <div className={`${!hideLayout && "flex min-h-screen ml-2 bg-white"}`}>
        {!hideLayout && (
          <>
            {/* Desktop sidebar */}
            <div className="hidden md:block">
              <LeftSidebar collapsed={isCollapsed} onCollapse={setCollapsed} />
            </div>

            {/* Mobile sidebar/making it visible only on small screens*/}
            <div className="md:hidden">
              <LeftSidebar
                mobile
                open={isMobile}
                collapsed={isCollapsed}
                onCollapse={setCollapsed}
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
          className={`flex-grow flex flex-col pt-0 px-6 bg-white
            ${!hideLayout ? (isCollapsed ? "md:ml-20" : "md:ml-64") : ""}
          `}
        >
          <Switch>
            {/* Protected */}
            <Route path="/" component={() => <ProtectedRoute component={Homepage} />} />

            <Route
              path="/social/facebook"
              component={() => <ProtectedRoute component={FacebookPage} />}
            />
            <Route
              path="/social/twitter"
              component={() => <ProtectedRoute component={TwitterPage} />}
            />
            <Route
              path="/social/instagram"
              component={() => <ProtectedRoute component={InstagramPage} />}
            />

            <Route
              path="/google-analytics"
              component={() => <ProtectedRoute component={GoogleAnalyticsPage} />}
            />

            <Route
              path="/glossary"
              component={() => <ProtectedRoute component={GlossaryPage} />}
            />
            <Route
              path="/error/tiktok"
              component={() => <ProtectedRoute component={ErrorPage} />}
            />
            <Route
              path="/error/linkedin"
              component={() => <ProtectedRoute component={ErrorPage} />}
            />
            <Route
              path="/admin-rejection"
              component={() => <ProtectedRoute component={AdminRejection} />}
            />

            <Route path="/login" component={LoginPage} />
            <Route
              path="/newsletter"
              component={() => <ProtectedRoute component={Newsletter} />}
            />

            {/* Admin-only */}
            <Route path="/admin" component={() => <AdminRoute component={AdminPage} />} />

            {/* Admin rejection (logged-in users only) */}
            <Route
              path="/admin-rejection"
              component={() => <ProtectedRoute component={AdminRejection} />}
            />

            {/* Public */}
            <Route path="/login" component={LoginPage} />

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
          width: "1000px",
          pointerEvents: "none",
        }}
      />
    </GlobalPageExportProvider>
  );
};

export default App;
