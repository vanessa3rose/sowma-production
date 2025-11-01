import { Route, Switch, useLocation } from "wouter";

import LeftSidebar from "./components/LeftSidebar";
import TopBanner from "./components/TopBanner";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";
import LoginPage from "./pages/LoginPage";
import GoogleAnalyticsPage from "./pages/GoogleAnalyticsPage";

const App = () => {
  const [location] = useLocation();
  const hideLayoutRoutes = ["/login"];
  const hideLayout = hideLayoutRoutes.includes(location);

  return (
    <div className="flex min-h-screen bg-white">
      <LeftSidebar />
      <div className="flex-grow flex flex-col ml-[20%] pt-28 px-6 bg-white">
        <TopBanner />
        <Switch>
          <Route path="/" component={Homepage} />
          <Route path="/social-media" component={SocialMediaPage} />
          <Route>
            <p className="p-4 text-black">404: Page Not Found</p>
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default App;