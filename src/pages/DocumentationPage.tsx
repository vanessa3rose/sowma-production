import { Link } from "wouter";

export default function DocumentationPage() {
  return (
    <div className="flex min-h-screen font-poppins bg-white">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-5 hidden lg:block sticky top-0 h-screen">
        <h2 className="text-lg font-semibold mb-4">Contents</h2>
        <div className="space-y-2 text-sm">
          <a href="#contact" className="block hover:text-blue-500">Contact</a>
          <a href="#tools" className="block hover:text-blue-500">Technical Tools</a>
          <a href="#navigation" className="block hover:text-blue-500">Navigation</a>
          <a href="#admin" className="block hover:text-blue-500">Admin Page</a>
          <a href="#glossary" className="block hover:text-blue-500">Glossary</a>
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
            The codebase is in TypeScript, using TailwindCSS and React (Vite). We use Neon to
            control our database of the social media metrics (Google Analytics, Facebook,
            Instagram, Twitter, LinkedIn, and Constant Contact). User authentication and sign-in
            was done using Clerk. Finally, we host our site using Vercel. Below are some of the
            logins you may need.
            </p>

            <ol className="list-decimal ml-6 space-y-3">
            <li>
                The code for the website lives on a GitHub repository linked{" "}
                <a href="#" className="text-blue-500 underline">
                here
                </a>
                . Email or text Lakshita and Vanessa if you have trouble accessing it.
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
                to test our database, if you would like access, feel free to email
                Lakshita and Vanessa explaining why.
            </li>
            </ol>
        </div>
        </div>

      </div>
    </div>
  );
}