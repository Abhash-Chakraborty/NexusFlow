"use client";

import { cn } from "@lib/utils";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export const Modal = Dialog.Root;
export const ModalTrigger = Dialog.Trigger;

export function ModalContent({ children, className, ...props }: Dialog.DialogContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-[rgba(19,32,51,0.24)] backdrop-blur-sm" />
      <Dialog.Content
        className={cn(
          "surface-card fixed left-1/2 top-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-[24px] p-6",
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 text-text-muted hover:bg-surface-2 hover:text-text-primary">
          <X className="h-4 w-4" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
