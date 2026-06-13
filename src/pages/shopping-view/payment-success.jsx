import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { CheckCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s) => s.auth && s.auth.isAuthenticated);

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
                <Button onClick={() => navigate(ROUTES.account)}>View Orders</Button>
                <Button variant="ghost" onClick={() => navigate(ROUTES.home)}>
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate(ROUTES.home)}>Continue Shopping</Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.login)}>
                  Sign in to track orders
                </Button>
              </>
            )}
          </div>

          <p className="mt-6 text-sm text-gray-500">
            You'll also receive an E-mail and Whatsapp Message confirming your order (if you supplied a phone number).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentSuccessPage;
