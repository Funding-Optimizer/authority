import React from "react";

function App() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #000000 0%, #1a1a2e 100%)",
      color: "#00ffff",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        textAlign: "center",
        maxWidth: "800px"
      }}>
        <h1 style={{
          fontSize: "4rem",
          fontWeight: "900",
          marginBottom: "20px",
          textShadow: "0 0 20px #00ffff"
        }}>
          CREDIT<span style={{color: "#ffff00"}}>$</span>TACK<span style={{color: "#ffff00"}}>≡</span>R™
        </h1>
        
        <p style={{
          fontSize: "1.5rem",
          marginBottom: "40px",
          color: "#cccccc"
        }}>
          AI-Powered Credit Optimization Platform
        </p>
        
        <div style={{
          background: "rgba(0,255,255,0.1)",
          border: "2px solid #00ffff",
          borderRadius: "15px",
          padding: "30px",
          marginBottom: "30px"
        }}>
          <div style={{
            fontSize: "3rem",
            fontWeight: "bold",
            color: "#00ff00",
            marginBottom: "10px"
          }}>
            750
          </div>
          <div style={{color: "#cccccc"}}>
            Sample Credit Score
          </div>
        </div>
        
        <button style={{
          background: "linear-gradient(45deg, #00ffff, #0066ff)",
          border: "none",
          color: "white",
          padding: "15px 40px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          borderRadius: "10px",
          cursor: "pointer",
          boxShadow: "0 5px 15px rgba(0,255,255,0.4)"
        }}>
          GET FULL ANALYSIS
        </button>
        
        <div style={{
          marginTop: "40px",
          color: "#666"
        }}>
          Platform Status: ✅ LIVE & READY
        </div>
      </div>
    </div>
  );
}

export default App;
