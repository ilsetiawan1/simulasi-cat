import { ImageResponse } from "next/og";

export const alt = "simcat — Simulasi CAT CPNS Standar BKN Gratis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F4F3EE",
          padding: "56px 64px",
          color: "#181816",
          fontFamily: "sans-serif",
        }}
      >
        {/* Top Wordmark Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            simcat
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#E6F4DC",
              border: "2px solid #43A018",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 20,
              fontWeight: 700,
              color: "#26660B",
            }}
          >
            Gratis 100% • Tanpa Wajib Login
          </div>
        </div>

        {/* Main Tactile Editorial Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#FAF9F5",
            border: "3px solid #181816",
            borderRadius: 28,
            padding: "44px 48px",
            boxShadow: "0 10px 0 #181816",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
            }}
          >
            <span>Simulasi</span>
            <span
              style={{
                display: "flex",
                backgroundColor: "#CBE8B4",
                borderLeft: "5px solid #43A018",
                borderRight: "5px solid #43A018",
                padding: "4px 18px",
              }}
            >
              CAT CPNS
            </span>
            <span>Standar BKN</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 26,
              lineHeight: 1.45,
              color: "#575650",
            }}
          >
            Latihan SKD Penuh (110 soal), Mini Tryout TWK/TIU/TKP, dan SKB dengan
            pengacakan soal, evaluasi passing grade, pembahasan, dan papan peringkat.
          </div>
        </div>

        {/* Bottom Passing Grade Strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 21,
            fontWeight: 600,
            color: "#575650",
          }}
        >
          <div style={{ display: "flex" }}>
            Acuan KepmenPANRB No. 321 Tahun 2024
          </div>
          <div style={{ display: "flex", gap: 24, color: "#181816" }}>
            <span>TWK 65</span>
            <span>•</span>
            <span>TIU 80</span>
            <span>•</span>
            <span>TKP 166</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
