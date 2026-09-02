"use client";

import { FormEvent, useEffect, useState } from "react";

type Field = {
  id: string;
  collection_id: string;
  name: string;
  field_type: string;
  required: boolean;
  display_order: number;
  default_value: string | null;
  options: unknown;
};

type RecordItem = {
  id: string;
  collection_id: string;
  import_order?: number | null;
  created_at: string;
  updated_at: string;
};

type RecordDetailResponse = {
  record: RecordItem;
  fields: Field[];
  values: Record<string, unknown>;
};

type RecordFormProps = {
  recordId: string;
  onSaved?: () => void;
  onDeleted?: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  recordPosition?: number;
  recordCount?: number;
};

export default function RecordForm({
  recordId,
  onSaved,
  onDeleted,
  onDirtyChange,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  recordPosition,
  recordCount,
}: RecordFormProps) {
  const [data, setData] = useState<RecordDetailResponse | null>(null);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const [originalValues, setOriginalValues] = useState<Record<string, unknown>>(
    {},
  );

  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [saved, setSaved] = useState(false);

  /*
   * Compare the editable values
   * against the last saved values.
   */
  const hasUnsavedChanges =
    JSON.stringify(formValues) !== JSON.stringify(originalValues);

  const recordTitle = getRecordTitle(data?.fields ?? [], formValues);

  const recordSubtitle = getRecordSubtitle(
    data?.fields ?? [],
    formValues,
    recordTitle.fieldId,
  );  

  /*
   * Tell MainWorkspace whether
   * this form has unsaved changes.
   */
  useEffect(() => {
    onDirtyChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onDirtyChange]);

  /*
   * Load the selected record.
   */
  useEffect(() => {
    const controller = new AbortController();

    async function loadRecord() {
      try {
        setError(null);
        setSaved(false);

        const response = await fetch(`/api/records/${recordId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          let message = "Unable to load record.";

          try {
            const errorData = await response.json();

            message = errorData.details || errorData.error || message;
          } catch {
            // Keep fallback message.
          }

          throw new Error(message);
        }

        const result: RecordDetailResponse = await response.json();

        setData(result);

        /*
         * Make separate objects
         * for the editable values
         * and the saved baseline.
         */
        setFormValues({
          ...result.values,
        });

        setOriginalValues({
          ...result.values,
        });

        setError(null);
        setSaved(false);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load record.");
        }
      }
    }

    loadRecord();

    return () => {
      controller.abort();
    };
  }, [recordId]);

  /*
   * Change one field in the
   * editable form state.
   */
  function updateValue(fieldId: string, value: unknown) {
    setSaved(false);

    setFormValues((current) => ({
      ...current,
      [fieldId]: value,
    }));
  }

  /*
   * Save changes.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
     * Nothing changed, so there
     * is nothing to save.
     */
    if (!hasUnsavedChanges) {
      return;
    }

    try {
      setSaving(true);
      setSaved(false);
      setError(null);

      const response = await fetch(`/api/records/${recordId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          values: formValues,
        }),
      });

      /*
       * Handle required-field
       * validation and API errors.
       */
      if (!response.ok) {
        let errorData: {
          error?: string;
          details?: string;
          fields?: string[];
        } = {};

        try {
          errorData = await response.json();
        } catch {
          // Keep fallback below.
        }

        if (Array.isArray(errorData.fields) && errorData.fields.length > 0) {
          throw new Error(`Required fields: ${errorData.fields.join(", ")}`);
        }

        throw new Error(
          errorData.details || errorData.error || "Unable to save record.",
        );
      }

      /*
       * The current form values
       * are now the saved baseline.
       */
      setOriginalValues({
        ...formValues,
      });

      setSaved(true);
      setError(null);

      onSaved?.();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to save changes.");
      }
    } finally {
      setSaving(false);
    }
  }

  /*
   * Restore the last saved values.
   */
  function handleCancelChanges() {
    setFormValues({
      ...originalValues,
    });

    setSaved(false);
    setError(null);
  }

  /*
   * Delete the current record.
   */
  async function handleDelete() {
    /*
     * Warn separately when the
     * form currently has edits.
     */
    if (hasUnsavedChanges) {
      const discardConfirmed = window.confirm(
        "This record has unsaved changes. Delete the record anyway?",
      );

      if (!discardConfirmed) {
        return;
      }
    }

    /*
     * Final permanent deletion
     * confirmation.
     */
    const confirmed = window.confirm(
      "Are you sure you want to delete this record? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/records/${recordId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let message = "Unable to delete record.";

        try {
          const errorData = await response.json();

          message = errorData.details || errorData.error || message;
        } catch {
          // Keep fallback message.
        }

        throw new Error(message);
      }

      /*
       * Tell the parent that the
       * form is no longer dirty
       * before removing the record.
       */
      onDirtyChange?.(false);

      onDeleted?.();
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to delete record.");
      }
    } finally {
      setDeleting(false);
    }
  }

  /*
   * Initial loading/error state.
   */
  if (error && !data) {
    return <p className="workspace-error">{error}</p>;
  }

  if (!data) {
    return <p className="loading-message">Loading record...</p>;
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      {/* Required field explanation */}
      <p className="required-note">
        Fields marked with <span className="required-mark">*</span> are
        required.
      </p>

      {/* Dynamic database fields */}
      {data.fields.map((field) => (
        <div key={field.id} className="form-field">
          <label htmlFor={field.id}>
            {field.name}

            {field.required && <span className="required-mark">*</span>}
          </label>

          {renderField(field, formValues[field.id], updateValue)}
        </div>
      ))}

      {/* API / validation error */}
      {error && <p className="workspace-error">{error}</p>}

      {/* Successful save */}
      {saved && <p className="save-success">Changes saved successfully.</p>}

      {/* Unsaved change indicator */}
      {hasUnsavedChanges && <p className="unsaved-warning">Unsaved changes</p>}

      {/* Form buttons */}
      <div className="form-actions">
        <button
          type="submit"
          className="button primary"
          disabled={saving || deleting || !hasUnsavedChanges}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          className="button"
          onClick={handleCancelChanges}
          disabled={saving || deleting || !hasUnsavedChanges}
        >
          Cancel Changes
        </button>

        <button
          type="button"
          className="button danger"
          onClick={handleDelete}
          disabled={saving || deleting}
        >
          {deleting ? "Deleting..." : "Delete Record"}
        </button>
      </div>
      <div className="record-form-header">
        <div>
          <h3 className="record-form-title">{recordTitle.value}</h3>

          {recordSubtitle && (
            <p className="record-form-subtitle">{recordSubtitle}</p>
          )}
        </div>
      </div>
      <div className="record-navigation">
        <button
          type="button"
          className="button"
          onClick={onPrevious}
          disabled={!hasPrevious || saving || deleting}
        >
          ← Previous
        </button>

        <span className="record-position">
          {recordPosition && recordCount
            ? `Record ${recordPosition} of ${recordCount}`
            : ""}
        </span>

        <button
          type="button"
          className="button"
          onClick={onNext}
          disabled={!hasNext || saving || deleting}
        >
          Next →
        </button>
      </div>
    </form>
  );
}

