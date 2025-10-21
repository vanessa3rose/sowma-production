import { Route, Switch } from "wouter";

import Homepage from "./pages/Homepage";
import SocialMediaPage from "./pages/SocialMediaPage";

import TopBanner from "./components/TopBanner";
import LeftSidebar from "./components/LeftSidebar";
import BarCharts from "./components/charts/BarCharts";
import PieCharts from "./components/charts/PieCharts";
import LineCharts from "./components/charts/lineCharts";

const App = () => {
  const testData = [
    { platform: "Google Search", traffic: 20 },
    { platform: "Social Media", traffic: 35 },
    { platform: "Email", traffic: 25 },
    { platform: "YouTube", traffic: 10 },
    { platform: "Newsletter", traffic: 5 },
    { platform: "Other", traffic: 15 },
  ];

  const lineData = [
    { year: "2001", sales: 40, profit: 24, expenses: 20 },
    { year: "2002", sales: 30, profit: 13, expenses: 27 },
    { year: "2003", sales: 20, profit: 98, expenses: 22 },
    { year: "2004", sales: 27, profit: 39, expenses: 18 },
  ];

  return (
    <>
      <LeftSidebar />
      <TopBanner />
      <PieCharts
        data={testData}
        width={600}
        height={600}
        dataKey="traffic"
        nameKey="platform"
      />

      <LineCharts
        data={lineData}
        width={600}
        height={400}
        xAxisKey="year"
        dataKeys={["sales", "profit", "expenses"]}
        showArea={false} // gradient lines, no dots
      />

      <BarCharts
        data={testData}
        width={600}
        height={300}
        xAxisKey="platform"
        dataKeys={["traffic"]}
      />

      <Switch>
        {/* <Route path="/" component={Homepage} />
        <Route path="/social-media" component={SocialMediaPage} /> */}

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
