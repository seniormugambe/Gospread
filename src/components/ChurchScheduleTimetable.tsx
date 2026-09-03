import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Radio, 
  Search, 
  LayoutList, 
  LayoutGrid, 
  CheckCircle2, 
  ExternalLink, 
  Bell, 
  ChevronRight,
  Filter,
  Building2,
  Sparkles,
  Share2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceScheduleItem, CHURCH_SCHEDULES, VideoStream } from '../data/gospelData';
import SocialMediaLinksBar from './SocialMediaLinksBar';
import ChurchLocationsCard from './ChurchLocationsCard';

interface ChurchScheduleTimetableProps {
  onSelectChannelModal?: (channelName: string) => void;
  onSelectVideo?: (video: VideoStream) => void;
  onWatchLiveService?: (churchName: string) => void;
  activeFilterChurch?: string;
  theme?: 'dark' | 'light';
}

type ViewMode = 'table' | 'cards';
type DayFilter = 'all' | 'Sunday' | 'Wednesday' | 'Friday' | 'Saturday';

export default function ChurchScheduleTimetable({
  onSelectChannelModal,
  onWatchLiveService,
  activeFilterChurch = 'all',
  theme = 'dark'
}: ChurchScheduleTimetableProps) {
  const [selectedChurch, setSelectedChurch] = useState<string>(activeFilterChurch);
  const [selectedDay, setSelectedDay] = useState<DayFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [reminderSetIds, setReminderSetIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Flatten all schedules with church reference
  const allSchedulesWithChurch = useMemo(() => {
    const list: Array<ServiceScheduleItem & { churchName: string }> = [];
    Object.entries(CHURCH_SCHEDULES).forEach(([churchName, schedules]) => {
      schedules.forEach(sch => {
        list.push({ ...sch, churchName });
      });
    });
    return list;
  }, []);

  const churchList = useMemo(() => {
    return Object.keys(CHURCH_SCHEDULES);
  }, []);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return allSchedulesWithChurch.filter(item => {
      const matchesChurch = selectedChurch === 'all' || item.churchName === selectedChurch;
      const matchesDay = selectedDay === 'all' || item.day.toLowerCase() === selectedDay.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        item.title.toLowerCase().includes(q) ||
        item.churchName.toLowerCase().includes(q) ||
        item.speakerOrLeader.toLowerCase().includes(q) ||
        item.locationOrStream.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q);

      return matchesChurch && matchesDay && matchesSearch;
    });
  }, [allSchedulesWithChurch, selectedChurch, selectedDay, searchQuery]);

  const handleToggleReminder = (id: string, title: string) => {
    setReminderSetIds(prev => {
      const exists = prev.includes(id);
      const updated = exists ? prev.filter(item => item !== id) : [...prev, id];
      setToastMessage(exists ? `Reminder removed for "${title}"` : `🔔 Reminder scheduled for "${title}"!`);
      setTimeout(() => setToastMessage(null), 3000);
      return updated;
    });
  };

  const handleAddToCalendar = (item: ServiceScheduleItem & { churchName: string }) => {
    const title = encodeURIComponent(`${item.churchName}: ${item.title}`);
    const details = encodeURIComponent(`${item.description}\nSpeaker: ${item.speakerOrLeader}\nLocation: ${item.locationOrStream}`);
    const location = encodeURIComponent(item.locationOrStream);
    const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(googleCalUrl, '_blank');
    setToastMessage(`Opening calendar for "${item.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-4 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2 border border-amber-400"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏛️ Timetable Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                <span>Sanctuary Timetable</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>Worldwide Broadcasts</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap font-serif">
              <span>Church Service Times & Gathering Timetable</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Find weekly service times, Sunday celebrations, midweek Bible masterclasses, and midnight prayer altars across global partner sanctuaries.
            </p>
          </div>

          {/* Quick Stats & View Switcher */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {/* View Mode Switcher: Table vs Cards */}
            <div className="flex items-center p-1 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-inner">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Structured Table View (Best for Tablet & Desktop)"
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table View</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards View</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Toolbar: Church Pills, Day Tabs, and Search */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Day Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs text-slate-400 font-bold mr-1 hidden sm:inline">Day:</span>
              {(['all', 'Sunday', 'Wednesday', 'Friday', 'Saturday'] as DayFilter[]).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedDay === day
                      ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                      : 'bg-slate-950/80 text-slate-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {day === 'all' ? 'All Days' : day}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services, ministers, campuses..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60 transition"
              />
            </div>
          </div>

          {/* Church Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedChurch('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedChurch === 'all'
                  ? 'bg-slate-200 text-slate-950 font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>All Sanctuaries ({allSchedulesWithChurch.length})</span>
            </button>
            {churchList.map(church => (
              <button
                key={church}
                onClick={() => setSelectedChurch(church)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  selectedChurch === church
                    ? 'bg-slate-200 text-slate-950 font-black'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{church}</span>
                <span className="text-[10px] opacity-70">({CHURCH_SCHEDULES[church]?.length || 0})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📋 TABLE DISPLAY (Optimized for Tablet & Desktop with Responsive Mobile Card Adaptor) */}
      {viewMode === 'table' ? (
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
          {/* Table Header Bar with Result Count */}
          <div className="px-4 sm:px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Showing <strong className="text-white">{filteredSchedules.length}</strong> scheduled services</span>
              <span className="hidden sm:inline">• All times shown in Eastern Standard Time (EST)</span>
            </div>

            <div className="text-[11px] text-amber-400/90 font-medium">
              ⚡ Real-time Worldwide Altar Sync
            </div>
          </div>

          {filteredSchedules.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-white">No Services Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No scheduled gatherings match your current filters. Try selecting another day or clearing your search.
              </p>
              <button
                onClick={() => {
                  setSelectedDay('all');
                  setSelectedChurch('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* DESKTOP & TABLET STRUCTURED TABLE (hidden on small mobile screens < 640px) */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-36">Day & Time</th>
                      <th className="py-3.5 px-4">Service & Gathering</th>
                      <th className="py-3.5 px-4">Church / Campus</th>
                      <th className="py-3.5 px-4">Presiding Minister</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredSchedules.map((sch) => {
                      const isReminderSet = reminderSetIds.includes(sch.id);
                      return (
                        <tr 
                          key={sch.id}
                          className="hover:bg-slate-800/40 transition-colors group"
                        >
                          {/* Day & Time Column */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="space-y-1">
                              <span className="inline-block px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                                {sch.day}
                              </span>
                              <div className="font-mono text-slate-200 font-bold text-xs flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>{sch.time}</span>
                              </div>
                            </div>
                          </td>

                          {/* Service Title & Description */}
                          <td className="py-3.5 px-4 align-top max-w-xs md:max-w-md">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white group-hover:text-amber-300 transition text-sm">
                                  {sch.title}
                                </span>
                                <span className="px-2 py-0.2 rounded text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                  {sch.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                                {sch.description}
                              </p>
                            </div>
                          </td>

                          {/* Church / Campus Location */}
                          <td className="py-3.5 px-4 align-top">
                            <div className="space-y-0.5">
                              <button
                                onClick={() => onSelectChannelModal && onSelectChannelModal(sch.churchName)}
                                className="font-bold text-amber-400 hover:underline flex items-center gap-1 text-xs"
                              >
                                <span>{sch.churchName}</span>
                                <CheckCircle2 className="w-3 h-3 text-blue-400 fill-blue-400" />
                              </button>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                <span className="truncate max-w-[180px]">{sch.locationOrStream}</span>
                              </div>
                            </div>
                          </td>

                          {/* Presiding Minister */}
                          <td className="py-3.5 px-4 align-top whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                              <User className="w-3.5 h-3.5 text-amber-400/80" />
                              <span className="truncate max-w-[150px]">{sch.speakerOrLeader}</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 align-top text-center whitespace-nowrap">
                            {sch.isLiveNow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse shadow-md shadow-red-600/30">
                                <Radio className="w-3 h-3" /> Live Now
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                                Upcoming
                              </span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {sch.isLiveNow ? (
                                <button
                                  onClick={() => onWatchLiveService && onWatchLiveService(sch.churchName)}
                                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition flex items-center gap-1"
                                >
                                  <Radio className="w-3 h-3" />
                                  <span>Watch Live</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleReminder(sch.id, sch.title)}
                                  className={`p-2 rounded-xl border transition ${
                                    isReminderSet
                                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                  }`}
                                  title={isReminderSet ? "Reminder active" : "Set reminder for this service"}
                                >
                                  <Bell className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleAddToCalendar(sch)}
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                                title="Add to Google Calendar"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE TABLET CARD-TABLE ADAPTER (For mobile screens < 640px) */}
              <div className="sm:hidden divide-y divide-slate-800/80">
                {filteredSchedules.map((sch) => {
                  const isReminderSet = reminderSetIds.includes(sch.id);
                  return (
                    <div key={sch.id} className="p-4 space-y-3 hover:bg-slate-800/30 transition">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                            {sch.day}
                          </span>
                          <span className="font-mono text-slate-200 font-bold text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {sch.time}
                          </span>
                        </div>

                        {sch.isLiveNow ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <Radio className="w-3 h-3" /> Live
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium border border-slate-700">
                            Weekly
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-white text-sm">{sch.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-normal">{sch.description}</p>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1 pt-1">
                        <div className="flex items-center gap-1 text-amber-400 font-semibold">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{sch.churchName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span className="truncate">{sch.locationOrStream}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span>{sch.speakerOrLeader}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                        {sch.isLiveNow && (
                          <button
                            onClick={() => onWatchLiveService && onWatchLiveService(sch.churchName)}
                            className="flex-1 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md"
                          >
                            <Radio className="w-3 h-3" />
                            <span>Watch Live</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleToggleReminder(sch.id, sch.title)}
                          className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                            isReminderSet
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          <Bell className="w-3.5 h-3.5" />
                          <span>{isReminderSet ? 'Reminder Set' : 'Remind Me'}</span>
                        </button>
                        <button
                          onClick={() => handleAddToCalendar(sch)}
                          className="px-3 py-2 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 text-xs font-bold"
                          title="Add to Calendar"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ) : (
        /* 🗂️ CARD GRID DISPLAY (Multi-column responsive grid on tablet & desktop) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.map((sch) => {
            const isReminderSet = reminderSetIds.includes(sch.id);
            return (
              <motion.div
                key={sch.id}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition space-y-3.5 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                        {sch.day}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 font-mono text-[10px] flex items-center gap-1 border border-slate-700">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {sch.time}
                      </span>
                    </div>

                    {sch.isLiveNow && (
                      <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-extrabold text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <Radio className="w-3 h-3" /> Live
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{sch.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">{sch.description}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                    <div 
                      onClick={() => onSelectChannelModal && onSelectChannelModal(sch.churchName)}
                      className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>{sch.churchName}</span>
                    </div>
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{sch.locationOrStream}</span>
                    </div>
                    <div className="text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                      <span>{sch.speakerOrLeader}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  {sch.isLiveNow ? (
                    <button
                      onClick={() => onWatchLiveService && onWatchLiveService(sch.churchName)}
                      className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow-md shadow-red-600/20"
                    >
                      <Radio className="w-3 h-3" />
                      <span>Watch Live</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleReminder(sch.id, sch.title)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isReminderSet
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isReminderSet ? 'Reminder Set' : 'Remind Me'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleAddToCalendar(sch)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
                    title="Add to Google Calendar"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
