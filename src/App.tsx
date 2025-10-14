import Homepage from "./pages/Homepage";
import { Route, Switch } from "wouter";
import SocialMediaPage from "./pages/SocialMediaPage";

const App = () => {
  return (
    <>
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
