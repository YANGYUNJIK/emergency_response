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

  // 데이터 불러오기
  useEffect(() => {
    axios.get(BASE_URL).then((res) => setVehicles(res.data));
  }, []);

  // 카테고리 숫자 클릭 시 → 차량 한 대씩 추가
  const filterVehicles = (regionType, category) => {
    const isGyeongbuk = (v) =>
      v.시도 === "경북" && v.집결 === "O" && v.status === "대기";
    const isOthers = (v) => v.시도 !== "경북" && v.status === "대기";

    const filtered = vehicles.find((v) => {
      if (regionType === "경북") return isGyeongbuk(v) && v.차종 === category;
      if (regionType === "타시도") return isOthers(v) && v.차종 === category;
      return false;
    });

    if (!filtered) return;

    // 선택된 차량에 추가
    setSelectedVehicles((prev) => [...prev, filtered]);

    // 차량 상태를 출동대기로 업데이트
    setVehicles((prev) =>
      prev.map((v) =>
        v.AVL === filtered.AVL ? { ...v, status: "출동대기" } : v
      )
    );
    setSelectedCategory(category);
  };

  // 상태별 리스트
  const gyeongbuk = vehicles.filter(
    (v) => v.시도 === "경북" && v.집결 === "O" && v.status === "대기"
  );
  const others = vehicles.filter(
    (v) => v.시도 !== "경북" && v.status === "대기"
  );

  const countByCategory = (list, category) =>
    list.filter((v) => v.차종 === category).length;

  // 출동 실행
  const handleDispatch = async () => {
    for (const v of selectedVehicles) {
      await axios.put(`${BASE_URL}/${v.AVL}/status`, "출동", {
        headers: { "Content-Type": "text/plain" },
      });
    }
    alert("🚨 출동 처리 완료 (문자 전송은 추후 연동)");
  };

  // ✅ 차량 편성 초기화 함수
  const resetSelectedVehicles = () => {
    // 출동대기 상태였던 차량들을 다시 대기로
    const restoredVehicles = vehicles.map((v) =>
      v.status === "출동대기" ? { ...v, status: "대기" } : v
    );
    setVehicles(restoredVehicles);
    setSelectedVehicles([]);
    setSelectedCategory("");
    setContactInfo({ tel: "", address: "", content: "" });
  };

  const handleRemoveFromDispatch = (vehicle) => {
    // 1. 차량 편성 리스트에서 제거
    setSelectedVehicles((prev) => prev.filter((v) => v.AVL !== vehicle.AVL));

    // 2. 차량 상태를 다시 '대기'로 복원
    setVehicles((prev) =>
      prev.map((v) => (v.AVL === vehicle.AVL ? { ...v, status: "대기" } : v))
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🚒 차량 현황</h1>

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
                  key={v.AVL}
                  className={`cursor-pointer ${
                    selectedVehicleForDispatch?.AVL === v.AVL
                      ? "bg-yellow-200"
                      : ""
                  }`}
                  onClick={() => setSelectedVehicleForDispatch(v)}
                >
                  {/* 위 tr 수정 */}
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1 text-center">{v.시도}</td>
                  <td className="border px-2 py-1 text-center">{v.소방서}</td>
                  <td className="border px-2 py-1 text-center">{v.호출명}</td>
                  <td className="border px-2 py-1 text-center">{v.차종}</td>
                  <td className="border px-2 py-1 text-center">{v.용량}</td>
                  <td className="border px-2 py-1 text-center">{v.인원}</td>
                  <td className="border px-2 py-1 text-center">{v.AVL}</td>
                  <td className="border px-2 py-1 text-center">{v.PSLTE}</td>
                  <td className="border px-2 py-1 text-center">대기중</td>
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
              <button
                className="bg-blue-600 text-white py-2 rounded"
                onClick={handleDispatch}
              >
                🚀 출동
              </button>
              <div className="flex gap-2 mt-4">
                <button
                  className="bg-purple-600 text-white py-2 px-4 rounded disabled:bg-gray-400"
                  onClick={async () => {
                    if (selectedVehicleForDispatch) {
                      await axios.put(
                        `${BASE_URL}/${selectedVehicleForDispatch.AVL}/status`,
                        "출동",
                        {
                          headers: {
                            "Content-Type": "text/plain",
                          },
                        }
                      );
                      alert(
                        `🚨 ${selectedVehicleForDispatch.호출명} 차량이 출동 처리되었습니다.`
                      );
                      setSelectedVehicleForDispatch(null);
                    }
                  }}
                  disabled={!selectedVehicleForDispatch}
                >
                  🚀 출동(임시)
                </button>

                <button
                  className="bg-gray-600 text-white py-2 px-4 rounded"
                  onClick={() => {
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
