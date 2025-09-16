import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogOut, Check, Star, Zap, Crown, Rocket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
  tokens: number;
  description: string;
  stripeLink: string;
}

const Plans: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const plans: Plan[] = [
    {
      id: 'analista',
      name: t('analystPlan'),
      price: 'R$ 7.500',
      tokens: 5,
      description: t('analystPlanDescription'),
      stripeLink: 'https://buy.stripe.com/eVq14ng1hevefbx8eTfYY0y',
      features: [
        t('fiveConsultationsPerMonth'),
        t('completeIPAnalysis'),
        t('chemicalMolecularData'),
        t('patentStatusByCountry'),
        t('emailSupport'),
        t('pdfExport')
      ]
    },
    {
      id: 'especialista',
      name: t('specialistPlan'),
      price: 'R$ 13.000',
      tokens: 10,
      description: t('specialistPlanDescription'),
      stripeLink: 'https://buy.stripe.com/4gMaEXg1h2Mw8N9fHlfYY0z',
      features: [
        t('tenConsultationsPerMonth'),
        t('advancedClinicalAnalysis'),
        t('fdaOrangeBookData'),
        t('detailedRegulationByCountry'),
        t('recentScientificEvidence'),
        t('marketOpportunityScore'),
        t('priorityWhatsappSupport'),
        t('executiveReports')
      ],
      popular: true
    },
    {
      id: 'diretor',
      name: t('directorPlan'),
      price: 'R$ 25.000',
      tokens: 20,
      description: t('directorPlanDescription'),
      stripeLink: 'https://buy.stripe.com/14A3cv9CTdraaVh52HfYY0B',
      features: [
        t('twentyConsultationsPerMonth'),
        t('completeTamSamSomAnalysis'),
        t('formulationStrategies'),
        t('completeRegulatoryDocumentation'),
        t('detailedSwotAnalysis'),
        t('dedicatedSupport247'),
        t('apiIntegration'),
        t('customReports'),
        t('strategicConsultingIncluded')
      ]
    }
  ];

  const handlePlanSelect = (stripeLink: string) => {
    window.open(stripeLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo_pharmyrus.png" 
                alt="Pharmyrus" 
                className="h-12 w-auto"
              />
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
            {t('choosePlan')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('selectIdealPlan')}
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'border-2 border-blue-500 bg-white ring-4 ring-blue-100'
                  : 'border border-gray-200 bg-white hover:shadow-2xl'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg">
                    <Star size={16} />
                    {t('mostPopular')}
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    {plan.id === 'analista' && <Zap className="text-white" size={32} />}
                    {plan.id === 'especialista' && <Rocket className="text-white" size={32} />}
                    {plan.id === 'diretor' && <Crown className="text-white" size={32} />}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <div className="text-center mb-8">
                  <span className="text-5xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-lg font-medium text-gray-500">/mês</span>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-blue-600">{plan.tokens}</span>
                    <span className="text-gray-600 ml-1">{t('monthlyConsultations')}</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
                
                <div>
                  <button
                    onClick={() => handlePlanSelect(plan.stripeLink)}
                    className={`w-full py-4 px-6 rounded-xl text-lg font-bold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        : 'bg-gray-900 text-white hover:bg-black shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {t('choosePlanButton')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('whyChoosePharmyrus')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('reliableData')}</h4>
                <p className="text-gray-600 text-sm">{t('connectedToMainAgencies')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="text-blue-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('instantAnalysis')}</h4>
                <p className="text-gray-600 text-sm">{t('completeResultsInSeconds')}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="text-purple-600" size={24} />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{t('specializedSupport')}</h4>
                <p className="text-gray-600 text-sm">{t('specializedTeam')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA para suporte */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">{t('needHelpChoosingPlan')}</p>
          <a 
            href="https://wa.me/5511995736666" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
            </svg>
            {t('speakWithSpecialist')}
          </a>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Plans;