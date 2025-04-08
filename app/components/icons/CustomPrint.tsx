import type { Ref, SVGProps } from 'react';
import { forwardRef, memo } from 'react';

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    ref={ref}
    {...props}
  >
    <path
      d="M19.5 9.5V5.01758C19.5 4.68594 19.3684 4.36836 19.134 4.13359L17.366 2.36602C17.1316 2.13164 16.8137 2 16.482 2H5.75C5.05977 2 4.5 2.55977 4.5 3.25V9.5C3.11914 9.5 2 10.6191 2 12V16.375C2 16.7203 2.27969 17 2.625 17H4.5V20.75C4.5 21.4402 5.05977 22 5.75 22H18.25C18.9402 22 19.5 21.4402 19.5 20.75V17H21.375C21.7203 17 22 16.7203 22 16.375V12C22 10.6191 20.8809 9.5 19.5 9.5ZM17 19.5H7V15.75H17V19.5ZM17 10.75H7V4.5H14.5V6.375C14.5 6.72031 14.7797 7 15.125 7H17V10.75ZM18.875 13.5625C18.3574 13.5625 17.9375 13.1426 17.9375 12.625C17.9375 12.107 18.3574 11.6875 18.875 11.6875C19.3926 11.6875 19.8125 12.107 19.8125 12.625C19.8125 13.1426 19.3926 13.5625 18.875 13.5625Z"
      fill="currentColor"
    />
  </svg>
);
const ForwardRef = forwardRef(SvgComponent);
const CustomPrint = memo(ForwardRef);
export default CustomPrint;
