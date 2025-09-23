import { Link } from "wouter";

export default function Homepage() {
  return (
    <>
      <div className="p-4">
        <h1 className="text-2xl">School on Wheels MA</h1>

        <p>Pages: </p>
        <ul className="list-disc ml-8 mb-4">
          <Link href="/" className="list-item text-blue-500">
            Homepage
          </Link>
        </ul>

        <p>API Routes: </p>
        <ul className="list-disc ml-8 mb-4">
          <a href="/api/example" className="list-item text-blue-500">
            /api/routes/example
          </a>
        </ul>
      </div>
    </>
  );
}
