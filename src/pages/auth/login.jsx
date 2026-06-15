import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser } from "@/store/auth-slice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getPostLoginPath } from "@/config/routes";
import { mergePendingCartItem } from "@/lib/post-auth-cart";

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
  const submittingRef = useRef(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated && user && !submittingRef.current) {
      navigate(getPostLoginPath(user, from), { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  async function onSubmit(e) {
    e && e.preventDefault && e.preventDefault();
    submittingRef.current = true;

    try {
      dispatch(setLoading(true));
      dispatch(setLoadingMessage("Signing in..."));

      const result = await dispatch(loginUser(formData)).unwrap();

      if (!result || result?.success === false) {
        const msg = result?.message || "Login failed";
        toast?.toast?.({ title: "Login failed", description: msg });
        return;
      }

      const loggedInUser =
        result?.user || result?.data?.user || result?.data || null;

      const merged = await mergePendingCartItem(dispatch, loggedInUser);

      if (merged) {
        toast?.toast?.({
          title: "Welcome",
          description: "Logged in successfully. Pending item added to cart.",
        });
      } else {
        toast?.toast?.({ title: "Welcome", description: "Logged in successfully" });
      }

      navigate(getPostLoginPath(loggedInUser, from), { replace: true });
    } catch (err) {
      const message =
        err?.message ||
        err?.payload?.message ||
        "Login error";
      toast?.toast?.({ title: "Login failed", description: message });
      console.error("Login error:", err);
    } finally {
      submittingRef.current = false;
      dispatch(setLoading(false));
      dispatch(setLoadingMessage(null));
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span>Don&apos;t have an account?</span>
          <Link
            to="/auth/register"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08665F]"
            style={{ backgroundColor: "#08665F" }}
          >
            Register
          </Link>
        </p>
      </div>

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
