import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";

function ActivityMapPage() {
  const mapRef = useRef(null);
  const infoWindowRef = useRef(null);
  const openedMarkerRef = useRef(null);
  const markersRef = useRef([]);

  const [filters, setFilters] = useState({
    province: "",
    station: "",
    callSign: "",
    type: "",
    keyword: "",
  });

  const [dummyData, setDummyData] = useState([
    {
      id: 1,
      province: "부산",
      station: "중부",
      callSign: "301",
      vehicleType: "펌프차",
      lat: 35.1796,
      lng: 129.0756,
      status: "대기",
    },
    {
      id: 2,
      province: "서울",
      station: "강남",
      callSign: "202",
      vehicleType: "대형탱크",
      lat: 37.4979,
      lng: 127.0276,
      status: "대기",
    },
  ]);

  const [filteredData, setFilteredData] = useState(dummyData);
  const [gpsData, setGpsData] = useState([]);

  // ✅ GPS 실시간 갱신
  useEffect(() => {
    const fetchGps = () => {
      axios.get("http://localhost:8080/gps/all").then((res) => {
        setGpsData(res.data);
      });
    };

    fetchGps(); // 최초 1회
    const interval = setInterval(fetchGps, 30000); // 5초마다 갱신

    return () => clearInterval(interval); // 언마운트 시 정리
  }, []);

  const drawMap = useCallback(() => {
    if (!mapRef.current || gpsData.length === 0) return;

    let map = mapRef.current.__kakaoMap__;

    if (!map) {
      map = new window.kakao.maps.Map(mapRef.current, {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 7,
      });
      mapRef.current.__kakaoMap__ = map;
    }

    // ✅ InfoWindow 닫기
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
      openedMarkerRef.current = null;
    }

    // ✅ 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const createMarker = (lat, lng, content, autoOpen = false) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
        map,
      });

      const infoWindow = new window.kakao.maps.InfoWindow({ content });

      window.kakao.maps.event.addListener(marker, "click", () => {
        const isOpen =
          infoWindowRef.current && openedMarkerRef.current === marker;
        if (isOpen) {
          infoWindowRef.current.close();
          infoWindowRef.current = null;
          openedMarkerRef.current = null;
        } else {
          if (infoWindowRef.current) infoWindowRef.current.close();
          infoWindow.open(map, marker);
          infoWindowRef.current = infoWindow;
          openedMarkerRef.current = marker;
        }
      });

      if (autoOpen) {
        infoWindow.open(map, marker);
        infoWindowRef.current = infoWindow;
        openedMarkerRef.current = marker;
      }

      markersRef.current.push(marker);
    };

    // ✅ dummyData 마커
    filteredData.forEach((v) => {
      const content = `
      <div style="padding:10px; font-size:14px;">
        🚒 호출명: ${v.callSign ?? "없음"}<br/>
        📍 차종: ${v.vehicleType ?? "없음"}<br/>
        🧯 소방서: ${v.station ?? "없음"}<br/>
        🧭 시도: ${v.province ?? "없음"}<br/>
        🌐 상태: ${v.status ?? "없음"}
      </div>`;
      createMarker(v.lat, v.lng, content);
    });

    // ✅ GPS 마커 (vehicleId 기준 중복 제거 + 랜덤 offset)
    const uniqueGps = {};
    gpsData.forEach((gps) => {
      const vid = gps.vehicleId ?? gps.id; // 안전하게 vehicleId 우선
      uniqueGps[vid] = gps;
    });

    Object.values(uniqueGps).forEach((gps) => {
      const offsetLat = 0.00003 * (Math.random() - 0.5); // ±0.000015
      const offsetLng = 0.00003 * (Math.random() - 0.5);
      const lat = gps.lat + offsetLat;
      const lng = gps.lng + offsetLng;

      const content = `
      <div style="padding:10px; font-size:14px;">
        🚒 호출명: ${gps.callSign ?? "없음"}<br/>
        📍 차종: ${gps.vehicleType ?? "없음"}<br/>
        🧯 소방서: ${gps.station ?? "없음"}<br/>
        🧭 시도: ${gps.province ?? "없음"}<br/>
        🌐 상태: ${gps.status ?? "없음"}
      </div>`;
      createMarker(lat, lng, content);
    });

    // ✅ 내 위치 마커 (가장 가까운 차량 info 포함)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const locPosition = new window.kakao.maps.LatLng(latitude, longitude);

        let closest = null;
        let minDist = Infinity;
        gpsData.forEach((g) => {
          const dist = Math.sqrt(
            (g.lat - latitude) ** 2 + (g.lng - longitude) ** 2
          );
          if (dist < minDist) {
            minDist = dist;
            closest = g;
          }
        });

        const content = `
        <div style="padding:10px; font-size:14px;">
          🚒 호출명: ${closest?.callSign ?? "없음"}<br/>
          📍 차종: ${closest?.vehicleType ?? "없음"}<br/>
          🧯 소방서: ${closest?.station ?? "없음"}<br/>
          🧭 시도: ${closest?.province ?? "없음"}<br/>
          🌐 상태: ${closest?.status ?? "없음"}
        </div>`;

        createMarker(latitude, longitude, content, true); // ✅ autoOpen
        map.setCenter(locPosition);
      });
    }
  }, [gpsData, filteredData]);

  // ✅ drawMap 실행 시점 조절
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      if (gpsData.length > 0) drawMap();
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=65315c0529219c7f4acf232e34c7c5a4&autoload=false";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          if (gpsData.length > 0) drawMap();
        });
      };
      document.head.appendChild(script);
    }
  }, [drawMap, gpsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const result = dummyData.filter(
      (item) =>
        (!filters.province || item.province.includes(filters.province)) &&
        (!filters.station || item.station.includes(filters.station)) &&
        (!filters.callSign || item.callSign.includes(filters.callSign)) &&
        (!filters.type || item.vehicleType.includes(filters.type)) &&
        (!filters.keyword ||
          Object.values(item).some(
            (val) => typeof val === "string" && val.includes(filters.keyword)
          ))
    );
    setFilteredData(result);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: "10px",
        }}
      >
        <select
          name="province"
          value={filters.province}
          onChange={handleChange}
        >
          <option value="">시도</option>
          <option value="서울">서울</option>
          <option value="부산">부산</option>
          <option value="대구">대구</option>
        </select>
        <select name="station" value={filters.station} onChange={handleChange}>
          <option value="">소방서</option>
          <option value="중부">중부</option>
          <option value="강남">강남</option>
        </select>
        <select name="type" value={filters.type} onChange={handleChange}>
          <option value="">차종</option>
          <option value="펌프차">펌프차</option>
          <option value="물탱크차">물탱크차</option>
        </select>
        <input
          name="callSign"
          placeholder="호출명"
          value={filters.callSign}
          onChange={handleChange}
        />
        <input
          name="keyword"
          placeholder="수기 검색"
          value={filters.keyword}
          onChange={handleChange}
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      <div ref={mapRef} style={{ width: "100%", height: "600px" }} />
    </div>
  );
}

export default ActivityMapPage;
