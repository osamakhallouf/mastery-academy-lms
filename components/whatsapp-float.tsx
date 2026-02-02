"use client";

import { RiWhatsappFill } from "react-icons/ri";

interface WhatsAppFloatProps {
  message?: string;
}

export const WhatsAppFloat = ({ message }: WhatsAppFloatProps) => {
  const text = message ?? "Hello Mastery Academy, I need support.";
  return (
    <a
      href={`https://wa.me/971557028756?text=${encodeURIComponent(text)}`}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 h-11 w-11 md:h-auto md:w-auto md:px-4 md:py-3 md:gap-2"
      aria-label="WhatsApp Contact"
      rel="noreferrer"
      target="_blank"
    >
      <RiWhatsappFill className="h-5 w-5" />
      <span className="hidden md:inline text-sm font-medium" dir="ltr">
        +971557028756
      </span>
    </a>
  );
};
