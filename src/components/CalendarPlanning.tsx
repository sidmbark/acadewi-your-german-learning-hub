import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Cours {
  id: string;
  titre: string;
  description?: string;
  date: string;
  heure: string;
  lien_zoom: string;
  statut?: string;
  profiles?: { nom: string; prenom: string };
  groupes?: { nom: string; niveau: string };
}

interface CalendarPlanningProps {
  cours: Cours[];
  onJoinZoom: (lienZoom: string) => void;
  canJoinCours: (date: string, heure: string) => boolean;
}

export default function CalendarPlanning({ cours, onJoinZoom, canJoinCours }: CalendarPlanningProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'week' | 'day'>('week');

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8h to 21h

  const navigatePrev = () => {
    if (view === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (view === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getCoursForDayAndHour = (day: Date, hour: number) => {
    return cours.filter(c => {
      const coursDate = new Date(c.date);
      const coursHour = parseInt(c.heure.split(':')[0]);
      return isSameDay(coursDate, day) && coursHour === hour;
    });
  };

  const getCoursForDay = (day: Date) => {
    return cours.filter(c => isSameDay(new Date(c.date), day));
  };

  const getLevelColor = (niveau?: string) => {
    const colors: Record<string, string> = {
      'A1': 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300',
      'A2': 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300',
      'B1': 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300',
      'B2': 'bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300',
      'C1': 'bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300',
      'C2': 'bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300',
    };
    return colors[niveau || ''] || 'bg-primary/20 border-primary text-primary';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={goToToday}>
            Aujourd'hui
          </Button>
          <h2 className="text-xl font-semibold ml-4">
            {view === 'week' 
              ? `${format(weekStart, 'd MMM', { locale: fr })} - ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: fr })}`
              : format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })
            }
          </h2>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'week' ? 'default' : 'outline'} 
            onClick={() => setView('week')}
            size="sm"
          >
            Semaine
          </Button>
          <Button 
            variant={view === 'day' ? 'default' : 'outline'} 
            onClick={() => setView('day')}
            size="sm"
          >
            Jour
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {view === 'week' ? (
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Day Headers */}
              <div className="grid grid-cols-8 border-b bg-muted/50">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r">
                  Heure
                </div>
                {weekDays.map((day, i) => (
                  <div 
                    key={i} 
                    className={`p-3 text-center border-r last:border-r-0 ${
                      isToday(day) ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-muted-foreground">
                      {format(day, 'EEE', { locale: fr })}
                    </div>
                    <div className={`text-lg font-bold ${isToday(day) ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              <div className="max-h-[600px] overflow-y-auto">
                {hours.map(hour => (
                  <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
                    <div className="p-2 text-center text-sm text-muted-foreground border-r flex items-start justify-center">
                      {`${hour}:00`}
                    </div>
                    {weekDays.map((day, dayIndex) => {
                      const dayEvents = getCoursForDayAndHour(day, hour);
                      return (
                        <div 
                          key={dayIndex} 
                          className={`p-1 border-r last:border-r-0 ${
                            isToday(day) ? 'bg-primary/5' : ''
                          }`}
                        >
                          {dayEvents.map(event => {
                            const canJoin = canJoinCours(event.date, event.heure);
                            return (
                              <div
                                key={event.id}
                                className={`p-2 rounded-lg border-l-4 text-xs mb-1 cursor-pointer hover:shadow-md transition-shadow ${getLevelColor(event.groupes?.niveau)}`}
                                onClick={() => canJoin && onJoinZoom(event.lien_zoom)}
                              >
                                <div className="font-semibold truncate">{event.titre}</div>
                                <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {event.heure}
                                </div>
                                {event.groupes && (
                                  <div className="mt-1 font-medium">
                                    {event.groupes.niveau}
                                  </div>
                                )}
                                {canJoin && (
                                  <Button size="sm" className="w-full mt-2 h-6 text-xs">
                                    <Video className="h-3 w-3 mr-1" />
                                    Rejoindre
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Day View */
          <div>
            <div className="max-h-[600px] overflow-y-auto">
              {hours.map(hour => {
                const dayEvents = getCoursForDayAndHour(currentDate, hour);
                return (
                  <div key={hour} className="flex border-b last:border-b-0 min-h-[80px]">
                    <div className="w-20 p-3 text-sm text-muted-foreground border-r flex items-start justify-center shrink-0">
                      {`${hour}:00`}
                    </div>
                    <div className="flex-1 p-2">
                      {dayEvents.map(event => {
                        const canJoin = canJoinCours(event.date, event.heure);
                        return (
                          <div
                            key={event.id}
                            className={`p-3 rounded-lg border-l-4 mb-2 ${getLevelColor(event.groupes?.niveau)}`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-semibold text-lg">{event.titre}</div>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    {event.heure}
                                  </span>
                                  {event.groupes && (
                                    <span className="font-medium">{event.groupes.nom} - {event.groupes.niveau}</span>
                                  )}
                                  {event.profiles && (
                                    <span>Prof. {event.profiles.prenom} {event.profiles.nom}</span>
                                  )}
                                </div>
                              </div>
                              {canJoin && (
                                <Button onClick={() => onJoinZoom(event.lien_zoom)}>
                                  <Video className="h-4 w-4 mr-2" />
                                  Rejoindre
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
          <div key={level} className={`px-3 py-1 rounded-full text-xs font-medium ${getLevelColor(level)}`}>
            {level}
          </div>
        ))}
      </div>
    </div>
  );
}
