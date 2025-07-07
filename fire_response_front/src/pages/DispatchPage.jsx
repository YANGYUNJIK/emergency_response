import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/vehicles";
const CATEGORIES = [
  "경펌",
  "소펌",
  "중펌",
  "대펌",
  "중형탱크",
  "대형탱크",
  "급수탱크",
  "화학",
  "산불",
  "험지",
  "로젠바우어",
  "산불신속팀",
  "구조",
  "구급",
  "지휘조사",
  "굴절고가",
  "배연",
  "회복지원",
  "기타",
];

function DispatchPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVehicleForDispatch, setSelectedVehicleForDispatch] =
    useState(null);
  const [contactInfo, setContactInfo] = useState({
    tel: "",
    address: "",
    content: "",
  });

  // 1️⃣ 최초 데이터 불러오기
  useEffect(() => {
    axios.get(BASE_URL).then((res) => {
      setVehicles(res.data); // ✅ confirm 값은 그대로 유지
    });
  }, []);

  // 2️⃣ 카테고리 클릭 시 차량 선택
  const filterVehicles = (regionType, category) => {
    const isGyeongbuk = (v) =>
      v.province === "경북" && v.gathering === "O" && v.status === "대기";
    const isOthers = (v) => v.province !== "경북" && v.status === "대기";
    const alreadySelectedIds = new Set(selectedVehicles.map((v) => v.id));

    const filtered = vehicles.find((v) => {
      const isValid =
        regionType === "경북"
          ? isGyeongbuk(v) && v.vehicleType === category
          : regionType === "타시도"
          ? isOthers(v) && v.vehicleType === category
          : false;
      return isValid && !alreadySelectedIds.has(v.id);
    });

    if (!filtered) return;

    setSelectedVehicles((prev) => [...prev, filtered]);

    setVehicles((prev) =>
      prev.map((v) => (v.id === filtered.id ? { ...v, status: "출동대기" } : v))
    );
    setSelectedCategory(category);
  };

  const gyeongbuk = vehicles.filter(
    (v) => v.province === "경북" && v.gathering === "O" && v.status === "대기"
  );
  const others = vehicles.filter(
    (v) => v.province !== "경북" && v.status === "대기"
  );

  const countByCategory = (list, category) =>
    list.filter((v) => v.vehicleType === category).length;

  // 정규화
  const normalizePhoneNumber = (raw) => {
    const digits = raw.replace(/\D/g, ""); // 숫자만 추출
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3"); // 010-1234-5678
    }
    return digits; // fallback
  };

  // 3️⃣ 출동 버튼
  const handleDispatch = async () => {
    try {
      for (const v of selectedVehicles) {
        const confirmLink = `https://fireresponse.netlify.app/dispatch-confirm?avl=${v.AVL}`;

        const message = `📍 출동 정보
📞 연락처: ${contactInfo.tel}
📍 주소: ${contactInfo.address}
📝 내용: ${contactInfo.content}
✅ 출동 확인: ${confirmLink}`;

        await axios.put(`${BASE_URL}/${v.id}/confirm`, "확인중", {
          headers: { "Content-Type": "text/plain" },
        });

        await axios.post("http://localhost:8080/sms/send", {
          phoneNumber: normalizePhoneNumber(v.AVL),
          message: `[${v.callSign}] 차량\n${message}`,
        });
      }

      alert("✅ 출동 문자 전송 완료");
    } catch (err) {
      console.error("❌ 문자 전송 실패", err);
      alert("출동 문자 전송 중 오류 발생");
    }
  };

  // 4️⃣ 편성 초기화
  const resetSelectedVehicles = () => {
    const restoredVehicles = vehicles.map((v) =>
      selectedVehicles.some((sel) => sel.id === v.id)
        ? {
            ...v,
            status: v.confirm === "성공" ? "출동" : "대기",
          }
        : v
    );

    setVehicles(restoredVehicles);
    setSelectedVehicles([]);
    setSelectedCategory("");
    setContactInfo({ tel: "", address: "", content: "" });
  };

  // 5️⃣ 편성에서 제거
  const handleRemoveFromDispatch = (vehicle) => {
    setSelectedVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));

    setVehicles((prev) =>
      prev.map((v) => (v.id === vehicle.id ? { ...v, status: "대기" } : v))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🚒 차량 현황</h1>

      {/* 현황 테이블 */}
      <table className="w-full table-auto border-collapse mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">구분</th>
            <th className="border px-2 py-1">계</th>
            {CATEGORIES.map((cat) => (
              <th key={cat} className="border px-2 py-1">
                {cat}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {["경북", "타시도"].map((region) => {
            const list = region === "경북" ? gyeongbuk : others;
            return (
              <tr
                key={region}
                className={region === "경북" ? "bg-blue-100" : "bg-orange-100"}
              >
                <td className="border px-2 py-1 text-center">{region} 대기</td>
                <td className="border px-2 py-1 text-center">{list.length}</td>
                {CATEGORIES.map((cat) => (
                  <td
                    key={cat}
                    className="border px-2 py-1 text-center cursor-pointer hover:bg-yellow-100"
                    onClick={() => filterVehicles(region, cat)}
                  >
                    {countByCategory(list, cat)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 차량 편성 */}
      {selectedVehicles.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">
              🚐 차량 편성: {selectedCategory}
            </h2>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={resetSelectedVehicles}
            >
              🔄 차량편성 초기화
            </button>
          </div>

          <table className="w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">연번</th>
                <th className="border px-2 py-1">시도</th>
                <th className="border px-2 py-1">소방서</th>
                <th className="border px-2 py-1">호출명</th>
                <th className="border px-2 py-1">차종</th>
                <th className="border px-2 py-1">용량</th>
                <th className="border px-2 py-1">인원</th>
                <th className="border px-2 py-1">AVL</th>
                <th className="border px-2 py-1">PSLTE</th>
                <th className="border px-2 py-1">출동문자확인</th>
              </tr>
            </thead>
            <tbody>
              {selectedVehicles.map((v, i) => (
                <tr
                  key={v.id}
                  className={`cursor-pointer ${
                    selectedVehicleForDispatch?.id === v.id
                      ? "bg-yellow-200"
                      : ""
                  }`}
                  onClick={() => handleRemoveFromDispatch(v)}
                >
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1 text-center">{v.province}</td>
                  <td className="border px-2 py-1 text-center">{v.station}</td>
                  <td className="border px-2 py-1 text-center">{v.capacity}</td>
                  <td className="border px-2 py-1 text-center">
                    {v.vehicleType}
                  </td>
                  <td className="border px-2 py-1 text-center">{v.capacity}</td>
                  <td className="border px-2 py-1 text-center">
                    {v.personnel}
                  </td>
                  <td className="border px-2 py-1 text-center">{v.AVL}</td>
                  <td className="border px-2 py-1 text-center">{v.PSLTE}</td>
                  <td
                    className="border px-2 py-1 text-center cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation(); // 차량 제거 클릭 방지

                      if (v.confirm === "확인중") {
                        try {
                          await axios.put(
                            `${BASE_URL}/${v.id}/confirm`,
                            "성공",
                            {
                              headers: { "Content-Type": "text/plain" },
                            }
                          );
                          await axios.put(
                            `${BASE_URL}/${v.id}/status`,
                            "출동",
                            {
                              headers: { "Content-Type": "text/plain" },
                            }
                          );

                          setVehicles((prev) =>
                            prev.map((v2) =>
                              v2.id === v.id
                                ? { ...v2, confirm: "성공", status: "출동" }
                                : v2
                            )
                          );
                        } catch (error) {
                          console.error("확인 처리 실패", error);
                          alert("🚨 확인 처리 중 오류 발생");
                        }
                      }
                    }}
                  >
                    {v.confirm === null || v.confirm === ""
                      ? "미전송"
                      : v.confirm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 출동 장소 입력 */}
          <div className="mt-6 border p-4 rounded bg-gray-50">
            <h3 className="text-md font-bold mb-2">📍 출동 장소</h3>
            <div className="flex flex-col gap-2">
              <input
                className="border p-2"
                placeholder="연락처"
                value={contactInfo.tel}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, tel: e.target.value })
                }
              />
              <input
                className="border p-2"
                placeholder="주소"
                value={contactInfo.address}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, address: e.target.value })
                }
              />
              <input
                className="border p-2"
                placeholder="출동 내용"
                value={contactInfo.content}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, content: e.target.value })
                }
              />

              {/* 하단 버튼 */}
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-blue-600 text-white py-2 px-4 rounded"
                  onClick={handleDispatch}
                >
                  🚀 출동
                </button>
                <button
                  className="bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => {
                    const restored = vehicles.map((v) =>
                      selectedVehicles.some((sel) => sel.id === v.id)
                        ? {
                            ...v,
                            status: v.confirm === "성공" ? "출동" : "대기",
                          }
                        : v
                    );
                    setVehicles(restored);
                    setSelectedVehicles([]);
                    setSelectedCategory("");
                    setContactInfo({ tel: "", address: "", content: "" });
                    setSelectedVehicleForDispatch(null);
                  }}
                >
                  🛑 종료
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DispatchPage;
