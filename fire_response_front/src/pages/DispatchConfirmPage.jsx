import { useEffect, useState } from "react";
import axios from "axios";

function DispatchConfirmPage() {
  const [statusMsg, setStatusMsg] = useState("🚒 출동 확인 처리 중...");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const avl = query.get("avl");

    if (!avl) {
      setStatusMsg("❌ 잘못된 접근입니다. (AVL 없음)");
      return;
    }

    // 백엔드에 상태 '출동'으로 요청
    axios
      .put(`http://localhost:8080/vehicles/avl/${avl}/status`, "출동", {
        headers: { "Content-Type": "text/plain" },
      })
      .then(() => {
        setStatusMsg("✅ 출동이 확인되었습니다. 감사합니다.");
      })
      .catch((err) => {
        console.error(err);
        setStatusMsg("❌ 출동 상태 변경에 실패했습니다.");
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">📡 출동 확인</h1>
      <p className="text-lg">{statusMsg}</p>
    </div>
  );
}

export default DispatchConfirmPage;
