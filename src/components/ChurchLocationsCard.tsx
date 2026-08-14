import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Building2, 
  Clock, 
  Phone, 
  Mail, 
  Compass, 
  ExternalLink, 
  CheckCircle2, 
  Globe, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Calendar,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChurchLocation, CHURCH_LOCATIONS } from '../data/gospelData';

interface ChurchLocationsCardProps {
  churchName: string;
  customLocations?: ChurchLocation[];
  onSelectCampusForSchedule?: (campus: ChurchLocation) => void;
  className?: string;
}

export default function ChurchLocationsCard({
  churchName,
  customLocations,
  onSelectCampusForSchedule,
  className = ''
}: ChurchLocationsCardProps) {
  // Retrieve locations or fallback to default
  const campuses: ChurchLocation[] = customLocations || CHURCH_LOCATIONS[churchName] || [
    {
      id: 'loc-default-1',
      churchName: churchName,
      campusName: `${churchName} Main Worship Center`,
      isMainCampus: true,
      address: '777 Kingdom Avenue',
      city: 'Atlanta',
      stateOrRegion: 'GA',
      country: 'United States',
      zipCode: '30303',
      leadPastor: 'Senior Pastors & Leadership',
      phone: '+1 (800) 555-7700',
      email: `contact@${churchName.toLowerCase().replace(/\s+/g, '')}.org`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(churchName)}`,
      serviceTimes: ['Sundays: 9:00 AM & 11:30 AM EST', 'Midweek: Wednesdays 7:00 PM EST'],
      features: ['Main Worship Sanctuary', 'Youth & Kids Chapel', 'Free On-Site Parking', 'Wheelchair Accessible'],
      image: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80'
    }
  ];

  const [selectedCampusId, setSelectedCampusId] = useState<string>(campuses[0]?.id || '');
  const activeCampus = campuses.find(c => c.id === selectedCampusId) || campuses[0];

  return (
    <div className={`space-y-4 rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl shadow-2xl ${className}`}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {churchName} Campuses & Locations
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {campuses.length} {campuses.length === 1 ? 'Location' : 'Campuses'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Worship with us in person across multiple cities or tune in live online
          </p>
        </div>

        {activeCampus && onSelectCampusForSchedule && (
          <button
            onClick={() => onSelectCampusForSchedule(activeCampus)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/30 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-pink-400" />
            <span>Filter Schedule for {activeCampus.campusName.split(' ')[0]}</span>
          </button>
        )}
      </div>

      {/* Campus Selector Pills */}
      {campuses.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {campuses.map((campus) => {
            const isSelected = campus.id === activeCampus.id;
            return (
              <button
                key={campus.id}
                onClick={() => setSelectedCampusId(campus.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition shrink-0 flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-500 to-pink-600 text-slate-950 font-extrabold border-transparent shadow-lg'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/80'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{campus.campusName}</span>
                {campus.isMainCampus && (
                  <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider font-extrabold ${isSelected ? 'bg-slate-950 text-white' : 'bg-amber-500/20 text-amber-300'}`}>
                    Main
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Campus Detail Card */}
      <AnimatePresence mode="wait">
        {activeCampus && (
          <motion.div
            key={activeCampus.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 sm:p-5 overflow-hidden"
          >
            {/* Left Image & Pastor Card */}
            <div className="md:col-span-5 space-y-3">
              <div className="relative h-44 sm:h-48 rounded-xl overflow-hidden border border-slate-800 shadow-xl group">
                <img
                  src={activeCampus.image}
                  alt={activeCampus.campusName}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">{activeCampus.city}, {activeCampus.country}</span>
                  </div>
                  <a
                    href={activeCampus.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-pink-600/90 hover:bg-pink-500 text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md"
                  >
                    <Navigation className="w-3 h-3" /> Get Directions
                  </a>
                </div>
              </div>

              {/* Pastor & Contact Bar */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-3">
                  {activeCampus.pastorAvatar ? (
                    <img
                      src={activeCampus.pastorAvatar}
                      alt={activeCampus.leadPastor}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
                      <Users className="w-5 h-5" />
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Leadership</span>
                    <h4 className="text-xs font-bold text-white truncate">{activeCampus.leadPastor}</h4>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <a href={`tel:${activeCampus.phone}`} className="hover:text-amber-300 transition truncate">{activeCampus.phone}</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <a href={`mailto:${activeCampus.email}`} className="hover:text-amber-300 transition truncate">{activeCampus.email}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Details & Schedules */}
            <div className="md:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">Campus Location</span>
                    <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                      {activeCampus.campusName}
                    </h3>
                  </div>
                  {activeCampus.isMainCampus && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold shrink-0 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-amber-400" /> Headquarters
                    </span>
                  )}
                </div>

                {/* Full Address */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200">
                  <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{activeCampus.address}</p>
                    <p className="text-slate-400 text-[11px]">{activeCampus.city}, {activeCampus.stateOrRegion} {activeCampus.zipCode ? activeCampus.zipCode : ''} — {activeCampus.country}</p>
                  </div>
                </div>

                {/* Service Times Box */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    Campus Gathering Times
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeCampus.serviceTimes.map((time, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-200 font-medium flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span>{time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campus Features / Amenities Badges */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">Campus Amenities & Accessibility</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeCampus.features.map((feature, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 border border-slate-700/70 text-[10px] font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
                <a
                  href={activeCampus.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-white/80" />
                </a>

                {onSelectCampusForSchedule && (
                  <button
                    onClick={() => onSelectCampusForSchedule(activeCampus)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Campus Schedule</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
