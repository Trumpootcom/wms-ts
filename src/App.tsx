import { useState } from "react";

function App() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        color: "#111827",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <header
        style={{
          background: "#1f2937",
          color: "white",
          padding: "16px 24px",
        }}
      >
        <h1 style={{ margin: 0 }}>VTT Slicer</h1>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "16px",
          padding: "16px",
        }}
      >
        {/* Controls panel */}
        <aside
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2>Controls</h2>

          <label>
            Upload Map
            <br />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
            />
          </label>
        </aside>

        {/* Preview panel */}
        <section
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            minHeight: "500px",
          }}
        >
          <h2>Preview</h2>

          {imageUrl ? (
            <img
              src={imageUrl}
              style={{
                maxWidth: "100%",
                maxHeight: "600px",
                border: "1px solid #ccc",
              }}
            />
          ) : (
            <p>No image loaded</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;