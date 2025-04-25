import { MailWarning } from "lucide-react";

interface formWarningProps {
  message?: string;
}

export const FormWarning = ({ message }: formWarningProps) => {
  if (!message) {
    return null;
  }

  return (
    <div className="bg-orange-100 p-3 rounded-md flex items-center gap-x-2 text-sm text-orange-700">
      <MailWarning className="h-4 w-4 text-orange-700" />
      <p>{message}</p>
    </div>
  );
};
