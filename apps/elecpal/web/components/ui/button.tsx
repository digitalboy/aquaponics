import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md active:scale-[0.98]',
        destructive: 'bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm active:scale-[0.98]',
        outline: 'border border-border bg-slate-900/60 text-slate-200 shadow-sm hover:bg-slate-800 hover:text-slate-100',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold shadow-sm',
        ghost: 'hover:bg-slate-800 hover:text-slate-100 text-slate-300',
        link: 'text-amber-400 underline-offset-4 hover:underline font-bold',
        cad: 'bg-slate-850 hover:bg-slate-750 text-slate-200 border border-slate-700 font-cad font-medium',
        cadActive: 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black font-cad shadow-md',
      },
      size: {
        default: 'h-8 px-3 py-1.5 gap-1.5 text-xs',
        sm: 'h-7 rounded-md px-2.5 text-xs gap-1.5',
        lg: 'h-9.5 rounded-lg px-4 text-sm gap-2 font-bold',
        icon: 'size-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