/*
 * Render the correct input
 * based on field_type.
 */
function renderField(
  field: Field,
  value: unknown,
  updateValue: (fieldId: string, value: unknown) => void,
) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);

  switch (field.field_type) {
    /*
     * Long text / notes
     */
    case "long_text":
      return (
        <textarea
          id={field.id}
          className="form-control form-textarea"
          value={stringValue}
          required={field.required}
          onChange={(event) => updateValue(field.id, event.target.value)}
        />
      );

    /*
     * Number
     */
    case "number":
      return (
        <input
          id={field.id}
          type="number"
          className="form-control"
          value={stringValue}
          required={field.required}
          onChange={(event) =>
            updateValue(
              field.id,
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        />
      );

    /*
     * Currency
     */
    case "currency":
      return (
        <input
          id={field.id}
          type="number"
          step="0.01"
          className="form-control"
          value={stringValue}
          required={field.required}
          onChange={(event) =>
            updateValue(
              field.id,
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
        />
      );

    /*
     * Date
     */
    case "date":
      return (
        <input
          id={field.id}
          type="date"
          className="form-control"
          value={stringValue}
          required={field.required}
          onChange={(event) => updateValue(field.id, event.target.value)}
        />
      );

    /*
     * Checkbox
     */
    case "checkbox":
      return (
        <input
          id={field.id}
          type="checkbox"
          className="form-checkbox"
          checked={value === true || value === "true"}
          onChange={(event) => updateValue(field.id, event.target.checked)}
        />
      );

    /*
     * Dropdown
     */
    case "dropdown": {
      const options = getDropdownOptions(field.options);

      return (
        <select
          id={field.id}
          className="form-control"
          value={stringValue}
          required={field.required}
          onChange={(event) => updateValue(field.id, event.target.value)}
        >
          <option value="">Select...</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    /*
     * Image
     *
     * Actual upload support
     * comes later.
     */
    case "image":
      return (
        <div className="image-field-placeholder">
          <p>Image upload will be added in the file-storage section.</p>
        </div>
      );

    /*
     * Default = text
     */
    default:
      return (
        <input
          id={field.id}
          type="text"
          className="form-control"
          value={stringValue}
          required={field.required}
          onChange={(event) => updateValue(field.id, event.target.value)}
        />
      );
  }
}

/*
 * Convert the field's JSON
 * dropdown options into strings.
 */
function getDropdownOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => String(option));
}

function getRecordTitle(
  fields: Field[],
  values: Record<string, unknown>,
): {
  fieldId?: string;
  value: string;
} {
  const preferredNames = [
    "company name",
    "name",
    "title",
    "record name",
    "certificate name",
  ];

  for (const preferredName of preferredNames) {
    const field = fields.find(
      (item) => item.name.trim().toLowerCase() === preferredName,
    );

    if (!field) {
      continue;
    }

    const value = values[field.id];

    if (value !== null && value !== undefined && String(value).trim() !== "") {
      return {
        fieldId: field.id,

        value: String(value),
      };
    }
  }

  /*
   * If no preferred title
   * field exists, use the
   * first populated text field.
   */
  const fallbackField = fields.find((field) => {
    const value = values[field.id];

    return (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      (field.field_type === "text" || field.field_type === "long_text")
    );
  });

  if (fallbackField) {
    return {
      fieldId: fallbackField.id,

      value: String(values[fallbackField.id]),
    };
  }

  return {
    value: "Untitled Record",
  };
}

function getRecordSubtitle(
  fields: Field[],
  values: Record<string, unknown>,
  titleFieldId?: string,
): string | null {
  const preferredNames = [
    "cert number",
    "certificate number",
    "cert #",
    "certificate #",
    "issue year",
  ];

  for (const preferredName of preferredNames) {
    const field = fields.find(
      (item) =>
        item.id !== titleFieldId &&
        item.name.trim().toLowerCase() === preferredName,
    );

    if (!field) {
      continue;
    }

    const value = values[field.id];

    if (value === null || value === undefined || String(value).trim() === "") {
      continue;
    }

    const lowerName = field.name.trim().toLowerCase();

    if (lowerName.includes("cert")) {
      return `Certificate ${String(value)}`;
    }

    if (lowerName.includes("year")) {
      return `Issue Year ${String(value)}`;
    }

    return String(value);
  }

  return null;
}
