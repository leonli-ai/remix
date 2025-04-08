import { Ellipsis, Loader2, Trash2, X } from "lucide-react";
import React, { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomStatusBadge from "~/components/common/CustomStatusBadge";
import CustomPrint from "~/components/icons/CustomPrint";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Separator } from "~/components/ui/separator";
import { getStatusColor, shouldShowWhichByQuotaStatus } from "~/lib/quote";
import { useShopifyInformation } from "~/lib/shopify";
import { QuoteStatusType } from "~/types/quotes/quote.schema";

import { QuoteDetailDialog } from "./QuoteDetailDialog";
import { DatePicker } from "~/components/ui/custom/date-picker";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { QuoteDetailInformationFormData } from "~/lib/schema/request-for-quote.schema";
import { FormProvider, UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";

interface ButtonsSectionProps {
  status: QuoteStatusType;
  id: string;
  handlePrint: () => void;
  onCancel: () => void;
  onDelete: () => void;
  shouldShowDeleteButton: boolean;
}

const Label = ({ children }: { children: React.ReactNode }) => {
  return <div className="font-bold">{children}</div>;
};

const GridItem = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string | ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("break-all text-sm space-y-1", className)}>
      <Label>{label}</Label>
      <div>{value || "-"}</div>
    </div>
  );
};

const PrintButton = ({
  handlePrint,
}: Pick<ButtonsSectionProps, "handlePrint">) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={handlePrint}
      className="no-print gap-1 p-0 text-sm font-bold text-primary-main"
    >
      <CustomPrint className="!h-6 !w-6" />
      {t("request-for-quote.detail.information.buttons.print")}
    </Button>
  );
};

const CancelButton = ({
  id,
  onCancel,
  status,
}: Pick<ButtonsSectionProps, "id" | "onCancel" | "status">) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={onCancel}
      className="no-print gap-1 p-0 text-sm font-bold text-primary-main"
    >
      <X className="!h-7 !w-7" strokeWidth={4} />
      {t("request-for-quote.detail.information.buttons.cancel")}
    </Button>
  );
};

const DeleteButton = ({
  id,
  onDelete,
}: Pick<ButtonsSectionProps, "id" | "onDelete">) => {
  const { t } = useTranslation();
  return (
    <Button
      variant="link"
      onClick={onDelete}
      className="no-print gap-1 p-0 text-sm font-bold text-primary-main"
    >
      <Trash2 className="!h-6 !w-6" strokeWidth={2} />
      {t("request-for-quote.detail.information.buttons.delete")}
    </Button>
  );
};
const DesktopButtonsSection = ({
  id,
  handlePrint,
  onCancel,
  onDelete,
  status,
  shouldShowDeleteButton,
}: ButtonsSectionProps) => {
  return (
    <div className="app-hidden items-center justify-end gap-4 lg:flex">
      <PrintButton handlePrint={handlePrint} />
      {shouldShowWhichByQuotaStatus(status, ["Submitted"]) && (
        <div className="flex items-center gap-4">
          <Separator orientation="vertical" className="h-6" />
          <CancelButton id={id} onCancel={onCancel} status={status} />
        </div>
      )}
      {shouldShowDeleteButton && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <DeleteButton id={id} onDelete={onDelete} />
        </>
      )}
    </div>
  );
};

