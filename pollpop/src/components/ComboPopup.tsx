"use client";

import { AnimatePresence, motion } from "framer-motion";

type ComboPopupProps = {
  combo: number;
};

export function ComboPopup({ combo }: ComboPopupProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            key={combo}
            initial={{ scale: 0.4, opacity: 0, y: 24 }}
            animate={{ scale: 1.15, opacity: 1, y: 0 }}
            exit={{ scale: 1.4, opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
            className="rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 px-8 py-4 text-3xl font-black tracking-tight text-slate-950 shadow-2xl"
          >
            {combo} COMBO!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
