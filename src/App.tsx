import Homepage from "./pages/Homepage";
import { Route, Switch } from "wouter";
import LeftSidebar from "./pages/LeftSidebar"; 
import Topbanner from "./pages/TopBanner";


const App = () => {
  return (
    <>
       <LeftSidebar/> 
       <Topbanner/>
      <Switch>

        {/* Shows a 404 error if the path doesn't match anything */}
        {
          <Route>
            <p className="p-4"></p>
          </Route>
        }
      </Switch>
    </>
  );
};

export default App;