const MobileButtonsSection = ({
  id,
  handlePrint,
  onCancel,
  onDelete,
  status,
  shouldShowDeleteButton,
}: ButtonsSectionProps) => {
  return (
    <div className="no-print flex justify-end lg:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-outline">
            <Ellipsis
              width={20}
              height={20}
              className="!h-5 !w-5 stroke-primary-main"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)]"
        >
          <DropdownMenuItem>
            <PrintButton handlePrint={handlePrint} />
          </DropdownMenuItem>
          {shouldShowWhichByQuotaStatus(status, ["Submitted"]) && (
            <DropdownMenuItem>
              <CancelButton id={id} onCancel={onCancel} status={status} />
            </DropdownMenuItem>
          )}
          {shouldShowDeleteButton && (
            <DropdownMenuItem>
              <DeleteButton id={id} onDelete={onDelete} />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const RenderEditExpirationDate = ({
  form,
}: {
  form: UseFormReturn<QuoteDetailInformationFormData>;
}) => {
  return (
    <FormField
      control={form.control}
      name="expirationDate"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <DatePicker
              {...field}
              minDate={new Date()}
              className="bg-white border-input text-primary-text"
              dateFormat="MM/dd/yyyy"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const RenderEditNotes = ({
  form,
}: {
  form: UseFormReturn<QuoteDetailInformationFormData>;
}) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Textarea
              {...field}
              className="bg-white border-input text-primary-text"
              rows={4}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const RenderEditPoNumber = ({
  form,
}: {
  form: UseFormReturn<QuoteDetailInformationFormData>;
}) => {
  return (
    <FormField
      control={form.control}
      name="poNumber"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Input
              {...field}
              className="bg-white border-input text-primary-text"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

interface QuoteDetailInformationCardProps {
  customerId: string;
  id: string;
  status: QuoteStatusType;
  createdAt: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  companyAccount: string;
  notes: string;
  poNumber: string;
  handlePrint: () => void;
  isLoading: boolean;
  type: "view" | "edit";
  expirationDate: string;
  className?: string;
  form: UseFormReturn<QuoteDetailInformationFormData>;
}

export default function QuoteDetailInformationCard({
  customerId,
  id,
  status,
  createdAt,
  firstName,
  lastName,
  emailAddress,
  phoneNumber,
  companyAccount,
  notes,
  poNumber,
  handlePrint,
  isLoading,
  type,
  expirationDate,
  className,
  form,
}: QuoteDetailInformationCardProps) {
  const { shopifyCustomerId } = useShopifyInformation();
  const { t } = useTranslation();

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleCancelQuote = () => {
    setCancelDialogOpen(true);
  };

  const handleDeleteQuote = () => {
    setDeleteDialogOpen(true);
  };

  const shouldShowDeleteButton = shopifyCustomerId === customerId;

  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-lg bg-gray-base p-5",
        className,
      )}
    >
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 items-center gap-6 lg:grid-cols-4">
            <div className="text-base font-bold lg:col-span-2">
              {t("request-for-quote.detail.information.title")}
            </div>
            <MobileButtonsSection
              id={id}
              handlePrint={handlePrint}
              onCancel={handleCancelQuote}
              onDelete={handleDeleteQuote}
              status={status}
              shouldShowDeleteButton={shouldShowDeleteButton}
            />
            <CustomStatusBadge
              className="w-fit"
              status={status}
              type={getStatusColor(status)}
            />
            <DesktopButtonsSection
              id={id}
              handlePrint={handlePrint}
              onCancel={handleCancelQuote}
              onDelete={handleDeleteQuote}
              status={status}
              shouldShowDeleteButton={shouldShowDeleteButton}
            />
          </div>
          <FormProvider {...form}>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              <GridItem
                label={t("request-for-quote.detail.information.created-at")}
                value={createdAt}
              />

              <GridItem
                label={t("request-for-quote.detail.information.first-name")}
                value={firstName}
              />
              <GridItem
                label={t("request-for-quote.detail.information.last-name")}
                value={lastName}
              />
              <GridItem
                label={t("request-for-quote.detail.information.email-address")}
                value={emailAddress}
              />
              <GridItem
                label={t("request-for-quote.detail.information.phone-number")}
                value={phoneNumber}
              />
              <GridItem
                label={t(
                  "request-for-quote.detail.information.company-account",
                )}
                value={companyAccount}
              />

              {/* po number */}
              {/* no print */}
              <GridItem
                className={cn(type === "edit" && "no-print")}
                label={t("request-for-quote.detail.information.po-number")}
                value={
                  type === "edit" ? (
                    <RenderEditPoNumber form={form} />
                  ) : (
                    poNumber
                  )
                }
              />
              {/* print only */}
              {type === "edit" && (
                <GridItem
                  className="app-hidden print-only"
                  label={t("request-for-quote.detail.information.po-number")}
                  value={poNumber}
                />
              )}

              {/* expiration date */}
              {/* no print */}
              <GridItem
                className={cn(type === "edit" && "no-print")}
                label={t(
                  "request-for-quote.detail.information.expiration-date",
                )}
                value={
                  type === "edit" ? (
                    <RenderEditExpirationDate form={form} />
                  ) : expirationDate ? (
                    format(new Date(expirationDate), "MM/dd/yyyy")
                  ) : (
                    "-"
                  )
                }
              />
              {/* print only */}
              {type === "edit" && (
                <GridItem
                  className="app-hidden print-only"
                  label={t(
                    "request-for-quote.detail.information.expiration-date",
                  )}
                  value={
                    expirationDate
                      ? format(new Date(expirationDate), "MM/dd/yyyy")
                      : "-"
                  }
                />
              )}

              {/* notes */}
              {/* no print */}
              <GridItem
                className={cn(type === "edit" && "no-print", "col-span-2")}
                label={t("request-for-quote.detail.information.notes")}
                value={
                  type === "edit" ? <RenderEditNotes form={form} /> : notes
                }
              />
              {/* print only */}
              {type === "edit" && (
                <GridItem
                  className="app-hidden print-only col-span-2"
                  label={t("request-for-quote.detail.information.notes")}
                  value={notes}
                />
              )}
            </div>
          </FormProvider>
          <QuoteDetailDialog
            id={id}
            isOpen={cancelDialogOpen}
            setIsOpen={setCancelDialogOpen}
            type="cancel"
          />
          <QuoteDetailDialog
            id={id}
            isOpen={deleteDialogOpen}
            setIsOpen={setDeleteDialogOpen}
            type="delete"
          />
        </>
      )}
    </div>
  );
}
