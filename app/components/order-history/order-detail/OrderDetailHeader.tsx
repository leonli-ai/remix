import { format } from "date-fns";
import { AlertTriangle, PrinterIcon, ShoppingCartIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DraftOrderDetailsResponse } from "~/types/order-management/draft-order-details.schema";
import OrderDetailStatusBadge from "./OrderDetailStatusBadge";
import { Separator } from "~/components/ui/separator";

type Customer = DraftOrderDetailsResponse["draftOrder"]["customer"];

interface OrderDetailHeaderProps {
  name: string;
  createdAt: string;
  customer: Customer;
  companyName: string;
  note2?: string;
  onReOrder?: () => void;
  isReOrdering?: boolean;
  statusCollection: {
    [key: string]: string;
  };
  tags?: string[];
  onPrint?: () => void;
  items: number;
}

export function OrderDetailHeader({
  name,
  createdAt,
  customer,
  statusCollection = {},
  companyName,
  onReOrder,
  isReOrdering,
  tags = [],
  note2,
  onPrint,
  items,
}: OrderDetailHeaderProps) {
  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 w-full">
        <div className="flex justify-between md:items-center w-full border-b pb-2">
          <h1 className="text-2xl font-bold">Order Detail</h1>

          <div className="flex flex-col md:flex-row gap-2 no-print">
            <Button
              variant="outline"
              onClick={onReOrder}
              disabled={isReOrdering}
            >
              <ShoppingCartIcon></ShoppingCartIcon>
              Reorder
            </Button>
            <Separator
              orientation="vertical"
              className="h-8 app-hidden md:block"
            ></Separator>
            <Button variant="outline" onClick={onPrint} className="no-print">
              <PrinterIcon className="h-4 w-4" />
              Print
            </Button>
          </div>
        </div>
        <div className="flex justify-between  gap-2">
          <div className="space-y-1">
            <p className="text-sm">
              Order Number: {name}{" "}
              {items ? `(${items} ${items > 1 ? "items" : "item"})` : ""}
            </p>
            <p className="text-sm">Company Name: {companyName}</p>
            <p className="text-sm">
              Ordered On: {format(new Date(createdAt), "MMMM d, yyyy")}
            </p>
            <p className="text-sm">
              Ordered By: {customer?.firstName} {customer?.lastName}
            </p>
            <p className="text-sm">Contact Email: {customer?.email}</p>
            <p className="text-sm flex gap-2">
              <div className="flex flex-col gap-2">
                {Object.entries(statusCollection).map(([key, value]) => (
                  <div className="flex gap-2" key={key}>
                    <div>{key}:</div>
                    <OrderDetailStatusBadge
                      key={key}
                      statusArray={[value]}
                      badgeClassName="flex w-fit"
                    />
                  </div>
                ))}
              </div>
            </p>
          </div>
          {/* <div className="flex items-end flex-col gap-2 no-print">
            <div className="font-bold">Need to Reorder?</div>
            <Button
              variant="outline"
              onClick={onReOrder}
              disabled={isReOrdering}
            >
              Add Items to Cart
            </Button>
          </div> */}
        </div>
      </div>
      {tags?.length > 0 && tags[0] === "rejected" && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3 space-y-1">
              <p className="text-sm font-semibold">
                Note from {customer?.firstName || ""} {customer?.lastName || ""}
              </p>
              <p className="text-sm">{note2 || ""}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
