import React from 'react';
import { Check, Star } from 'lucide-react';

interface PricingSectionProps {
  monthlyPrice?: number;
  academyName?: string;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ 
  monthlyPrice = 500,
  academyName = "Football Academy"
}) => {
  const features = [
    "Unlimited field access",
    "Professional coaching",
    "Training equipment provided",
    "Monthly progress reports",
    "Priority booking",
    "Academy merchandise discount"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Monthly Membership</h3>
      
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Star className="h-5 w-5 text-yellow-400 fill-current mr-2" />
            <span className="text-sm font-medium text-green-700">Most Popular</span>
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">{academyName}</h4>
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-green-600">{monthlyPrice}</span>
            <span className="text-lg text-gray-600 ml-1">DH</span>
            <span className="text-gray-500 ml-2">/month</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">Billed monthly</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h5 className="font-semibold text-gray-900">What's included:</h5>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center">
            <Check className="h-4 w-4 text-green-600 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>

      <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200">
        Join Monthly Membership
      </button>
      
      <p className="text-xs text-gray-500 text-center mt-3">
        Cancel anytime • No long-term commitment
      </p>
    </div>
  );
}; 