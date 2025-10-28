import { Route, Switch, useLocation } from "wouter";

import LeftSidebar from "./components/LeftSidebar";
import TopBanner from "./components/TopBanner";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";
import LoginPage from "./pages/LoginPage";

const App = () => {
  const [location] = useLocation();
  const hideLayoutRoutes = ["/login"];
  const hideLayout = hideLayoutRoutes.includes(location);
  
  return (
    <>
      {!hideLayout && <LeftSidebar />}
      {!hideLayout && <TopBanner />}

      <Switch>
        <Route path="/" component={Homepage} />
        <Route path="/social-media" component={SocialMediaPage} />
        <Route path="/login" component={LoginPage} />

        {/* Shows a 404 error if the path doesn't match anything */}
        {
          <Route>
            <p className="p-4">404: Page Not Found</p>
          </Route>
        }
      </Switch>
    </>
  );
};

export default App;