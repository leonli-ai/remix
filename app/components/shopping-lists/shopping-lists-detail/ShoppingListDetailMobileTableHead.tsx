import { Checkbox } from "~/components/ui/checkbox";
import { ShoppingListDetailTableActions } from "./ShoppingListDetailTableActions";

interface ShoppingListDetailMobileTableHeadProps {
  selectedItems: number[];
  onSelectItems: (itemIds: number[]) => void;
  products: any[];
  onDeleteItems: (itemIds: number[], skipModal?: boolean) => void;
  isDeleting: boolean;
  shoppingListId: number;
}

export function ShoppingListDetailMobileTableHead({
  selectedItems,
  products,
  onSelectItems,
  onDeleteItems,
  isDeleting,
  shoppingListId,
}: ShoppingListDetailMobileTableHeadProps) {
  const toggleAllRows = (checked: boolean) => {
    const newSelectedItems = checked ? products.map((p) => p.id) : [];
    onSelectItems(newSelectedItems);
  };
  return (
    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
      <Checkbox
        className="w-6 h-6 border border-gray-400 rounded-sm bg-white data-[state=checked]:bg-blue-400 data-[state=checked]:border-blue-400 shadow-none data-[state=checked]:text-white [&>span>svg]:stroke-[4]"
        checked={selectedItems.length === products.length}
        onCheckedChange={(checked) => toggleAllRows(!!checked)}
      />
      <ShoppingListDetailTableActions
        shoppingListId={shoppingListId}
        selectedItems={selectedItems}
        products={products}
        onRemoveSelected={(skipModal) => {
          onDeleteItems(selectedItems, skipModal);
        }}
        isDeleting={isDeleting}
        alignOffset={-16}
      />
    </div>
  );
}
