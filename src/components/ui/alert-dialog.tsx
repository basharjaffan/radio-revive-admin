'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/lib/utils';

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;

interface AlertDialogOverlayProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> {}

const AlertDialogOverlay = React.forwardRef<HTMLDivElement, AlertDialogOverlayProps>(
  function AlertDialogOverlay(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPrimitive.Overlay
        className={cn(
          'fixed inset-0 z-50 bg-black/80',
          className
        )}
        {...rest}
        ref={ref}
      />
    );
  }
);

interface AlertDialogContentProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content> {}

const AlertDialogContent = React.forwardRef<HTMLDivElement, AlertDialogContentProps>(
  function AlertDialogContent(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
          ref={ref}
          className={cn(
            'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg',
            className
          )}
          {...rest}
        />
      </AlertDialogPortal>
    );
  }
);

function AlertDialogHeader(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}
      {...rest}
    />
  );
}

function AlertDialogFooter(props: React.HTMLAttributes<HTMLDivElement>) {
  const { className, ...rest } = props;
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...rest}
    />
  );
}

interface AlertDialogTitleProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title> {}

const AlertDialogTitle = React.forwardRef<HTMLHeadingElement, AlertDialogTitleProps>(
  function AlertDialogTitle(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPrimitive.Title
        ref={ref}
        className={cn('text-lg font-semibold', className)}
        {...rest}
      />
    );
  }
);

interface AlertDialogDescriptionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description> {}

const AlertDialogDescription = React.forwardRef<HTMLParagraphElement, AlertDialogDescriptionProps>(
  function AlertDialogDescription(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPrimitive.Description
        ref={ref}
        className={cn('text-sm text-gray-500', className)}
        {...rest}
      />
    );
  }
);

interface AlertDialogActionProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {}

const AlertDialogAction = React.forwardRef<HTMLButtonElement, AlertDialogActionProps>(
  function AlertDialogAction(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPrimitive.Action
        ref={ref}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...rest}
      />
    );
  }
);

interface AlertDialogCancelProps extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {}

const AlertDialogCancel = React.forwardRef<HTMLButtonElement, AlertDialogCancelProps>(
  function AlertDialogCancel(props, ref) {
    const { className, ...rest } = props;
    return (
      <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(
          'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0',
          className
        )}
        {...rest}
      />
    );
  }
);

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
