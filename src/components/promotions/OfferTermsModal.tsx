import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { FREE_WEBSITE_PROMO } from "@/data/promotions";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

interface OfferTermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const OfferTermsModal: React.FC<OfferTermsModalProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass border-border/80 p-6 md:p-8 rounded-2xl">
        <DialogHeader className="mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit mb-2">
            <ShieldCheck className="w-4 h-4" /> Official Promotional Terms
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {FREE_WEBSITE_PROMO.terms.title}
          </DialogTitle>
          <DialogDescription className="text-sm opacity-80">
            Clear, transparent terms governing the DigiFormation 2026 complimentary business website offer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm divide-y divide-border/40">
          {FREE_WEBSITE_PROMO.terms.sections.map((section, idx) => (
            <div key={section.heading} className={idx > 0 ? "pt-5" : ""}>
              <h4 className="font-semibold text-base mb-2.5 text-foreground flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gradient-brand text-[10px] font-bold grid place-items-center text-primary-foreground flex-shrink-0">
                  {idx + 1}
                </span>
                {section.heading.replace(/^\d+\.\s*/, "")}
              </h4>
              <ul className="space-y-2 opacity-90 pl-7 list-disc">
                {section.details.map((item, dIdx) => (
                  <li key={dIdx} className="leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs opacity-70">
          <span>DigiFormation Ltd · Companies House Registered</span>
          <span>Zero Hidden Traps</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferTermsModal;
