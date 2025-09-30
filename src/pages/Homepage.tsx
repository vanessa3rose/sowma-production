import { Link } from "wouter";
import logo from "../../images/logo.png";

export default function Homepage() {
  return (
    <>
      <div className="p-4">
        <img src={logo} alt="Logo" className="h-24" />
        <h1 className="text-2xl bg-sowma-yellow">School on Wheels MA</h1>

        <p className="text-sowma-accent">Pages: </p>
        <ul className="list-disc ml-8 mb-4">
          <Link href="/" className="list-item text-sowma-blue">
            Homepage
          </Link>
        </ul>

        <p className="text-sowma-accent"> API Routes: </p>
        <ul className="list-disc ml-8 mb-4">
          <a href="/api/example" className="list-item text-sowma-blue">
            /api/routes/example
          </a>
        </ul>
      </div>
    </>
  );
}
