"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitErrorHandler } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";
import { api } from "@/lib/trpc";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { ActionButton } from "@/components/ui/action-button";

function ApiKeySuccess({ apiKey }: { apiKey: string }) {
  const [isCopied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="py-4">
        Note: please copy the key and store it somewhere safe. Once you close
        the dialog, you won&apos;t be able to access it again.
      </div>
      <div className="flex space-x-2 pt-2">
        <Input value={apiKey} readOnly />
        <Button onClick={onCopy}>
          {!isCopied ? (
            <Copy className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function AddApiKeyForm({ onSuccess }: { onSuccess: (key: string) => void }) {
  const formSchema = z.object({
    name: z.string(),
  });
  const router = useRouter();
  const mutator = api.apiKeys.create.useMutation({
    onSuccess: (resp) => {
      onSuccess(resp.key);
      router.refresh();
    },
    onError: () => {
      toast({ description: "Something went wrong", variant: "destructive" });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(value: z.infer<typeof formSchema>) {
    mutator.mutate({ name: value.name });
  }

  const onError: SubmitErrorHandler<z.infer<typeof formSchema>> = (errors) => {
    toast({
      description: Object.values(errors)
        .map((v) => v.message)
        .join("\n"),
      variant: "destructive",
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex w-full space-x-3 space-y-8 pt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => {
            return (
              <FormItem className="flex-1">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Name" {...field} />
                </FormControl>
                <FormDescription>
                  Give your API key a unique name
                </FormDescription>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <ActionButton
          className="h-full"
          type="submit"
          loading={mutator.isPending}
        >
          Create
        </ActionButton>
      </form>
    </Form>
  );
}

export default function AddApiKey() {
  const [key, setKey] = useState<string | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>New API Key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {key ? "Key was successfully created" : "Create API key"}
          </DialogTitle>
          <DialogDescription>
            {key ? (
              <ApiKeySuccess apiKey={key} />
            ) : (
              <AddApiKeyForm onSuccess={setKey} />
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              onClick={() => setKey(undefined)}
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
