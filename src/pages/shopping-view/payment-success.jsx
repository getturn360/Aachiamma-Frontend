import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle } from "lucide-react";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth && s.auth.isAuthenticated);

  useEffect(() => {
  }, [isAuthenticated]);

  return (
    <div className="max-w-3xl mx-auto mt-12 mt-[90px]">
      <Card className="p-8 shadow-xl">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <p className="text-gray-700 leading-relaxed">
            Thank you — your payment has been received successfully. We've recorded your order and will start processing it shortly.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isAuthenticated ? (
              <>
                <Button onClick={() => navigate("/shop/account")}>View Orders</Button>
                <Button variant="ghost" onClick={() => navigate("/shop/home")}>Continue Shopping</Button>
              </>
            ) : (
              <>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-gray-500">
            You'll also receive a SMS confirming your order (if you supplied a phone number).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;
