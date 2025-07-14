"use client";
import React from "react";

interface AuthContainerProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthContainer({
  title,
  description,
  children,
}: AuthContainerProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="text-gray-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
