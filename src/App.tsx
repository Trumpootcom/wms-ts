function App() {
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
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.5rem" }}>VTT Slicer</h1>
      </header>

      <main
        style={{
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: "16px",
          padding: "16px",
        }}
      >
        <aside
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Controls</h2>
          <p>Upload, sizing, grid, and export controls will go here.</p>
        </aside>

        <section
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "16px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            minHeight: "500px",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Preview</h2>
          <p>Map preview and slice overlay will go here.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
