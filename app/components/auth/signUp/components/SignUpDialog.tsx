"use client";

// Components
import { SignUp } from "@clerk/nextjs";
import { Dialog, Button, Flex } from "@radix-ui/themes";
import { useUser } from "@clerk/nextjs";

// Types
import { SignUpDialogProps } from "../types/SignUpDialogProps";

export const SignUpDialog = ({ onClose }: SignUpDialogProps) => {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || isSignedIn) {
    return null;
  }

  return (
    <Dialog.Root defaultOpen onOpenChange={onClose}>
      <Dialog.Content width="460px">
        <Dialog.Title>Sign Up</Dialog.Title>
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
};
