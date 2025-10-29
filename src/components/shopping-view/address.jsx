// src/components/shopping-view/address.jsx
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
  // If parent passed value & onChange => guest mode (shared single form)
  const isGuestMode = value !== undefined && typeof onChange === "function";

  const [formData, setFormData] = useState(initialAddressFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  const { addressList = [], isLoading } = useSelector((state) => state.shopAddress || {});
  const { toast } = useToast();

  // Sync parent-provided guest value into local formData for editing view
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isGuestMode]);

  // Fetch saved addresses only when NOT in guest mode
  useEffect(() => {
    if (!isGuestMode) {
      dispatch(fetchAllAddresses(user?.id));
    }
  }, [dispatch, user?.id, isGuestMode]);

  // --- when in guest mode, notify parent on every formData change (so shipping recomputes live) ---
  useEffect(() => {
    if (isGuestMode) {
      try {
        onChange && onChange({ ...formData });
        // also persist guest address locally for page reloads
        try {
          localStorage.setItem("guest_address_v1", JSON.stringify(formData));
        } catch (e) { /* ignore storage errors */ }
      } catch (e) {
        // don't break UI if onChange throws
        console.warn("Address onChange errored", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  async function handleManageAddress(event) {
    event.preventDefault();

    // If guest mode, save to parent only (no API)
    if (isGuestMode) {
      // validate minimal
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
      toast({ title: "Address saved for this order" });
      return;
    }

    // logged-in user flow
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

        // if deleted address was selected in checkout, clear selection
        try {
          if (typeof setCurrentSelectedAddress === "function") {
            const sel = selectedId;
            const selId = sel && typeof sel === "object" ? (sel._id || sel.id) : sel;
            const delId = getCurrentAddress._id || getCurrentAddress.id;
            if (selId && delId && String(selId) === String(delId)) {
              try {
                setCurrentSelectedAddress(null);
              } catch (e) {
                // ignore
              }
            }
          }
        } catch (e) {
          // ignore
        }
      }
    });
  }

  function handleEditAddress(getCuurentAddress) {
    if (isGuestMode) {
      // in guest mode populate local form only
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
    // require at least these
    return (
      formData.firstName.trim() !== "" &&
      formData.phone.trim() !== "" &&
      formData.streetAddress.trim() !== "" &&
      formData.city.trim() !== "" &&
      formData.postcode.trim() !== ""
    );
  }

  // Render: guest mode shows only the shared form (CommonForm from addressFormControls)
  if (isGuestMode) {
    // use CommonForm but wired to local formData; on submit we call onChange (see handleManageAddress)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Billing details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CommonForm
            formControls={addressFormControls}
            formData={formData}
            setFormData={setFormData}
            buttonText={"Save for this order"}
            onSubmit={handleManageAddress}
            isBtnDisabled={!isFormValid()}
          />
        </CardContent>
      </Card>
    );
  }

  // Logged-in user UI (list + add/edit form)
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
              // pass setCurrentSelectedAddress through (parent may pass undefined)
              setCurrentSelectedAddress={typeof setCurrentSelectedAddress === "function" ? setCurrentSelectedAddress : undefined}
              // showUse true when parent provided setCurrentSelectedAddress => checkout context
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
