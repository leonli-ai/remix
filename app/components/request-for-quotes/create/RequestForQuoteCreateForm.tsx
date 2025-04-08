import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";
import RequestForQuoteInformationForm from "./RequestForQuoteInformationForm";
interface RequestForQuoteCreateFormProps {
  className?: string;
}
export default function RequestForQuoteCreateForm({
  className,
}: RequestForQuoteCreateFormProps) {
  const { t } = useTranslation();

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <h1 className="text-2xl font-bold">
        {t("request-for-quote.create.title")}
      </h1>
      <RequestForQuoteInformationForm />
    </div>
  );
}
