import { useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Unauthorized = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log(location);
  const { user, loading } = useAuth();

  const fromLocation = location.state?.from;

  useEffect(() => {
    if (loading) return;

    // not logged in
    if (!user && !user?.isLogin) navigate("/login", { replace: true });
    //no direct access (no state)
    if (!fromLocation) navigate("/", { replace: true });
  }, [user, loading, navigate, fromLocation]);

  return (
    <div className="container text-center mt-5">
      <h1 className="text-5xl text-red-500 fw-bold">403</h1>
      <h2 className="my-4 text-3xl ">Access Denied! 🚫</h2>
      <p className="lead">You have no permission to see these pages!!!</p>
      <Link to={fromLocation?.pathname || '/'} className="px-4 py-2 bg-black text-white mt-4 rounded-lg inline-block">
        Go Back
      </Link>
    </div>
  );
};

export default Unauthorized;
