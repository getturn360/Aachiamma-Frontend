import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser, loginUser } from "@/store/auth-slice";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { getPostLoginPath } from "@/config/routes";
import { mergePendingCartItem } from "@/lib/post-auth-cart";

const initialState = {
  userName: "",
  email: "",
  phone: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const submittingRef = useRef(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user && !submittingRef.current) {
      navigate(getPostLoginPath(user, "/"), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  async function onSubmit(event) {
    event.preventDefault();
    submittingRef.current = true;

    try {
      const regResult = await dispatch(registerUser(formData)).unwrap();
      if (!regResult?.success) {
        toast({
          title: regResult?.message || "Registration failed",
          variant: "destructive",
        });
        return;
      }

      toast({ title: regResult?.message || "Account created. Signing you in..." });

      const loginCredentials = { password: formData.password };
      const email = (formData.email || "").trim();
      const phone = (formData.phone || "").trim();
      if (email) loginCredentials.email = email;
      else if (phone) loginCredentials.phone = phone;

      const loginResult = await dispatch(loginUser(loginCredentials)).unwrap();

      if (!loginResult?.success) {
        toast({
          title: "Account created. Please sign in.",
          description: loginResult?.message,
        });
        navigate("/auth/login");
        return;
      }

      const loggedInUser =
        loginResult?.user || loginResult?.data?.user || loginResult?.data || null;

      const merged = await mergePendingCartItem(dispatch, loggedInUser);

      if (merged) {
        toast({
          title: "Welcome",
          description: "Account created and pending item added to your cart.",
        });
      }

      navigate(getPostLoginPath(loggedInUser, "/"), { replace: true });
    } catch (err) {
      const message = err?.message || err?.msg || "Registration error";
      toast({ title: "Registration error", description: message, variant: "destructive" });
      console.error("Register error:", err);
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span>Already have an account?</span>
          <Link
            to="/auth/login"
            className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08665F]"
            style={{ backgroundColor: "#08665F" }}
          >
            Login
          </Link>
        </p>
      </div>
      <CommonForm
        formControls={registerFormControls}
        buttonText={"Sign Up"}
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AuthRegister;
