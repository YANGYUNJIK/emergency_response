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
    시도: "",
    소방서: "",
    차종: "",
    호출명: "",
    용량: "",
    인원: "",
    AVL: "",
    PSLTE: "",
  });

  const [vehicles, setVehicles] = useState([]);
  const [primarySearch, setPrimarySearch] = useState(""); // 1차 검색
  const [secondarySearch, setSecondarySearch] = useState(""); // 2차 검색
  const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 여부
  const [editTargetAvl, setEditTargetAvl] = useState(""); // 수정할 차량의 AVL
  // 수정 모달을 위한
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editVehicleData, setEditVehicleData] = useState(null);

  useEffect(() => {
    axios
      .get(BASE_URL)
      .then((res) => setVehicles(res.data))
      .catch((err) => console.error("불러오기 실패:", err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "AVL" || name === "PSLTE") {
      setInputs((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setInputs((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "인원") {
      const onlyNumbers = value.replace(/\D/g, ""); // 숫자만 남기기
      setInputs((prev) => ({ ...prev, [name]: onlyNumbers }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!inputs.AVL || inputs.AVL.trim() === "") {
      alert("🚨 AVL 번호를 입력해야 합니다.");
      return;
    }

    const 집결 = inputs.시도 === "경북" ? "X" : "O";
    const vehicleData = {
      ...inputs,
      집결,
      status: "대기", // 항상 초기화
    };

    if (isEditMode) {
      // 🔄 수정 모드
      axios
        .put(`${BASE_URL}/${editTargetAvl}`, vehicleData)
        .then(() => {
          setVehicles((prev) =>
            prev.map((v) => (v.AVL === editTargetAvl ? { ...vehicleData } : v))
          );
          alert("🚨 수정 완료되었습니다!");
          resetForm();
        })
        .catch((err) => {
          console.error("수정 실패:", err);
        });
    } else {
      // 🆕 등록 모드
      if (vehicles.some((v) => v.AVL === formatPhoneNumber(inputs.AVL))) {
        alert("❌ 이미 등록된 AVL 번호입니다!");
        return;
      }

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
      시도: "",
      소방서: "",
      차종: "",
      호출명: "",
      용량: "",
      인원: "",
      AVL: "",
      PSLTE: "",
    });
    setEditTargetAvl("");
    setIsEditMode(false);
  };

  // const handleEdit = (vehicle) => {
  //   setInputs({
  //     시도: vehicle.시도,
  //     소방서: vehicle.소방서,
  //     차종: vehicle.차종,
  //     호출명: vehicle.호출명,
  //     용량: vehicle.용량,
  //     인원: vehicle.인원,
  //     AVL: vehicle.AVL,
  //     PSLTE: vehicle.PSLTE,
  //   });
  //   setEditTargetAvl(vehicle.AVL);
  //   setIsEditMode(true); // 수정 모드 ON
  // };

  const handleEdit = (vehicle) => {
    setEditVehicleData(vehicle);
    setEditModalVisible(true);
  };

  const handleEditSave = (updatedVehicle) => {
    axios
      .put(`${BASE_URL}/${updatedVehicle.AVL}`, updatedVehicle)
      .then(() => {
        setVehicles((prev) =>
          prev.map((v) =>
            v.AVL === updatedVehicle.AVL ? { ...updatedVehicle } : v
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

  const handleStatusChange = (avl, newStatus) => {
    axios
      .put(`${BASE_URL}/${avl}/status`, JSON.stringify(newStatus), {
        headers: { "Content-Type": "application/json" },
      })
      .then(() => {
        setVehicles((prev) =>
          prev.map((v) => (v.AVL === avl ? { ...v, status: newStatus } : v))
        );
      })
      .catch((err) => console.error("상태 변경 실패:", err));
  };

  const handleDelete = (avl) => {
    const target = vehicles.find((v) => v.AVL === avl);
    const confirmDelete = window.confirm(
      `[${target.호출명}] 차량 정보를 삭제하시겠습니까?`
    );

    if (confirmDelete) {
      axios
        .delete(`${BASE_URL}/${avl}`)
        .then(() => {
          setVehicles((prev) => prev.filter((v) => v.AVL !== avl));
        })
        .catch((err) => console.error("삭제 실패:", err));
    }
  };

  const handleJipgyeolToggle = async (targetAvl) => {
    const updatedList = vehicles.map((v) =>
      v.AVL === targetAvl ? { ...v, 집결: v.집결 === "O" ? "X" : "O" } : v
    );
    setVehicles(updatedList);

    const updated = updatedList.find((v) => v.AVL === targetAvl);

    try {
      await axios.put(
        `${BASE_URL}/${targetAvl}/jipgyeol`,
        JSON.stringify(updated.집결),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("집결 상태 업데이트 실패", error);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const formattedData = jsonData.map((row, index) => {
        const 시도 = row["시도"] || "";
        return {
          id: vehicles.length + index + 1,
          시도,
          소방서: row["소방서"] || "",
          차종: row["차종"] || "",
          호출명: row["호출명"] || "",
          용량: row["용량"] || "",
          인원: row["인원"] || "",
          AVL: formatPhoneNumber(row["AVL"] || ""),
          PSLTE: formatPhoneNumber(row["PSLTE"] || ""),
          집결: 시도 === "경북" ? "X" : "O",
          status: "대기",
        };
      });

      formattedData.forEach((vehicle) => {
        axios
          .post(BASE_URL, vehicle)
          .catch((err) => console.error("DB 저장 실패:", err));
      });

      setVehicles((prev) => [...prev, ...formattedData]);
    };

    reader.readAsArrayBuffer(file);
  };

  // 여기야~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const filteredVehicles = vehicles.filter((v) => {
    const keyword1 = primarySearch.toLowerCase();
    const keyword2 = secondarySearch.toLowerCase();

    const matchPrimary =
      v.시도.toLowerCase().includes(keyword1) ||
      v.소방서.toLowerCase().includes(keyword1) ||
      v.차종.toLowerCase().includes(keyword1) ||
      v.status.toLowerCase().includes(keyword1);

    const matchSecondary =
      v.시도.toLowerCase().includes(keyword2) ||
      v.소방서.toLowerCase().includes(keyword2) ||
      v.status.toLowerCase().includes(keyword2) ||
      v.차종.toLowerCase().includes(keyword2);

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
          {["시도", "소방서", "차종", "호출명", "용량", "인원", "PSLTE"].map(
            (field) => (
              <input
                key={field}
                name={field}
                placeholder={field === "PSLTE" ? "PS-LTE 번호" : field}
                value={inputs[field]}
                onChange={handleChange}
                className="border p-2 w-40"
                maxLength={field === "PSLTE" ? 13 : undefined}
              />
            )
          )}

          {/* 🔒 AVL 필드: 수정 모드일 때 비활성화 + 안내문구 추가 */}
          <div className="flex flex-col">
            <input
              name="AVL"
              placeholder="AVL단말기번호"
              value={inputs["AVL"]}
              onChange={handleChange}
              disabled={isEditMode}
              className={`border p-2 w-40 ${
                isEditMode ? "bg-gray-200 text-gray-600 cursor-not-allowed" : ""
              }`}
              maxLength={13}
              title={isEditMode ? "수정할 수 없습니다" : ""}
            />
            {isEditMode && (
              <small className="text-gray-500 mt-1">
                고유 식별번호(AVL)는 수정할 수 없습니다. <br />
                변경 시 삭제 후 재등록 해주세요.
              </small>
            )}
          </div>

          <button
            type="submit"
            className={`${
              isEditMode ? "bg-green-600" : "bg-blue-500"
            } text-white px-4 py-2 rounded`}
          >
            {isEditMode ? "수정 완료" : "등록"}
          </button>

          {isEditMode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              취소
            </button>
          )}

          <button
            type="button"
            onClick={() => document.getElementById("excelInput").click()}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            📂 엑셀 업로드
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
            {filteredVehicles.map((v, index) => (
              <tr key={v.AVL}>
                <td className="border px-2 py-1 text-center">{index + 1}</td>
                <td className="border px-2 py-1 text-center">{v.시도}</td>
                <td className="border px-2 py-1 text-center">{v.소방서}</td>
                <td className="border px-2 py-1 text-center">{v.차종}</td>
                <td className="border px-2 py-1 text-center">{v.호출명}</td>
                <td className="border px-2 py-1 text-center">{v.용량}</td>
                <td className="border px-2 py-1 text-center">{v.인원}</td>
                <td className="border px-2 py-1 text-center">{v.AVL}</td>
                <td className="border px-2 py-1 text-center">{v.PSLTE}</td>
                <td className="border px-2 py-1 text-center">{v.status}</td>
                <td
                  className="border px-2 py-1 text-center cursor-pointer"
                  onClick={() => handleJipgyeolToggle(v.AVL)}
                >
                  {v.집결}
                </td>
                <td className="border px-2 py-1 text-center space-x-1">
                  <button
                    onClick={() => handleStatusChange(v.AVL, "도착")}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    도착
                  </button>
                  <button
                    onClick={() => handleStatusChange(v.AVL, "철수")}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    철수
                  </button>
                  <button
                    onClick={() =>
                      alert(`[${v.호출명}] 차량에 문자 전송됨 (모의)`)
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    문자
                  </button>
                  <button
                    onClick={() => handleEdit(v)}
                    className="bg-blue-400 text-white px-2 py-1 rounded"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(v.AVL)}
                    className="bg-gray-500 text-white px-2 py-1 rounded"
                  >
                    삭제
                  </button>
                </td>
              </tr>
            ))}
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
    setEditInputs((prev) => ({
      ...prev,
      [name]: name === "PSLTE" ? formatPhoneNumber(value) : value,
    }));
    if (name === "인원") {
      const onlyNumbers = value.replace(/\D/g, "");
      setEditInputs((prev) => ({ ...prev, 인원: onlyNumbers }));
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow w-[400px] relative">
        <h2 className="text-xl font-semibold mb-4">🚨 차량 정보 수정</h2>

        {["시도", "소방서", "차종", "호출명", "용량", "인원", "PSLTE"].map(
          (field) => (
            <input
              key={field}
              name={field}
              placeholder={field}
              value={editInputs[field] || ""}
              onChange={handleChange}
              className="border p-2 w-full mb-2"
            />
          )
        )}

        <div className="mb-2">
          <label className="text-sm text-gray-600">AVL (수정 불가)</label>
          <input
            name="AVL"
            value={editInputs.AVL || ""}
            disabled
            className="border p-2 w-full bg-gray-100 text-gray-500"
          />
        </div>

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
