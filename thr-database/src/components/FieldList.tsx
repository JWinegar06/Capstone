"use client";

import { useEffect, useState } from "react";

type Field = {
  id: string;
  collection_id: string;
  name: string;
  field_type: string;
  required: boolean;
  display_order: number;
};

type FieldListProps = {
  collectionId?: string;
};

export default function FieldList({ collectionId }: FieldListProps) {
  const [fields, setFields] = useState<Field[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collectionId) {
      setFields([]);
      setError(null);
      return;
    }

    async function loadFields() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/fields?collectionId=${collectionId}`,
        );

        if (!response.ok) {
          throw new Error("Unable to load fields.");
        }

        const data: Field[] = await response.json();

        setFields(data);
      } catch (err) {
        console.error(err);

        setError("Unable to load fields.");
      } finally {
        setLoading(false);
      }
    }

    loadFields();
  }, [collectionId]);

  if (!collectionId) {
    return (
      <p className="sidebar-empty">Select a collection to view its fields.</p>
    );
  }

  if (loading) {
    return <p className="sidebar-empty">Loading fields...</p>;
  }

  if (error) {
    return <p className="sidebar-error">{error}</p>;
  }

  if (fields.length === 0) {
    return <p className="sidebar-empty">No fields have been created yet.</p>;
  }

  return (
    <ul className="field-list">
      {fields.map((field) => (
        <li key={field.id} className="field-item">
          <span className="field-name">{field.name}</span>

          <span className="field-type">{field.field_type}</span>
        </li>
      ))}
    </ul>
  );
}
