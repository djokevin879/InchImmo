"use client";

import { useEffect, useState } from "react";
import { getGeminiAdvice } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function GeminiDashboardAdvice({ stats }: { stats: any }) {
  const [advice, setAdvice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function fetchAdvice() {
      const res = await getGeminiAdvice(stats);
      setAdvice(res);
      setLoading(false);
    }
    fetchAdvice();
  }, [stats]);

  if (loading) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-4 w-4 animate-spin mr-2 text-primary" />
          <span className="text-sm font-medium text-primary">Analyse des données par Gemini...</span>
        </CardContent>
      </Card>
    );
  }

  if (!advice) return null;

  return (
    <Card className="bg-white border-l-4 border-l-primary shadow-sm shadow-gray-200/50 overflow-hidden transition-all duration-300">
      <CardHeader 
        className="pb-3 border-b border-gray-50 bg-gray-50/30 cursor-pointer select-none hover:bg-gray-50/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="text-[10px] uppercase tracking-[0.2em] font-black text-primary">Intelligence Stratégique</div>
            </div>
            <CardTitle className="text-xl font-black text-secondary mt-1">Conseils de l'IA</CardTitle>
          </div>
          <div className="h-8 w-8 rounded-full border flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary transition-all">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="p-6 space-y-4">
              <p className="text-sm font-medium text-gray-700 leading-relaxed border-b pb-4 border-gray-100">{advice.summary}</p>
              <ul className="grid gap-3">
                {advice.advices.map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm group">
                    <div className="h-5 w-5 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <span className="text-[10px] font-black text-primary">{i+1}</span>
                    </div>
                    <span className="text-gray-600 font-medium pt-0.5">{a}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
