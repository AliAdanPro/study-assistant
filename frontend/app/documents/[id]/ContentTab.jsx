import React from "react";

export default function ContentTab({ pdfUrl }) {
  return (
    <>
      <div className="mb-4 font-semibold text-gray-700">Document Viewer</div>
      <div className="w-full rounded-xl overflow-hidden border border-gray-100 shadow">
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          width="100%"
          height="600px"
          className="border-0 w-full"
        />
      </div>
    </>
  );
}
