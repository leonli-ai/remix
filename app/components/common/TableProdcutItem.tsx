import { ImageIcon } from "lucide-react";
import { cn } from "~/lib/utils";
interface TableProductItemProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  sku?: string;
  className?: string;
}

export default function TableProductItem({
  imageSrc,
  imageAlt,
  title,
  sku,
  className,
}: TableProductItemProps) {
  return (
    <div className={cn("flex items-center gap-[10px]", className)}>
      <div>
        <img
          src={imageSrc || ""}
          alt={imageAlt || ""}
          className="h-[60px] w-[60px] min-w-[60px] max-w-fit rounded border border-gray-200 object-contain "
          onError={(e) => {
            e.currentTarget.style.display = "none";
            (e.currentTarget?.nextSibling as HTMLElement).style.display =
              "block";
          }}
        />
        <ImageIcon
          className="h-[60px] w-[60px] min-w-[60px] text-gray-400"
          style={{ display: "none" }}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="line-clamp-3 print-avoid-word-hidden font-normal">
          {title || ""}
        </div>
        {/* {item?.variant?.title && (
          <div className="bg-gray-base w-fit max-w-32 text-xs text-gray-500 line-clamp-1 py-1 px-2 rounded-lg">
            {item?.variant?.title || ""}
          </div>
        )} */}
      </div>
    </div>
  );
}
