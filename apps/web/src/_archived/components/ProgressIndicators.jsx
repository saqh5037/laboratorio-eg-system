import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { progressVariants } from '../utils/animations';

// Progress bar lineal profesional
export const LinearProgress = ({ 
  value = 0, 
  max = 100,
  label,
  color = "blue",
  size = "md",
  showPercentage = true,
  className = "" 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    medical: "bg-gradient-to-r from-blue-500 to-blue-600"
  };

  const sizes = {
    sm: "h-1",
    md: "h-2", 
    lg: "h-3",
    xl: "h-4"
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <motion.span 
              key={percentage}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-sm text-gray-500"
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${sizes[size]} overflow-hidden`}>
        <motion.div
          className={`${sizes[size]} rounded-full ${colors[color]} relative overflow-hidden`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ 
            duration: 1,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: [-100, 200] }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// Progress circular médico
export const CircularProgress = ({ 
  value = 0,
  max = 100,
  size = 100,
  strokeWidth = 8,
  color = "blue",
  backgroundColor = "#e5e7eb",
  showValue = true,
  label,
  className = "" 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444", 
    yellow: "#f59e0b",
    medical: "#2563eb"
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-lg font-bold text-gray-900"
          >
            {Math.round(percentage)}%
          </motion.span>
        )}
        {label && (
          <span className="text-xs text-gray-500 mt-1 text-center">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Step progress para procesos médicos
export const StepProgress = ({ 
  steps = [],
  currentStep = 0,
  completedSteps = [],
  className = "" 
}) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              {/* Step circle */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isCurrent ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ✓
                  </motion.div>
                ) : (
                  <span>{index + 1}</span>
                )}

                {/* Current step pulse */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Step label */}
              <span className={`text-xs text-center font-medium ${
                isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.label || step}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200 -z-10">
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Loading indicator con múltiples variaciones
export const LoadingIndicator = ({ 
  type = "spinner",
  size = "md",
  color = "blue",
  message,
  className = "" 
}) => {
  const sizes = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48
  };

  const colors = {
    blue: "#3b82f6",
    green: "#10b981",
    red: "#ef4444",
    medical: "#2563eb"
  };

  const spinnerVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const dotsVariants = {
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const renderIndicator = () => {
    switch (type) {
      case "spinner":
        return (
          <motion.div
            variants={spinnerVariants}
            animate="spin"
            style={{
              width: sizes[size],
              height: sizes[size],
              border: `3px solid ${colors[color]}20`,
              borderTop: `3px solid ${colors[color]}`,
              borderRadius: '50%'
            }}
          />
        );

      case "pulse":
        return (
          <motion.div
            variants={pulseVariants}
            animate="pulse"
            style={{
              width: sizes[size],
              height: sizes[size],
              backgroundColor: colors[color],
              borderRadius: '50%'
            }}
          />
        );

      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                variants={dotsVariants}
                animate="bounce"
                transition={{ delay: i * 0.2 }}
                style={{
                  width: sizes[size] / 3,
                  height: sizes[size] / 3,
                  backgroundColor: colors[color],
                  borderRadius: '50%'
                }}
              />
            ))}
          </div>
        );

      case "medical":
        return (
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-blue-200 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-8 h-8 border-t-2 border-blue-500 rounded-full"
            />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderIndicator()}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-gray-600 text-center"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

// Upload progress con preview
export const UploadProgress = ({ 
  files = [],
  onRemove,
  className = "" 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center space-x-3">
              {/* File icon */}
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xs font-medium">
                  {file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>

              {/* Progress */}
              <div className="w-24">
                <LinearProgress
                  value={file.progress || 0}
                  size="sm"
                  showPercentage={false}
                />
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                {file.status === 'uploading' && (
                  <LoadingIndicator type="spinner" size="sm" />
                )}
                {file.status === 'completed' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
                {file.status === 'error' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✗</span>
                  </motion.div>
                )}

                {/* Remove button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onRemove?.(file.id)}
                  className="w-5 h-5 text-gray-400 hover:text-red-500"
                >
                  ✕
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Activity indicator para procesos en background
export const ActivityIndicator = ({ 
  activities = [],
  className = "" 
}) => {
  return (
    <AnimatePresence>
      {activities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm ${className}`}
        >
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Actividades en curso
          </h4>
          
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <LoadingIndicator type="spinner" size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {activity.message}
                  </p>
                  {activity.progress !== undefined && (
                    <LinearProgress
                      value={activity.progress}
                      size="sm"
                      showPercentage={false}
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default {
  LinearProgress,
  CircularProgress,
  StepProgress,
  LoadingIndicator,
  UploadProgress,
  ActivityIndicator
};