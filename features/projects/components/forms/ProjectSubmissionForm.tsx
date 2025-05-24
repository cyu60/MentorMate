// This file has been modularized into smaller components for better maintainability
// The original 742-line component has been broken down into:
// - Schema and validation (./schema/ProjectSubmissionSchema.ts)
// - Data fetching hooks (./hooks/useProjectSubmissionData.ts)
// - Step navigation (./hooks/useStepNavigation.ts) 
// - Step validation (./hooks/useStepValidation.ts)
// - Individual step components (./steps/)
// - Reusable UI components (./components/)

// Export the modular version for backward compatibility
export { ProjectSubmissionFormComponent } from "./ProjectSubmissionFormRefactored";