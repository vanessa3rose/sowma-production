import { Route, Switch, useLocation } from "wouter";
import { useState } from "react";
import { useUser } from "@clerk/clerk-react";

import LeftSidebar from "./components/LeftSidebar";

import Homepage from "./pages/Homepage";
import LoginPage from "./pages/LoginPage";
import AcceptInvitePage from "./pages/AcceptInvitePage";

import GoogleAnalyticsPage from "./pages/SocialMedia/GoogleAnalyticsPage";
import TwitterPage from "./pages/SocialMedia/TwitterPage";
import FacebookPage from "./pages/SocialMedia/FacebookPage";
import InstagramPage from "./pages/SocialMedia/InstagramPage";
import ConstantContactPage from "./pages/SocialMedia/ConstantContactPage";
import LinkedInPage from "./pages/SocialMedia/LinkedInPage";
import AdminPage from "./pages/AdminPage";
import AdminRejection from "./pages/AdminRejection";
import NotFoundPage from "./pages/NotFound";

import GlossaryPage from "./pages/Glossary";
import ErrorPage from "./pages/ErrorPage";

import { ProtectedRoute } from "./components/routes/ProtectedRoute";
import { AdminRoute } from "./components/routes/AdminRoute";

import { GlobalPageExportProvider } from "./components/export-pdf/GlobalPageExportProvider";

const App = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [location] = useLocation();

  const currentPath = location.toLowerCase();
  const hideLayoutRoutes = ["/signup", "/login", "/accept-invite"];
  // Auth/public flows should render without dashboard chrome.
  const hideLayout =
    hideLayoutRoutes.some(
      (route) => currentPath === route || currentPath.startsWith(`${route}/`),
    ) ||
    !isLoaded ||
    !isSignedIn;

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

            {/* Mobile sidebar */}
            <div className="md:hidden">
              <LeftSidebar
                mobile
                open={isMobile}
                collapsed={isCollapsed}
                onCollapse={setCollapsed}
                onClose={() => setisMobile(false)}
              />
            </div>

            {/* Mobile toggle button */}
            <button
              className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-200 rounded-lg shadow"
              onClick={() => setisMobile(!isMobile)}
            >
              ☰
            </button>
          </>
        )}

        {/* Content */}
        <div
          className={`flex-grow flex flex-col pt-0 px-6 bg-white ${
            !hideLayout ? (isCollapsed ? "md:ml-20" : "md:ml-64") : ""
          }`}
        >
          <Switch>
            {/* Protected */}
            <Route
              path="/"
              component={() => <ProtectedRoute component={Homepage} />}
            />
            <Route
              path="/homepage"
              component={() => <ProtectedRoute component={Homepage} />}
            />
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
              path="/social/google-analytics"
              component={() => (
                <ProtectedRoute component={GoogleAnalyticsPage} />
              )}
            />
            <Route
              path="/social/constant-contact"
              component={() => (
                <ProtectedRoute component={ConstantContactPage} />
              )}
            />
            <Route
              path="/social/linkedin"
              component={() => <ProtectedRoute component={LinkedInPage} />}
            />
            <Route
              path="/newsletter"
              component={() => (
                <ProtectedRoute component={ConstantContactPage} />
              )}
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

            {/* Admin-only */}
            <Route
              path="/admin"
              component={() => <AdminRoute component={AdminPage} />}
            />

            {/* Logged-in users only */}
            <Route
              path="/admin-rejection"
              component={() => <ProtectedRoute component={AdminRejection} />}
            />

            {/* Public */}
            <Route path="/login" component={LoginPage} />
            <Route path="/accept-invite" component={AcceptInvitePage} />
            <Route path="/accept-invite/:rest*" component={AcceptInvitePage} />
            <Route component={NotFoundPage} />
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
