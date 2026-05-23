import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.16em] transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--accent)] px-5 py-3 text-black shadow-[0_0_22px_rgba(var(--accent-rgb),0.12)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_36px_rgba(255,255,255,0.14)] active:translate-y-0',
        outline:
          'border border-[var(--border)] px-5 py-3 text-[var(--accent)] hover:-translate-y-0.5 hover:border-white/28 hover:bg-[var(--accent-soft)] hover:shadow-[0_12px_34px_rgba(0,0,0,0.28)] active:translate-y-0',
        ghost: 'px-3 py-2 text-[var(--secondary-text)] hover:-translate-y-0.5 hover:text-white active:translate-y-0',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);

Button.displayName = 'Button';

export { buttonVariants };
