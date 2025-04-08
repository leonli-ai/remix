import React from 'react';
import type { CompanyContactProfile } from '~/hooks/use-customers';

interface CompanyTagsProps {
  profiles: CompanyContactProfile[];
}

export function CompanyTags({ profiles }: CompanyTagsProps) {
  if (!profiles.length) return <span>-</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {profiles.map((profile, i) => (
        <span
          key={i}
          className="
            inline-block
            px-2
            py-0.5
            m-0.5
            text-sm
            bg-gray-100
            text-gray-900
            rounded-full
          "
        >
          {profile.company.name}
        </span>
      ))}
    </div>
  );
} 