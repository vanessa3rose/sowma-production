import { Route, Switch, useLocation } from "wouter";

import LeftSidebar from "./components/LeftSidebar";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GoogleAnalyticsPage from "./pages/GoogleAnalyticsPage";
import AdminPage from "./pages/AdminPage";
import TestExportPDF from "./pages/TestExportPDF"; //TODO: Remove
import GlossaryPage from "./pages/Glossary";
import Newsletter from "./pages/Newsletter";

const App = () => {
  const [location] = useLocation();
  const hideLayoutRoutes = ["/login", "/signup"];
  const hideLayout = hideLayoutRoutes.includes(location);

  return (
    <div className={`${!hideLayout && "flex min-h-screen bg-white"}`}>
      {!hideLayout && <LeftSidebar />}
      <div
        className={`${!hideLayout && "flex-grow flex flex-col ml-[20%] pt-0 px-6 bg-white"}`}
      >
        <Switch>
          <Route path="/" component={Homepage} />
          <Route path="/social-media" component={SocialMediaPage} />
          <Route path="/social/:platform" component={SocialMediaPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/google-analytics" component={GoogleAnalyticsPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/test-export" component={TestExportPDF} />
          <Route path="/glossary" component={GlossaryPage} />
          <Route path="/newsletter" component={Newsletter} />

          <Route>
            <p className="p-4 text-black">404: Page Not Found</p>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default App;
