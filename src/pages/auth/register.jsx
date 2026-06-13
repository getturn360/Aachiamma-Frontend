import CommonForm from "@/components/common/form";
import { useToast } from "@/components/ui/use-toast";
import { registerFormControls } from "@/config";
import { registerUser } from "@/store/auth-slice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";

const initialState = {
  userName: "",
  email: "",
  password: "",
};

function AuthRegister() {
  const [formData, setFormData] = useState(initialState);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    dispatch(registerUser(formData)).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: data?.payload?.message,
        });
        
        const loggedInUser = data?.payload?.user || data?.payload?.data?.user || data?.payload?.data || null;
        const pendingItemStr = sessionStorage.getItem("pendingCartItem");
        
        if (pendingItemStr && loggedInUser) {
          try {
            const pendingItem = JSON.parse(pendingItemStr);
            dispatch(addToCart({
              userId: loggedInUser.id || loggedInUser._id,
              productId: pendingItem.productId,
              quantity: pendingItem.quantity,
              productObj: pendingItem.productObj
            })).then(() => {
              sessionStorage.removeItem("pendingCartItem");
              dispatch(fetchCartItems(loggedInUser.id || loggedInUser._id));
              toast({ title: "Pending item added to your new cart!" });
              navigate("/shop/cart");
            });
          } catch (e) {
            console.error(e);
            navigate("/auth/login");
          }
        } else {
          navigate("/auth/login");
        }
      } else {
        toast({
          title: data?.payload?.message,
          variant: "destructive",
        });
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Create new account
        </h1>
        <p className="mt-2">
          Already have an account
          <Link
            className="font-medium ml-2 text-primary hover:underline"
            to="/auth/login"
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
