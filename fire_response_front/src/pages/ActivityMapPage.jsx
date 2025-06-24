
import { useEffect, useRef, useState } from 'react';

function ActivityMapPage() {
  const dummyData = [
    { id: 1, 시도: "부산", 소방서: "중부", 호출명: "301", 차종: "펌프차", lat: 35.1796, lng: 129.0756 },
    { id: 2, 시도: "서울", 소방서: "강남", 호출명: "202", 차종: "물탱크차", lat: 37.4979, lng: 127.0276 },
  ];

  const mapRef = useRef(null);
  const [filters, setFilters] = useState({
    시도: '',
    소방서: '',
    호출명: '',
    차종: '',
    keyword: '',
  });
  const [filteredData, setFilteredData] = useState(dummyData);

  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      drawMap(); // 이미 kakao.maps 로드된 경우
    } else {
      const script = document.createElement("script");
      script.src = "//dapi.kakao.com/v2/maps/sdk.js?appkey=65315c0529219c7f4acf232e34c7c5a4&autoload=false";
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => {
          drawMap();
        });
      };
      document.head.appendChild(script);
    }
  }, [filteredData]);

  const drawMap = () => {
    const container = mapRef.current;
    const options = {
      center: new window.kakao.maps.LatLng(36.5, 127.5),
      level: 7,
    };

    const map = new window.kakao.maps.Map(container, options);

    // 마커 생성
    filteredData.forEach(vehicle => {
      new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(vehicle.lat, vehicle.lng),
        map,
      });
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const result = dummyData.filter(item =>
      (!filters.시도 || item.시도.includes(filters.시도)) &&
      (!filters.소방서 || item.소방서.includes(filters.소방서)) &&
      (!filters.호출명 || item.호출명.includes(filters.호출명)) &&
      (!filters.차종 || item.차종.includes(filters.차종)) &&
      (!filters.keyword || Object.values(item).some(val => val.includes(filters.keyword)))
    );
    setFilteredData(result);
  };

  return (
    <div>
      {/* 필터 영역 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '10px' }}>
        <select name="시도" value={filters.시도} onChange={handleChange}>
          <option value="">시도</option>
          <option value="서울">서울</option>
          <option value="부산">부산</option>
          <option value="대구">대구</option>
        </select>
        <select name="소방서" value={filters.소방서} onChange={handleChange}>
          <option value="">소방서</option>
          <option value="중부">중부</option>
          <option value="강남">강남</option>
        </select>
        <select name="차종" value={filters.차종} onChange={handleChange}>
          <option value="">차종</option>
          <option value="펌프차">펌프차</option>
          <option value="물탱크차">물탱크차</option>
        </select>
        <input name="호출명" placeholder="호출명" value={filters.호출명} onChange={handleChange} />
        <input name="keyword" placeholder="수기 검색" value={filters.keyword} onChange={handleChange} />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 지도 영역 */}
      <div ref={mapRef} style={{ width: '100%', height: '600px' }} />
    </div>
  );
}

export default ActivityMapPage;
