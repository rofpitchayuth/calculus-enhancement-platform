import "/src/styles/Navbar.css"; // สไตล์อยู่ไฟล์นี้

export default function Navbar() {
  return (
    <div className="navbar rounded-xl shadow-md ">
        <div className="basis-3xs">Home</div>
        <div className="basis-3xs">Course</div>
        <div className="basis-3xs">Dashboard</div>
        <div className="basis-3xs">Profile</div>
    </div>
  );
}
