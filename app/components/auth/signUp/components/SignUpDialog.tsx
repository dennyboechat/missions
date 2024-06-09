"use client";

// Components
import { SignUp } from "@clerk/nextjs";
import { Dialog, Button, Flex } from "@radix-ui/themes";

// Types
import { SignUpDialogProps } from "../types/SignUpDialogProps";

export const SignUpDialog = ({ onClose }: SignUpDialogProps) => (
  <Dialog.Root defaultOpen onOpenChange={onClose}>
    <Dialog.Content width="450px">
      <SignUp routing="hash" />
      <Flex gap="3" justify="end">
        <Dialog.Close>
          <Button variant="soft" color="gray" onClick={onClose}>
            Close
          </Button>
        </Dialog.Close>
      </Flex>
    </Dialog.Content>
  </Dialog.Root>
);
