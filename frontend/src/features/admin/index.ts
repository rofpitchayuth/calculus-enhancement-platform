/**
 * admin/index.ts — Feature Entry Point
 * =====================================
 * Public API for the Admin feature.
 */

export { AdminQuestionPage } from "./pages/AdminQuestionPage";
export { adminService } from "./services/admin.service";
export { useAdminDraft } from "./hooks/useAdminDraft";
export * from "./types/admin.types";

// Components (optional: export if needed outside this feature)
export { ExpertReviewForm } from "./components/ExpertReviewForm";
export { QuestionInputForm } from "./components/QuestionInputForm";
export { default as MathImageUploader } from "./components/MathImageUploader";
