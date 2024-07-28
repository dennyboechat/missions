"use client";

// Components
import { SignIn } from "@clerk/nextjs";
import { Dialog, Button, Flex } from "@radix-ui/themes";

// Types
import { SignInDialogProps } from "../types/SignInDialogProps";

export const SignInDialog = ({ onClose }: SignInDialogProps) => (
  <Dialog.Root defaultOpen onOpenChange={onClose}>
    <Dialog.Content width="460px">
      <SignIn routing="hash" />
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
