import { Route, Switch } from "wouter";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";

import TopBanner from "./components/TopBanner";
import LeftSidebar from "./components/LeftSidebar";

const App = () => {
  return (
    <>
      <LeftSidebar />
      <TopBanner />

      <Switch>
        <Route path="/" component={Homepage} />
        <Route path="/social-media" component={SocialMediaPage} />

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
