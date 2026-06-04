import React, { Fragment } from "react";
import api from "@/api/axios";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

function ProductFilter({ filters, handleFilter }) {
  const [filterOptions, setFilterOptions] = React.useState({});

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await api.get("/api/common/categories/get?sticky=true");
        if (!mounted) return;
        const cats = (res?.data?.categories || []).map((c) => ({ id: c.slug || c._id, label: c.name }));
        setFilterOptions({ category: cats });
      } catch (e) {
       
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  // "All Products" is checked when no category filter is applied
  const noCategorySelected =
    !filters?.category || (Array.isArray(filters.category) && filters.category.length === 0);

  return (
    <div className="bg-background rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="text-lg font-extrabold">Filters</h2>
      </div>
      <div className="p-4 space-y-4">
        {/* Static "All Products" filter option */}
        <Fragment key="all-products">
          <div>
            <h3 className="text-base font-bold">category</h3>
            <div className="grid gap-2 mt-2">
              {/* All Products — always shown, clears category filter when selected */}
              <Label className="flex font-semibold items-center gap-2">
                <Checkbox
                  checked={noCategorySelected}
                  onCheckedChange={() => {
                    // Clicking "All Products" clears every category filter
                    if (!noCategorySelected && filters?.category) {
                      filters.category.forEach((cat) => handleFilter("category", cat));
                    }
                  }}
                />
                All Products
              </Label>

              {/* Backend-driven category options */}
              {(filterOptions.category || []).map((option) => (
                <Label className="flex font-medium items-center gap-2" key={option.id}>
                  <Checkbox
                    checked={
                      filters &&
                      Object.keys(filters).length > 0 &&
                      filters["category"] &&
                      filters["category"].indexOf(option.id) > -1
                    }
                    onCheckedChange={() => handleFilter("category", option.id)}
                  />
                  {option.label}
                </Label>
              ))}
            </div>
          </div>
          <Separator />
        </Fragment>

        {/* Any additional filter keys from backend (non-category) */}
        {Object.keys(filterOptions)
          .filter((k) => k !== "category")
          .map((keyItem) => (
            <Fragment key={keyItem}>
              <div>
                <h3 className="text-base font-bold">{keyItem}</h3>
                <div className="grid gap-2 mt-2">
                  {filterOptions[keyItem].map((option) => (
                    <Label className="flex font-medium items-center gap-2" key={option.id}>
                      <Checkbox
                        checked={
                          filters &&
                          Object.keys(filters).length > 0 &&
                          filters[keyItem] &&
                          filters[keyItem].indexOf(option.id) > -1
                        }
                        onCheckedChange={() => handleFilter(keyItem, option.id)}
                      />
                      {option.label}
                    </Label>
                  ))}
                </div>
              </div>
              <Separator />
            </Fragment>
          ))}
      </div>
    </div>
  );
}

export default ProductFilter;