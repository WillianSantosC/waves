import type { Validator } from "../core/types";
import { additionalContextValidator } from "./additional-context/additional-context";
import { howToValidateValidator } from "./how-to-validate/how-to-validate";
import { placeholdersValidator } from "./placeholders/placeholders";
import { relatedIssuesValidator } from "./related-issues/related-issues";
import { reviewerNotesValidator } from "./reviewer-notes/reviewer-notes";
import { structureValidator } from "./structure/structure";
import { successCriteriaValidator } from "./success-criteria/success-criteria";
import { summaryValidator } from "./summary/summary";
import { typeOfChangeValidator } from "./type-of-change/type-of-change";

export const allValidators: Validator[] = [
  structureValidator,
  placeholdersValidator,
  typeOfChangeValidator,
  reviewerNotesValidator,
  additionalContextValidator,
  summaryValidator,
  relatedIssuesValidator,
  successCriteriaValidator,
  howToValidateValidator,
];
