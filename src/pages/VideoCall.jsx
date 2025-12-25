import { useEffect, useState } from "react";

function JoinVideoCall() {
  const [roomUrl, setRoomUrl] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get("roomUrl");
    if (url) setRoomUrl(url);
  }, []);

  const joinCall = () => {
    if (roomUrl) window.open(roomUrl, "_blank");
    else alert("Room URL missing");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#111827", color: "white", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "400px", background: "#1f2937", padding: "30px", borderRadius: "10px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Join Video Call</h1>
        <button onClick={joinCall} style={{ width: "100%", padding: "12px", background: "#16a34a", border: "none", color: "white", borderRadius: "6px", cursor: "pointer" }}>
          Join Video Call
        </button>
      </div>
    </div>
  );
}

export default JoinVideoCall;
