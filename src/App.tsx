import Homepage from "./components/Homepage";
import { Route, Switch } from "wouter";

const App = () => {
  return (
    <>
      <Switch>
        <Route path="/" component={Homepage} />

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
