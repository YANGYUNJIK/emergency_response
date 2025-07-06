import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080/vehicles";

const COLUMNS = [
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

export default function StatusPage() {
  const [mode, setMode] = useState("평상시");
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    axios.get(BASE_URL).then((res) => setVehicles(res.data));
  }, []);

  const getFilteredVehicles = () => {
    if (mode === "평상시") {
      return vehicles.filter((v) => v.province === "경북");
    } else {
      return vehicles.filter(
        (v) => v.gathering === "O" || v.province !== "경북"
      );
    }
  };

  const groupByRegionAndStatus = () => {
    const data = {};
    const filtered = getFilteredVehicles();

    for (const v of filtered) {
      const region = v.province || "미지정";
      const status = v.status || "미지정";

      if (!data[region]) {
        data[region] = { 전체: [], 대기: [], 활동: [] };
      }
      data[region]["전체"].push(v);
      if (status === "대기") data[region]["대기"].push(v);
      if (status === "활동" || status === "도착") data[region]["활동"].push(v);
    }

    return data;
  };

  const getCounts = (list) => {
    const counts = { 차량: list.length, 인원: 0 };
    for (const col of COLUMNS) {
      counts[col] = 0;
    }
    for (const v of list) {
      const type = v.vehicleType || "기타";
      const personnel = parseInt(v.personnel || 0);
      if (COLUMNS.includes(type)) {
        counts[type] += 1;
      } else {
        counts["기타"] += 1;
      }
      counts.인원 += personnel;
    }
    return counts;
  };

  const renderRow = (label, list) => {
    if (!list || list.length === 0) return null;
    const counts = getCounts(list);
    return (
      <tr>
        <td className="border px-2 py-1 text-center">{label}</td>
        <td className="border px-2 py-1 text-center">
          {counts.차량} / {counts.인원}
        </td>
        {COLUMNS.map((col) => (
          <td key={col} className="border px-2 py-1 text-center">
            {counts[col] || 0}
          </td>
        ))}
      </tr>
    );
  };

  const grouped = groupByRegionAndStatus();
  const sortedRegions = Object.keys(grouped).sort();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🚒 동원 소방력 현황</h1>

      <div className="mb-4">
        <button
          onClick={() => setMode("평상시")}
          className={`px-4 py-2 mr-2 rounded text-white ${
            mode === "평상시" ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          평상시
        </button>
        <button
          onClick={() => setMode("재난시")}
          className={`px-4 py-2 rounded text-white ${
            mode === "재난시" ? "bg-red-600" : "bg-gray-400"
          }`}
        >
          재난시
        </button>
      </div>

      <table className="w-full table-auto border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-2 py-1">구분</th>
            <th className="border px-2 py-1">차량 계/인원 계</th>
            {COLUMNS.map((col) => (
              <th key={col} className="border px-2 py-1">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mode === "평상시" && grouped["경북"] && (
            <>
              {renderRow("경북", grouped["경북"].전체)}
              {renderRow("대기", grouped["경북"].대기)}
              {renderRow("활동", grouped["경북"].활동)}
            </>
          )}

          {mode === "재난시" &&
            sortedRegions.map((region) => {
              const regionData = grouped[region];
              if (!regionData || !regionData.전체) return null;

              if (region === "경북") {
                const filtered = regionData.전체.filter(
                  (v) => v.gathering === "O"
                );
                if (filtered.length === 0) return null;
                const standby = filtered.filter((v) => v.status === "대기");
                const active = filtered.filter(
                  (v) => v.status === "활동" || v.status === "도착"
                );
                return (
                  <React.Fragment key="경북">
                    <tr className="border-t-4 border-black"></tr>
                    {renderRow("경북", filtered)}
                    {renderRow("대기", standby)}
                    {renderRow("활동", active)}
                  </React.Fragment>
                );
              } else {
                return (
                  <React.Fragment key={region}>
                    <tr className="border-t-4 border-black"></tr>
                    {renderRow(region, regionData.전체)}
                    {renderRow("대기", regionData.대기)}
                    {renderRow("활동", regionData.활동)}
                  </React.Fragment>
                );
              }
            })}
        </tbody>
      </table>
    </div>
  );
}
