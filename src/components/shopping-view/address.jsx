import { useEffect, useState } from "react";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { addressFormControls } from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewAddress,
  deleteAddress,
  editaAddress,
  fetchAllAddresses,
} from "@/store/shop/address-slice";
import AddressCard from "./address-card";
import { useToast } from "../ui/use-toast";

const initialAddressFormData = {
  firstName: "",
  lastName: "",
  company: "",
  whatsapp: "",
  phone: "",
  email: "",
  country: "India",
  streetAddress: "",
  apartment: "",
  city: "",
  state: "Kerala",
  postcode: "",
  addressType: "Home",
  notes: "",
};

function Address({ setCurrentSelectedAddress, selectedId, value, onChange }) {
 
  const isGuestMode = value !== undefined && typeof onChange === "function";

  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { addressList = [], isLoading } = useSelector((state) => state.shopAddress || {});
  const { toast } = useToast();


  const [guestSaved, setGuestSaved] = useState(false);
  const [guestSavedSnapshot, setGuestSavedSnapshot] = useState(null);

  useEffect(() => {
    if (isGuestMode) {
      setFormData({
        firstName: value?.firstName || value?.name || "",
        lastName: value?.lastName || "",
        company: value?.company || "",
        whatsapp: value?.whatsapp || "",
        phone: value?.phone || "",
        email: value?.email || "",
        country: value?.country || "India",
        streetAddress: value?.streetAddress || value?.address || "",
        apartment: value?.apartment || "",
        city: value?.city || "",
        state: value?.state || "Kerala",
        postcode: value?.postcode || value?.pincode || "",
        addressType: value?.addressType || "Home",
        notes: value?.notes || "",
      });

    
    }

  }, [value, isGuestMode]);


  useEffect(() => {
    if (!isGuestMode) {
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user?.id, isGuestMode]);


  useEffect(() => {
    if (isGuestMode) {
      try {
        onChange && onChange({ ...formData });
   
        try {
          localStorage.setItem("guest_address_v1", JSON.stringify(formData));
        } catch (e) {
      console.error("[address.jsx] Error:", e);
    }
      } catch (e) {
      console.error("[address.jsx] Error:", e);
        /* guest address persistence optional */
      }
    }

  }, [formData]);

  useEffect(() => {
    if (guestSavedSnapshot !== null) {
      try {
        const cur = JSON.stringify(formData || {});
        if (cur !== guestSavedSnapshot) {
          if (guestSaved) setGuestSaved(false);
        } else {
 
          if (!guestSaved) setGuestSaved(true);
        }
      } catch (e) {
      console.error("[address.jsx] Error:", e);
    }
    }
 
  }, [formData]);

  async function handleManageAddress(event) {
    event.preventDefault();

    
    if (isGuestMode) {
     
      if (
        !formData.firstName ||
        !formData.phone ||
        !formData.streetAddress ||
        !formData.city ||
        !formData.postcode
      ) {
        toast({ title: "Please enter required fields", variant: "destructive" });
        return;
      }
      onChange({ ...formData });

      try {
        localStorage.setItem("guest_address_v1", JSON.stringify(formData));
      } catch (e) {
      console.error("[address.jsx] Error:", e);
    }

  
      try {
        const snap = JSON.stringify(formData || {});
        setGuestSavedSnapshot(snap);
        setGuestSaved(true);
      } catch (e) {
      console.error("[address.jsx] Error:", e);
    }

      toast({ title: "Address saved for this order" });
      return;
    }

 
    if (addressList && addressList.length >= 3 && currentEditedId === null) {
      setFormData(initialAddressFormData);
      toast({
        title: "You can add max 3 addresses",
        variant: "destructive",
      });
      return;
    }

    if (currentEditedId !== null) {
      dispatch(
        editaAddress({
          userId: user?.id,
          addressId: currentEditedId,
          formData,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setCurrentEditedId(null);
          setFormData(initialAddressFormData);
          toast({
            title: "Address updated successfully",
          });
        }
      });
    } else {
      dispatch(
        addNewAddress({
          ...formData,
          userId: user?.id,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllAddresses(user?.id));
          setFormData(initialAddressFormData);
          toast({
            title: "Address added successfully",
          });
        }
      });
    }
  }

  async function handleDeleteAddress(getCurrentAddress) {
    if (isGuestMode) {
      toast({ title: "Cannot delete in guest mode", variant: "destructive" });
      return;
    }
    // call API
    dispatch(
      deleteAddress({ userId: user?.id, addressId: getCurrentAddress._id })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllAddresses(user?.id));
        toast({
          title: "Address deleted successfully",
        });


        try {
          if (typeof setCurrentSelectedAddress === "function") {
            const sel = selectedId;
            const selId = sel && typeof sel === "object" ? (sel._id || sel.id) : sel;
            const delId = getCurrentAddress._id || getCurrentAddress.id;
            if (selId && delId && String(selId) === String(delId)) {
              try {
                setCurrentSelectedAddress(null);
              } catch (e) {
      console.error("[address.jsx] Error:", e);
    }
            }
          }
        } catch (e) {
      console.error("[address.jsx] Error:", e);
    }
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    if (isGuestMode) {
   
      setFormData({
        firstName: getCuurentAddress?.firstName || getCuurentAddress?.name || "",
        lastName: getCuurentAddress?.lastName || getCuurentAddress?.name || "",
        company: getCuurentAddress?.company || "",
        whatsapp: getCuurentAddress?.whatsapp || "",
        phone: getCuurentAddress?.phone || "",
        email: getCuurentAddress?.email || "",
        country: getCuurentAddress?.country || "India",
        streetAddress: getCuurentAddress?.streetAddress || getCuurentAddress?.address || "",
        apartment: getCuurentAddress?.apartment || "",
        city: getCuurentAddress?.city || "",
        state: getCuurentAddress?.state || "Kerala",
        postcode: getCuurentAddress?.postcode || getCuurentAddress?.pincode || "",
        addressType: getCuurentAddress?.addressType || "Home",
        notes: getCuurentAddress?.notes || "",
      });
      return;
    }
    setCurrentEditedId(getCuurentAddress?._id);
    setFormData({
      firstName: getCuurentAddress?.firstName || getCuurentAddress?.name || "",
      lastName: getCuurentAddress?.lastName || getCuurentAddress?.name || "",
      company: getCuurentAddress?.company || "",
      whatsapp: getCuurentAddress?.whatsapp || "",
      phone: getCuurentAddress?.phone || "",
      email: getCuurentAddress?.email || "",
      country: getCuurentAddress?.country || "India",
      streetAddress: getCuurentAddress?.streetAddress || getCuurentAddress?.address || "",
      apartment: getCuurentAddress?.apartment || "",
      city: getCuurentAddress?.city || "",
      state: getCuurentAddress?.state || "Kerala",
      postcode: getCuurentAddress?.postcode || getCuurentAddress?.pincode || "",
      addressType: getCuurentAddress?.addressType || "Home",
      notes: getCuurentAddress?.notes || "",
    });
  }

  function isFormValid() {
  
    return (
      formData.firstName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.streetAddress.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.postcode.trim() !== ""
    );
  }

 
  if (isGuestMode) {
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">

          <div id="guest-address-form-wrapper">
            {guestSaved && (
              <style>{`#guest-address-form-wrapper button[type=\"submit\"]{display:none !important}`}</style>
            )}

            <CommonForm
              formControls={addressFormControls}
              formData={formData}
              setFormData={setFormData}
              buttonText={"Save for this order"}
              onSubmit={handleManageAddress}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2  gap-2">
        {addressList && addressList.length > 0 ? (
          addressList.map((singleAddressItem) => (
            <AddressCard
              key={singleAddressItem._id}
              selectedId={selectedId}
              handleDeleteAddress={handleDeleteAddress}
              addressInfo={singleAddressItem}
              handleEditAddress={() => handleEditAddress(singleAddressItem)}
             
              setCurrentSelectedAddress={typeof setCurrentSelectedAddress === "function" ? setCurrentSelectedAddress : undefined}
          
              showUse={!!setCurrentSelectedAddress}
            />
          ))
        ) : (
          <div className="p-3 text-sm text-gray-600">No saved addresses found.</div>
        )}
      </div>

      <CardHeader>
        <CardTitle>
          {currentEditedId !== null ? "Edit Address" : "Add New Address"}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <CommonForm
          formControls={addressFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Edit" : "Add"}
          onSubmit={handleManageAddress}
          isBtnDisabled={!isFormValid()}
        />
      </CardContent>
    </Card>
  );
}

export default Address;
