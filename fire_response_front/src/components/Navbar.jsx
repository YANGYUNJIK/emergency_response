import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="flex justify-center gap-8 bg-gray-100 py-4 shadow">
      <Link to="/" className="hover:text-red-600">메인</Link>
      
      <Link to="/status" className="hover:text-red-600">현황</Link>
      <Link to="/register" className="hover:text-red-600">등록</Link>
      <Link to="/dispatch" className="hover:text-red-600">출동</Link>
      <Link to="/activity" className="hover:text-red-600">활동(현황)</Link>
      <Link to="/activity/map" className="hover:text-red-600">활동(지도)</Link>
      <Link to="/stats" className="hover:text-red-600">통계</Link>
    </nav>
  );
}

export default Navbar;
