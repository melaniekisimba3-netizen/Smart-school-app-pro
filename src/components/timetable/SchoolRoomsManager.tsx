import React, { useState } from "react";
import { 
  Building, 
  Plus, 
  Trash2, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  UserX,
  Layers
} from "lucide-react";
import { SchoolRoom, TeacherUnavailability, Teacher } from "../../types";
import { usePedagogicalTimetable } from "../../context/PedagogicalTimetableContext";

interface SchoolRoomsManagerProps {
  teachers: Teacher[];
}

export const SchoolRoomsManager: React.FC<SchoolRoomsManagerProps> = ({ teachers }) => {
  const { 
    schoolRooms, 
    addSchoolRoom, 
    deleteSchoolRoom, 
    teacherUnavailabilities, 
    addTeacherUnavailability, 
    deleteTeacherUnavailability 
  } = usePedagogicalTimetable();

  // New Room State
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomType, setRoomType] = useState<"standard" | "lab_science" | "lab_it" | "workshop" | "amphi">("standard");
  const [roomCapacity, setRoomCapacity] = useState(45);

  // New Unavailability State
  const [showAddUnavModal, setShowAddUnavModal] = useState(false);
  const [unavTeacher, setUnavTeacher] = useState("");
  const [unavDay, setUnavDay] = useState("Lundi");
  const [unavReason, setUnavReason] = useState("Charge universitaire / Recherche");

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    const roomTypeCategory = roomType === "lab_science" ? "Laboratoire" : roomType === "lab_it" ? "Informatique" : roomType === "workshop" ? "Atelier" : roomType === "amphi" ? "Amphithéâtre" : "Classe ordinaire";

    addSchoolRoom({
      id: `room-${Date.now()}`,
      name: roomName.trim(),
      code: roomCode.trim() || roomName.slice(0, 4).toUpperCase(),
      capacity: Number(roomCapacity),
      roomType,
      type: roomTypeCategory,
      isSpecialized: roomType !== "standard",
      schoolId: "sch-001"
    });

    setShowAddRoomModal(false);
    setRoomName("");
    setRoomCode("");
  };

  const handleSaveUnavailability = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unavTeacher) return;

    const teacherObj = teachers.find(t => `${t.firstName || ""} ${t.lastName || ""}`.trim() === unavTeacher || t.name === unavTeacher);

    addTeacherUnavailability({
      id: `unav-${Date.now()}`,
      teacherId: teacherObj?.id || `teach-${Date.now()}`,
      teacherName: unavTeacher,
      day: unavDay,
      reason: unavReason,
      schoolId: "sch-001"
    });

    setShowAddUnavModal(false);
  };

  const getTeacherDisplayName = (t: Teacher) => {
    if (t.name) return t.name;
    return `${t.firstName || ""} ${t.lastName || ""}`.trim() || "Enseignant";
  };

  return (
    <div className="space-y-6">
      {/* Salles & Locaux */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 dark:bg-blue-950/50 text-brand-blue rounded-xl">
              <Building className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Salles de Classe, Laboratoires & Locaux Spécialisés
              </h3>
              <p className="text-xs text-slate-500">Capacités d'accueil et affectation des espaces d'apprentissage</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddRoomModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-brand-blue hover:bg-blue-700 rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Salle / Local</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {schoolRooms.map((room) => (
            <div
              key={room.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-2 relative group hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {room.code || "LOCAL"}
                </span>
                <button
                  onClick={() => deleteSchoolRoom(room.id)}
                  className="text-slate-400 hover:text-red-600 transition p-1"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="font-bold text-slate-900 dark:text-white text-xs">{room.name}</div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Capacité : <strong>{room.capacity || 45} places</strong></span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  room.isSpecialized ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }`}>
                  {room.roomType === "lab_science" ? "Labo Sciences" : room.roomType === "lab_it" ? "Labo Info" : room.roomType === "amphi" ? "Amphi" : "Standard"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indisponibilités Enseignants */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
              <UserX className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Contraintes & Indisponibilités des Enseignants
              </h3>
              <p className="text-xs text-slate-500">Pris en compte automatiquement par le générateur d'horaires</p>
            </div>
          </div>

          <button
            onClick={() => {
              setUnavTeacher(teachers[0] ? getTeacherDisplayName(teachers[0]) : "");
              setShowAddUnavModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>Déclarer une Indisponibilité</span>
          </button>
        </div>

        {teacherUnavailabilities.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Aucune contrainte d'indisponibilité enregistrée. Tous les enseignants sont disponibles sur toute la grille horaire.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {teacherUnavailabilities.map((unav) => (
              <div
                key={unav.id}
                className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{unav.teacherName}</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Indisponible le {unav.day}
                  </div>
                  {unav.reason && <div className="text-[10px] text-slate-400 italic">{unav.reason}</div>}
                </div>

                <button
                  onClick={() => deleteTeacherUnavailability(unav.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: ADD ROOM */}
      {showAddRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Ajouter une Salle / Local</h3>
              <button onClick={() => setShowAddRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Nom du Local *</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="ex: Salle 204 ou Laboratoire Informatique B"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Code / Raccourci</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  placeholder="ex: S-204 ou LAB-IT"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Type d'Espace</label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                >
                  <option value="standard">Salle de cours standard</option>
                  <option value="lab_science">Laboratoire de Sciences / Chimie</option>
                  <option value="lab_it">Laboratoire Informatique</option>
                  <option value="workshop">Atelier Technique</option>
                  <option value="amphi">Amphithéâtre / Grande Salle</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Capacité d'Accueil</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={roomCapacity}
                  onChange={(e) => setRoomCapacity(Number(e.target.value))}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddRoomModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue text-white font-bold rounded-xl shadow-sm hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD UNAVAILABILITY */}
      {showAddUnavModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Déclarer une Indisponibilité</h3>
              <button onClick={() => setShowAddUnavModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnavailability} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Enseignant *</label>
                <select
                  value={unavTeacher}
                  onChange={(e) => setUnavTeacher(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {teachers.map(t => {
                    const name = getTeacherDisplayName(t);
                    return <option key={t.id} value={name}>{name}</option>;
                  })}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Jour d'Indisponibilité *</label>
                <select
                  value={unavDay}
                  onChange={(e) => setUnavDay(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-bold"
                >
                  {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">Motif Justificatif</label>
                <input
                  type="text"
                  value={unavReason}
                  onChange={(e) => setUnavReason(e.target.value)}
                  placeholder="ex: Activités universitaires, Mission"
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddUnavModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl shadow-sm hover:bg-amber-700"
                >
                  Valider
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
