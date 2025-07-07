import { useEffect, useRef, useState } from "react";
import axios from "axios";

function ActivityMapPage() {
  const mapRef = useRef(null);
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

  const infoWindowRef = useRef(null); // 현재 열린 InfoWindow
  const openedMarkerRef = useRef(null); // 현재 열린 마커
  const markersRef = useRef([]); // 모든 마커를 저장

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      drawMap();
    } else {
      const script = document.createElement("script");
      script.src =
        "//dapi.kakao.com/v2/maps/sdk.js?appkey=65315c0529219c7f4acf232e34c7c5a4&autoload=false";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          drawMap();
        });
      };
      document.head.appendChild(script);
    }
  }, [gpsData, filteredData]);

  useEffect(() => {
    axios.get("http://localhost:8080/gps/all").then((res) => {
      setGpsData(res.data);
    });
  }, []);

  const drawMap = () => {
    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(36.5, 127.5),
      level: 7,
    };

    const map = new window.kakao.maps.Map(container, options);
    mapRef.current.__kakaoMap__ = map;

    // ✅ 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 🔁 마커 클릭 시 infoWindow toggle 지원
    const createMarker = (lat, lng, content, source) => {
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(lat, lng),
        map,
      });

      const infoWindow = new window.kakao.maps.InfoWindow({ content });

      window.kakao.maps.event.addListener(marker, "click", () => {
        const alreadyOpen =
          infoWindowRef.current && openedMarkerRef.current === marker;

        if (alreadyOpen) {
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

      markersRef.current.push(marker); // ✅ 마커 저장
    };

    // ✅ dummyData 마커
    filteredData.forEach((vehicle) => {
      const content = `
      <div style="padding:10px; font-size:14px;">
        🚒 호출명: ${vehicle.callSign ?? "없음"}<br/>
        📍 차종: ${vehicle.vehicleType ?? "없음"}<br/>
        🧯 소방서: ${vehicle.station ?? "없음"}<br/>
        🧭 시도: ${vehicle.province ?? "없음"}<br/>
        🌐 상태: ${vehicle.status ?? "없음"}
      </div>
    `;
      createMarker(vehicle.lat, vehicle.lng, content, "dummy");
    });

    // ✅ GPS 마커
    gpsData.forEach((gps) => {
      const content = `
      <div style="padding:10px; font-size:14px;">
        🚒 호출명: ${gps.callSign ?? "없음"}<br/>
        📍 차종: ${gps.vehicleType ?? "없음"}<br/>
        🧯 소방서: ${gps.station ?? "없음"}<br/>
        🧭 시도: ${gps.province ?? "없음"}<br/>
        🌐 상태: ${gps.status ?? "없음"}
      </div>
    `;
      createMarker(gps.lat, gps.lng, content, "gps");
    });

    // ✅ 내 위치 마커
    if ("geolocation" in navigator && gpsData.length > 0) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const locPosition = new window.kakao.maps.LatLng(latitude, longitude);

        // 가장 가까운 차량 탐색
        let closest = null;
        let minDist = Number.MAX_VALUE;
        gpsData.forEach((gps) => {
          const dist = Math.sqrt(
            Math.pow(gps.lat - latitude, 2) + Math.pow(gps.lng - longitude, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            closest = gps;
          }
        });

        const marker = new window.kakao.maps.Marker({
          position: locPosition,
          map,
          title: "내 위치",
        });

        const content = `
        <div style="padding:10px; font-size:14px;">
          🚒 호출명: ${closest?.callSign ?? "없음"}<br/>
          📍 차종: ${closest?.vehicleType ?? "없음"}<br/>
          🧯 소방서: ${closest?.station ?? "없음"}<br/>
          🧭 시도: ${closest?.province ?? "없음"}<br/>
          🌐 상태: ${closest?.status ?? "없음"}
        </div>
      `;

        const infoWindow = new window.kakao.maps.InfoWindow({ content });

        infoWindow.open(map, marker);
        map.setCenter(locPosition);

        markersRef.current.push(marker);
      });
    }
  };

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
          Object.values(item).some((val) => val.includes(filters.keyword)))
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
