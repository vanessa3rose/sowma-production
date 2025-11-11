import { Route, Switch, useLocation } from "wouter";

import LeftSidebar from "./components/LeftSidebar";
import TopBanner from "./components/TopBanner";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import GoogleAnalyticsPage from "./pages/GoogleAnalyticsPage";

const App = () => {
  const [location] = useLocation();
  const hideLayoutRoutes = ["/login", "/signup"];
  const hideLayout = hideLayoutRoutes.includes(location);

  return (
    <div className={`${!hideLayout && "flex min-h-screen bg-white"}`}>
      {!hideLayout && <LeftSidebar />}
      <div
        className={`${!hideLayout && "flex-grow flex flex-col ml-[20%] pt-28 px-6 bg-white"}`}
      >
        {!hideLayout && <TopBanner />}

        <Switch>
          <Route path="/" component={Homepage} />
          <Route path="/social-media" component={SocialMediaPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/google-analytics" component={GoogleAnalyticsPage} />
          <Route path="/signup" component={SignupPage} />

          <Route>
            <p className="p-4 text-black">404: Page Not Found</p>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default App;
