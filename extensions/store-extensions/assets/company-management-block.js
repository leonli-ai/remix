const getCustomerInformation = async () => {
  const appUrl = document
    .querySelector(".company-management-wrapper")
    .getAttribute("data-app-url");

  try {
    const customerId = localStorage.getItem("customer-id");

    if (!customerId) {
      console.warn("No customer ID found");
      return null;
    }

    const response = await fetch(
      `${appUrl}/api/v1/customer-management/customer/get-by-id`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
          Origin: window.location.origin,
          Referer: window.location.origin + "/",
        },
        body: JSON.stringify({
          storeName: window.location.host,
          customerId: "gid://shopify/Customer/" + customerId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching customer information:", error);
    return null;
  }
};

const init = async () => {
  const shopifyCompanyLocationId = localStorage.getItem("company-location-id");
  const shopifyCompanyId = localStorage.getItem("company-id");

  const customerInfo = await getCustomerInformation();

  const adminRole =
    customerInfo?.roles?.find(
      (role) =>
        role?.companyLocationId?.includes(shopifyCompanyLocationId) ||
        role?.companyId?.includes(shopifyCompanyId),
    )?.name ?? "";

  if (adminRole === "Admin") {
    const companyManagementBlock = document.querySelector(
      ".company-management-wrapper",
    );
    if (companyManagementBlock) {
      companyManagementBlock.style.display = "flex";
    }
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
