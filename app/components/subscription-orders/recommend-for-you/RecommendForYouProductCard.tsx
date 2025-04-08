import { Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn, formatPrice } from "~/lib/utils";

interface RecommendForYouProductCardProps {
  product: {
    id: number;
    inventory: string;
    title: string;
    uom: string;
    listPrice: {
      amount: number;
      currency: string;
    };
    price: {
      amount: number;
      currency: string;
    };
    image: string;
    link: string;
    createdAt: string;
    customerPartnerNumber: string;
    SKU: string;
  };
  btnFunction: (sku: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

const isNewProduct = (createdAt: string): boolean => {
  const createdDate = new Date(createdAt);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - createdDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
};

export default function RecommendForYouProductCard({
  product,
  btnFunction,
  disabled = false,
  loading = false,
}: RecommendForYouProductCardProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col border rounded-md bg-gray-base h-full pb-2">
      <div className="px-[22px] py-[10px] border-b bg-white rounded-t-md h-[200px] flex items-center justify-center">
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
        >
          <img
            src={product.image}
            alt={product.title}
            className="object-contain w-full h-full"
          />
        </a>
      </div>
      <div className="flex flex-col gap-y-2 flex-1 justify-between">
        <div className="flex flex-col gap-y-1 px-3 py-1">
          <div className="text-xs text-gray-middle font-bold swiper-no-swiping">
            {product.inventory}
          </div>
          <div className="line-clamp-2 text-primary-text font-bold text-base leading-5 text-ellipsis swiper-no-swiping">
            <a href={product.link} target="_blank" rel="noopener noreferrer">
              {product.title}
            </a>
          </div>
          <div className="text-xs text-primary-text flex items-center flex-wrap gap-x-[2px] swiper-no-swiping">
            <div>
              {t(
                "subscription-orders.recommend-for-you.product-card.list-price",
              )}
              :
            </div>
            <div className="line-through">
              {formatPrice(
                product.listPrice.amount,
                product.listPrice.currency,
              )}
            </div>
          </div>
          <div className="text-xs text-primary-text flex items-center flex-wrap gap-x-[2px] swiper-no-swiping">
            <div>
              {t(
                "subscription-orders.recommend-for-you.product-card.your-price",
              )}
              :
            </div>
            <div className="flex items-center">
              <span className="text-lg font-bold">
                {formatPrice(product.price.amount, product.price.currency)}
              </span>{" "}
              / {product.uom}
            </div>
          </div>
          <Badge
            className={cn(
              "text-white bg-secondary-main hover:bg-secondary-main rounded-full px-3 my-[2px] w-fit",
              !isNewProduct(product.createdAt) && "opacity-0",
            )}
          >
            {t("subscription-orders.recommend-for-you.product-card.new")}
          </Badge>
          <div className="flex flex-col">
            <div className="text-xs text-primary-text w-full flex flex-wrap gap-x-1 swiper-no-swiping">
              <div>
                {t(
                  "subscription-orders.recommend-for-you.product-card.customer-partner-number",
                )}
                :
              </div>
              <div className="text-gray-middle">
                {product.customerPartnerNumber}
              </div>
            </div>
            <div className="text-xs text-primary-text w-full flex flex-wrap gap-x-1 swiper-no-swiping">
              <div>
                {t("subscription-orders.recommend-for-you.product-card.sku")}:
              </div>
              <div className="text-gray-middle">{product.SKU}</div>
            </div>
          </div>
        </div>

        <div className="px-3">
          <Button
            className="w-full h-11 border-primary text-primary gap-x-2 hover:text-primary"
            variant={"outline"}
            onClick={() => btnFunction(product.SKU)}
            disabled={disabled}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Check className="!w-6 !h-6" strokeWidth={3}></Check>
                <div className="flex-1">
                  {t(
                    "subscription-orders.recommend-for-you.product-card.subscribe-now",
                  )}
                </div>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
