import * as React from "react";
import { Button } from "./button";

const VARIANT_CLASSES = {
  default:
    "flex flex-col h-fit p-2 w-16 text-xs max-md:p-1 max-md:w-12 max-md:text-[10px]",
  primary:
    "flex flex-col h-fit p-2 w-16 text-xs bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white max-md:p-1 max-md:w-12 max-md:text-[10px]",
};

const BigButton = React.forwardRef(
  (
    { className = "", icon: Icon, children, variant = "default", ...props },
    ref,
  ) => {
    const variantClass = VARIANT_CLASSES[variant] || VARIANT_CLASSES.default;
    return (
      <Button
        variant="outline"
        size="lg"
        className={`max-md:flex-1 min-w-fit ${variantClass} ${className}`}
        ref={ref}
        {...props}
      >
        <Icon className="size-5 max-md:size-4" />
        <span className="text-center">{children}</span>
      </Button>
    );
  },
);
BigButton.displayName = "BigButton";

export default BigButton;
