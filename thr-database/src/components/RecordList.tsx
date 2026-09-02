"use client";

import { useEffect, useMemo, useState } from "react";

type Field = {
  id: string;
  name: string;
  field_type: string;
  display_order: number;
};

type RecordItem = {
  id: string;
  collection_id: string;
  import_order?: number | null;
  created_at: string;
  updated_at: string;

  values: Record<string, unknown>;
};

type RecordsResponse = {
  fields: Field[];
  records: RecordItem[];
};

type RecordListProps = {
  collectionId: string;
  searchQuery: string;
  selectedRecordId?: string;
  onSelectRecord: (recordId: string) => void;
  refreshKey: number;

  onRecordsLoaded?: (recordIds: string[]) => void;
};

export default function RecordList({
  collectionId,
  searchQuery,
  selectedRecordId,
  onSelectRecord,
  refreshKey,
  onRecordsLoaded,
}: RecordListProps) {
  const [data, setData] = useState<RecordsResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRecords() {
      try {
        const response = await fetch(
          `/api/records?collectionId=${collectionId}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load records.");
        }

        const result: RecordsResponse = await response.json();

        setData(result);
        setError(null);
        onRecordsLoaded?.(result.records.map((record) => record.id));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error(err);

        setError("Unable to load records.");
      }
      
    }

    loadRecords();

    return () => controller.abort();
  }, [collectionId, refreshKey, onRecordsLoaded]);

  const filteredRecords = useMemo(() => {
    if (!data) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return data.records;
    }

    return data.records.filter((record) =>
      Object.values(record.values).some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [data, searchQuery]);

  if (error) {
    return <p className="workspace-error">{error}</p>;
  }

  if (!data) {
    return <p className="loading-message">Loading records...</p>;
  }

  if (data.records.length === 0) {
    return (
      <div className="empty-records">
        <p>No records yet.</p>

        <p>
          Use <strong>+ Record</strong> to create the first record.
        </p>
      </div>
    );
  }

  return (
    <div className="record-list">
      <p className="record-count">
        {filteredRecords.length}{" "}
        {filteredRecords.length === 1 ? "record" : "records"}
      </p>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {data.fields.map((field) => (
                <th key={field.id}>{field.name}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className={
                  record.id === selectedRecordId ? "selected-record" : ""
                }
                onClick={() => onSelectRecord(record.id)}
              >
                {data.fields.map((field) => (
                  <td key={field.id}>
                    {formatValue(record.values[field.id], field.field_type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <p className="empty-search">No records match your search.</p>
      )}
    </div>
  );
}

function formatValue(value: unknown, fieldType: string) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (fieldType === "checkbox") {
    return value ? "Yes" : "No";
  }

  if (fieldType === "currency" && typeof value === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  if (fieldType === "date") {
    const date = new Date(String(value));

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
