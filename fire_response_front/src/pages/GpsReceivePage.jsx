// src/pages/GpsReceivePage.jsx

import { useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // ✅ 추가

function GpsReceivePage() {
  const { vehicleId } = useParams(); // ✅ URL 경로에서 추출
  const sentRef = useRef(false); // ✅ 중복 방지

  useEffect(() => {
    if (sentRef.current) return;

    if (!vehicleId) {
      alert("❗ 유효하지 않은 접근입니다.");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          const data = {
            vehicleId: parseInt(vehicleId),
            lat: latitude,
            lng: longitude,
          };

          axios
            .post("http://localhost:8080/gps/receive", data)
            .then(() => alert("📍 위치 정보가 전송되었습니다!"))
            .catch(() => alert("🚨 위치 전송 실패!"));

          sentRef.current = true; // ✅ 한 번만 실행
        },
        (error) => {
          console.error("위치 정보 획득 실패", error);
          alert("위치 정보를 가져올 수 없습니다.");
        }
      );
    } else {
      alert("이 브라우저는 GPS를 지원하지 않습니다.");
    }
  }, [vehicleId]);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold">📡 GPS 위치 전송 중...</h1>
      <p>브라우저에서 위치 정보 접근을 허용해주세요.</p>
    </div>
  );
}

export default GpsReceivePage;
