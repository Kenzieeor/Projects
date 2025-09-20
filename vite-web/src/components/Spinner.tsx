import { useState, useEffect } from "react";

export function Spinner({
  children,
  isLoading,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}) {
  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex justify-center pt-20 z-50">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin [animation-duration:0.4s]" />
        </div>
      )}
      {!isLoading && children}
    </>
  );
}
