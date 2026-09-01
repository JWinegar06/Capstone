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
};

export default function RecordForm({
  recordId,
  onSaved,
  onDeleted,
}: RecordFormProps) {
  const [data, setData] = useState<RecordDetailResponse | null>(null);

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});

  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecord() {
      try {
        const response = await fetch(`/api/records/${recordId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load record.");
        }

        const result: RecordDetailResponse = await response.json();

        setData(result);

        setFormValues(result.values);

        setError(null);
        setSaved(false);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError("Unable to load record.");
      }
    }

    loadRecord();

    return () => {
      controller.abort();
    };
  }, [recordId]);

  function updateValue(fieldId: string, value: unknown) {
    setSaved(false);

    setFormValues((current) => ({
      ...current,

      [fieldId]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

      if (!response.ok) {
        throw new Error("Unable to save record.");
      }

      setSaved(true);

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

  async function handleDelete() {
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
          // Keep fallback
        }

        throw new Error(message);
      }

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

  if (error && !data) {
    return <p className="workspace-error">{error}</p>;
  }

  if (!data) {
    return <p className="loading-message">Loading record...</p>;
  }

  return (
    <form className="record-form" onSubmit={handleSubmit}>
      {data.fields.map((field) => (
        <div key={field.id} className="form-field">
          <label htmlFor={field.id}>
            {field.name}

            {field.required && <span className="required-mark">*</span>}
          </label>

          {renderField(field, formValues[field.id], updateValue)}
        </div>
      ))}

      {error && <p className="workspace-error">{error}</p>}

      {saved && <p className="save-success">Changes saved successfully.</p>}

      <div className="form-actions">
        <button
          type="submit"
          className="button primary"
          disabled={saving || deleting}
        >
          {saving ? "Saving..." : "Save Changes"}
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
    </form>
  );
}

function renderField(
  field: Field,
  value: unknown,
  updateValue: (fieldId: string, value: unknown) => void,
) {
  const stringValue =
    value === null || value === undefined ? "" : String(value);

  switch (field.field_type) {
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

    case "image":
      return (
        <div className="image-field-placeholder">
          <p>Image upload will be added in the file-storage section.</p>
        </div>
      );

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

function getDropdownOptions(options: unknown): string[] {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.map((option) => String(option));
}
