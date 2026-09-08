import { NextRequest, NextResponse } from "next/server";

import pool from "@/lib/db";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const recordResult = await pool.query(
      `
        SELECT
          id,
          collection_id,
          import_order,
          created_at,
          updated_at
        FROM records
        WHERE id = $1;
        `,
      [id],
    );

    if (recordResult.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const record = recordResult.rows[0];

    const fieldsResult = await pool.query(
      `
        SELECT
          id,
          collection_id,
          name,
          field_type,
          required,
          display_order,
          default_value,
          options
        FROM fields
        WHERE collection_id = $1
        ORDER BY
          display_order,
          name;
        `,
      [record.collection_id],
    );

    const valuesResult = await pool.query(
      `
        SELECT
          field_id,
          value
        FROM record_values
        WHERE record_id = $1;
        `,
      [id],
    );

    const values: Record<string, unknown> = {};

    valuesResult.rows.forEach((row) => {
      values[row.field_id] = row.value;
    });

    return NextResponse.json({
      record,
      fields: fieldsResult.rows,
      values,
    });
  } catch (error) {
    console.error("Record detail database error:", error);

    return NextResponse.json(
      {
        error: "Unable to retrieve record.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const client = await pool.connect();

  try {
    const { id } = await context.params;

    const body = await request.json();

    const values = body.values as Record<string, unknown> | undefined;

    if (!values) {
      return NextResponse.json(
        {
          error: "Record values are required.",
        },
        {
          status: 400,
        },
      );
    }

    const recordCheck = await client.query(
      `
        SELECT
          id,
          collection_id
        FROM records
        WHERE id = $1;
        `,
      [id],
    );

    if (recordCheck.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const requiredFieldsResult = await client.query(
      `
    SELECT
      id,
      name,
      field_type
    FROM fields
    WHERE collection_id = $1
      AND required = true;
    `,
      [recordCheck.rows[0].collection_id],
    );

    const missingFields: string[] = [];

    for (const field of requiredFieldsResult.rows) {
      const value = values[field.id];

      const missing = value === null || value === undefined || value === "";

      if (missing) {
        missingFields.push(field.name);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Required fields are missing.",
          fields: missingFields,
        },
        {
          status: 400,
        },
      );
    }

    await client.query("BEGIN");

    for (const [fieldId, value] of Object.entries(values)) {
      await client.query(
        `
        INSERT INTO
          record_values (
            record_id,
            field_id,
            value,
            updated_at
          )
        VALUES (
          $1,
          $2,
          $3::jsonb,
          NOW()
        )
        ON CONFLICT (
          record_id,
          field_id
        )
        DO UPDATE SET
          value =
            EXCLUDED.value,
          updated_at =
            NOW();
        `,
        [id, fieldId, JSON.stringify(value)],
      );
    }

    const updatedRecordResult = await client.query(
      `
    UPDATE records
    SET updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      collection_id,
      import_order,
      created_at,
      updated_at;
    `,
      [id],
    );

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      record: updatedRecordResult.rows[0],
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError);
    }

    console.error("Record update error:", error);

    return NextResponse.json(
      {
        error: "Unable to update record.",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const client = await pool.connect();

  try {
    const { id } = await context.params;

    console.log("Deleting record:", id);

    await client.query("BEGIN");

    const recordCheck = await client.query(
      `
        SELECT id
        FROM records
        WHERE id = $1;
        `,
      [id],
    );

    if (recordCheck.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        {
          error: "Record not found.",
        },
        {
          status: 404,
        },
      );
    }

    const result = await client.query(
      `
        DELETE FROM records
        WHERE id = $1
        RETURNING id;
        `,
      [id],
    );

    await client.query("COMMIT");

    console.log("Deleted record:", result.rows[0].id);

    return NextResponse.json({
      success: true,
      recordId: result.rows[0].id,
    });
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Delete rollback error:", rollbackError);
    }

    console.error("Delete record error:", error);

    return NextResponse.json(
      {
        error: "Unable to delete record.",

        details:
          error instanceof Error ? error.message : "Unknown database error.",
      },
      {
        status: 500,
      },
    );
  } finally {
    client.release();
  }
}
