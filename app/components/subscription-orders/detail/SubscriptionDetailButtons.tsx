import {
  Ellipsis,
  Loader2,
  Pause,
  Pencil,
  StepForward,
  Check,
  X,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { SubscriptionContractStatusType } from "~/types/subscription-contracts/subscription-contract.schema";
import { shouldShowButton } from "~/lib/subscription-orders";

interface ButtonProps {
  handleClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  type:
    | "skip-delivery"
    | "edit"
    | "pause"
    | "resume"
    | "approve"
    | "decline"
    | "cancel"
    | "delete";
}

const SubscriptionDetailButtons = ({
  isLoading,
  disabled,
  handleClick,
  type,
}: ButtonProps) => {
  const { t } = useTranslation();
  const i18nKey = `subscription-orders.detail.information-card.buttons.${type}`;
  const config = {
    "skip-delivery": {
      icon: <StepForward className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    edit: {
      icon: <Pencil className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    pause: {
      icon: <Pause className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    resume: {
      icon: <RotateCcw className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    approve: {
      icon: <Check className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    decline: {
      icon: <X className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    cancel: {
      icon: <X className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
    delete: {
      icon: <Trash2 className="!h-6 !w-6" />,
      text: t(i18nKey),
    },
  };
  return (
    <Button
      variant="link"
      onClick={handleClick}
      disabled={isLoading || disabled}
      className="gap-1 p-0 text-sm font-bold text-primary-main"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        config[type].icon
      )}
      {config[type].text}
    </Button>
  );
};

export type SubscriptionDetailButtonConfig = Partial<
  Record<
    ButtonProps["type"],
    {
      isLoading?: boolean;
      disabled?: boolean;
      onClick: () => void;
    }
  >
>;

interface SubscriptionDetailDestopButtonsProps {
  orderApproverRole: boolean;
  status: SubscriptionContractStatusType;
  className?: string;
  disabledAll?: boolean;
  buttonConfig?: SubscriptionDetailButtonConfig;
}

export const SubscriptionDetailDestopButtons = ({
  status,
  orderApproverRole,
  className,
  disabledAll,
  buttonConfig,
}: SubscriptionDetailDestopButtonsProps) => {
  return (
    <div
      className={cn(
        "app-hidden lg:flex gap-x-6 items-center justify-end [&>*:last-child]:hidden",
        className,
      )}
    >
      {/* Approve */}
      {orderApproverRole && shouldShowButton(status, ["pending"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["approve"]?.onClick || (() => {})}
            type="approve"
            isLoading={buttonConfig?.["approve"]?.isLoading}
            disabled={buttonConfig?.["approve"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Decline */}
      {orderApproverRole && shouldShowButton(status, ["pending"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["decline"]?.onClick || (() => {})}
            type="decline"
            isLoading={buttonConfig?.["decline"]?.isLoading}
            disabled={buttonConfig?.["decline"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Resume */}
      {shouldShowButton(status, ["paused"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["resume"]?.onClick || (() => {})}
            type="resume"
            isLoading={buttonConfig?.["resume"]?.isLoading}
            disabled={buttonConfig?.["resume"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Pause */}
      {shouldShowButton(status, ["active"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["pause"]?.onClick || (() => {})}
            type="pause"
            isLoading={buttonConfig?.["pause"]?.isLoading}
            disabled={buttonConfig?.["pause"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Skip Delivery */}
      {shouldShowButton(status, ["active"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["skip-delivery"]?.onClick || (() => {})}
            type="skip-delivery"
            isLoading={buttonConfig?.["skip-delivery"]?.isLoading}
            disabled={buttonConfig?.["skip-delivery"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Edit */}
      {shouldShowButton(status, ["pending"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["edit"]?.onClick || (() => {})}
            type="edit"
            isLoading={buttonConfig?.["edit"]?.isLoading}
            disabled={buttonConfig?.["edit"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Delete */}
      {shouldShowButton(status, ["pending"]) && (
        <>
          <SubscriptionDetailButtons
            handleClick={buttonConfig?.["delete"]?.onClick || (() => {})}
            type="delete"
            isLoading={buttonConfig?.["delete"]?.isLoading}
            disabled={buttonConfig?.["delete"]?.disabled || disabledAll}
          />
          <Separator orientation="vertical" className="h-6" />
        </>
      )}
    </div>
  );
};

export const SubscriptionDetailMobileButtons = ({
  status,
  orderApproverRole,
  className,
  buttonConfig,
  disabledAll,
}: SubscriptionDetailDestopButtonsProps) => {
  return (
    <div className={cn("flex lg:hidden justify-end", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-outline">
            <Ellipsis
              width={20}
              height={20}
              className="!w-5 !h-5 stroke-primary-main"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="shadow-[0px_4px_30px_0px_rgba(0,0,0,0.25)]"
        >
          {/* Approve */}
          {orderApproverRole && shouldShowButton(status, ["pending"]) && (
            <>
              <DropdownMenuItem>
                <SubscriptionDetailButtons
                  handleClick={buttonConfig?.["approve"]?.onClick || (() => {})}
                  type="approve"
                  isLoading={buttonConfig?.["approve"]?.isLoading}
                  disabled={buttonConfig?.["approve"]?.disabled || disabledAll}
                />
              </DropdownMenuItem>
            </>
          )}

          {/* Decline */}
          {orderApproverRole && shouldShowButton(status, ["pending"]) && (
            <>
              <DropdownMenuItem>
                <SubscriptionDetailButtons
                  handleClick={buttonConfig?.["decline"]?.onClick || (() => {})}
                  type="decline"
                  isLoading={buttonConfig?.["decline"]?.isLoading}
                  disabled={buttonConfig?.["decline"]?.disabled || disabledAll}
                />
              </DropdownMenuItem>
            </>
          )}

          {/* Resume */}
          {shouldShowButton(status, ["paused"]) && (
            <>
              <DropdownMenuItem>
                <SubscriptionDetailButtons
                  handleClick={buttonConfig?.["resume"]?.onClick || (() => {})}
                  type="resume"
                  isLoading={buttonConfig?.["resume"]?.isLoading}
                  disabled={buttonConfig?.["resume"]?.disabled || disabledAll}
                />
              </DropdownMenuItem>
            </>
          )}
          {/* Pause */}
          {shouldShowButton(status, ["active"]) && (
            <>
              <DropdownMenuItem>
                <SubscriptionDetailButtons
                  handleClick={buttonConfig?.["pause"]?.onClick || (() => {})}
                  type="pause"
                  isLoading={buttonConfig?.["pause"]?.isLoading}
                  disabled={buttonConfig?.["pause"]?.disabled || disabledAll}
                />
              </DropdownMenuItem>
              <Separator orientation="vertical" className="h-6" />
            </>
          )}

          {/* Skip Delivery */}
          {shouldShowButton(status, ["active"]) && (
            <DropdownMenuItem>
              <SubscriptionDetailButtons
                handleClick={
                  buttonConfig?.["skip-delivery"]?.onClick || (() => {})
                }
                type="skip-delivery"
                isLoading={buttonConfig?.["skip-delivery"]?.isLoading}
                disabled={
                  buttonConfig?.["skip-delivery"]?.disabled || disabledAll
                }
              />
            </DropdownMenuItem>
          )}

          {/* Edit */}
          {shouldShowButton(status, ["pending"]) && (
            <DropdownMenuItem>
              <SubscriptionDetailButtons
                handleClick={buttonConfig?.["edit"]?.onClick || (() => {})}
                type="edit"
                isLoading={buttonConfig?.["edit"]?.isLoading}
                disabled={buttonConfig?.["edit"]?.disabled || disabledAll}
              />
            </DropdownMenuItem>
          )}

          {/* Delete */}
          {shouldShowButton(status, ["pending"]) && (
            <DropdownMenuItem>
              <SubscriptionDetailButtons
                handleClick={buttonConfig?.["delete"]?.onClick || (() => {})}
                type="delete"
                isLoading={buttonConfig?.["delete"]?.isLoading}
                disabled={buttonConfig?.["delete"]?.disabled || disabledAll}
              />
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
