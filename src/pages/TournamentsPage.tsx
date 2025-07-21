import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, MapPin, Clock, Star } from 'lucide-react';

export const TournamentsPage: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-center mb-4"
            >
              <Trophy className="h-12 w-12 text-green-600 mr-4" />
              <h1 className="text-4xl font-bold text-gray-900">Tournois</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-600"
            >
              Découvrez et participez aux meilleurs tournois de football
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blurred Tournament Organization Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
         

          <div className="relative bg-white rounded-2xl shadow-lg p-8 overflow-hidden">
            {/* Blurred Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-50"></div>
            
            {/* Blurred Content */}
            <div className="relative z-10 filter blur-sm pointer-events-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tournament Creation */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Créer un Tournoi</h3>
                  </div>
                  <p className="text-gray-600">Configurez les paramètres, les équipes et les règles de votre tournoi</p>
                </div>

                {/* Team Management */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestion d'Équipes</h3>
                  </div>
                  <p className="text-gray-600">Inscrivez et gérez les équipes participantes</p>
                </div>

                {/* Schedule Management */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Planning des Matchs</h3>
                  </div>
                  <p className="text-gray-600">Organisez les horaires et les terrains des matchs</p>
                </div>

                {/* Results Tracking */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Star className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Suivi des Résultats</h3>
                  </div>
                  <p className="text-gray-600">Enregistrez et suivez les scores en temps réel</p>
                </div>

                {/* Bracket System */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                      <Trophy className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Système de Brackets</h3>
                  </div>
                  <p className="text-gray-600">Générez automatiquement les tableaux de tournoi</p>
                </div>

                {/* Statistics */}
                <div className="bg-white/80 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                      <Star className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Statistiques</h3>
                  </div>
                  <p className="text-gray-600">Analysez les performances et les statistiques</p>
                </div>
              </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-2xl">
                <Trophy className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bientôt Disponible</h3>
                <p className="text-gray-600 mb-4">
                  Notre système d'organisation de tournois est en cours de développement.
                  <br />
                  Restez connecté pour les mises à jour !
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">En développement</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}; 