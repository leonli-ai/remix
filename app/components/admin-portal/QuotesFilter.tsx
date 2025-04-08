import { TextField, Select } from "@shopify/polaris";
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
interface QuotesFilterProps {
  onFilter: (filter: {
    quoteNumber?: string;
    status?: string;
    poNumber?: string;
    createdAt?: string;
    updatedAt?: string;
    owner?: string;
  }) => void;
}

const statusOptions = [
  { label: "Submitted", value: "Submitted" },
  { label: "Approved", value: "Approved" },
  { label: "Ordered", value: "Ordered" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Declined", value: "Declined" },
  { label: "Expired", value: "Expired" },
];

export function QuotesFilter({
  onFilter,
}: QuotesFilterProps) {
  const { t } = useTranslation();
  const [quoteNumber, setQuoteNumber] = useState("");
  const [status, setStatus] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [customer, setCustomer] = useState("");

  const handleQuoteNumberChange = useCallback((value: string) => setQuoteNumber(value), []);

  const handleStatusChange = useCallback(
    (value: string) => setStatus(value),
    [],
  );

  const handlePoNumberChange = useCallback(
    (value: string) => setPoNumber(value),
    [],
  );

  const handleCreatedAtChange = useCallback(
    (value: string) => setCreatedAt(value),
    [],
  );

  const handleExpirationDateChange = useCallback(
    (value: string) => setExpirationDate(value),
    [],
  );

  const handleCustomerChange = useCallback(
    (value: string) => setCustomer(value),
    [],
  );

  useEffect(() => {
    const newFilters = {
      ...(quoteNumber ? { id: Number(quoteNumber) } : {}),
      ...(status ? { status } : {}),
      ...(poNumber ? { poNumber } : {}),
      ...(createdAt ? { createdAt } : {}),
      ...(expirationDate ? { expirationDate } : {}),
      ...(customer ? { customer } : {})
    };

    onFilter(newFilters);
  }, [quoteNumber, status, poNumber, createdAt, expirationDate, customer]);

  return (
    <div className="flex gap-2 justify-between">
      <TextField
        label=''
        placeholder={t(
          "admin-portal.quotes.filter.quote-number-placeholder",
        )}
        value={quoteNumber}
        onChange={handleQuoteNumberChange}
        autoComplete="off"
        labelHidden
      />
      <Select
        label=''
        options={statusOptions}
        value={status}
        onChange={handleStatusChange}
        labelHidden
        placeholder={t(
          "admin-portal.quotes.filter.status-placeholder",
        )}
      />
      <TextField
        label=''
        placeholder={t(
          "admin-portal.quotes.filter.po-number-placeholder",
        )}
        value={poNumber}
        onChange={handlePoNumberChange}
        autoComplete="off"
        labelHidden
      />
      <TextField
        label=''
        placeholder={t(
          "admin-portal.quotes.filter.created-at-placeholder",
        )}
        value={createdAt}
        onChange={handleCreatedAtChange}
        autoComplete="off"
        labelHidden
        type="date"
      />
      <TextField
        label=''
        placeholder={t(
          "admin-portal.quotes.filter.expiration-date-placeholder",
        )}
        value={expirationDate}
        onChange={handleExpirationDateChange}
        autoComplete="off"
        labelHidden
        type="date"
      />
      <TextField
        label=''
        placeholder={t(
          "admin-portal.quotes.filter.customer-placeholder",
        )}
        value={customer}
        onChange={handleCustomerChange}
        autoComplete="off"
        labelHidden
      />

    </div>
  );
}
