import IMG1 from "../assets/IMG1.png";
import IMG2 from "../assets/IMG2.png";
import IMG3 from "../assets/IMG3.png";
import IMG4 from "../assets/IMG4.png";
import IMG5 from "../assets/IMG5.png";
import IMG6 from "../assets/IMG6.png";
import IMG7 from "../assets/IMG7.png";

export default function DocumentationPage() {
  return (
    <div className="flex min-h-screen font-poppins bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-5 hidden lg:block sticky top-0 h-screen">
        <h2 className="text-xl font-semibold mb-4">Contents</h2>
        <div className="space-y-2 text-lg">
          <a href="#contact" className="block hover:text-blue-500">
            Contact
          </a>
          <a href="#tools" className="block hover:text-blue-500">
            Technical Tools
          </a>
          <a href="#navigation" className="block hover:text-blue-500">
            Navigation
          </a>
          <a href="#admin" className="block hover:text-blue-500">
            Admin Page
          </a>
          <a href="#glossary" className="block hover:text-blue-500">
            Glossary
          </a>
          <a href="#socialmediapages" className="block hover:text-blue-500">
            Social Media Platform Pages
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-16 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="font-semibold text-3xl lg:text-4xl mb-6">
          SOWMA Documentation Guide
        </h1>

        {/* Contact Section */}
        <div id="contact" className="mt-4">
          <h2 className="text-2xl font-semibold mb-4">Contact Details:</h2>

          <p className="text-lg text-gray-500 mb-6">
            Reach out for any questions, concerns, or problems that may arise.
          </p>

          <div className="text-lg text-black space-y-4">
            <div>
              <p className="font-medium">Lakshita Jain</p>
              <p>(781) 350-6966</p>
              <a
                href="mailto:lak.jai110@gmail.com"
                className="text-blue-500 underline"
              >
                lak.jai110@gmail.com
              </a>
            </div>

            <div>
              <p className="font-medium">Vanessa Rose</p>
              <p>(603) 931-8003</p>
              <a
                href="mailto:vanessa3rose@gmail.com"
                className="text-blue-500 underline"
              >
                vanessa3rose@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Technical Tools */}
        <div id="tools" className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Technical Tools:</h2>

          <div className="text-lg text-black space-y-4">
            <p>
              The codebase is in TypeScript, using TailwindCSS and React (Vite).
              We use Neon to control our database of the social media metrics
              (Google Analytics, Facebook, Instagram, Twitter, LinkedIn, and
              Constant Contact). User authentication and sign-in was done using
              Clerk. Finally, we host our site using Vercel. Below are some of
              the logins you may need.
            </p>

            <ol className="list-decimal ml-6 space-y-3">
              <li>
                The code for the website lives on a GitHub repository linked{" "}
                <a href="#" className="text-blue-500 underline">
                  here
                </a>
                . Email or text Lakshita and Vanessa if you have trouble
                accessing it.
              </li>

              <li>
                The website is hosted on Vercel at{" "}
                <a
                  href="https://sowma-production.vercel.app"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  sowma-production.vercel.app
                </a>
                . Login information as an admin is described{" "}
                <a href="#admin" className="text-blue-500 underline">
                  below
                </a>
                .
              </li>

              <li>
                We use Clerk{" "}
                <a
                  href="https://clerk.com"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  (what site should be hyperlinked to clerk?)
                </a>{" "}
                for user sign in and up. The email is:{" "}
                <a
                  href="mailto:jumbocodesowma@gmail.com"
                  className="text-blue-500 underline"
                >
                  jumbocodesowma@gmail.com
                </a>{" "}
                password: @nspirEcha8ge
              </li>

              <li>
                We use{" "}
                <a
                  href="https://neon.tech"
                  target="_blank"
                  className="text-blue-500 underline"
                >
                  Neon
                </a>{" "}
                to test our database, if you would like access, feel free to
                email Lakshita and Vanessa explaining why.
              </li>
            </ol>
          </div>
        </div>

        {/* Navigating the Site */}
        <div id="navigation" className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Navigating the Site:</h2>

          <div className="text-lg text-black space-y-4">
            <p>
              Below is a guide to help you navigate different parts of the site.
            </p>

            {/* Admin Page */}
            <h3 id="admin" className="text-xl font-semibold mt-4 mb-2">
              Admin Page (Only Admin View):
            </h3>
            <p className="font-medium mt-4 text-center italic py-4">
              Users and Roles Tab
            </p>
            <div className="my-4">
              <img src={IMG1} className="w-full rounded-lg border" />
            </div>
            <ul className="list-disc ml-6">
              <li>View and edit users and their roles on this page.</li>
              <li>
                Click the dropdown menu to change roles and delete to remove
                users.
              </li>
            </ul>

            <p className="font-medium mt-4 text-center italic py-4">
              Api and Data Tab
            </p>
            <div className="my-3">
              <img src={IMG2} className="w-full rounded-lg border" />
            </div>
            <li>
              LinkedIn Data may be downloaded through (Content → Export → ….)
            </li>
            <li>Attach the spreadsheet downloaded here to upload the data.</li>

            <div className="my-3">
              <img src={IMG3} className="w-full rounded-lg border" />
            </div>
            <ul className="list-disc ml-6">
              <li>
                To edit data on a platform from a specific day, first choose the
                platform. Then choose the name of the metric that must be
                changed. Lastly, type in the correct metric that corresponds to
                the correct date, then submit.
              </li>
            </ul>

            <p className="font-medium mt-4 text-center italic"> Waitlist Tab</p>
            <div className="my-3">
              <img src={IMG4} className="w-full rounded-lg border" />
            </div>
            <ul className="list-disc ml-6">
              <li>On the Waitlist tab, approve or deny users.</li>
              <li>
                Users will then receive an email with an invitation to accept
                their invitation and set a password.
              </li>
              <li>
                Until they have accepted their invitation, they will appear
                under Pending Invites as such:
              </li>
            </ul>
            <div className="my-3">
              <img src={IMG5} className="w-full rounded-lg border" />
            </div>

            {/* Glossary */}
            <div id="glossary" className="mt-10">
              <a
                href="https://sowma-production.vercel.app/glossary"
                className="text-2xl text-blue-500 underline font-semibold mb-4"
              >
                Glossary:
              </a>
              <div className="py-4">
                <li>
                  This page contains terms and their definitions for various
                  metrics. You may click on the blue bubbles with Platform names
                  with hyperlinks to the pages.
                </li>
              </div>
            </div>
            {/* Social Media Pages */}
            <div id="socialmediapages" className="mt-10">
              <h3 className="text-2xl font-semibold mb-4">
                Social Media Platform Pages:
              </h3>
              <p className="font-medium mt-4 text-center italic py-4">
                {" "}
                Picking social medias{" "}
              </p>
              <p>
                Here, click on different social media sites to access their
                individual metrics.
              </p>
            </div>
            <div className="my-4">
              <img src={IMG6} className="w-full rounded-lg border" />
            </div>

            <p className="font-medium mt-4 text-center italic">
              {" "}
              Exporting the data:{" "}
            </p>
            <p>
              To export the charts, click the export button at the top right of
              any metrics page (left image). Then press “Download PDF” to
              download. The date dropdown allows for a specific or default range
              (right image). The date dropdown will let you select a custom
              range or presets.
            </p>
            <div className="my-4">
              <img src={IMG7} className="w-full rounded-lg border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
