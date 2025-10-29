// client/src/pages/auth/login.jsx
import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser, checkAuth } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { addToCart, fetchCartItems, clearGuestCart } from "@/store/shop/cart-slice";

// NEW: common loader actions
import { setLoading, setLoadingMessage } from "@/store/common-slice";

const initialState = {
  email: "",
  password: "",
};

function AuthLogin() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // where to go after login (fallback '/')
  const from = location.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e && e.preventDefault && e.preventDefault();

    // START global loader
    try {
      dispatch(setLoading(true));
      dispatch(setLoadingMessage("Signing in..."));

      // dispatch login thunk and unwrap result (throws on rejection)
      const result = await dispatch(loginUser(formData)).unwrap();

      // result should be the server response object -- check token or success
      const token =
        result?.token ||
        result?.data?.token ||
        result?.accessToken ||
        null;

      if (!result || result?.success === false || !token) {
        // show server message if available
        const msg = result?.message || "Login failed";
        toast?.toast?.({ title: "Login failed", description: msg });
        return;
      }

      // Optional: merge guest cart into user cart (if you have that logic)
      try {
        // fetch user's cart from server (will use token saved by login thunk)
        await dispatch(fetchCartItems());
        // if you stored guest cart in localStorage and want to merge, implement here:
        // dispatch(addToCart(...)) then clear guest
        try {
          dispatch(clearGuestCart());
        } catch (e) {}
      } catch (e) {
        // not critical; continue
        console.warn("Cart merge failed:", e);
      }

      // After successful login and fetching user, redirect to 'from' or home
      navigate(from, { replace: true });
      toast?.toast?.({ title: "Welcome", description: "Logged in successfully" });
    } catch (err) {
      // err can be an Error or the rejected payload
      const message = err?.message || err?.msg || (err?.message === undefined && JSON.stringify(err)) || "Login error";
      toast?.toast?.({ title: "Login error", description: message });
      console.error("Login error:", err);
    } finally {
      // STOP global loader (always)
      dispatch(setLoading(false));
      dispatch(setLoadingMessage(null));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
        <p className="mt-2">
          Don't have an account
          <Link className="font-medium ml-2 text-primary hover:underline" to="/auth/register">
            Register
          </Link>
        </p>
      </div>

      {/* IMPORTANT: CommonForm already renders a <form>, so do NOT wrap it in another form */}
      <div>
        <CommonForm
          formControls={loginFormControls}
          buttonText={"Sign In"}
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}

export default AuthLogin;
