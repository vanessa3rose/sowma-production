import { Link } from "wouter";

export default function Homepage() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl">JumboCode Vite Template</h1>
        <p>Major packages/tools included:</p>
        <ul className="list-disc ml-8 mb-4">
          <li>React</li>
          <li>TypeScript</li>
          <li>TailwindCSS</li>
          <li>Wouter</li>
        </ul>

        <p>Pages: </p>
        <ul className="list-disc ml-8 mb-4">
          <Link href="/" className="list-item text-blue-500">
            Homepage
          </Link>
          <Link href="/users/Gabe" className="list-item text-blue-500">
            Gabe's User Page
          </Link>
          <Link href="/users/Ben" className="list-item text-blue-500">
            Ben's User Page
          </Link>
        </ul>

        <p>API Routes: </p>
        <ul className="list-disc ml-8 mb-4">
          <a href="/api/hello" className="list-item text-blue-500">
            /api/hello
          </a>
          <a href="/api/users?name=Gabe" className="list-item text-blue-500">
            /api/users?name=Gabe
          </a>
          <a href="/api/users?name=Ben" className="list-item text-blue-500">
            /api/users?name=Ben
          </a>
        </ul>
      </div>
    </>
  );
}
