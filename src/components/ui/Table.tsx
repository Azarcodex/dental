"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export default function Table({ headers, children, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-gray-100 bg-white", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50">
            {headers.map((header) => (
              <th 
                key={header} 
                className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {children}
        </tbody>
      </table>
    </div>
  );
}
