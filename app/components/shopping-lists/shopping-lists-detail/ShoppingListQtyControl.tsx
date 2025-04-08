import _ from "lodash";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getValidQuantity } from "~/lib/quick-order";

export function ShoppingListQtyControl({
  product,
  onUpdateQuantity,
  increment = 1,
}: {
  product: {
    id: number;
    quantity: number;
  };
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  increment?: number;
}) {
  const [quantity, setQuantity] = useState<number | undefined>(
    product.quantity,
  );
  useEffect(() => {
    setQuantity(product.quantity);
  }, [product.quantity]);

  const handleQuantityUpdate = (newQuantity: number) => {
    onUpdateQuantity(product.id, newQuantity);
    setQuantity(newQuantity);
  };

  return (
    <div className="flex items-center border rounded-md border-gray-300 bg-gradient-to-b from-white to-[#E5F3FF] w-fit">
      <Button
        variant="outline"
        size="icon"
        className="border-none shadow-none text-black rounded-none bg-transparent w-11 h-11"
        onClick={() => {
          if (quantity && quantity > 1) {
            const newQuantity = getValidQuantity(quantity, increment, false);
            if (newQuantity > 0) {
              handleQuantityUpdate(newQuantity);
            }
          }
        }}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={quantity}
        className="w-11 h-11 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none text-center rounded-none border-t-0 border-b-0 shadow-none outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus:border-gray-300 bg-white px-0"
        onBlur={(e) => {
          if (e.target.value === product.quantity.toString()) {
            return;
          }

          handleQuantityUpdate(Math.floor(Number(e.target.value)) || 1);
        }}
        onChange={(e) => {
          if (_.toNumber(e.target.value) < 0) return;
          if (!e.target.value) {
            return setQuantity(undefined);
          }
          setQuantity(Math.floor(Number(e.target.value)) || 1);
        }}
      />
      <Button
        variant="outline"
        size="icon"
        className="border-none shadow-none text-black rounded-none bg-transparent w-11 h-11"
        onClick={() => {
          if (quantity && quantity > 0) {
            const newQuantity = getValidQuantity(quantity, increment, true);
            if (newQuantity > 0) {
              handleQuantityUpdate(newQuantity);
            }
          }
        }}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
