import { Route, Switch } from "wouter";

import LeftSidebar from "./components/LeftSidebar";
import TopBanner from "./components/TopBanner";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";

const App = () => {
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