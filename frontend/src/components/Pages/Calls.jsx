import React, { useRef, useEffect, useState } from "react";

const Calls = ({ selectedUser, currentUser, socketRef }) => {
  const [callActive, setCallActive] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const iceConfig = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

  // --- WebRTC helpers ---
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(iceConfig);
    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: "ice",
            candidate: event.candidate,
            sender: currentUser,
            receiver: selectedUser,
          })
        );
      }
    };

    pc.onconnectionstatechange = () => {
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) {
        endCall(true);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const getMedia = async (withVideo) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: withVideo });
    localStreamRef.current = stream;
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    return stream;
  };

  const startCall = async (video = false) => {
    if (!selectedUser) return;
    setCallActive(true);
    setIsVideoCall(video);

    const pc = createPeerConnection();
    const stream = await getMedia(video);
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socketRef.current.send(
      JSON.stringify({
        type: "offer",
        sdp: offer,
        video,
        sender: currentUser,
        receiver: selectedUser,
      })
    );
  };

  const endCall = (silent = false) => {
    setCallActive(false);
    setIsVideoCall(false);

    if (!silent && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "hangup",
          sender: currentUser,
          receiver: selectedUser,
        })
      );
    }

    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      remoteStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    remoteStreamRef.current = null;
  };

  useEffect(() => () => endCall(true), []);

  return (
    <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
      {!callActive ? (
        <>
          <button onClick={() => startCall(false)} title="Voice Call">📞</button>
          <button onClick={() => startCall(true)} title="Video Call">🎥</button>
        </>
      ) : (
        <button onClick={() => endCall()} title="End Call" style={{ color: "red" }}>❌</button>
      )}

      {callActive && isVideoCall && (
        <div style={{ display: "flex", gap: 12 }}>
          <video ref={remoteVideoRef} autoPlay playsInline style={{ flex: 1, minHeight: 220, background: "#000" }} />
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: 160, height: 120, background: "#000" }} />
        </div>
      )}
    </div>
  );
};

export default Calls;
