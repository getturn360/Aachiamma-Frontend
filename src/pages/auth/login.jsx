import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { loginFormControls } from "@/config";
import { loginUser, checkAuth } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { addToCart, fetchCartItems, clearGuestCart } from "@/store/shop/cart-slice";
import { getPostLoginPath } from "@/config/routes";

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

  const from = location.state?.from?.pathname || "/";

  async function onSubmit(e) {
    e && e.preventDefault && e.preventDefault();

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

      try {
        const pendingItemStr = sessionStorage.getItem("pendingCartItem");
        if (pendingItemStr) {
          const pendingItem = JSON.parse(pendingItemStr);
          await dispatch(addToCart({
            userId: loggedInUser?.id || loggedInUser?._id,
            productId: pendingItem.productId,
            quantity: pendingItem.quantity,
            productObj: pendingItem.productObj
          })).unwrap();
          sessionStorage.removeItem("pendingCartItem");
          toast?.toast?.({ title: "Welcome", description: "Logged in successfully. Pending item added to cart." });
        } else {
          toast?.toast?.({ title: "Welcome", description: "Logged in successfully" });
        }
      } catch (e) {
        console.error("Error processing pending cart item:", e);
        toast?.toast?.({ title: "Welcome", description: "Logged in successfully" });
      }

      try {
        await dispatch(fetchCartItems(loggedInUser?.id || loggedInUser?._id));
        try {
          dispatch(clearGuestCart());
        } catch (e) {}
      } catch (e) {
        /* cart merge optional */
      }

      navigate(getPostLoginPath(loggedInUser, from), { replace: true });
    } catch (err) {
   
      const message = err?.message || err?.msg || (err?.message === undefined && JSON.stringify(err)) || "Login error";
      toast?.toast?.({ title: "Login error", description: message });
      console.error("Login error:", err);
    } finally {
  
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
