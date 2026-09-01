"use client";

import { useEffect, useState } from "react";

type Field = {
  id: string;
  name: string;
  field_type: string;
};

type FieldListProps = {
  collectionId?: string;
};

export default function FieldList({ collectionId }: FieldListProps) {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    if (!collectionId) {
      return;
    }

    const controller = new AbortController();

    async function loadFields() {
      try {
        const response = await fetch(
          `/api/fields?collectionId=${collectionId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load fields.");
        }

        const data: Field[] = await response.json();

        setFields(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);
      }
    }

    loadFields();

    return () => controller.abort();
  }, [collectionId]);

  if (!collectionId) {
    return null;
  }

  return (
    <div className="sidebar-section">
      <h3 className="sidebar-heading">Fields</h3>

      <div className="field-list">
        {fields.map((field) => (
          <div key={field.id} className="field-item">
            <span>{field.name}</span>

            <small>{field.field_type}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
