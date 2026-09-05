import React from 'react';
import { Users, ShieldCheck, Mail, MapPin, Building, UserCheck } from 'lucide-react';

export function UsersTeamPage() {
  const officers = [
    {
      name: 'Rohinth Kumaran',
      role: 'Inspector (Grade I) - Primary Enforcement Officer',
      email: 'rohinth.k@lm.gov.in',
      zone: 'Kumbakonam & Thanjavur Zone',
      status: 'Active'
    },
    {
      name: 'Vishwa T.',
      role: 'Senior Metrological Officer',
      email: 'vishwa.t@lm.gov.in',
      zone: 'Chennai Central Zone',
      status: 'Active'
    },
    {
      name: 'Siva Anand',
      role: 'Deputy Controller of Legal Metrology',
      email: 'siva.a@lm.gov.in',
      zone: 'Tamil Nadu State Headquarters',
      status: 'Active'
    },
    {
      name: 'K. Meenakshi',
      role: 'Laboratory Verification Specialist',
      email: 'meenakshi.k@lm.gov.in',
      zone: 'Standards & Calibration Lab, Trichy',
      status: 'Active'
    }
  ];

  return (
    <div id="users-team-page" className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">
          Department Officers & Enforcement Team
        </h1>
        <p className="text-sm text-slate-500">
          Zonal inspectors, legal metrology officers, and laboratory verification authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {officers.map((officer) => (
          <div
            key={officer.email}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
              {officer.name.split(' ').map((n) => n[0]).join('')}
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm truncate">{officer.name}</h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {officer.status}
                </span>
              </div>
              <div className="text-xs font-semibold text-blue-600 truncate">{officer.role}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{officer.zone}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
