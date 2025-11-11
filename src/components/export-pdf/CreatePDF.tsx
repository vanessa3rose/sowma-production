import React from "react";
import { exportPDF } from "../../utils/exportPDF";

const PDFSection = () => {
  return (
    <div className="absolute flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      {/* This section will be exported */}
      <div
        id="pdf-content"
        className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-2xl text-center"
      >
        <h1 className="text-3xl font-bold text-blue-600 mb-4">
          My Styled PDF Export 🚀
        </h1>
        <p className="text-gray-700 mb-6">
          This entire section, including Tailwind styles, will appear in the
          exported PDF. You can include images, text, or any other HTML content.
        </p>

        <table className="w-full border border-gray-200 text-left text-gray-600">
          <thead>
            <tr className="bg-blue-100">
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b">Alice</td>
              <td className="px-4 py-2 border-b">Developer</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border-b">Bob</td>
              <td className="px-4 py-2 border-b">Designer</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Button */}
      <button
        onClick={() => exportPDF("pdf-content", "MyStyledExport.pdf")}
        className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Download as PDF
      </button>
    </div>
  );
};

export default PDFSection;
