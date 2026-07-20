import { useEffect, useState } from "react";
import FloatingPreviewLayout from "./components/FloatingPreviewLayout.tsx";
import { useSlicerState } from "./hooks/useSlicerState.ts";
import titlebarLeft from "./assets/trumpoot_titlebar_a.png";
import titlebarFill from "./assets/trumpoot_titlebar_b.png";
import { buildInfo } from "./buildInfo.ts";
import { theme } from "./theme.ts";

const titlebarHeightPx = 45;
const titlebarLeftAspectRatio = 171 / 98;
const titlebarLeftWidthPx = titlebarHeightPx * titlebarLeftAspectRatio;

function App() {
  const slicer = useSlicerState();
  const [isSplashOpen, setIsSplashOpen] = useState(true);

  useEffect(() => {
    if (!isSplashOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSplashOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSplashOpen]);

  return (
    <div
      style={{
        height: "100dvh",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        background: theme.app.background,
        color: theme.app.text,
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          position: "relative",
          minHeight: `${titlebarHeightPx}px`,
          backgroundColor: theme.app.titlebarFallback,
          backgroundImage: `url(${titlebarFill})`,
          backgroundSize: "100% 100%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: theme.control.sliderTrackDark,
          padding: "0 14px",
          paddingLeft: `${titlebarLeftWidthPx + 14}px`,
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          aria-label="Open WMS Tool Suite splash screen"
          onClick={() => setIsSplashOpen(true)}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${titlebarLeftWidthPx}px`,
            display: "block",
            border: 0,
            padding: 0,
            margin: 0,
            background: "transparent",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <img
            src={titlebarLeft}
            alt=""
            aria-hidden="true"
            style={{
              height: "100%",
              width: "auto",
              display: "block",
            }}
          />
        </button>

        <h1
          style={{
            position: "relative",
            zIndex: 1,
            margin: 0,
            textShadow: `0 1px 2px ${theme.app.titlebarTextShadow}`,
          }}
        >
          WMS Tool Suite
        </h1>
      </header>

      {isSplashOpen ? (
        <div
          role="presentation"
          onMouseDown={() => setIsSplashOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 20,
            display: "grid",
            placeItems: "center",
            padding: "24px",
            background: "hsl(42 15% 5% / 48%)",
            boxSizing: "border-box",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="splash-title"
            onMouseDown={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              borderRadius: "8px",
              overflow: "hidden",
              border: `1px solid ${theme.panel.border}`,
              background: theme.panel.background,
              color: theme.panel.text,
              boxShadow:
                "0 18px 42px hsl(42 20% 5% / 42%), " +
                theme.panel.horizontalInsetShadow,
            }}
          >
            <div
              style={{
                position: "relative",
                minHeight: `${titlebarHeightPx}px`,
                backgroundColor: theme.app.titlebarFallback,
                backgroundImage: `url(${titlebarFill})`,
                backgroundSize: "100% 100%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                paddingLeft: `${titlebarLeftWidthPx + 14}px`,
                paddingRight: "44px",
                display: "flex",
                alignItems: "center",
                color: theme.control.sliderTrackDark,
                boxSizing: "border-box",
              }}
            >
              <img
                src={titlebarLeft}
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: "auto",
                  display: "block",
                }}
              />
              <h2
                id="splash-title"
                style={{
                  position: "relative",
                  zIndex: 1,
                  margin: 0,
                  fontSize: "22px",
                  lineHeight: 1.1,
                  textShadow: `0 1px 2px ${theme.app.titlebarTextShadow}`,
                }}
              >
                WMS Tool Suite
              </h2>
              <button
                type="button"
                aria-label="Close splash screen"
                onClick={() => setIsSplashOpen(false)}
                style={{
                  position: "absolute",
                  right: "8px",
                  top: "7px",
                  zIndex: 2,
                  width: "26px",
                  height: "26px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.control.buttonBorder}`,
                  background:
                    `linear-gradient(${theme.control.buttonPrimaryTop}, ` +
                    `${theme.control.buttonPrimaryBottom})`,
                  boxShadow: theme.control.buttonInsetHighlight,
                  color: theme.control.buttonText,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                x
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: "12px",
                padding: "18px",
                boxShadow: theme.panel.bodyInsetShadow,
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: theme.control.sliderTrackDark,
                }}
              >
                Web Map Slicer
              </div>
              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.45,
                  color: theme.panel.text,
                }}
              >
                A Trumpoot Tool Suite app for turning large maps into printable
                PDF slices.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "5px 10px",
                  paddingTop: "4px",
                  color: theme.panel.mutedText,
                  fontSize: "13px",
                }}
              >
                <div>Version</div>
                <div>{buildInfo.version}</div>
                <div>Revision</div>
                <div>{buildInfo.revision}</div>
                <div>Built</div>
                <div>{buildInfo.builtAt}</div>
                <div>Site</div>
                <div>wms.trumpoot.com</div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <FloatingPreviewLayout slicer={slicer} />
    </div>
  );
}

export default App;
