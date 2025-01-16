"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const DynamicReactSwagger = dynamic(() => import("./react-swagger"), {
  ssr: false,
  loading: () => <div>Loading...</div>,
});

export default function IndexPage() {
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState(false);

  (async function fetchSpecs() {
    if (spec || error) return;
    try {
      const response = await fetch("swagger/doc.json");

      if (!response.ok) throw new Error("Failed to fetch API docs");
      const fetchedSpec = await response.json();
      setSpec(fetchedSpec);
    } catch (err) {
      console.error("Error fetching Swagger specs:", err);
      setError(true);
    }
  })();

  if (error) {
    return <div>Error loading API documentation. Please try again later.</div>;
  }

  if (!spec) {
    return (
        <div className="loading">
          <span>Loading API documentation...</span>
        </div>
    );
  }

  return (
    <section className="container">
      <DynamicReactSwagger spec={spec} />
    </section>
  );
}
