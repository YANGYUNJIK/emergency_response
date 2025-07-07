import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";

const BASE_URL = "http://localhost:8080/vehicles"; // 백엔드 주소

// 전화번호 포맷 (000-000-0000)
function formatPhoneNumber(input) {
  const digits = input.replace(/\D/g, "").slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function RegisterPage() {
  const [inputs, setInputs] = useState({
    province: "",
    station: "",
    vehicleType: "",
    callSign: "",
    capacity: "",
    personnel: "",
    AVL: "",
    PSLTE: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [primarySearch, setPrimarySearch] = useState(""); // 1차 검색
  const [secondarySearch, setSecondarySearch] = useState(""); // 2차 검색
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 여부
  const [editTargetId, setEditTargetId] = useState(""); // 수정할 차량의 AVL
  // 수정 모달을 위한
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState(null);
  const [gpsAgreedIds, setGpsAgreedIds] = useState([]); // Gps 동의 차량

  useEffect(() => {
    // 차량 목록 가져오기
    axios
      .get(BASE_URL)
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("불러오기 실패:", err));

    // ✅ GPS 동의한 차량 ID 목록 가져오기
    axios
      .get("http://localhost:8080/gps/all")
      .then((res) => {
        const ids = res.data.map((item) => item.id); // vehicleId = id
        setGpsAgreedIds(ids);
      })
      .catch((err) => console.error("GPS 정보 불러오기 실패:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "AVL" || name === "PSLTE") {
      setInputs((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else if (name === "personnel") {
      const onlyNumbers = value.replace(/\D/g, "");
      setInputs((prev) => ({ ...prev, personnel: onlyNumbers }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedAvl = formatPhoneNumber(inputs.AVL);

    if (formattedAvl) {
      const isDuplicateAvl = vehicles.some((v) => v.AVL === formattedAvl);
      if (isDuplicateAvl) {
        alert("❌ 이미 등록된 AVL 번호입니다!");
        return;
      }
    }

    const gathering = inputs.province === "경북" ? "X" : "O";
    const vehicleData = {
      ...inputs,
      AVL: formattedAvl, // ✅ 포맷된 AVL 사용
      gathering,
      status: "대기",
    };

    if (isEditMode) {
      // 🔄 수정 모드
      axios
        .put(`${BASE_URL}/${editTargetId}`, vehicleData)
        .then(() => {
          setVehicles((prev) =>
            prev.map((v) =>
              v.id === editTargetId ? { ...vehicleData, id: editTargetId } : v
            )
          );
          alert("🚨 수정 완료되었습니다!");
          resetForm();
        })
        .catch((err) => {
          console.error("수정 실패:", err);
        });
    } else {
      // 🆕 등록 모드
      axios
        .post(BASE_URL, vehicleData)
        .then((res) => {
          setVehicles((prev) => [...prev, res.data]);
          resetForm();
        })
        .catch((err) => {
          console.error("등록 실패:", err);
          console.log("▶ 전송된 vehicle 데이터:", vehicleData);
        });
    }
  };

  const resetForm = () => {
    setInputs({
      province: "",
      station: "",
      vehicleType: "",
      callSign: "",
      capacity: "",
      personnel: "",
      AVL: "",
      PSLTE: "",
    });
    setEditTargetId("");
    setIsEditMode(false);
  };

  const handleEdit = (vehicle) => {
    setEditVehicleData(vehicle);
    setEditModalVisible(true);
    setEditTargetId(vehicle.id);
  };

  const handleEditSave = (updatedVehicle) => {
    const formattedAvl = formatPhoneNumber(updatedVehicle.AVL || "");

    if (
      formattedAvl &&
      vehicles.some((v) => v.id !== updatedVehicle.id && v.AVL === formattedAvl)
    ) {
      alert("❌ 다른 차량과 중복된 AVL 번호입니다.");
      return;
    }

    axios
      .put(`${BASE_URL}/${updatedVehicle.id}`, {
        ...updatedVehicle,
        AVL: formattedAvl,
      })
      .then(() => {
        setVehicles((prev) =>
          prev.map((v) =>
            v.id === updatedVehicle.id
              ? { ...updatedVehicle, AVL: formattedAvl }
              : v
          )
        );
        alert("✅ 수정 완료!");
        setEditModalVisible(false);
        setEditVehicleData(null);
      })
      .catch((err) => {
        console.error("수정 실패:", err);
      });
  };

  // 일괄 철수 핸들러 예시
  const handleRetreatAll = () => {
    const confirmRetreat = window.confirm(
      "⚠ 정말 전체 차량을 철수 상태로 변경하시겠습니까?"
    );
    if (!confirmRetreat) return;

    axios
      .put(`${BASE_URL}/status/all`, JSON.stringify("철수"), {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        return axios.get(BASE_URL);
      })
      .then((res) => {
        const validVehicles = res.data.filter(
          (v) => v && v.id && v.province && v.vehicleType && v.callSign // 최소 유효성 검사
        );
        setVehicles(validVehicles);
      })
      .catch((err) => {
        console.error("일괄 철수 실패:", err);
        alert("❌ 일괄 철수 실패");
      });
  };

  // 일괄 철수 핸들러 예시
  const handleRetreatAll2 = () => {
    const confirmRetreat = window.confirm(
      "⚠ 정말 전체 차량을 대기 상태로 변경하시겠습니까?"
    );
    if (!confirmRetreat) return;

    axios
      .put(`${BASE_URL}/status/all`, JSON.stringify("대기"), {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        return axios.get(BASE_URL);
      })
      .then((res) => {
        const validVehicles = res.data.filter(
          (v) => v && v.id && v.province && v.vehicleType && v.callSign // 최소 유효성 검사
        );
        setVehicles(validVehicles);
      })
      .catch((err) => {
        console.error("일괄 대기 실패:", err);
        alert("❌ 일괄 대기 실패");
      });
  };

  const handleStatusChange = (id, newStatus) => {
    axios
      .put(`${BASE_URL}/${id}/status`, JSON.stringify(newStatus), {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setVehicles((prev) =>
          prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
        );
      })
      .catch((err) => console.error("상태 변경 실패:", err));
  };

  const handleSendSms = (vehicle) => {
    const phoneNumber = vehicle.AVL; // 또는 vehicle.PSLTE
    if (!phoneNumber) {
      alert(`[${vehicle.callSign}] 전화번호가 없습니다.`);
      return;
    }

    axios
      .post("http://localhost:8080/sms/send", {
        phoneNumber,
        vehicleId: vehicle.id,
      })
      .then(() => {
        alert(`[${vehicle.callSign}] 문자 전송 완료!`);
      })
      .catch((err) => {
        console.error("문자 전송 실패:", err);
        alert(`[${vehicle.callSign}] 문자 전송 실패!`);
      });
  };

  const handleDelete = (id) => {
    const target = vehicles.find((v) => v.id === id);
    const confirmDelete = window.confirm(
      `[${target.callSign}] 차량 정보를 삭제하시겠습니까?`
    );

    if (confirmDelete) {
      axios
        .delete(`${BASE_URL}/${id}`)
        .then(() => {
          setVehicles((prev) => prev.filter((v) => v.id !== id));
        })
        .catch((err) => console.error("삭제 실패:", err));
    }
  };

  const handleGatheringToggle = async (targetId) => {
    const updatedList = vehicles.map((v) =>
      v.id === targetId
        ? { ...v, gathering: v.gathering === "O" ? "X" : "O" }
        : v
    );
    setVehicles(updatedList);

    const updated = updatedList.find((v) => v.id === targetId);

    try {
      await axios.put(
        `${BASE_URL}/${targetId}/gathering`,
        JSON.stringify(updated.gathering),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("집결 상태 업데이트 실패", error);
    }
  };
  // here
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row) => {
        const province = row["시도"] || "";
        return {
          province,
          station: row["소방서"] || "",
          vehicleType: row["차종"] || "",
          callSign: row["호출명"] || "",
          capacity: row["용량"] || "",
          personnel: row["인원"] || "",
          AVL: formatPhoneNumber(row["AVL"] || ""),
          PSLTE: formatPhoneNumber(row["PSLTE"] || ""),
          gathering: province === "경북" ? "X" : "O",
          status: "대기",
        };
      });

      // ✅ 중복 제거
      const existingAvlSet = new Set(vehicles.map((v) => v.AVL));
      const existingPslteSet = new Set(vehicles.map((v) => v.PSLTE));
      const deduplicated = formattedData.filter(
        (item) =>
          (!item.AVL || !existingAvlSet.has(item.AVL)) &&
          (!item.PSLTE || !existingPslteSet.has(item.PSLTE))
      );

      const duplicateCount = formattedData.length - deduplicated.length;

      if (deduplicated.length === 0) {
        alert("❌ 중복된 데이터입니다. 등록할 항목이 없습니다.");
        return;
      }

      try {
        // ✅ Promise.all로 서버 응답 데이터를 수집
        const savedVehicles = await Promise.all(
          deduplicated.map((vehicle) =>
            axios.post(BASE_URL, vehicle).then((res) => res.data)
          )
        );

        setVehicles((prev) => [...prev, ...savedVehicles]);

        alert(
          `📂 엑셀 업로드 완료!\n✅ 등록: ${savedVehicles.length}개\n❌ 중복 제외: ${duplicateCount}개`
        );
      } catch (err) {
        console.error("엑셀 업로드 중 오류:", err);
        alert("❌ 일부 또는 전체 데이터 등록 실패");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // 여기야~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const filteredVehicles = vehicles.filter((v) => {
    const keyword1 = primarySearch.toLowerCase();
    const keyword2 = secondarySearch.toLowerCase();

    const matchPrimary =
      (v.province?.toLowerCase() || "").includes(keyword1) ||
      (v.station?.toLowerCase() || "").includes(keyword1) ||
      (v.vehicleType?.toLowerCase() || "").includes(keyword1) ||
      (v.status?.toLowerCase() || "").includes(keyword1);

    const matchSecondary =
      (v.province?.toLowerCase() || "").includes(keyword2) ||
      (v.station?.toLowerCase() || "").includes(keyword2) ||
      (v.vehicleType?.toLowerCase() || "").includes(keyword2) ||
      (v.status?.toLowerCase() || "").includes(keyword2);

    return matchPrimary && matchSecondary;
  });

  return (
    <>
      {/* ✅ 수정 모달 */}
      <EditModal
        visible={editModalVisible}
        vehicle={editVehicleData}
        onClose={() => setEditModalVisible(false)}
        onSave={handleEditSave}
      />

      {/* 기존 페이지 내용 */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">📋 동원소방력 등록</h1>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "시도", name: "province" },
            { label: "소방서", name: "station" },
            { label: "차종", name: "vehicleType" },
            { label: "호출명", name: "callSign" },
            { label: "용량", name: "capacity" },
            { label: "인원", name: "personnel" },
            { label: "AVL", name: "AVL" },
            { label: "PSLTE", name: "PSLTE" },
          ].map(({ label, name }) => (
            <input
              key={name}
              name={name} // ✅ 이제 일치함
              placeholder={
                name === "PSLTE"
                  ? "PS-LTE 번호"
                  : name === "AVL"
                  ? "AVL 단말기 번호"
                  : label
              }
              value={inputs[name]}
              onChange={handleChange}
              className="border p-2 w-40"
              maxLength={name === "PSLTE" ? 13 : undefined}
            />
          ))}

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            등록
          </button>

          {/* {isEditMode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              취소
            </button>
          )} */}

          <button
            type="button"
            onClick={() => document.getElementById("excelInput").click()}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            📂 엑셀 업로드
          </button>
          <button
            type="button"
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            📂 GPS 동의 문자(전체)
          </button>
          <button
            type="button" // ✅ 이걸 꼭 넣어주세요!
            onClick={handleRetreatAll}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            🚨 상황 종료
          </button>

          <button
            type="button" // ✅ 이걸 꼭 넣어주세요!
            onClick={handleRetreatAll2}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            🚨 일괄 대기
          </button>
          <input
            id="excelInput"
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelUpload}
            className="hidden"
          />
        </form>

        <div className="mb-6 space-y-2">
          <input
            type="text"
            placeholder="1차 검색"
            value={primarySearch}
            onChange={(e) => setPrimarySearch(e.target.value)}
            className="border p-2 w-60 mr-2"
          />
          <input
            type="text"
            placeholder="2차 검색"
            value={secondarySearch}
            onChange={(e) => setSecondarySearch(e.target.value)}
            className="border p-2 w-60"
          />
        </div>

        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">연번</th>
              <th className="border px-2 py-1">시도</th>
              <th className="border px-2 py-1">소방서</th>
              <th className="border px-2 py-1">차종</th>
              <th className="border px-2 py-1">호출명</th>
              <th className="border px-2 py-1">용량</th>
              <th className="border px-2 py-1">인원</th>
              <th className="border px-2 py-1">AVL</th>
              <th className="border px-2 py-1">PSLTE</th>
              <th className="border px-2 py-1">상태</th>
              <th className="border px-2 py-1">자원집결지</th>
              <th className="border px-2 py-1">작업</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v, index) => {
              const isGpsAgreed = gpsAgreedIds.includes(v.id); // ✅ GPS 동의 여부 확인
              return (
                <tr
                  key={v.id}
                  className={isGpsAgreed ? "bg-green-100" : ""} // ✅ 동의한 차량은 배경색 적용
                >
                  <td className="border px-2 py-1 text-center">{index + 1}</td>
                  <td className="border px-2 py-1 text-center">{v.province}</td>
                  <td className="border px-2 py-1 text-center">{v.station}</td>
                  <td className="border px-2 py-1 text-center">
                    {v.vehicleType}
                  </td>
                  <td className="border px-2 py-1 text-center">{v.callSign}</td>
                  <td className="border px-2 py-1 text-center">{v.capacity}</td>
                  <td className="border px-2 py-1 text-center">
                    {v.personnel}
                  </td>
                  <td className="border px-2 py-1 text-center">{v.AVL}</td>
                  <td className="border px-2 py-1 text-center">{v.PSLTE}</td>
                  <td className="border px-2 py-1 text-center">{v.status}</td>
                  <td
                    className="border px-2 py-1 text-center cursor-pointer"
                    onClick={() => handleGatheringToggle(v.id)}
                  >
                    {v.gathering}
                  </td>
                  <td className="border px-2 py-1 text-center space-x-1">
                    <button
                      onClick={() => handleStatusChange(v.id, "대기")}
                      className="bg-purple-500 text-white px-2 py-1 rounded"
                    >
                      대기
                    </button>
                    <button
                      onClick={() => handleStatusChange(v.id, "도착")}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      도착
                    </button>
                    <button
                      onClick={() => handleStatusChange(v.id, "철수")}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      철수
                    </button>
                    <button
                      onClick={() => handleEdit(v)}
                      className="bg-blue-400 text-white px-2 py-1 rounded"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleSendSms(v)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      문자
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="bg-gray-500 text-white px-2 py-1 rounded"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// 👇 이 위치에 붙여 넣으세요
function EditModal({ visible, vehicle, onClose, onSave }) {
  const [editInputs, setEditInputs] = useState(vehicle || {});

  useEffect(() => {
    setEditInputs(vehicle || {});
  }, [vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "personnel") {
      const onlyNumbers = value.replace(/\D/g, "");
      setEditInputs((prev) => ({ ...prev, personnel: onlyNumbers }));
    } else if (name === "PSLTE" || name === "AVL") {
      setEditInputs((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setEditInputs((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow w-[400px] relative">
        <h2 className="text-xl font-semibold mb-4">🚨 차량 정보 수정</h2>

        {[
          "province",
          "station",
          "vehicleType",
          "callSign",
          "capacity",
          "personnel",
          "AVL",
          "PSLTE",
        ].map((field) => (
          <input
            key={field}
            name={field}
            placeholder={field}
            value={editInputs[field] || ""}
            onChange={handleChange}
            className="border p-2 w-full mb-2"
            maxLength={field === "AVL" || field === "PSLTE" ? 13 : undefined}
          />
        ))}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => onSave(editInputs)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            수정 완료
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
