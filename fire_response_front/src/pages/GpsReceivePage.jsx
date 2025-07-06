// src/pages/GpsReceivePage.jsx
import { useEffect } from "react";
import axios from "axios";

function GpsReceivePage() {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const vehicleId = searchParams.get("vehicleId"); // 예: ?vehicleId=3

    if (!vehicleId) {
      alert("❗ 유효하지 않은 접근입니다.");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const data = {
            vehicleId: parseInt(vehicleId), // number로 전송
            lat: latitude,
            lng: longitude,
          };

          axios
            .post("http://localhost:8080/gps/receive", data)
            .then(() => alert("📍 위치 정보가 전송되었습니다!"))
            .catch(() => alert("🚨 위치 전송 실패!"));
        },
        (error) => {
          console.error("위치 정보 획득 실패", error);
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저는 GPS를 지원하지 않습니다.");
    }
  }, []);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">📡 GPS 위치 전송 중...</h1>
      <p>브라우저에서 위치 정보 접근을 허용해주세요.</p>
    </div>
  );
}

export default GpsReceivePage;
