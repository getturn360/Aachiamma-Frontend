import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import accImg from "../../assets/account.jpg";
import Address from "@/components/shopping-view/address";
import ShoppingOrders from "@/components/shopping-view/orders";

function ShoppingAccount() {
  return (
    <div className="flex flex-col pt-2 sm:pt-[10px]">
   
      <div className="relative h-[140px] sm:h-[200px] md:h-[300px] w-full overflow-hidden">
        <img
          src={accImg}
          className="h-full w-full object-cover object-center"
          alt="account cover"
        />
      </div>

      
      <div className="container mx-auto max-w-5xl grid grid-cols-1 gap-4 py-6 px-4 sm:px-0">
        <div className="flex flex-col rounded-lg border bg-background p-4 sm:p-6 shadow-sm">
          <Tabs defaultValue="orders">
     
            <TabsList className="gap-1">
              <TabsTrigger value="orders" className="px-3 py-1 text-sm">
                Orders
              </TabsTrigger>
              <TabsTrigger value="address" className="px-3 py-1 text-sm">
                Address
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="p-0">
              <ShoppingOrders />
            </TabsContent>

            <TabsContent value="address" className="p-0">
              <Address />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default ShoppingAccount;
