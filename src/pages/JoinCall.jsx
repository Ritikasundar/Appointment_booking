import { useEffect, useRef, useState } from "react";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "36a8711c6a374888bf3de28263b4b482";

function JoinCall() {
  const [channel, setChannel] = useState("");
  const [token, setToken] = useState("");
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]); // Track users in call

  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);

  // ✅ Read channel & token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setChannel(params.get("channel") || "");
    setToken(params.get("token") || "");
  }, []);

  // ✅ Initialize Agora client
  const initializeClient = async () => {
    const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    client.on("user-published", async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === "audio") {
        user.audioTrack.play();
      }

      // Add user to remoteUsers state
      setRemoteUsers((prev) => [...prev, { uid: user.uid }]);
    });

    client.on("user-unpublished", (user) => {
      // Remove user from remoteUsers state
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    });

    clientRef.current = client;
  };

  // ✅ Join audio call
  const joinCall = async () => {
    if (!channel || !token) {
      alert("Missing channel or token");
      return;
    }

    try {
      await initializeClient();

      await clientRef.current.join(APP_ID, channel, token, null);

      localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
      await clientRef.current.publish([localAudioTrackRef.current]);

      setJoined(true);
      console.log("🎧 Joined audio call");
    } catch (err) {
      console.error("Join failed:", err);
      alert("Failed to join call");
    }
  };

  // ✅ Leave audio call
  const leaveCall = async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      }

      await clientRef.current.leave();

      setJoined(false);
      setRemoteUsers([]); // Clear users when leaving
      console.log("👋 Left call");
    } catch (err) {
      console.error("Leave failed:", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111827",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "400px",
          background: "#1f2937",
          padding: "30px",
          borderRadius: "10px",
        }}
      >
        <h1
          style={{ fontSize: "24px", textAlign: "center", marginBottom: "20px" }}
        >
          Join Audio Call
        </h1>

        <input value={channel} disabled placeholder="Channel" style={inputStyle} />
        <input
          value={token}
          disabled
          placeholder="Token"
          style={{ ...inputStyle, marginTop: "10px" }}
        />

        {!joined ? (
          <button style={joinBtn} onClick={joinCall}>
            Join Call
          </button>
        ) : (
          <button style={leaveBtn} onClick={leaveCall}>
            Leave Call
          </button>
        )}

        {joined && (
          <div style={{ marginTop: "20px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>Users in Call:</h2>
            <ul>
              {/* Show local user */}
              <li key="local">You (Local User)</li>
              {/* Show remote users */}
              {remoteUsers.map((user) => (
                <li key={user.uid}>User {user.uid}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  background: "#374151",
  border: "none",
  color: "white",
  borderRadius: "6px",
};

const joinBtn = {
  width: "100%",
  padding: "12px",
  marginTop: "20px",
  background: "#2563eb",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
};

const leaveBtn = {
  width: "100%",
  padding: "12px",
  marginTop: "20px",
  background: "#6b7280",
  border: "none",
  color: "white",
  borderRadius: "6px",
  cursor: "pointer",
};

export default JoinCall;
