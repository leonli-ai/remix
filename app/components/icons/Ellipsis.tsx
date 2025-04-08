import type { Ref, SVGProps } from 'react';
import { forwardRef, memo } from 'react';

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="currentColor"
    ref={ref}
    {...props}
  >
    <path d="M12.42 10A2.418 2.418 0 0 1 10 12.418a2.418 2.418 0 0 1-2.42-2.42A2.418 2.418 0 0 1 10 7.58 2.418 2.418 0 0 1 12.42 10Zm3.494-2.42a2.418 2.418 0 0 0-2.42 2.42 2.418 2.418 0 0 0 2.42 2.419 2.418 2.418 0 0 0 2.42-2.42 2.418 2.418 0 0 0-2.42-2.419Zm-11.828 0A2.418 2.418 0 0 0 1.666 10a2.418 2.418 0 0 0 2.42 2.419 2.418 2.418 0 0 0 2.42-2.42 2.418 2.418 0 0 0-2.42-2.419Z" />
  </svg>
);
const ForwardRef = forwardRef(SvgComponent);
const Ellipsis = memo(ForwardRef);

export default Ellipsis;
