"use client";

// Components
import { Popover } from "@radix-ui/themes";

// Types
import { PopupConfirmationProps } from "../types/PopupConfirmationProps";

export const PopupConfirmation = ({
  content,
  children,
}: PopupConfirmationProps) => {
  return (
    <Popover.Root>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content width="360px">{content}</Popover.Content>
    </Popover.Root>
  );
};
